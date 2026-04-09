import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Trust Score", href: "#how-it-works" },
    { label: "Extension", href: "#features" },
    { label: "API", href: "#features" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Status", href: "#" },
    { label: "Changelog", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer id="contact" className="border-t border-card-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top section — logo large */}
        <div className="mb-16">
          <h2 className="text-6xl font-bold tracking-tighter md:text-8xl">
            WAL<span className="text-accent">L</span>O
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted">
            Web3 security platform that helps you avoid scams before you
            interact with wallets, addresses, and crypto websites.
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
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

          {/* Contact column */}
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
                  href="mailto:hello@wallo.xyz"
                  className="text-sm text-zinc-400 transition-colors hover:text-foreground"
                >
                  hello@wallo.xyz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-card-border pt-8 md:flex-row">
          <p className="text-xs text-muted">
            © 2026 Wallo. All rights reserved.
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
