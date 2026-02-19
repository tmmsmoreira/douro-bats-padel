'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Venue {
  id: string;
  name: string;
  address?: string;
  logo?: string;
  courts: Court[];
}

interface Court {
  id: string;
  label: string;
  venueId: string;
}

export function VenuesList() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('venuesList');
  const [deleteVenue, setDeleteVenue] = useState<{ id: string; name: string } | null>(null);

  const { data: venues, isLoading } = useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/venues`);
      if (!res.ok) throw new Error('Failed to fetch venues');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (venueId: string) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/venues/${venueId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || 'Failed to delete venue');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast.success('Venue deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete venue: ${error.message}`);
    },
  });

  const handleEdit = (venueId: string) => {
    router.push(`/admin/venues/${venueId}/edit`);
  };

  const handleDelete = (venueId: string, venueName: string) => {
    setDeleteVenue({ id: venueId, name: venueName });
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('loadingVenues')}</div>;
  }

  if (!venues || venues.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noVenuesAvailable')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {venues.map((venue) => (
        <Card key={venue.id}>
          <CardHeader>
            <div className="flex items-start gap-4">
              {venue.logo && (
                <div className="relative h-16 w-16 rounded border overflow-hidden flex-shrink-0">
                  <Image
                    src={venue.logo}
                    alt={t('logo', { venueName: venue.name })}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <CardTitle>{venue.name}</CardTitle>
                {venue.address && (
                  <p className="text-sm text-muted-foreground mt-1">{venue.address}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(venue.id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(venue.id, venue.name)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div>
              <p className="text-sm font-medium mb-2">{t('courts')}</p>
              {venue.courts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {venue.courts.map((court) => (
                    <Badge key={court.id} variant="outline">
                      {court.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('noCourtsAvailable')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Venue Confirmation Dialog */}
      <AlertDialog open={!!deleteVenue} onOpenChange={(open) => !open && setDeleteVenue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('confirmDeleteVenue', { venueName: deleteVenue?.name })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this venue and all its courts. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteVenue) {
                  deleteMutation.mutate(deleteVenue.id);
                  setDeleteVenue(null);
                }
              }}
            >
              Delete Venue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
