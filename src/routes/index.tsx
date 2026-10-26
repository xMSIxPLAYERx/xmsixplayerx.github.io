import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jean Ghanameh | Judo • Robotics • CS" },
      { name: "description", content: "Portfolio of Jean Ghanameh — judo athlete, robotics builder and computer science student." },
      { property: "og:title", content: "Jean Ghanameh | Judo • Robotics • CS" },
      { property: "og:description", content: "Judo, robotics, mechatronics and code — the portfolio of Jean Ghanameh." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const links = [
  { href: "#about", label: "About" },
  { href: "#passions", label: "Passions" },
  { href: "#robotics", label: "RB & MC" },
  { href: "#media", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];

const vars = (o: Record<string, string | number>) => o as CSSProperties;

/* ---------- Snow with mouse wind ---------- */
function Snow() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0, wind = 0, targetWind = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    type F = { x: number; y: number; r: number; s: number; d: number };
    let flakes: F[] = [];
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = w < 640 ? 60 : w < 1024 ? 100 : 160;
      flakes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 2.4 + 0.4, s: Math.random() * 1 + 0.4, d: Math.random() * Math.PI * 2,
      }));
    };
    const tick = () => {
      wind += (targetWind - wind) * 0.03;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      for (const f of flakes) {
        f.d += 0.01; f.y += f.s; f.x += Math.sin(f.d) * 0.4 + wind * f.r;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        if (f.x > w + 5) f.x = -5; else if (f.x < -5) f.x = w + 5;
        ctx.moveTo(f.x, f.y); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      }
      ctx.fill();
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => { targetWind = (e.clientX / w - 0.5) * 1.5; };
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) tick(); };
    resize(); tick();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}

/* ---------- Scroll-driven 3D, parallax, progress, active nav ---------- */
function useScroll3D(setActive: (id: string) => void) {
  useEffect(() => {
    const boxes = Array.from(document.querySelectorAll<HTMLElement>("[data-3d]"));
    const bg = document.querySelector<HTMLElement>(".bg-mountain");
    const bar = document.querySelector<HTMLElement>("[data-progress]");
    const orbs = Array.from(document.querySelectorAll<HTMLElement>("[data-orb]"));
    let mx = 0, my = 0, raf = 0;
    let smx = 0, smy = 0;
    const loop = () => {
      smx += (mx - smx) * 0.08; smy += (my - smy) * 0.08;
      const vh = window.innerHeight;
      const mobile = window.innerWidth < 768;
      const depth = mobile ? 0.7 : 1;
      let best = Infinity;
      for (const el of boxes) {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - vh / 2;
        const p = Math.max(-1.3, Math.min(1.3, center / vh));
        const a = Math.abs(p);
        if (Math.abs(center) < best) { best = Math.abs(center); setActive(el.parentElement!.id); }
        const tiltX = p * 35 * depth + (mobile ? 0 : smy * -6 * (1 - a));
        const tiltY = mobile ? 0 : smx * 10 * (1 - a);
        el.style.transform = `perspective(1100px) translate3d(0, ${p * 60}px, ${-a * 380 * depth}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        el.style.opacity = String(Math.max(0.1, 1 - a * 0.9));
      }
      const max = document.documentElement.scrollHeight - vh;
      const prog = max > 0 ? window.scrollY / max : 0;
      if (bg) bg.style.transform = `scale(${1.15 + prog * 0.3}) translate3d(${smx * -20}px, ${-prog * 5}%, 0)`;
      if (bar) bar.style.transform = `scaleX(${prog})`;
      orbs.forEach((o, i) => {
        const k = (i + 1) * 25;
        o.style.transform = `translate3d(${smx * k}px, ${smy * k - window.scrollY * 0.15 * (i + 1)}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); };
  }, [setActive]);

  // staggered reveals
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.2 },
    );
    document.querySelectorAll("[data-stagger]").forEach((el) => {
      Array.from(el.children).forEach((c, i) => (c as HTMLElement).style.setProperty("--i", String(i)));
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // spotlight
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>(".spot");
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`);
      t.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
}

/* ---------- Counter ---------- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - start) / 1600);
        setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ---------- Layout pieces ---------- */
function Section({ id, tag, title, children, wide }: { id: string; tag: string; title: string; children?: ReactNode; wide?: boolean }) {
  return (
    <section id={id} className="flex min-h-[100svh] items-center justify-center px-4 pb-12 pt-28 sm:px-6 md:pt-32">
      <div
        data-3d
        className={`scene-3d glass w-full rounded-[28px] px-5 py-10 text-center sm:rounded-[36px] sm:px-10 sm:py-14 lg:px-14 lg:py-16 ${wide ? "max-w-5xl" : "max-w-[900px]"}`}
      >
        <div data-stagger>
          <span className="glass-soft mb-6 inline-block rounded-full px-4 py-1.5 font-display text-[0.7rem] uppercase tracking-[0.25em] text-primary sm:text-xs">
            {tag}
          </span>
          <h2 className="title-main mb-4">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

const Body = ({ children }: { children: ReactNode }) => (
  <p className="mx-auto max-w-[650px] text-[0.98rem] font-light leading-relaxed text-muted-foreground sm:text-lg sm:leading-[1.8]">{children}</p>
);

function Nav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="fade-up fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-[1000px] -translate-x-1/2 sm:top-6" style={vars({ "--d": "100ms" })}>
      <nav className="glass flex h-14 items-center justify-between rounded-full px-5 sm:h-16 sm:px-8">
        <a href="#home" className="font-display text-base font-bold tracking-[0.1em] sm:text-lg" onClick={() => setOpen(false)}>GJ // 2026</a>
        <div className="hidden gap-1 md:flex lg:gap-2">
          {links.map((l) => {
            const on = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground lg:px-4 lg:text-sm ${on ? "bg-foreground/15 text-foreground" : "text-muted-foreground hover:bg-foreground/10"}`}
              >
                {l.label}
              </a>
            );
          })}
        </div>
        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`h-0.5 w-5 rounded bg-foreground transition ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 rounded bg-foreground transition ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 rounded bg-foreground transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>
      <div className={`glass mt-2 grid overflow-hidden rounded-3xl transition-all duration-500 md:hidden ${open ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}>
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${i * 50}ms` : "0ms" }}
            className={`border-b px-6 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-500 last:border-0 active:bg-foreground/10 ${open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"} ${active === l.href.slice(1) ? "text-primary" : ""}`}
          >
            {l.label}
          </a>
        ))}
      </div>
    </header>
  );
}

