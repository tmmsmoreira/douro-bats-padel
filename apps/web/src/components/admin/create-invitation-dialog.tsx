'use client';

import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { CreateInvitationDto } from '@padel/types';
import { SendIcon, SendIconHandle } from '@/components/icons/send-icon';
import { motion } from 'motion/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function CreateInvitationDialog() {
  const t = useTranslations('admin');
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [expirationDays, setExpirationDays] = useState('7');
  const iconRef = useRef<SendIconHandle>(null);

  const createMutation = useMutation({
    mutationFn: async (dto: CreateInvitationDto) => {
      const res = await fetch(`${API_URL}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create invitation');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success(t('invitationSent'));
      setOpen(false);
      setEmail('');
      setName('');
      setExpirationDays('7');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('invitationError'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      email,
      name,
      expiresInDays: parseInt(expirationDays, 10),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="gradient"
          className="gap-2 px-4 py-5 text-base font-medium w-full"
          onMouseEnter={() => iconRef.current?.startAnimation()}
          onMouseLeave={() => iconRef.current?.stopAnimation()}
          animate
        >
          <SendIcon size={18} ref={iconRef} />
          {t('createInvitation')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('createInvitation')}</DialogTitle>
            <DialogDescription>{t('invitationsDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('invitationEmail')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('invitationEmailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t('invitationName')}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t('invitationNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDays">{t('expirationDays')}</Label>
              <Input
                id="expirationDays"
                type="number"
                min="1"
                max="30"
                placeholder={t('expirationDaysPlaceholder')}
                value={expirationDays}
                onChange={(e) => setExpirationDays(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('sending') : t('sendInvitation')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
