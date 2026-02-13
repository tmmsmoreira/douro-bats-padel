"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { useDictionary } from "@/components/dictionary-provider"
import { useLocale } from "@/hooks/use-locale"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const dict = useDictionary()
  const locale = useLocale()

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{dict.footer.title || "Douro Bats Padel"}</h3>
            <p className="text-sm text-muted-foreground">
              {dict.footer.description}
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{dict.footer.quickLinks}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.nav.events}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/leaderboard`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.nav.ranking}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{dict.footer.legal}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/terms`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.footer.termsAndConditions}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.footer.cookiePolicy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.nav.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{dict.footer.contact}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{dict.footer.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href="mailto:info@dourobatspadel.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  info@dourobatspadel.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a href="tel:+351123456789" className="text-muted-foreground hover:text-primary transition-colors">
                  {dict.footer.phone}
                </a>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-primary hover:underline font-medium">
                  {dict.contact.sendMessage} →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Douro Bats Padel. {dict.footer.allRightsReserved}</p>
            <p>
              {dict.footer.madeWith}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

