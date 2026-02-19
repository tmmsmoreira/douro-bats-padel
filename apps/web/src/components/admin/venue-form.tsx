'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { CreateVenueDto, UpdateVenueDto } from '@padel/types';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const saveMutation = useMutation({
    mutationFn: async (data: CreateVenueDto | UpdateVenueDto) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const url = venueId ? `${API_URL}/venues/${venueId}` : `${API_URL}/venues`;
      const method = venueId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      if (venueId) {
        queryClient.invalidateQueries({ queryKey: ['venue', venueId] });
      }
      router.push('/admin/venues');
    },
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
      alert(t('pleaseEnterVenueName'));
      return;
    }

    if (formData.courts.length === 0) {
      alert(t('pleaseAddAtLeastOneCourt'));
      return;
    }

    const dto: CreateVenueDto | UpdateVenueDto = {
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      logo: formData.logo.trim() || undefined,
      courts: formData.courts,
    };

    saveMutation.mutate(dto);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('venueDetails')}</CardTitle>
          <CardDescription>{t('venueDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('venueName')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('venueNamePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('address')}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder={t('addressPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">{t('logoUrl')}</Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
              placeholder={t('logoUrlPlaceholder')}
              type="url"
            />
            {formData.logo && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">{t('logoPreview')}</p>
                <img
                  src={formData.logo}
                  alt={t('logoPreviewAlt')}
                  className="h-16 w-16 object-contain border rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="court">{t('courtsLabel')} *</Label>
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
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/venues')}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? venueId
                  ? t('updating')
                  : t('creating')
                : venueId
                  ? t('updateVenue')
                  : t('createVenue')}
            </Button>
          </div>

          {saveMutation.isError && (
            <div className="text-sm text-destructive">
              {t('errorPrefix')}{' '}
              {saveMutation.error instanceof Error
                ? saveMutation.error.message
                : venueId
                  ? t('failedToUpdate')
                  : t('failedToCreate')}
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
