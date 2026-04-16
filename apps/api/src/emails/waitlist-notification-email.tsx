import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WaitlistNotificationEmailProps {
  name: string;
  eventTitle: string;
  position: number;
}

export const WaitlistNotificationEmail = ({
  name = 'Player',
  eventTitle = 'Game Night',
  position = 1,
}: WaitlistNotificationEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>You're on the waitlist for {eventTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brandName}>Douro Bats Padel</Heading>
          </Section>
          <Section style={content}>
            <Heading style={heading}>Waitlisted - Position #{position}</Heading>
            <Text style={paragraph}>
              Hi <strong>{name}</strong>,
            </Text>
            <Text style={paragraph}>
              The event <strong>{eventTitle || 'the upcoming game night'}</strong> is currently
              full, but you've been added to the waitlist at <strong>position #{position}</strong>.
            </Text>
            <Text style={paragraph}>
              If a spot opens up, you'll be automatically promoted and notified. Hang tight!
            </Text>
            <Hr style={divider} />
            <Text style={infoText}>
              You'll receive an email notification if you get promoted to a confirmed spot.
            </Text>
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

export default WaitlistNotificationEmail;

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
const heading = {
  color: '#1a1a1a',
  fontSize: '26px',
  fontWeight: '700',
  marginTop: '0',
  marginBottom: '24px',
};
const paragraph = { color: '#404040', fontSize: '16px', lineHeight: '1.7', marginBottom: '16px' };
const divider = { borderColor: '#e5e5e5', margin: '32px 0' };
const infoText = { color: '#666666', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' };
const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e5e5e5',
};
const footerText = { color: '#a3a3a3', fontSize: '13px', lineHeight: '1.8', margin: '4px 0' };
