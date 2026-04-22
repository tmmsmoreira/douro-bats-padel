import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { Locale } from '@padel/types';
import { t } from '../i18n';

interface InvitationEmailProps {
  invitationUrl: string;
  invitedByName: string;
  locale: Locale;
}

export const InvitationEmail = ({
  invitationUrl = 'https://example.com/register',
  invitedByName = 'Admin',
  locale = Locale.PT,
}: InvitationEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>{t(locale, 'emails.invitation.preview')}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brandName}>Douro Bats Padel</Heading>
          </Section>

          <Section style={content}>
            <Heading style={heading}>{t(locale, 'emails.invitation.heading')}</Heading>
            <Text style={paragraph}>
              {t(locale, 'emails.invitation.body1', { inviterName: invitedByName })}
            </Text>
            <Text style={paragraph}>{t(locale, 'emails.invitation.body2')}</Text>

            <Section style={featuresBox}>
              <Text style={featuresTitle}>{t(locale, 'emails.invitation.featuresTitle')}</Text>
              <Text style={featureItem}>{t(locale, 'emails.invitation.feature1')}</Text>
              <Text style={featureItem}>{t(locale, 'emails.invitation.feature2')}</Text>
              <Text style={featureItem}>{t(locale, 'emails.invitation.feature3')}</Text>
              <Text style={featureItem}>{t(locale, 'emails.invitation.feature4')}</Text>
              <Text style={featureItem}>{t(locale, 'emails.invitation.feature5')}</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={invitationUrl}>
                {t(locale, 'emails.invitation.cta')}
              </Button>
            </Section>

            <Text style={smallText}>{t(locale, 'emails.common.orPaste')}</Text>
            <Link href={invitationUrl} style={link}>
              {invitationUrl}
            </Link>

            <Hr style={divider} />

            <Text style={infoText}>
              <strong>{t(locale, 'emails.invitation.expires')}</strong>
            </Text>
            <Text style={infoText}>{t(locale, 'emails.invitation.ignore')}</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              {t(locale, 'emails.common.footerCopyright', { year: currentYear })}
            </Text>
            <Text style={footerText}>{t(locale, 'emails.common.footerTagline')}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const getInvitationSubject = (locale: Locale) => t(locale, 'emails.invitation.subject');

export default InvitationEmail;

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    'Space Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #a3e635 0%, #8b5cf6 100%)',
  borderRadius: '16px 16px 0 0',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const brandName = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  letterSpacing: '-0.5px',
};

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
  letterSpacing: '-0.5px',
};

const paragraph = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '1.7',
  marginBottom: '16px',
};

const featuresBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #a3e635',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 0',
};

const featuresTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700',
  marginBottom: '12px',
  marginTop: '0',
};

const featureItem = {
  color: '#404040',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  background: 'linear-gradient(135deg, #a3e635 0%, #8b5cf6 100%)',
  borderRadius: '12px',
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  boxShadow: '0 4px 12px rgba(163, 230, 53, 0.3)',
};

const smallText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '1.6',
  marginTop: '20px',
  marginBottom: '8px',
};

const link = {
  color: '#a3e635',
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  display: 'block',
  marginBottom: '20px',
  textDecoration: 'underline',
};

const divider = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
};

const infoText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  marginBottom: '12px',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e5e5e5',
};

const footerText = {
  color: '#a3a3a3',
  fontSize: '13px',
  lineHeight: '1.8',
  margin: '4px 0',
};
