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
import { Locale } from '@padel/types';
import { t } from '../i18n';

type EventNotificationType = 'draw-published' | 'results-published' | 'event-open';

interface EventNotificationEmailProps {
  name: string;
  eventTitle: string;
  type: EventNotificationType;
  locale: Locale;
}

const keyFor = (type: EventNotificationType) =>
  type === 'draw-published'
    ? 'drawPublished'
    : type === 'results-published'
      ? 'resultsPublished'
      : 'eventOpen';

const defaultTitleKey = (type: EventNotificationType) =>
  type === 'draw-published'
    ? 'emails.defaults.upcomingGameNight'
    : type === 'results-published'
      ? 'emails.defaults.theGameNight'
      : 'emails.defaults.nextGameNight';

export const EventNotificationEmail = ({
  name = 'Player',
  eventTitle = 'Game Night',
  type = 'draw-published',
  locale = Locale.PT,
}: EventNotificationEmailProps) => {
  const currentYear = new Date().getFullYear();
  const base = `emails.${keyFor(type)}`;
  const resolvedEventTitle = eventTitle || t(locale, defaultTitleKey(type));

  return (
    <Html>
      <Head />
      <Preview>{t(locale, `${base}.preview`, { event: resolvedEventTitle })}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brandName}>Douro Bats Padel</Heading>
          </Section>
          <Section style={content}>
            <Heading style={headingStyle}>{t(locale, `${base}.heading`)}</Heading>
            <Text style={paragraph}>{t(locale, 'emails.common.greeting', { name })}</Text>
            <Text style={paragraph}>
              {t(locale, `${base}.body`, { event: resolvedEventTitle })}
            </Text>
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

export const getEventNotificationSubject = (
  locale: Locale,
  type: EventNotificationType,
  eventTitle: string
) =>
  t(locale, `emails.${keyFor(type)}.subject`, {
    event: eventTitle || t(locale, 'emails.defaults.gameNight'),
  });

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