const cards = [
  { icon: "🤖", t: "Robotics", d: "Designing physical hardware, microcontrollers, and motion control logic for autonomous systems." },
  { icon: "🥋", t: "Judo", d: "Mastering momentum, leverage, timing, and razor-sharp resilience in intense competitive environments.", featured: true },
  { icon: "💻", t: "CS & Logic", d: "Writing clean, optimized code and architecting scalable algorithms for complex applications." },
];

const gallery = [
  { src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=75", alt: "Judo Training / Competition" },
  { src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=75", alt: "Robotics Hardware Build" },
  { src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=75", alt: "Software Architecture & Code" },
];

const ticker = ["Judo", "Robotics", "Mechatronics", "Computer Science", "Discipline", "Precision", "Curiosity"];

function Hero() {
  const name = "Jean Ghanameh";
  return (
    <section id="home" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-20 text-center">
      <div data-orb className="orb left-[8%] top-[22%] h-24 w-24 sm:h-40 sm:w-40" />
      <div data-orb className="orb right-[10%] top-[60%] h-16 w-16 sm:h-28 sm:w-28" style={{ animationDelay: "-3s" }} />
      <div data-orb className="orb left-[60%] top-[12%] h-10 w-10 sm:h-16 sm:w-16" style={{ animationDelay: "-6s" }} />
      <div data-3d className="scene-3d relative">
        <span className="fade-up glass-soft mb-6 inline-block rounded-full px-4 py-1.5 font-display text-[0.7rem] uppercase tracking-[0.25em] text-primary sm:text-xs" style={vars({ "--d": "100ms" })}>
          Born Dec 17, 2011 • Age 14
        </span>
        <h1 className="title-main mb-4 [perspective:800px]" aria-label={name}>
          {name.split("").map((ch, i) => (
            <span key={i} aria-hidden className="letter" style={vars({ "--i": i })}>{ch === " " ? "\u00A0" : ch}</span>
          ))}
        </h1>
        <p className="fade-up mb-6 font-display text-sm uppercase tracking-[0.2em] text-primary sm:text-xl" style={vars({ "--d": "1000ms" })}>
          Judo • Robotics • Computer Science
        </p>
        <div className="fade-up" style={vars({ "--d": "1200ms" })}>
          <Body>Welcome to my interactive portfolio. Scroll down to explore my training, hardware builds, and software development.</Body>
        </div>
        <a href="#about" className="fade-up glass mt-10 inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-medium uppercase tracking-wider transition hover:scale-105" style={vars({ "--d": "1400ms" })}>
          Explore <span aria-hidden className="scroll-cue inline-block">↓</span>
        </a>
      </div>
    </section>
  );
}

function Ticker() {
  const items = [...ticker, ...ticker];
  return (
    <div className="glass-soft -rotate-2 overflow-hidden border-x-0 py-4 backdrop-blur-xl" aria-hidden>
      <div className="marquee">
        {items.concat(items).map((t, i) => (
          <span key={i} className="mx-6 whitespace-nowrap font-display text-lg uppercase tracking-[0.3em] text-primary sm:text-2xl">
            {t} <span className="ml-6 text-muted-foreground">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Index() {
  const [active, setActive] = useState("home");
  useScroll3D(setActive);
  return (
    <>
      <div data-progress className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-primary" aria-hidden />
      <div className="bg-mountain" aria-hidden />
      <Snow />
      <Nav active={active} />
      <main className="overflow-x-clip">
        <Hero />
        <Ticker />

        <Section id="about" tag="// 01. Identity" title="The Visionary">
          <div data-stagger>
            <Body>Driven by curiosity and precision. Whether I am architecting modular software algorithms, wiring autonomous robotic rigs, or training on the judo mat, I push every project to its absolute physical and logical limit.</Body>
          </div>
          <div data-stagger className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 sm:gap-5">
            {[
              { n: 14, s: "", l: "Years old" },
              { n: 3, s: "", l: "Disciplines" },
              { n: 100, s: "%", l: "Commitment" },
            ].map((x) => (
              <div key={x.l} className="spot lift glass-soft rounded-2xl px-2 py-5 sm:rounded-3xl sm:py-7">
                <div className="title-main !text-3xl sm:!text-5xl"><Counter to={x.n} suffix={x.s} /></div>
                <div className="mt-1 text-[0.65rem] uppercase tracking-widest text-muted-foreground sm:text-xs">{x.l}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="passions" tag="// 02. Disciplines" title="Core Focus" wide>
          <div data-stagger className="mt-8 grid gap-4 text-left sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {cards.map((c) => (
              <div key={c.t} className={`spot lift glass-soft rounded-3xl p-6 hover:-translate-y-2 sm:p-7 ${c.featured ? "shimmer order-first bg-primary/10 sm:col-span-2 lg:order-none lg:col-span-1" : ""}`}>
                <div className="mb-4 text-4xl transition-transform duration-500 group-hover:scale-110" aria-hidden>{c.icon}</div>
                <h3 className="mb-2 text-xl font-medium">{c.t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="robotics" tag="// 03. Coding and Executing" title="Robotics & Mechatronics">
          <div data-stagger>
            <Body>Robotics and mechatronics are an essential part of our technologically advanced world. Learning and practicing is only the beginning.</Body>
          </div>
          <div data-stagger className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-2">
            {["Sensors", "Microcontrollers", "Motors", "C++", "Python", "CAD", "Autonomy"].map((t) => (
              <span key={t} className="lift glass-soft rounded-full px-4 py-2 font-display text-xs uppercase tracking-widest hover:-translate-y-1">{t}</span>
            ))}
          </div>
        </Section>

        <Section id="media" tag="// 04. Media & Projects" title="Visual Showcase" wide>
          <div data-stagger className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {gallery.map((g, i) => (
              <figure key={g.alt} className={`spot lift glass-soft relative aspect-[4/3] overflow-hidden rounded-3xl hover:-translate-y-2 ${i === 2 ? "sm:col-span-2 sm:aspect-[16/7] lg:col-span-1 lg:aspect-[4/3]" : ""}`}>
                <img src={g.src} alt={g.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-sm">{g.alt}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section id="contact" tag="// 05. Direct Channel" title="Initiate Contact">
          <div data-stagger>
            <Body>Ready to collaborate on a software project or build custom robotics hardware?</Body>
          </div>
          <div data-stagger className="mx-auto mt-8 grid max-w-xl gap-3 font-display sm:grid-cols-2">
            <a href="mailto:ghanameh.jean@hotmail.com" className="spot lift glass-soft break-all rounded-2xl px-5 py-4 text-primary hover:-translate-y-1">
              <span className="block text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              ghanameh.jean@hotmail.com
            </a>
            <a href="tel:+96176431511" className="spot lift glass-soft rounded-2xl px-5 py-4 text-primary hover:-translate-y-1">
              <span className="block text-xs uppercase tracking-widest text-muted-foreground">Phone</span>
              +961 76 431 511
            </a>
          </div>
        </Section>
      </main>
      <footer className="pb-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Jean Ghanameh</footer>
    </>
  );
}
