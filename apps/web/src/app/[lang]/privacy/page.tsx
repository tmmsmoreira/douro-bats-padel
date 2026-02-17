import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { HomeNavClient } from "@/components/client-nav-wrapper"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavClient />
      <main className="container mx-auto px-4 py-12 max-w-4xl flex-1">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>
        </div>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              At Douro Bats Padel, we take your privacy seriously. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-muted-foreground">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
              please do not access the platform.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle>2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Personal Information</h3>
            <p className="text-muted-foreground">We may collect personal information that you provide to us, including:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Name and email address</li>
              <li>Profile photo</li>
              <li>Contact information (phone number, address)</li>
              <li>Payment information for tournament fees</li>
              <li>Tournament participation and match results</li>
            </ul>

            <h3 className="font-semibold mt-4">Automatically Collected Information</h3>
            <p className="text-muted-foreground">When you access our platform, we may automatically collect:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>3. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Create and manage your account</li>
              <li>Process tournament registrations and payments</li>
              <li>Calculate and display player rankings</li>
              <li>Send you notifications about tournaments and matches</li>
              <li>Improve our platform and services</li>
              <li>Communicate with you about updates and announcements</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>4. Information Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Other players (name, profile photo, and ranking information)</li>
              <li>Tournament organizers and venue operators</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Law enforcement or regulatory authorities when required by law</li>
            </ul>
            <p className="text-muted-foreground">
              We do not sell your personal information to third parties.
            </p>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle>5. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational security measures to protect your personal
              information. However, no method of transmission over the internet or electronic storage is 100% secure, and
              we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>6. Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We retain your personal information for as long as necessary to provide our services and comply with legal
              obligations. You may request deletion of your account and associated data at any time.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>7. Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Access and review your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to certain data processing activities</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="text-muted-foreground">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:privacy@dourobatspadel.com" className="text-primary hover:underline">
                privacy@dourobatspadel.com
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>8. Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience on our platform. You can
              control cookie settings through your browser preferences. For more information, see our{" "}
              <a href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card>
          <CardHeader>
            <CardTitle>9. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our platform may contain links to third-party websites or integrate with third-party services (such as
              Google OAuth). We are not responsible for the privacy practices of these third parties. We encourage you to
              review their privacy policies.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>10. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our platform is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you believe we have collected information from a child under 13,
              please contact us immediately.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card>
          <CardHeader>
            <CardTitle>11. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>12. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">
              If you have questions or concerns about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@dourobatspadel.com" className="text-primary hover:underline">
                privacy@dourobatspadel.com
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
      </main>
      <Footer />
    </div>
  )
}

