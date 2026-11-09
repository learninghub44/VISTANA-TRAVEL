"use client";

import { useRef, useState } from "react";
import { ImagePlus, Star, ChevronLeft, ChevronRight, X, Loader2, Link2 } from "lucide-react";
import { uploadImageAction } from "@/app/actions";
import SmartImage from "@/components/ui/SmartImage";

const MAX_PHOTOS = 10;
const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Photo manager for a package: pick or drag in several photos at once, see
 * previews, choose the cover (first photo), reorder, remove, or paste a link.
 */
export default function TourImagesField({ images, onChange }: { images: string[]; onChange: (next: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [dragging, setDragging] = useState(false);

  const list = images.filter(Boolean);

  async function addFiles(files: FileList | File[]) {
    setMessage("");
    const room = MAX_PHOTOS - list.length;
    const picked = Array.from(files).slice(0, Math.max(room, 0));
    if (Array.from(files).length > room) setMessage(`Only ${MAX_PHOTOS} photos allowed — extra files were skipped.`);

    const uploaded: string[] = [];
    const problems: string[] = [];
    setBusy((n) => n + picked.length);
    // Sequential keeps order and stays well under the upload rate limit.
    for (const file of picked) {
      try {
        if (!TYPES.includes(file.type)) throw new Error("not a JPG, PNG, WEBP or GIF");
        if (file.size > MAX_BYTES) throw new Error("larger than 8MB");
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadImageAction(fd);
        if (res.error || !res.url) throw new Error(res.error || "upload failed");
        uploaded.push(res.url);
      } catch (e) {
        problems.push(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (uploaded.length) onChange([...list, ...uploaded]);
    if (problems.length) setMessage(problems.join(" • "));
  }

  const move = (i: number, d: number) => {
    const next = [...list];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const makeCover = (i: number) => onChange([list[i], ...list.filter((_, k) => k !== i)]);
  const remove = (i: number) => onChange(list.filter((_, k) => k !== i));

  const addLink = () => {
    const v = link.trim();
    if (!/^https:\/\//i.test(v)) return setMessage("Photo links must start with https://");
    if (list.length >= MAX_PHOTOS) return setMessage(`Only ${MAX_PHOTOS} photos allowed.`);
    onChange([...list, v]);
    setLink("");
    setMessage("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold text-slate-405">
          Package Photos <span className="text-slate-400 normal-case font-medium">({list.length}/{MAX_PHOTOS}) — first photo is the cover</span>
        </label>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={`rounded-2xl border-2 border-dashed p-3 transition-colors ${dragging ? "border-gold bg-gold/5" : "border-slate-200 bg-slate-50"}`}
      >
        {list.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {list.map((src, i) => (
              <li key={src + i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 group">
                <SmartImage src={src} alt={`Package photo ${i + 1}`} sizes="200px" className="absolute inset-0 w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 bg-gold text-navy-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-current" /> Cover
                  </span>
                )}
                <button type="button" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center">
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute inset-x-0 bottom-0 flex justify-between items-center p-1.5 bg-gradient-to-t from-slate-950/70 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier" className="h-6 w-6 rounded-full bg-white/90 text-slate-800 disabled:opacity-30 flex items-center justify-center"><ChevronLeft className="h-3.5 w-3.5" /></button>
                  {i !== 0 && <button type="button" onClick={() => makeCover(i)} className="text-[10px] font-bold bg-white/90 text-slate-800 rounded-full px-2 py-1">Make cover</button>}
                  <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move later" className="h-6 w-6 rounded-full bg-white/90 text-slate-800 disabled:opacity-30 flex items-center justify-center"><ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
            {Array.from({ length: busy }).map((_, i) => (
              <li key={`busy-${i}`} className="aspect-[4/3] rounded-xl bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={list.length >= MAX_PHOTOS}
          className="w-full flex flex-col items-center justify-center gap-1 py-5 text-xs font-semibold text-slate-500 hover:text-navy-700 disabled:opacity-50 cursor-pointer"
        >
          <ImagePlus className="h-6 w-6" />
          <span>Click to choose photos or drag them here</span>
          <span className="text-[10px] font-normal text-slate-400">JPG, PNG, WEBP or GIF · up to 8MB each</span>
        </button>
        <input ref={inputRef} type="file" accept={TYPES.join(",")} multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
            placeholder="…or paste a photo link (https://)"
            className="w-full bg-slate-50 rounded-xl py-2 pl-8 pr-3 text-xs outline-none text-slate-800"
          />
        </div>
        <button type="button" onClick={addLink} className="px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold">Add</button>
      </div>

      {message && <p role="alert" className="text-[11px] text-red-600">{message}</p>}
    </div>
  );
}
