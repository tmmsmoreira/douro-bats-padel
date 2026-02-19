import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp } from 'lucide-react';
import { Footer } from '@/components/footer';
import { HomeNavClient } from '@/components/client-nav-wrapper';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNavClient />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-4xl flex-1">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">About Douro Bats Padel</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Your premier padel tournament management platform
            </p>
          </div>

          {/* Mission Statement */}
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <p className="text-muted-foreground">
                Douro Bats Padel is dedicated to bringing the padel community together through
                organized, competitive, and fun tournaments. We believe in creating an inclusive
                environment where players of all skill levels can compete, improve, and enjoy the
                sport they love.
              </p>
              <p className="text-muted-foreground">
                Our platform simplifies tournament management, player rankings, and event
                organization, making it easier than ever to participate in competitive padel.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Competitive Tournaments</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">
                  Participate in professionally organized tournaments with fair matchmaking and
                  transparent scoring systems.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Player Rankings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">
                  Track your progress with our comprehensive ranking system that rewards consistent
                  performance and skill development.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Community Driven</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">
                  Join a vibrant community of padel enthusiasts, make new friends, and connect with
                  players who share your passion.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Easy Event Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">
                  Simple registration, automated draws, and real-time updates make participating in
                  events hassle-free.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Our Story */}
          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <p className="text-muted-foreground">
                Founded in Porto, Portugal, Douro Bats Padel emerged from a passion for the sport
                and a desire to create a better tournament experience for players and organizers
                alike.
              </p>
              <p className="text-muted-foreground">
                What started as a small local tournament series has grown into a comprehensive
                platform serving the padel community with state-of-the-art technology and a
                commitment to fair play.
              </p>
              <p className="text-muted-foreground">
                Today, we continue to innovate and improve, always listening to our community and
                striving to provide the best possible experience for everyone involved in the sport.
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Fair Play:</strong> We believe in transparent rules and equal
                    opportunities for all players.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Community:</strong> Building lasting connections and friendships through
                    sport.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Excellence:</strong> Continuously improving our platform and services.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Inclusivity:</strong> Welcoming players of all backgrounds and skill
                    levels.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
