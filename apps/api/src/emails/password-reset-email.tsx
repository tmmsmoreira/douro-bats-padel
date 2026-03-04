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

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({
  name = 'Player',
  resetUrl = 'https://example.com/reset-password',
}: PasswordResetEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Reset your Douro Bats Padel password</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient */}
          <Section style={header}>
            <Heading style={brandName}>Douro Bats Padel</Heading>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Heading style={heading}>Password Reset Request 🔐</Heading>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              We received a request to reset your password for your Douro Bats Padel account.
            </Text>
            <Text style={paragraph}>
              Click the button below to create a new password and regain access to your account:
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>
            <Text style={smallText}>Or copy and paste this link into your browser:</Text>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
            <Hr style={divider} />
            <Text style={warningText}>
              <strong>⏱️ This link will expire in 1 hour</strong>
            </Text>
            <Text style={infoText}>
              If you didn't request a password reset, you can safely ignore this email. Your
              password will remain unchanged.
            </Text>
            <Text style={securityText}>
              🔒 For security reasons, this link can only be used once.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>© {currentYear} Douro Bats Padel. All rights reserved.</Text>
            <Text style={footerText}>
              Exclusive padel community · Game nights · Rankings · Draws
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

// Styles - Matching Douro Bats Padel branding
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

const warningText = {
  color: '#dc2626',
  fontSize: '14px',
  lineHeight: '1.6',
  marginBottom: '12px',
};

const infoText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  marginBottom: '12px',
};

const securityText = {
  color: '#8b5cf6',
  fontSize: '14px',
  lineHeight: '1.6',
  marginBottom: '12px',
  fontWeight: '500',
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
