import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { HomeNavClient } from "@/components/client-nav-wrapper"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavClient />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-4xl flex-1">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Terms and Conditions</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Last updated: February 2026</p>
        </div>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">
              Welcome to Douro Bats Padel. These Terms and Conditions govern your use of our platform and services. By
              accessing or using our platform, you agree to be bound by these terms.
            </p>
            <p className="text-muted-foreground">
              If you do not agree with any part of these terms, you may not access the platform or use our services.
            </p>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>2. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">
              To participate in tournaments and access certain features, you must create an account. You are responsible
              for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and up-to-date information</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </CardContent>
        </Card>

        {/* Tournament Participation */}
        <Card>
          <CardHeader>
            <CardTitle>3. Tournament Participation</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">When participating in tournaments, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Abide by all tournament rules and regulations</li>
              <li>Respect other players, officials, and venue staff</li>
              <li>Arrive on time for scheduled matches</li>
              <li>Accept the decisions of tournament officials</li>
              <li>Play fairly and in the spirit of good sportsmanship</li>
            </ul>
            <p className="text-muted-foreground">
              Failure to comply with these requirements may result in disqualification, suspension, or permanent ban from
              the platform.
            </p>
          </CardContent>
        </Card>

        {/* Ranking System */}
        <Card>
          <CardHeader>
            <CardTitle>4. Ranking System</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">
              Our ranking system is designed to fairly assess player performance. Rankings are calculated based on match
              results and tournament participation. We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Modify the ranking algorithm to improve fairness</li>
              <li>Adjust rankings in cases of suspected manipulation or cheating</li>
              <li>Reset rankings at the beginning of each season</li>
            </ul>
          </CardContent>
        </Card>

        {/* Code of Conduct */}
        <Card>
          <CardHeader>
            <CardTitle>5. Code of Conduct</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">Users must not:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Engage in harassment, bullying, or discriminatory behavior</li>
              <li>Use offensive, abusive, or inappropriate language</li>
              <li>Attempt to manipulate rankings or tournament results</li>
              <li>Share account credentials with others</li>
              <li>Interfere with the platform's operation or security</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Fees and Payments */}
        <Card>
          <CardHeader>
            <CardTitle>6. Fees and Payments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">
              Some tournaments may require entry fees. All fees are non-refundable unless the tournament is cancelled by
              the organizers. Payment must be made in full before the registration deadline.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>7. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">
              All content on the platform, including text, graphics, logos, and software, is the property of Douro Bats
              Padel or its licensors and is protected by copyright and other intellectual property laws.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle>8. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">
              Douro Bats Padel is not liable for any injuries, losses, or damages that may occur during tournament
              participation. Users participate at their own risk and are responsible for their own health and safety.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>9. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting
              to the platform. Your continued use of the platform after changes are posted constitutes acceptance of the
              modified terms.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>10. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground">
              If you have any questions about these Terms and Conditions, please contact us at{" "}
              <a href="mailto:info@dourobatspadel.com" className="text-primary hover:underline">
                info@dourobatspadel.com
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

