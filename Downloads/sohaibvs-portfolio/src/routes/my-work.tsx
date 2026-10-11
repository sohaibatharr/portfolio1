import { createFileRoute } from "@tanstack/react-router";
import { Gallery } from "../components/Gallery";

const navLinks = [
  ["Home", "/"],
  ["My Work", "/my-work"],
  ["Featured", "/#featured-work"],
  ["Testimonials", "/#testimonials"],
  ["About Me", "/#about"],
  ["Pricing", "/#pricing"],
  ["FAQ", "/#faq"],
] as const;

export const Route = createFileRoute("/my-work")({
  component: MyWorkPage,
});

function MyWorkPage() {
  return (
    <div className="tp tp-work-page" id="home">
      <nav className="tp-nav tp-page-nav">
        <div className="tp-logo">sa</div>
        <ul className="tp-links tp-links-page">
          {navLinks.map(([label, href]) => (
            <li key={label}><a href={href}>{label}</a></li>
          ))}
        </ul>
        <a href="/" className="tp-navbtn">Home</a>
      </nav>

      <main className="tp-wrap tp-work-main">
        <Gallery />
      </main>
    </div>
  );
}
