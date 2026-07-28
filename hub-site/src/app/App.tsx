import { useState, useEffect, useRef } from "react";
import { ArrowRight, X, CheckCircle } from "lucide-react";

const FOCUS_AREAS = [
  {
    num: "01",
    title: "Business Setup",
    services: ["Business Plan Drafting", "Funding Strategisation"],
    desc: "We lay the foundation — crafting investor-ready business plans and mapping the funding path that fits your stage and ambition.",
    photo: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1800&h=1200&fit=crop&auto=format",
    alt: "Dark modern architecture — structure and foundations",
  },
  {
    num: "02",
    title: "Product & Service Distribution",
    services: ["Website Design", "Customer Segmentation", "Marketing"],
    desc: "We build the channels — from a website that converts to audience clarity and campaigns that reach the right people at the right moment.",
    photo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&h=1200&fit=crop&auto=format",
    alt: "Sleek modern office at night — distribution and reach",
  },
  {
    num: "03",
    title: "Business Growth",
    services: ["Finance Management", "Human Resources"],
    desc: "We scale the engine — putting financial discipline and the right people in place so growth compounds rather than strains.",
    photo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1800&h=1200&fit=crop&auto=format",
    alt: "Abstract dark gradient — upward momentum",
  },
];

const FOUNDERS = [
  {
    name: "Alexandra Osei",
    role: "Co-Founder & Strategy",
    bio: "Former McKinsey consultant and operator. Alexandra has advised 40+ early-stage companies across Africa and Europe on go-to-market and funding.",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&auto=format&face",
    alt: "Alexandra Osei, Co-Founder",
  },
  {
    name: "Marcus Adeyemi",
    role: "Co-Founder & Product",
    bio: "Product leader and designer with roots in Lagos and London. Marcus has shipped digital products for startups and Fortune 500 brands alike.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&auto=format&face",
    alt: "Marcus Adeyemi, Co-Founder",
  },
];

const INTERESTS = [
  "Business Setup",
  "Product & Service Distribution",
  "Business Growth",
  "All of the above",
];

