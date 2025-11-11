"use client";

import Link from "next/link";
import { useState } from "react";
import { Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Implement newsletter subscription
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
    }, 1000);
  };

  return (
    <footer className="mx-auto max-w-[1280px] rounded-t-[28px] overflow-hidden bg-[var(--c-bg-page)]">
      {/* Top CTA Section */}
      <section className="relative min-h-[260px] px-[clamp(16px,4vw,48px)] py-[clamp(16px,3vw,40px)]">
        {/* Background Image - Replace when available */}
        <div className="absolute inset-0 bg-center bg-cover bg-[var(--c-footer-dark)]"></div>
        <div className="absolute inset-0 bg-black/55 backdrop-saturate-[1.1] backdrop-contrast-[1.05]"></div>

        {/* CTA Bar */}
        <div className="relative z-10 flex items-start justify-between gap-4 mb-4 flex-wrap">
          <Link
            href="#contact"
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-bold uppercase tracking-[0.04em] border-2 border-white text-white hover:bg-white/10 active:translate-y-px transition focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-white/70"
          >
            Contact
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-[13px] font-extrabold uppercase tracking-[0.04em] bg-[var(--c-accent)] text-black shadow-[var(--shadow-soft)] hover:brightness-95 active:translate-y-px transition focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-white/70"
          >
            Contact Us
          </Link>
        </div>

        {/* CTA Text */}
        <div className="relative z-10 max-w-4xl">
          <h2 className="text-white uppercase font-black leading-[1.05] tracking-[0.02em] text-[clamp(28px,3.2vw+8px,44px)] mb-4">
            WE&apos;RE NOT ROCKET SCIENTISTS,
            <br />
            BUT WE DO BUSINESS WITH THEM
          </h2>
          <p className="text-white/85 text-[clamp(14px,1vw+10px,18px)]">
            Our team will connect you with the right people in our orbit.
          </p>
        </div>
      </section>

      {/* Bottom Footer Content */}
      <section className="bg-[var(--c-footer-light)] text-[var(--c-text)] rounded-t-[28px] px-[clamp(16px,4vw,48px)] py-[clamp(19px,3.6vw,56px)]">
        {/* Footer Grid */}
        <div className="grid gap-[clamp(20px,3vw,40px)] md:grid-cols-[290px_1fr] items-start mb-8">
          {/* Logo & Socials */}
          <aside className="space-y-3">
            <Link href="/" className="inline-block">
              {/* Logo placeholder - replace with actual logo */}
              <div className="h-20 w-20 rounded bg-[var(--c-accent)] flex items-center justify-center mb-4">
                <span className="text-[var(--c-footer-dark)] font-bold text-2xl">CF</span>
              </div>
            </Link>
            <div className="flex gap-4 text-[22px] my-3">
              <a
                href="https://twitter.com/capitalfactory"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on X (Twitter)"
                className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
              >
                <Twitter size={22} />
              </a>
              <a
                href="https://linkedin.com/company/capital-factory"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on LinkedIn"
                className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
              >
                <Linkedin size={22} />
              </a>
              <a
                href="https://instagram.com/capitalfactory"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
              >
                <Instagram size={22} />
              </a>
            </div>
            <small className="text-sm text-[var(--c-text-muted)] mt-2 block">
              © {new Date().getFullYear()} Capital Factory. All rights reserved.
            </small>
          </aside>

          {/* Navigation Columns */}
          <nav className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {/* Startups */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#b05a18] mb-2 uppercase">
                Startups
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Join the Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Browse the Startups
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Browse the Mentors
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Job Opportunities
                  </Link>
                </li>
              </ul>
            </div>

            {/* Funding */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#b05a18] mb-2 uppercase">
                Funding
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Apply for Funding
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Investor Network
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Portfolio Companies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Partners */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#b05a18] mb-2 uppercase">
                Partners
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Become a Partner
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Corporate Partners
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Sponsor Events
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#b05a18] mb-2 uppercase">
                Company
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect With Us */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#b05a18] mb-2 uppercase">
                Connect With Us
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/signup"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Log In
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="block py-1.5 text-[15px] text-[#1b2430] hover:underline focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[var(--c-accent)]"
                  >
                    Newsletter
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Newsletter Signup Card */}
        <div className="mt-8 bg-[var(--c-footer-dark)] text-white rounded-2xl p-6 md:flex md:items-center md:justify-between md:gap-5">
          <div className="mb-4 md:mb-0">
            <h4 className="text-lg font-semibold mb-1">Join Capital Factory</h4>
            <p className="text-sm text-white/80 max-w-[46ch]">
              Surround yourself with more than 1,000 startups that have raised venture capital
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-4 md:mt-0 flex gap-3 w-full md:justify-end max-md:flex-col"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 max-w-[520px] rounded-full border-2 border-[var(--c-accent)] bg-white text-[var(--c-text)] px-4 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)] focus:ring-offset-2 focus:ring-offset-[var(--c-footer-dark)] max-md:w-full"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[var(--c-accent)] text-black font-extrabold tracking-[0.03em] px-5 py-3 shadow-[var(--shadow-soft)] hover:brightness-95 active:translate-y-px transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)] focus:ring-offset-2 focus:ring-offset-[var(--c-footer-dark)] max-md:w-full"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
      </section>
    </footer>
  );
}

