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

interface PromotionNotificationEmailProps {
  name: string;
  eventTitle: string;
}

export const PromotionNotificationEmail = ({
  name = 'Player',
  eventTitle = 'Game Night',
}: PromotionNotificationEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>You've been promoted from the waitlist for {eventTitle}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brandName}>Douro Bats Padel</Heading>
          </Section>
          <Section style={content}>
            <Heading style={heading}>You're In!</Heading>
            <Text style={paragraph}>
              Hi <strong>{name}</strong>,
            </Text>
            <Text style={paragraph}>
              A spot has opened up and you've been <strong>promoted from the waitlist</strong> for{' '}
              <strong>{eventTitle || 'the upcoming game night'}</strong>.
            </Text>
            <Text style={paragraph}>
              You are now confirmed! Make sure to arrive on time and bring your A-game.
            </Text>
            <Hr style={divider} />
            <Text style={infoText}>
              If you can no longer attend, please update your RSVP so another player can take your
              spot.
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

export default PromotionNotificationEmail;

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
