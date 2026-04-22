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
import { Locale } from '@padel/types';
import { t } from '../i18n';

interface RSVPConfirmationEmailProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  locale: Locale;
}

export const RSVPConfirmationEmail = ({
  name = 'Player',
  eventTitle = 'Game Night',
  eventDate = '',
  locale = Locale.PT,
}: RSVPConfirmationEmailProps) => {
  const currentYear = new Date().getFullYear();
  const resolvedEventTitle = eventTitle || t(locale, 'emails.defaults.upcomingGameNight');

  return (
    <Html>
      <Head />
      <Preview>
        {t(locale, 'emails.rsvpConfirmation.preview', { event: resolvedEventTitle })}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brandName}>Douro Bats Padel</Heading>
          </Section>
          <Section style={content}>
            <Heading style={heading}>{t(locale, 'emails.rsvpConfirmation.heading')}</Heading>
            <Text style={paragraph}>{t(locale, 'emails.common.greeting', { name })}</Text>
            <Text style={paragraph}>
              {eventDate
                ? t(locale, 'emails.rsvpConfirmation.bodyWithDate', {
                    event: resolvedEventTitle,
                    date: eventDate,
                  })
                : t(locale, 'emails.rsvpConfirmation.bodyNoDate', { event: resolvedEventTitle })}
            </Text>
            <Text style={paragraph}>{t(locale, 'emails.rsvpConfirmation.body2')}</Text>
            <Hr style={divider} />
            <Text style={infoText}>{t(locale, 'emails.rsvpConfirmation.info')}</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              {t(locale, 'emails.common.footerCopyright', { year: currentYear })}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const getRsvpConfirmationSubject = (locale: Locale, eventTitle: string) =>
  t(locale, 'emails.rsvpConfirmation.subject', {
    event: eventTitle || t(locale, 'emails.defaults.gameNight'),
  });

export default RSVPConfirmationEmail;

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
