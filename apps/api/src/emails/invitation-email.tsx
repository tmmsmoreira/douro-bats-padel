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

interface InvitationEmailProps {
  invitationUrl: string;
  invitedByName: string;
}

export const InvitationEmail = ({
  invitationUrl = 'https://example.com/register',
  invitedByName = 'Admin',
}: InvitationEmailProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>You've been invited to join Douro Bats Padel</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading style={heading}>You're Invited!</Heading>
            <Text style={paragraph}>
              {invitedByName} has invited you to join Douro Bats Padel, our exclusive padel
              community.
            </Text>
            <Text style={paragraph}>
              Douro Bats Padel is a members-only platform for managing padel game nights, including
              player registrations, draw generation, results tracking, and automatic rankings.
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={invitationUrl}>
                Accept Invitation & Register
              </Button>
            </Section>
            <Text style={smallText}>Or copy and paste this link into your browser:</Text>
            <Link href={invitationUrl} style={link}>
              {invitationUrl}
            </Link>
            <Text style={smallText}>This invitation will expire in 7 days.</Text>
            <Text style={smallText}>
              If you weren't expecting this invitation, you can safely ignore this email.
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

export default InvitationEmail;

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
  color: '#16a34a',
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
  backgroundColor: '#16a34a',
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
  color: '#16a34a',
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
