import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeNav } from "@/components/home-nav"
import { Footer } from "@/components/footer"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNav />
      <main className="container mx-auto px-4 py-12 max-w-4xl flex-1">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>
        </div>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>1. What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your device when you visit our platform. They help us
              provide you with a better experience by remembering your preferences and understanding how you use our
              platform.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>2. Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Essential Cookies</h3>
            <p className="text-muted-foreground">
              These cookies are necessary for the platform to function properly. They enable core functionality such as
              security, authentication, and accessibility. The platform cannot function properly without these cookies.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Authentication tokens (session management)</li>
              <li>Security cookies (CSRF protection)</li>
              <li>Load balancing cookies</li>
            </ul>

            <h3 className="font-semibold mt-4">Functional Cookies</h3>
            <p className="text-muted-foreground">
              These cookies enable enhanced functionality and personalization, such as remembering your preferences and
              settings.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Language preferences</li>
              <li>Theme preferences (light/dark mode)</li>
              <li>User interface customizations</li>
            </ul>

            <h3 className="font-semibold mt-4">Analytics Cookies</h3>
            <p className="text-muted-foreground">
              These cookies help us understand how visitors interact with our platform by collecting and reporting
              information anonymously.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Page views and navigation patterns</li>
              <li>Time spent on pages</li>
              <li>Error tracking and performance monitoring</li>
            </ul>

            <h3 className="font-semibold mt-4">Performance Cookies</h3>
            <p className="text-muted-foreground">
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance of
              our platform.
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>3. Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may use third-party services that set cookies on your device. These include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                <strong>Google OAuth:</strong> For authentication and single sign-on functionality
              </li>
              <li>
                <strong>Analytics Services:</strong> To understand platform usage and improve our services
              </li>
            </ul>
            <p className="text-muted-foreground">
              These third parties have their own privacy policies and cookie policies. We recommend reviewing them to
              understand how they use cookies.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Duration */}
        <Card>
          <CardHeader>
            <CardTitle>4. How Long Do Cookies Last?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Session Cookies</h3>
            <p className="text-muted-foreground">
              These are temporary cookies that expire when you close your browser. They are used to maintain your session
              while you navigate the platform.
            </p>

            <h3 className="font-semibold mt-4">Persistent Cookies</h3>
            <p className="text-muted-foreground">
              These cookies remain on your device for a set period or until you delete them. They are used to remember
              your preferences and settings across multiple sessions.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Authentication tokens: Up to 7 days</li>
              <li>Preference cookies: Up to 1 year</li>
              <li>Analytics cookies: Up to 2 years</li>
            </ul>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>5. How to Manage Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences
              through your browser settings:
            </p>

            <h3 className="font-semibold mt-4">Browser Settings</h3>
            <p className="text-muted-foreground">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from specific websites</li>
              <li>Block all cookies from being set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <p className="text-muted-foreground mt-4">
              Please note that if you choose to block or delete cookies, some features of our platform may not function
              properly, and you may not be able to access certain areas of the platform.
            </p>

            <h3 className="font-semibold mt-4">Browser-Specific Instructions</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>
                <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
              </li>
              <li>
                <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
              </li>
              <li>
                <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
              </li>
              <li>
                <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle>6. Changes to This Cookie Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other
              operational, legal, or regulatory reasons. Please check this page periodically for updates.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>7. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions about our use of cookies, please contact us at{" "}
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

