'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { CopyIcon, DeleteIcon } from 'lucide-animated';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import type { Invitation, InvitationStatus } from '@padel/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

export function InvitationsList() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [revokeInvitationId, setRevokeInvitationId] = useState<string | null>(null);
  const [deleteInvitationId, setDeleteInvitationId] = useState<string | null>(null);

  const { data: invitations, isLoading } = useQuery<Invitation[]>({
    queryKey: ['invitations'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/invitations`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch invitations');
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/invitations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to revoke invitation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success(t('revokedInvitation'));
    },
    onError: () => {
      toast.error(t('revokedInvitationError'));
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/invitations/${id}/resend`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to resend invitation');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success(t('invitationResent'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('resendInvitationError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/invitations/${id}/permanent`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete invitation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success(t('invitationDeleted'));
    },
    onError: () => {
      toast.error(t('deleteInvitationError'));
    },
  });

  const copyInvitationLink = (token: string) => {
    const link = `${WEB_URL}/register?invitation=${token}`;
    navigator.clipboard.writeText(link);
    toast.success(t('linkCopied'));
  };

  const getStatusBadge = (status: InvitationStatus) => {
    const variants: Record<InvitationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> =
      {
        PENDING: 'default',
        ACCEPTED: 'secondary',
        REVOKED: 'destructive',
        EXPIRED: 'outline',
      };

    return (
      <Badge variant={variants[status]}>
        {t(`invitation${status.charAt(0) + status.slice(1).toLowerCase()}`)}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noInvitations')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card className="glass-card" key={invitation.id}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{invitation.email}</p>
                  {getStatusBadge(invitation.status)}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {t('expiresAt')}: {new Date(invitation.expiresAt).toLocaleDateString(locale)}
                  </p>
                  {invitation.usedAt && (
                    <p>
                      {t('usedAt')}: {new Date(invitation.usedAt).toLocaleDateString(locale)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {invitation.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInvitationLink(invitation.token)}
                    >
                      <CopyIcon size={16} className="h-4 w-4" />
                      {t('copyLink')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendMutation.mutate(invitation.id)}
                      disabled={resendMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                      {t('resendInvitation')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setRevokeInvitationId(invitation.id)}
                    >
                      <DeleteIcon size={16} className="h-4 w-4" />
                      {t('revokeInvitation')}
                    </Button>
                  </>
                )}
                {invitation.status === 'REVOKED' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteInvitationId(invitation.id)}
                  >
                    <DeleteIcon size={16} className="h-4 w-4" />
                    {t('deleteInvitation')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Revoke Invitation Confirmation Dialog */}
      <ConfirmationDialog
        open={!!revokeInvitationId}
        onOpenChange={(open) => !open && setRevokeInvitationId(null)}
        title={t('confirmRevokeInvitation')}
        description="This action cannot be undone."
        confirmText={t('revokeInvitation')}
        confirmingText={t('revokingInvitation')}
        cancelText={t('cancel')}
        variant="default"
        onConfirm={() => {
          if (revokeInvitationId) {
            revokeMutation.mutate(revokeInvitationId);
            setRevokeInvitationId(null);
          }
        }}
      />

      {/* Delete Invitation Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteInvitationId}
        onOpenChange={(open) => !open && setDeleteInvitationId(null)}
        title={t('confirmDeleteInvitation')}
        description="This will permanently delete this invitation from the database. This action cannot be undone."
        confirmText={t('deleteInvitation')}
        confirmingText={t('deletingInvitation')}
        cancelText={t('cancel')}
        variant="destructive"
        onConfirm={() => {
          if (deleteInvitationId) {
            deleteMutation.mutate(deleteInvitationId);
            setDeleteInvitationId(null);
          }
        }}
      />
    </div>
  );
}
