import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { buildCloudinaryImageUrl, buildGalleryApiUrl } from "../lib/gallery-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thumbnail Designer — Thumbnails That Get Clicked" },
      { name: "description", content: "High-CTR YouTube thumbnail design, branding and creative support for creators." },
      { property: "og:title", content: "Thumbnail Designer — Thumbnails That Get Clicked" },
      { property: "og:description", content: "High-CTR YouTube thumbnail design for creators who want more views." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const Spark = ({ c = "var(--accent)", s = 8 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 10 10"><path d="M5 0C5.4 3.2 6.8 4.6 10 5 6.8 5.4 5.4 6.8 5 10 4.6 6.8 3.2 5.4 0 5 3.2 4.6 4.6 3.2 5 0Z" fill={c} /></svg>
);
const Check = ({ s = 22 }: { s?: number }) => (
  <span className="tp-check" style={{ width: s, height: s }}>
    <svg width={s * 0.5} height={s * 0.5} viewBox="0 0 12 12"><path d="M2 6.5 5 9l5-6" stroke="var(--bg)" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
  </span>
);
const Label = ({ children }: { children: string }) => (
  <div className="tp-label"><Spark />{children}</div>
);
const workMods = import.meta.glob<{ url: string }>("../assets/work/*.asset.json", { eager: true, import: "default" });
const work = Object.entries(workMods)
  .sort(([a], [b]) => parseInt(a.match(/thumb-(\d+)/)?.[1] ?? "0") - parseInt(b.match(/thumb-(\d+)/)?.[1] ?? "0"))
  .map(([, m]) => m.url);
const clientMods = import.meta.glob<{ url: string }>("../assets/clients/*.asset.json", { eager: true, import: "default" });
const clientImg = (k: string) => clientMods[`../assets/clients/${k}.jpg.asset.json`]?.url;
const clients: [string, string, string][] = [
  ["preston", "PrestonGamez", "https://www.youtube.com/@PrestonRoblox/videos"],
  ["surf", "Surfs Up", "https://www.youtube.com/@TheSurfsUp/videos"],
  ["zachhfinance", "Zachh", "https://www.youtube.com/@zachhfinance/videos"],
  ["suzie", "Suzie Taylor", "https://www.youtube.com/@SuzieTaylor"],
  ["drl", "DR LA ROSA", "https://www.youtube.com/@DRLAROSA"],
  ["martin", "Josip and Martin", "https://www.youtube.com/@martinjosip/videos"],
  ["fancy", "Fancy", "https://www.youtube.com/@xFANCY9/videos"],
  ["kevin", "KevinFromTheBlock", "https://www.youtube.com/@kevinfromtheblock/videos"],
  ["benji", "Benji", "https://www.youtube.com/@ehrenbenji"],
  ["nico", "Nico Grigg", "https://www.youtube.com/@nicogrigg"],
  ["bige", "Bige", "https://www.youtube.com/@BigeOfficial"],
  ["brianna", "Brianna", "https://www.youtube.com/@BriannaYT"],
  ["howtoai", "How to Ai", "https://www.youtube.com/@howtoaitutorials"],
  ["vermax", "Vermax", "https://www.youtube.com/@Vermax"],
  ["nhg", "NHG Benji", "https://www.youtube.com/@NoHandGaming/featured"],
  ["mrsinn", "Mr. Sinn", "https://www.youtube.com/@MrSinn"],
];
const Thumb = ({ src, alt }: { src: string; alt: string }) => (
  <div className="tp-thumb" style={{ padding: 0, overflow: "hidden" }}>
    <img src={src} alt={alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
  </div>
);

const processSteps = [
  ["Discovery & Strategy", "We talk about your channel, audience and the video so every thumbnail fits your goals.", "01"],
  ["Ideation", "I sketch 2–3 click-worthy directions built around one clear idea and emotion.", "02"],
  ["Design", "The chosen concept is produced in full detail: lighting, text, color and contrast.", "03"],
  ["Delivery & Feedback", "You receive final files fast, with revisions until you're confident it'll perform.", "04"],
] as const;
const testimonials = [
  { name: "[Channel name]", subs: "[N] subscribers", quote: "\"[Add a real testimonial from your client here, with their permission.]\"" },
  { name: "[Channel name]", subs: "[N] subscribers", quote: "\"[Add a real testimonial from your client here, with their permission.]\"" },
  { name: "[Channel name]", subs: "[N] subscribers", quote: "\"[Add a real testimonial from your client here, with their permission.]\"" },
  { name: "[Channel name]", subs: "[N] subscribers", quote: "\"[Add a real testimonial from your client here, with their permission.]\"" },
  { name: "[Channel name]", subs: "[N] subscribers", quote: "\"[Add a real testimonial from your client here, with their permission.]\"" },
  { name: "[Channel name]", subs: "[N] subscribers", quote: "\"[Add a real testimonial from your client here, with their permission.]\"" },
];
const faqs = [
  ["How fast is delivery?", "Most thumbnails are delivered within 24–48 hours after the concept is approved."],
  ["How many revisions do I get?", "Unlimited reasonable revisions until you're happy with the result."],
  ["What do you need from me?", "The video topic, title, and any photos or footage you'd like featured."],
  ["Do you do A/B test variants?", "Yes — I can create multiple variants for YouTube's built-in Test & Compare."],
  ["Which file formats do I get?", "High-res JPG/PNG under 2MB, plus the layered source file on request."],
  ["How do I pay?", "Payment is handled upfront per project or monthly for ongoing plans."],
];

function Index() {
  const [open, setOpen] = useState(0);
  const [menu, setMenu] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const processTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(true);
  const [canScrollNext, setCanScrollNext] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadHeroImages = async () => {
      try {
        const response = await fetch(buildGalleryApiUrl());
        const data = await response.json();

        if (!response.ok || !Array.isArray(data.images)) {
          return;
        }

        const imageUrls = data.images.map((image: { publicId?: string }) => buildCloudinaryImageUrl(image.publicId ?? ""));

        if (!ignore) {
          setHeroImages(imageUrls.filter(Boolean));
        }
      } catch {
        // Fall back to the local bundled images below.
      }
    };

    void loadHeroImages();
    return () => {
      ignore = true;
    };
  }, []);

  const heroImageSet = heroImages.length > 0 ? heroImages : work;
  const rowA = heroImageSet.slice(0, 11);
  const rowB = heroImageSet.slice(11, 22);
  const navLinks = [["Home", "#home"], ["My Work", "/my-work"], ["Featured", "#featured-work"], ["Testimonials", "#testimonials"], ["About Me", "#about"], ["Pricing", "#pricing"], ["FAQ", "#faq"]];

  const updateProcessArrows = () => {
    const track = processTrackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft <= 1);
    setCanScrollNext(track.scrollLeft >= maxScroll - 1);
  };

  const scrollProcess = (direction: number) => {
    const track = processTrackRef.current;
    if (!track) return;
    const stepWidth = window.innerWidth <= 768 ? 280 + 24 : 380 + 24;
    track.scrollBy({ left: direction * stepWidth, behavior: "smooth" });
  };

  return (
    <div className="tp" id="home">
      <nav className="tp-nav">
        <div className="tp-logo">sa</div>
        <ul className={`tp-links ${menu ? "open" : ""}`}>
          {navLinks.map(([l, h]) => <li key={l}><a href={h} onClick={() => setMenu(false)}>{l}</a></li>)}
        </ul>
        <button className="tp-burger" aria-label="Menu" onClick={() => setMenu(!menu)}><span /><span /><span /></button>
        <a href="#closing" className="tp-navbtn">Let's Work</a>
      </nav>

      <header className="tp-hero">
        <h1 className="tp-h">Thumbnails that convert</h1>
        <p className="tp-p">I don't just make pretty thumbnails, my thumbnails are well optimised to get clicked, which spark curiosity and urge the viewer to click on them</p>
        <div className="tp-btns">
          <a href="#featured-work" className="tp-mono tp-primary">My Work</a>
          <a href="mailto:plexmediaa@gmail.com" className="tp-mono tp-secondary">Contact Me</a>
        </div>
      </header>

      <div className="tp-marquee">
        <div className="tp-row">{[...rowA, ...rowA].map((src, i) => <div className="tp-frame" key={`row-a-${i}`}><Thumb src={src} alt={`Featured thumbnail ${i + 1}`} /></div>)}</div>
        <div className="tp-row">{[...rowB, ...rowB].map((src, i) => <div className="tp-frame" key={`row-b-${i}`}><Thumb src={src} alt={`Featured thumbnail ${i + 1}`} /></div>)}</div>
      </div>

      <section className="tp-wrap" style={{ paddingTop: 60 }}>
        <Label>Clients</Label>
        <h2 className="tp-h">My YouTube Clients.</h2>
        <div className="tp-marquee" style={{ marginTop: 32 }}>
          <div className="tp-row" style={{ gap: 36 }}>
            {[...clients, ...clients].map(([k, name, url], i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 110, flex: "none", color: "inherit", textDecoration: "none" }}>
                <img src={clientImg(k)} alt={name} loading="lazy" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }} />
                <span style={{ fontSize: 13, textAlign: "center" }}>{name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="tp-wrap tp-sec" id="process" style={{ paddingTop: 60 }}>
        <Label>Process</Label>
        <h2 className="tp-h">Simple, Proven Process.</h2>
        <p className="tp-p tp-sub">From the first call to the final file, every step is built to make your video impossible to scroll past — clear communication, fast turnaround, zero guesswork.</p>
        <div className="tp-process">
          <div className="tp-process-track" ref={processTrackRef} onScroll={updateProcessArrows}>
            {processSteps.map(([title, description, number]) => (
              <article className="tp-process-card" key={title}>
                <div className="tp-process-head">
                  <div className="tp-process-icon">
                    {title === "Discovery & Strategy" ? (
                      <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="13" cy="13" r="7.5" /><path d="M18.2 18.2 26 26" /><path d="M11 7v2M7 13h2M15 13h2M13 11v2" /></svg>
                    ) : title === "Ideation" ? (
                      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M15 7.5c-4.4 0-8 3.6-8 8a8 8 0 0 0 2.8 6.1c1.1.9 1.8 2.2 1.8 3.6v.8h7.2v-.8c0-1.4.7-2.7 1.8-3.6A8 8 0 0 0 23 15.5c0-4.4-3.6-8-8-8Zm0 4.7 1.5 3.2 3.5.5-2.5 2.4 0 3.5-2.5-1.3-2.5 1.3 0-3.5-2.5-2.4 3.5-.5L15 12.2Z" /><path d="M20.5 8.7 22 7.3l1.3 1.4-1.3 1.3-1.2-1.3Z" stroke="none" fill="var(--accent)" /></svg>
                    ) : title === "Design" ? (
                      <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13 22.2 7 26l3.8-6.1 6.5-8.7 7.1 7.1-8.4 7.7Z" /><path d="M20.4 8.5 23.8 5l3.3 3.3-3.4 3.3-3.3-3.1Z" /><path d="M11.3 21.1 7.2 25.2" /></svg>
                    ) : (
                      <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="9.5" cy="8" r="3" /><path d="M9 11.5v5.8L15 19l6 6m-6-11.7 5.6 0 4.8 10.7M9 19l4.7 4.8" /><path d="M13.5 18.5 19.5 14.5 24 18.5v5.1H13.5v-5.1Z" /><line x1="14" y1="18.5" x2="27" y2="18.5" /></svg>
                    )}
                  </div>
                  <span className="tp-process-number">{number}</span>
                </div>
                <h3 className="tp-process-title">{title}</h3>
                <p className="tp-process-copy">{description}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="tp-process-arrows">
          <button type="button" className="tp-process-arrow" aria-label="Previous step" disabled={!canScrollPrev} onClick={() => scrollProcess(-1)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.4 4.5 6.9 10l5.5 5.5" /></svg>
          </button>
          <button type="button" className="tp-process-arrow" aria-label="Next step" disabled={!canScrollNext} onClick={() => scrollProcess(1)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.6 4.5 13.1 10l-5.5 5.5" /></svg>
          </button>
        </div>
      </section>

      <section className="tp-wrap tp-sec" id="featured-work">
        <Label>Featured Work</Label>
        <h2 className="tp-h">Real Results For Creators</h2>
        <p className="tp-p tp-sub">Thumbnails are the first impression. Here's what better ones can do for your channel.</p>
        <div className="tp-featured-grid">
          {work.slice(0, 6).map((src, i) => (
            <div className="tp-featured-card" key={`${src}-${i}`}>
              <div className="tp-featured-inner">
                <img src={src} alt="Featured thumbnail design" loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tp-wrap tp-sec" id="testimonials">
        <Label>Testimonials</Label>
        <h2 className="tp-h">What Creators Say</h2>
        <p className="tp-p tp-sub">Real words from real clients — coming soon.</p>
        <div className="tp-testimonials">
          <div className="tp-testimonial-row tp-testimonial-row-left">
            {[...testimonials.slice(0, 3), ...testimonials.slice(0, 3)].map((item, index) => (
              <article className="tp-tcard" key={`t1-${index}`} aria-hidden={index >= 3}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                  <span className="tp-av" style={{ width: 40, height: 40 }} />
                  <div>
                    <div style={{ font: "600 15px Inter" }}>{item.name}</div>
                    <div style={{ font: "400 13px Inter", color: "var(--body)" }}>{item.subs}</div>
                  </div>
                </div>
                <p style={{ fontSize: 15, lineHeight: "22px" }}>{item.quote}</p>
              </article>
            ))}
          </div>
          <div className="tp-testimonial-row tp-testimonial-row-right">
            {[...testimonials.slice(3, 6), ...testimonials.slice(3, 6)].map((item, index) => (
              <article className="tp-tcard" key={`t2-${index}`} aria-hidden={index >= 3}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                  <span className="tp-av" style={{ width: 40, height: 40 }} />
                  <div>
                    <div style={{ font: "600 15px Inter" }}>{item.name}</div>
                    <div style={{ font: "400 13px Inter", color: "var(--body)" }}>{item.subs}</div>
                  </div>
                </div>
                <p style={{ fontSize: 15, lineHeight: "22px" }}>{item.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="tp-wrap tp-sec" id="about">
        <div className="tp-about">
          <div className="tp-portrait" />
          <div>
            <Label>About</Label>
            <h2 className="tp-h">Thumbnail Specialist</h2>
            <div style={{ font: "600 28px Inter", letterSpacing: "-0.03em", margin: "12px 0" }}>Designing for clicks, not just looks.</div>
            <p className="tp-body">I help creators turn great videos into great first impressions, combining design craft with a deep understanding of what makes people click.</p>
            <div style={{ display: "grid", gap: 12, margin: "24px 0" }}>
              <div className="tp-li"><Check />[Your achievement #1]</div>
              <div className="tp-li"><Check />[Your achievement #2]</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <a href="#closing" className="tp-navbtn" style={{ position: "static" }}>Let's Work</a>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 16 }}>★★★★★</div>
                <div style={{ font: "500 14px Inter" }}>Trusted by [N]+ Creators</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tp-wrap tp-sec">
        <div className="tp-grid2" style={{ marginTop: 0, alignItems: "start" }}>
          <div className="tp-card">
            <div className="tp-t" style={{ marginBottom: 20 }}>Typical Designers</div>
            {["Generic templates", "Slow turnaround", "No strategy behind designs", "Limited revisions", "Poor communication"].map((x) => (
              <div className="tp-li" key={x} style={{ padding: "10px 0" }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="var(--accent)" /><path d="M6 6l6 6M12 6l-6 6" stroke="var(--text)" strokeWidth="1.8" /></svg>{x}
              </div>
            ))}
          </div>
          <div className="tp-dark" style={{ transform: "translateY(-16px)" }}>
            <div className="tp-t" style={{ marginBottom: 20 }}>Working With Me</div>
            {["Custom concept every time", "24–48h delivery", "CTR-driven strategy", "Unlimited revisions", "Direct, fast communication"].map((x) => (
              <div className="tp-li" key={x} style={{ padding: "10px 0" }}><Check s={18} />{x}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="tp-wrap tp-sec" id="pricing">
        <Label>Pricing</Label>
        <h2 className="tp-h">Simple, Transparent Pricing</h2>
        <p className="tp-p tp-sub">Pick a plan that matches your upload schedule. Replace these with your real prices.</p>
        <div className="tp-grid2">
          {[["Single", "$[X]", "/thumbnail", "One custom thumbnail, perfect for trying things out.", false], ["Pack", "$[Y]", "/5 thumbnails", "Best value for creators uploading weekly.", true]].map(([n, p, u, d, pop]) => (
            <div className="tp-card" key={n as string} style={{ position: "relative" }}>
              {pop && <span className="tp-badge">Popular</span>}
              <Plan n={n as string} p={p as string} u={u as string} d={d as string} />
            </div>
          ))}
          <div className="tp-card" style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <div style={{ font: "500 16px Inter", color: "var(--body)" }}>Ongoing</div>
              <div style={{ margin: "12px 0" }}><span className="tp-price">???</span> <span style={{ fontSize: 16 }}>/month</span></div>
              <p className="tp-body" style={{ marginBottom: 24 }}>A dedicated design partner for channels that publish often.</p>
              <a href="#closing" className="tp-darkbtn">Get in touch<span className="tp-arrow">→</span></a>
            </div>
            <Features />
          </div>
        </div>
      </section>

      <section className="tp-wrap tp-sec" id="faq">
        <div className="tp-faq">
          <div className="tp-left">
            <Label>FAQ</Label>
            <h2 className="tp-h">Questions? Answers.</h2>
            <p className="tp-body" style={{ marginTop: 12 }}>Still unsure? Book a quick call.</p>
          </div>
          <div>
            {faqs.map(([q, a], i) => (
              <div className={`tp-q ${open === i ? "open" : ""}`} key={q}>
                <button className="tp-qbtn" onClick={() => setOpen(open === i ? -1 : i)}>
                  {q}
                  <svg className="tp-chev" width="16" height="16" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="var(--text)" strokeWidth="1.6" fill="none" /></svg>
                </button>
                <div className="tp-ans"><div>{a}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tp-wrap tp-sec" id="closing">
        <div className="tp-close">
          {[["CTR ↑", "-12deg", "10%", "8%", true], ["Fast delivery", "8deg", "14%", "78%", false], ["Bold design", "-6deg", "78%", "6%", false], ["More views", "10deg", "80%", "80%", true], ["Brand-ready", "-4deg", "46%", "4%", false]].map(([t, r, top, left, blue], i) => (
            <span key={t as string} className="tp-float" style={{ top: top as string, left: left as string, rotate: r as string, animationDelay: `${i * 0.8}s`, background: blue ? "var(--blue)" : "var(--bg-mid)", color: blue ? "var(--bg)" : "var(--text)" }}>{t}</span>
          ))}
          <h2 className="tp-h">Ready To Get More Clicks?</h2>
          <p className="tp-p" style={{ color: "var(--text-muted)", maxWidth: 520, marginTop: 16 }}>Let's talk about your channel and design thumbnails your audience can't ignore.</p>
          <div className="tp-btns"><a href="#" className="tp-mono tp-primary" style={{ boxShadow: "inset 0 0 0 1px var(--blue-rim)" }}>Book a Call</a></div>
        </div>
      </section>

      <footer className="tp-foot">
        <div className="tp-wrap">
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="tp-logo">sa</div><span style={{ font: "600 18px Inter" }}>Sohaib Athar</span></div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "12px 0 20px" }}>Thumbnails that get clicked.</p>
              <div style={{ display: "flex", gap: 10 }}>{["X", "Th", "Ig", "Yt"].map((s) => <a key={s} href="#" className="tp-soc" aria-label={s}>{s}</a>)}</div>
            </div>
            <div>
              <div style={{ font: "600 14px Inter", marginBottom: 14 }}>Sections</div>
              {[["Home", "#home"], ["Projects", "#process"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
                <a key={l} href={h} style={{ display: "block", fontSize: 14, opacity: 0.7, marginBottom: 8 }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, fontSize: 14, color: "var(--text-muted)" }}>
            <span>© 2026 Sohaib Athar. All rights reserved.</span><span>Designed with care.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Features() {
  return (
    <div>
      <div style={{ font: "600 14px Inter", marginBottom: 12 }}>Features included:</div>
      {["Custom concept", "Unlimited revisions", "24–48h delivery", "Source file"].map((f) => (
        <div className="tp-li" key={f} style={{ padding: "6px 0" }}><Check s={16} />{f}</div>
      ))}
    </div>
  );
}

function Plan({ n, p, u, d }: { n: string; p: string; u: string; d: string }) {
  return (
    <>
      <div style={{ font: "500 16px Inter", color: "var(--body)" }}>{n}</div>
      <div style={{ margin: "12px 0" }}><span className="tp-price">{p}</span> <span style={{ fontSize: 16 }}>{u}</span></div>
      <p className="tp-body" style={{ marginBottom: 24 }}>{d}</p>
      <a href="#closing" className="tp-darkbtn">Get started<span className="tp-arrow">→</span></a>
      <div style={{ marginTop: 24 }}><Features /></div>
    </>
  );
}
