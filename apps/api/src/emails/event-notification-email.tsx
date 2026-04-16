import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EventNotificationEmailProps {
  name: string;
  eventTitle: string;
  type: 'draw-published' | 'results-published' | 'event-open';
}

const config = {
  'draw-published': {
    preview: (title: string) => `The draw for ${title} has been published!`,
    heading: 'Draw Published',
    body: (title: string) =>
      `The draw for **${title || 'the upcoming game night'}** has been published. Check the app to see your court and team assignments.`,
  },
  'results-published': {
    preview: (title: string) => `Results for ${title} are now available!`,
    heading: 'Results Are In!',
    body: (title: string) =>
      `The results for **${title || 'the game night'}** are now available. Check the app to see scores, rankings updates, and match details.`,
  },
  'event-open': {
    preview: (title: string) => `RSVP is now open for ${title}!`,
    heading: 'RSVP Now Open',
    body: (title: string) =>
      `Registration is now open for **${title || 'the next game night'}**. Head to the app to confirm your spot before it fills up!`,
  },
};

export const EventNotificationEmail = ({
  name = 'Player',
  eventTitle = 'Game Night',
  type = 'draw-published',
}: EventNotificationEmailProps) => {
  const currentYear = new Date().getFullYear();
  const cfg = config[type];

  return (
    <Html>
      <Head />
      <Preview>{cfg.preview(eventTitle)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brandName}>Douro Bats Padel</Heading>
          </Section>
          <Section style={content}>
            <Heading style={headingStyle}>{cfg.heading}</Heading>
            <Text style={paragraph}>
              Hi <strong>{name}</strong>,
            </Text>
            <Text style={paragraph}>{cfg.body(eventTitle)}</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {currentYear} Douro Bats Padel. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default EventNotificationEmail;

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Space Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' };
const header = {
  background: 'linear-gradient(135deg, #a3e635 0%, #8b5cf6 100%)',
  borderRadius: '16px 16px 0 0',
  padding: '32px 40px',
  textAlign: 'center' as const,
};
const brandName = { color: '#ffffff', fontSize: '32px', fontWeight: '700', margin: '0' };
const content = {
  backgroundColor: '#ffffff',
  borderRadius: '0 0 16px 16px',
  padding: '40px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
};
const headingStyle = {
  color: '#1a1a1a',
  fontSize: '26px',
  fontWeight: '700',
  marginTop: '0',
  marginBottom: '24px',
};
const paragraph = { color: '#404040', fontSize: '16px', lineHeight: '1.7', marginBottom: '16px' };
const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e5e5e5',
};
const footerText = { color: '#a3a3a3', fontSize: '13px', lineHeight: '1.8', margin: '4px 0' };
