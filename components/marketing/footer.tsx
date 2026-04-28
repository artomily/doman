import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Trust Score", href: "#how-it-works" },
    { label: "Extension", href: "#features" },
    { label: "API Reference", href: "/api-reference" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
  Resources: [
    { label: "Documentation", href: "https://doman-docs.vercel.app" },
    { label: "API Reference", href: "/api-reference" },
    { label: "Open Source", href: "#open-source" },
    { label: "Changelog", href: "#" },
  ],
};

const topNavLinks = [
  { label: "Product", href: "#features" },
  { label: "Company", href: "#about" },
  { label: "Resources", href: "#" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-card-border bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-12">
        {/* Top menu row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-card-border pb-8">
          <nav className="flex flex-wrap gap-6 md:gap-10">
            {topNavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium uppercase tracking-wider text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="mailto:hello@doman.xyz"
            className="text-xs text-muted transition-colors hover:text-foreground"
          >
            hello@doman.xyz
          </a>
        </div>

        {/* Big brand name — centered */}
        <div className="overflow-hidden py-6 text-center md:py-8">
          <h2 className="text-[20vw] sm:text-[15vw] md:text-[20vw] font-bold leading-none tracking-tighter">
            DOMA<span className="text-accent">N</span>
          </h2>
        </div>

        {/* Links grid below the brand name */}
        <div className="grid grid-cols-2 gap-8 border-t border-card-border pt-10 md:grid-cols-4">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect column */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Connect
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 transition-colors hover:text-foreground"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 transition-colors hover:text-foreground"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-zinc-400 transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@doman.xyz"
                  className="text-sm text-zinc-400 transition-colors hover:text-foreground"
                >
                  hello@doman.xyz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-card-border py-8 md:flex-row">
          <p className="text-xs text-muted">
            © 2026 Doman. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
