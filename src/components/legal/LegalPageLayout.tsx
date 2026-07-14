import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { FileText } from "lucide-react";

const LEGAL_NAV = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/dpa", label: "Data Processing Agreement" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/msa", label: "Master Service Agreement" },
  { href: "/cyber-liability-insurance", label: "Cyber Liability Insurance" },
];

export default function LegalPageLayout({
  title,
  effectiveDate,
  currentHref,
  children,
}: {
  title: string;
  effectiveDate: string;
  currentHref: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white pt-32 pb-14 relative">
        <div className="absolute inset-0 bg-emerald-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FileText className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-3">{title}</h1>
          <p className="text-slate-400 text-xs font-light">Effective Date: {effectiveDate}</p>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-[#070a12] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          {/* Sidebar nav */}
          <aside className="lg:col-span-1 lg:sticky lg:top-28 space-y-2">
            <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white px-2 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800">
                Legal Documents
              </h3>
              <ul className="space-y-1 text-xs">
                {LEGAL_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 rounded-xl transition-colors ${
                        item.href === currentHref
                          ? "bg-emerald-600 text-white font-semibold"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <article className="lg:col-span-3 bg-white dark:bg-slate-900/60 p-6 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300 legal-prose">
            {children}
          </article>
        </div>
      </section>

      <Footer />
    </>
  );
}
