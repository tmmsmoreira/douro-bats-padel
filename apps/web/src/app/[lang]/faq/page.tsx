'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HomeNav } from '@/components/home-nav';
import { Footer } from '@/components/footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer:
      'Douro Bats Padel is an invitation-only platform for association members. To create an account, you must receive an invitation email from an administrator. The email will contain a unique registration link. Click the link and complete the registration form with your details.',
  },
  {
    category: 'Getting Started',
    question: 'Do I need to verify my email?',
    answer:
      "Yes, email verification is required to participate in tournaments. After signing up, you'll receive a verification email. Click the link in the email to verify your account.",
  },
  {
    category: 'Tournaments',
    question: 'How do I register for a tournament?',
    answer:
      'Browse available tournaments on the Events page, select the tournament you want to join, and click the registration button. Make sure to register before the deadline.',
  },
  {
    category: 'Tournaments',
    question: 'Can I cancel my tournament registration?',
    answer:
      'Yes, you can cancel your registration before the registration deadline. However, entry fees are non-refundable unless the tournament is cancelled by the organizers.',
  },
  {
    category: 'Tournaments',
    question: 'What happens if I miss my match?',
    answer:
      'If you miss your scheduled match without prior notice, you may be disqualified from the tournament. Please arrive on time and notify organizers if you have any issues.',
  },
  {
    category: 'Rankings',
    question: 'How does the ranking system work?',
    answer:
      'Rankings are calculated based on your match results and tournament performance. The system uses a sophisticated algorithm that considers wins, losses, opponent strength, and consistency over time.',
  },
  {
    category: 'Rankings',
    question: 'What are the different tiers?',
    answer:
      'There are five tiers: Explorers (beginner), Navigators (intermediate), Pioneers (advanced), Champions (expert), and Legends (elite). Your tier is determined by your rating and performance.',
  },
  {
    category: 'Rankings',
    question: 'How often are rankings updated?',
    answer:
      'Rankings are updated after each tournament concludes and all matches are published. You can view your current ranking and history on your profile page.',
  },
  {
    category: 'Account',
    question: 'How do I update my profile information?',
    answer:
      'Go to your account settings to update your name, email, profile photo, and other personal information. Some changes may require email verification.',
  },
  {
    category: 'Account',
    question: 'I forgot my password. What should I do?',
    answer:
      'Click the "Forgot Password" link on the login page and enter your email address. You\'ll receive instructions to reset your password.',
  },
  {
    category: 'Account',
    question: 'Can I delete my account?',
    answer:
      'Yes, you can request account deletion by contacting us at info@dourobatspadel.com. Please note that this action is permanent and cannot be undone.',
  },
  {
    category: 'Technical',
    question: 'What browsers are supported?',
    answer:
      'Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser up to date for the best experience.',
  },
  {
    category: 'Technical',
    question: 'Is there a mobile app?',
    answer:
      'Currently, we offer a mobile-responsive website that works great on smartphones and tablets. A dedicated mobile app may be available in the future.',
  },
  {
    category: 'Technical',
    question: "I'm experiencing technical issues. Who can I contact?",
    answer:
      "Please contact our support team at info@dourobatspadel.com with details about the issue you're experiencing. Include your browser type and any error messages you see.",
  },
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit cards, debit cards, and other payment methods depending on your location. Payment details are securely processed through our payment provider.',
  },
  {
    category: 'Payment',
    question: 'Are tournament fees refundable?',
    answer:
      "Tournament fees are generally non-refundable unless the tournament is cancelled by the organizers. Please review the specific tournament's refund policy before registering.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeNav />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-4xl flex-1">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Find answers to common questions about Douro Bats Padel
            </p>
          </div>

          {/* FAQ by Category */}
          {categories.map((category) => (
            <div key={category} className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">{category}</h2>
              <div className="space-y-2 sm:space-y-3">
                {faqs
                  .filter((faq) => faq.category === category)
                  .map((faq) => {
                    const globalIndex = faqs.indexOf(faq);
                    const isOpen = openIndex === globalIndex;

                    return (
                      <Card key={globalIndex} className="overflow-hidden">
                        <CardHeader
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleFAQ(globalIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium">{faq.question}</CardTitle>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                        </CardHeader>
                        {isOpen && (
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Contact Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Still have questions?</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-4">
                If you couldn&apos;t find the answer you&apos;re looking for, feel free to reach out
                to our support team.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