// ── Glassmorphism Toast ───────────────────────────────────────
function Toast({ visible }: { visible: boolean }) {
  return (
    <div
      className="fixed bottom-4 left-3 right-3 md:left-1/2 md:right-auto md:bottom-8 z-[200] pointer-events-none md:w-auto"
      style={{
        transform: `translateY(${visible ? "0" : "20px"})`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/20 shadow-2xl md:w-max"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <CheckCircle size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">
            Contact request received
          </p>
          <p
            className="text-[#86868b] text-xs mt-0.5"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            We'll be in touch within one business day.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Contact Modal ─────────────────────────────────────────────
function ContactModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    interest: "",
    message: "",
  });
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstInput.current?.focus(), 120);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
    onSubmit();
    setForm({ name: "", email: "", company: "", interest: "", message: "" });
  }

  const inputBase =
    "w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#3a3a3c] focus:outline-none focus:border-white/40 focus:bg-white/8 transition-all duration-200";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] transition-opacity duration-500"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed inset-0 z-[110] flex items-end md:items-center justify-center md:px-4 pointer-events-none"
        aria-modal="true"
        role="dialog"
        aria-label="Start a project"
      >
        <div
          className="relative w-full md:max-w-lg md:rounded-3xl rounded-t-3xl border border-white/12 shadow-2xl pointer-events-auto overflow-y-auto max-h-[95dvh]"
          style={{
            background: "rgba(12,12,12,0.96)",
            backdropFilter: "blur(48px)",
            WebkitBackdropFilter: "blur(48px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-white/8">
            <div>
              <p
                className="text-xs font-semibold tracking-[0.2em] uppercase text-[#86868b] mb-2"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                MJ Hub
              </p>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                Start a project
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-[#86868b] hover:text-white hover:bg-white/15 transition-all duration-200 mt-1"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold text-[#86868b] tracking-wide"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  Full name
                </label>
                <input
                  ref={firstInput}
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className={inputBase}
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold text-[#86868b] tracking-wide"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className={inputBase}
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-[#86868b] tracking-wide"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Company / Venture
              </label>
              <input
                type="text"
                placeholder="Acme Inc. (or leave blank if pre-launch)"
                className={inputBase}
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-[#86868b] tracking-wide"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Area of interest
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm({ ...form, interest: opt })}
                    className="text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200"
                    style={{
                      fontFamily: "'Nunito Sans', sans-serif",
                      borderColor: form.interest === opt ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.12)",
                      color: form.interest === opt ? "#ffffff" : "#86868b",
                      background: form.interest === opt ? "rgba(255,255,255,0.1)" : "transparent",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-[#86868b] tracking-wide"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                Tell us about your project
              </label>
              <textarea
                rows={3}
                required
                placeholder="Where are you now, and where do you want to go?"
                className={`${inputBase} resize-none`}
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 text-sm font-semibold text-black bg-white px-6 py-4 rounded-xl hover:bg-[#f5f5f7] active:scale-[0.98] transition-all duration-200 group"
            >
              Send request
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  function handleSubmit() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  }

  function openModal() { setModalOpen(true); }
  function closeModal() { setModalOpen(false); }

  return (
    <div
      className="bg-background text-foreground min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      <ContactModal open={modalOpen} onClose={closeModal} onSubmit={handleSubmit} />
      <Toast visible={toastVisible} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: "100vh" }}>
        <img
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1800&h=1200&fit=crop&auto=format"
          alt="Minimal dark workspace"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-white font-black text-xl tracking-tight">MJ Hub</span>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 text-sm font-semibold text-black bg-white px-5 py-2.5 rounded-full hover:bg-[#f5f5f7]/90 active:scale-[0.97] transition-all duration-200"
          >
            Start a project
          </button>
        </div>

        {/* Hero copy */}
        <div
          className="relative z-10 flex flex-col justify-end max-w-[1400px] mx-auto px-8 pb-28 md:pb-36"
          style={{ minHeight: "100vh" }}
        >
          <p
            className="text-xs font-semibold tracking-[0.22em] uppercase text-[#86868b] mb-6"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Business Consulting Studio
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black text-white leading-[0.92] tracking-tight mb-8 max-w-4xl whitespace-pre-line">
            {"From idea\nto enterprise."}
          </h1>
          <p
            className="text-base md:text-lg text-[#86868b] leading-relaxed max-w-lg"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            We partner with founders to build, distribute, and grow businesses — end to end.
          </p>
        </div>
      </section>

      {/* ── INTRO STRIP ───────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Three pillars.<br />One cohesive practice.
            </h2>
            <p
              className="text-[#86868b] text-base md:text-lg leading-relaxed"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              Most consultancies specialise in one dimension — strategy, or marketing, or operations.
              We connect all three, so the business you plan is the one you can actually build and sustain.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOCUS AREAS ──────────────────────────────────────── */}
      {FOCUS_AREAS.map((area, i) => (
        <section
          key={area.num}
          className="relative w-full overflow-hidden bg-black"
          style={{ minHeight: "88vh" }}
        >
          <img
            src={area.photo}
            alt={area.alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.5 }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
          {i % 2 === 0 ? (
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-transparent to-transparent" />
          )}

          <div
            className="relative z-10 flex flex-col justify-end max-w-[1400px] mx-auto px-8 pb-24 md:pb-32"
            style={{ minHeight: "88vh" }}
          >
            <div className={`max-w-xl ${i % 2 === 1 ? "ml-auto text-right" : ""}`}>
              <p
                className="text-xs font-semibold tracking-[0.22em] uppercase text-[#3a3a3c] mb-4"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {area.num}
              </p>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
                {area.title}
              </h2>
              <div className={`flex flex-wrap gap-2 mb-7 ${i % 2 === 1 ? "justify-end" : ""}`}>
                {area.services.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-semibold text-[#86868b] border border-white/15 rounded-full px-4 py-1.5 tracking-wide"
                    style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p
                className="text-[#86868b] text-sm md:text-base leading-relaxed"
                style={{ fontFamily: "'Nunito Sans', sans-serif" }}
              >
                {area.desc}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-8 right-8 h-px bg-white/10" />
        </section>
      ))}

      {/* ── FOUNDERS ─────────────────────────────────────────── */}
      <section id="about" className="bg-[#0a0a0a] border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-8 py-24 md:py-32">
          <p
            className="text-xs font-semibold tracking-[0.22em] uppercase text-[#86868b] mb-16"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            The founders
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            {FOUNDERS.map((f) => (
              <div key={f.name} className="bg-[#0a0a0a] p-10 md:p-14 group hover:bg-[#111] transition-colors duration-300">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#1d1d1f] mb-8">
                  <img
                    src={f.photo}
                    alt={f.alt}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-1">{f.name}</h3>
                <p
                  className="text-xs font-semibold tracking-widest uppercase text-[#86868b] mb-6"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {f.role}
                </p>
                <p
                  className="text-[#86868b] text-sm leading-relaxed"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {f.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-8 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-0 md:divide-x md:divide-white/10">
            {[
              { value: "80+", label: "Projects built" },
              { value: "£12M+", label: "Transactions processed" },
              { value: "3", label: "Focus disciplines" },
              { value: "2", label: "Founders, one vision" },
            ].map((stat) => (
              <div key={stat.label} className="md:px-12 first:pl-0 last:pr-0">
                <p className="text-5xl font-black text-white tracking-tight leading-none mb-3">
                  {stat.value}
                </p>
                <p
                  className="text-xs text-[#86868b] tracking-wide"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ──────────────────────────────────────── */}
      <section id="contact" className="relative w-full overflow-hidden bg-black" style={{ minHeight: "70vh" }}>
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1800&h=900&fit=crop&auto=format"
          alt="Technology and ambition"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.3 }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />

        <div
          className="relative z-10 flex flex-col items-center justify-center text-center max-w-[900px] mx-auto px-8"
          style={{ minHeight: "70vh" }}
        >
          <p
            className="text-xs font-semibold tracking-[0.22em] uppercase text-[#86868b] mb-8"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Ready to begin
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tight mb-8 whitespace-pre-line">
            {"Let's build\nsomething real."}
          </h2>
          <p
            className="text-[#86868b] text-base md:text-lg leading-relaxed mb-12 max-w-md"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            Tell us where your business is and where you want it to go.
            We respond within one business day.
          </p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-3 text-base font-semibold text-black bg-white px-8 py-4 rounded-full hover:bg-[#f5f5f7]/90 active:scale-[0.97] transition-all duration-200 group"
          >
            Start a project
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-white font-black text-base tracking-tight">MJ Hub</p>
            <p
              className="text-[#86868b] text-xs mt-1"
              style={{ fontFamily: "'Nunito Sans', sans-serif" }}
            >
              Business Consulting Studio
            </p>
          </div>
          <p
            className="text-[#3a3a3c] text-xs"
            style={{ fontFamily: "'Nunito Sans', sans-serif" }}
          >
            © 2026 MJ Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
