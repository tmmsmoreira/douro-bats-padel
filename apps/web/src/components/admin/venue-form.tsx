'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { LoadingButton } from '@/components/ui/loading-button';
import type { CreateVenueDto, UpdateVenueDto } from '@padel/types';
import { XIcon } from 'lucide-animated';
import { useTranslations } from 'next-intl';
import { getShimmerDataURL } from '@/lib/image-blur';
import { useFormMutation } from '@/hooks';

interface VenueFormProps {
  venueId?: string;
  initialData?: {
    name: string;
    address?: string;
    logo?: string;
    courts: Array<{ label: string }>;
  };
}

export function VenueForm({ venueId, initialData }: VenueFormProps) {
  const router = useRouter();
  const t = useTranslations('venueForm');

  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    logo: string;
    courts: string[];
  }>({
    name: '',
    address: '',
    logo: '',
    courts: [],
  });

  // Load initial data for edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address || '',
        logo: initialData.logo || '',
        courts: initialData.courts.map((c) => c.label),
      });
    }
  }, [initialData]);

  const [courtInput, setCourtInput] = useState('');

  // Use the standardized form mutation hook
  const saveMutation = useFormMutation<CreateVenueDto | UpdateVenueDto>({
    endpoint: venueId ? `/venues/${venueId}` : '/venues',
    method: venueId ? 'PATCH' : 'POST',
    invalidateKeys: venueId ? [['venues'], ['venue', venueId]] : [['venues']],
    successMessage: venueId ? t('venueUpdatedSuccess') : t('venueCreatedSuccess'),
    errorMessage: venueId ? t('venueUpdateError') : t('venueCreateError'),
    redirectPath: '/admin/venues',
  });

  const handleAddCourt = () => {
    const trimmedCourt = courtInput.trim();
    if (trimmedCourt && !formData.courts.includes(trimmedCourt)) {
      setFormData((prev) => ({
        ...prev,
        courts: [...prev.courts, trimmedCourt],
      }));
      setCourtInput('');
    }
  };

  const handleRemoveCourt = (courtToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      courts: prev.courts.filter((court) => court !== courtToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('pleaseEnterVenueName'));
      return;
    }

    if (formData.courts.length === 0) {
      toast.error(t('pleaseAddAtLeastOneCourt'));
      return;
    }

    const dto: CreateVenueDto | UpdateVenueDto = {
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      logo: formData.logo.trim() || undefined,
      courts: formData.courts,
    };

    // Check for changes in edit mode
    if (venueId && initialData) {
      const hasChanges =
        formData.name.trim() !== initialData.name ||
        formData.address.trim() !== (initialData.address || '') ||
        formData.logo.trim() !== (initialData.logo || '') ||
        JSON.stringify(formData.courts.sort()) !==
          JSON.stringify(initialData.courts.map((c) => c.label).sort());

      if (!hasChanges) {
        toast.info(t('noChangesToSave') || 'No changes to save');
        router.push('/admin/venues');
        return;
      }
    }

    saveMutation.mutate(dto);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('venueDetails')}</CardTitle>
          <CardDescription>{t('venueDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field>
            <FieldLabel htmlFor="name">{t('venueName')} *</FieldLabel>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('venueNamePlaceholder')}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="address">{t('address')}</FieldLabel>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder={t('addressPlaceholder')}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="logo">{t('logoUrl')}</FieldLabel>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
              placeholder={t('logoUrlPlaceholder')}
              type="url"
            />
            {formData.logo && (
              <FieldDescription>
                <span className="block mb-2">{t('logoPreview')}</span>
                <div className="relative h-16 w-16 border rounded overflow-hidden">
                  <Image
                    src={formData.logo}
                    alt={t('logoPreviewAlt')}
                    fill
                    placeholder="blur"
                    blurDataURL={getShimmerDataURL(64, 64)}
                    className="object-contain"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="court">{t('courtsLabel')} *</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="court"
                value={courtInput}
                onChange={(e) => setCourtInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCourt();
                  }
                }}
                placeholder={t('courtLabelPlaceholder')}
              />
              <Button type="button" onClick={handleAddCourt}>
                {t('addCourt')}
              </Button>
            </div>
            {formData.courts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.courts.map((court) => (
                  <Badge key={court} variant="secondary" className="flex items-center gap-1">
                    {court}
                    <button
                      type="button"
                      onClick={() => handleRemoveCourt(court)}
                      className="ml-1 hover:text-destructive"
                    >
                      <XIcon size={16} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Field>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/venues')}
            animate
          >
            {t('cancel')}
          </Button>
          <LoadingButton
            type="submit"
            isLoading={saveMutation.isPending}
            loadingText={venueId ? t('updating') : t('creating')}
            animate
          >
            {venueId ? t('updateVenue') : t('createVenue')}
          </LoadingButton>
        </CardFooter>
      </Card>
    </form>
  );
}
