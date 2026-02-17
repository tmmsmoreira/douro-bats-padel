"use client"

import { Link } from "@/i18n/navigation"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const tFooter = useTranslations('footer')
  const tNav = useTranslations('nav')
  const tContact = useTranslations('contact')

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Douro Bats Padel</h3>
            <p className="text-sm text-muted-foreground">
              {tFooter('description')}
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
            <h3 className="text-lg font-bold">{tFooter('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {tNav('home')}
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {tNav('events')}
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
                  {tNav('ranking')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {tNav('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{tFooter('legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  {tFooter('termsAndConditions')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  {tFooter('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  {tFooter('cookiePolicy')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  {tNav('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{tFooter('contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{tFooter('address')}</span>
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
                  {tFooter('phone')}
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  {tContact('sendMessage')} →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            <p>© {currentYear} Douro Bats Padel. {tFooter('allRightsReserved')}</p>
            <p>
              {tFooter('madeWith')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

