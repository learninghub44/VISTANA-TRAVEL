-- Rate-limit counters now live in the database instead of per-isolate memory.
--
-- Cloudflare Workers run many isolates at once and recycle them freely, so the
-- old in-memory limiter only throttled requests landing on the same warm
-- isolate. One atomic upsert per hit gives a single global count that survives
-- restarts and deploys.

create table if not exists rate_limits (
  key text primary key,
  count integer not null,
  reset_at timestamptz not null
);

alter table rate_limits enable row level security; -- no policies: service-role only

create or replace function rate_limit_hit(p_key text, p_limit integer, p_window_ms integer)
returns table (out_allowed boolean, out_remaining integer, out_reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_count integer;
  v_reset timestamptz;
begin
  insert into rate_limits as r (key, count, reset_at)
  values (p_key, 1, v_now + make_interval(secs => p_window_ms / 1000.0))
  on conflict (key) do update set
    count = case when r.reset_at <= v_now then 1 else r.count + 1 end,
    reset_at = case when r.reset_at <= v_now then v_now + make_interval(secs => p_window_ms / 1000.0) else r.reset_at end
  returning r.count, r.reset_at into v_count, v_reset;

  -- Opportunistic cleanup so the table never grows without bound.
  if random() < 0.01 then
    delete from rate_limits where reset_at < v_now - interval '1 day';
  end if;

  return query select v_count <= p_limit, greatest(p_limit - v_count, 0), v_reset;
end;
$$;

revoke all on function rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function rate_limit_hit(text, integer, integer) to service_role;
