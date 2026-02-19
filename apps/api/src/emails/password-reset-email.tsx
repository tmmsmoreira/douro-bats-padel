import {
  Body,
  Button,
  Container,
  Head,
  Heading,
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
          <Section style={content}>
            <Heading style={heading}>Reset Your Password</Heading>
            <Text style={paragraph}>Hi {name},</Text>
            <Text style={paragraph}>
              We received a request to reset your password. Click the button below to create a new
              password:
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
            <Text style={smallText}>This link will expire in 1 hour.</Text>
            <Text style={smallText}>
              If you didn't request a password reset, you can safely ignore this email.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>© {currentYear} Douro Bats Padel. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const content = {
  backgroundColor: '#f8f9fa',
  borderRadius: '10px',
  padding: '30px',
  marginBottom: '20px',
};

const heading = {
  color: '#2563eb',
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '20px',
};

const paragraph = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  marginBottom: '16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
};

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  marginTop: '16px',
  marginBottom: '8px',
};

const link = {
  color: '#2563eb',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
  display: 'block',
  marginBottom: '16px',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '20px',
};

const footerText = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '1.6',
};
