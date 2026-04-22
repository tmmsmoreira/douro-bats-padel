'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateInvitation } from '@/hooks';
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
import { SendIcon, SendIconHandle } from '@/components/icons/send-icon';

export function CreateInvitationDialog() {
  const t = useTranslations('admin');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [expirationDays, setExpirationDays] = useState('7');
  const iconRef = useRef<SendIconHandle>(null);

  // Use custom hook for creating invitation
  const createMutation = useCreateInvitation((data: unknown) => {
    const result = data as { emailSent?: boolean };
    if (result.emailSent === false) {
      toast.warning(t('invitationCreatedEmailFailed'));
    }
    setOpen(false);
    setEmail('');
    setName('');
    setExpirationDays('7');
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
          {t('sendInvitation')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('sendInvitation')}</DialogTitle>
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
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? t('sending') : t('send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
