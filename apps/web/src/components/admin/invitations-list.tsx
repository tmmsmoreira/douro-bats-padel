'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Invitation, InvitationStatus } from '@padel/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

export function InvitationsList() {
  const t = useTranslations('admin');
  const { data: session } = useSession();
  const queryClient = useQueryClient();

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
      toast.success(t('invitationRevoked'));
    },
    onError: () => {
      toast.error(t('invitationError'));
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
        {t(`invitation${status.charAt(0) + status.slice(1).toLowerCase()}` as any)}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noInvitations')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{invitation.email}</p>
                  {getStatusBadge(invitation.status)}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {t('expiresAt')}: {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                  {invitation.usedAt && (
                    <p>
                      {t('usedAt')}: {new Date(invitation.usedAt).toLocaleDateString()}
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
                      <Copy className="h-4 w-4 mr-2" />
                      {t('copyLink')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('revokeInvitation')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('confirmRevokeInvitation')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => revokeMutation.mutate(invitation.id)}>
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
