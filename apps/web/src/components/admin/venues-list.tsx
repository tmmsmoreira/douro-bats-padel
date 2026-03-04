'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  SquarePenIcon,
  DeleteIcon,
  DeleteIconHandle,
  SquarePenIconHandle,
  MapPinIcon,
} from 'lucide-animated';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';

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
  const deleteIconRef = useRef<DeleteIconHandle>(null);
  const squarePenIconRef = useRef<SquarePenIconHandle>(null);

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
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="space-y-4"
    >
      {venues.map((venue) => (
        <motion.div
          key={venue.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <Card className="glass-card group hover:shadow-xl transition-all duration-300 border-border/50">
            <CardContent className="p-6 space-y-4">
              {/* Top Section: Logo, Name, Address, and Actions */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Square Avatar for Venue Logo */}
                  <Avatar className="h-14 w-14 rounded-lg shrink-0">
                    {venue.logo ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={venue.logo}
                          alt={t('logo', { venueName: venue.name })}
                          fill
                          className="object-contain p-1"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <AvatarFallback className="gradient-primary text-lg font-semibold rounded-lg">
                        {venue.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Venue Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-lg truncate">{venue.name}</h3>
                    {venue.address && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPinIcon size={14} className="text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground truncate">{venue.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(venue.id)}
                    onMouseEnter={() => squarePenIconRef.current?.startAnimation()}
                    onMouseLeave={() => squarePenIconRef.current?.stopAnimation()}
                  >
                    <SquarePenIcon ref={squarePenIconRef} size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(venue.id, venue.name)}
                    disabled={deleteMutation.isPending}
                    onMouseEnter={() => deleteIconRef.current?.startAnimation()}
                    onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
                  >
                    <DeleteIcon ref={deleteIconRef} size={16} />
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* Bottom Section: Courts */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('courts')}</p>
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
        </motion.div>
      ))}

      {/* Delete Venue Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteVenue}
        onOpenChange={(open) => !open && setDeleteVenue(null)}
        title={t('confirmDeleteVenue', { venueName: deleteVenue?.name ?? '' })}
        description={t('deleteVenueDescription')}
        confirmText={t('deleteVenueButton')}
        cancelText={t('cancel')}
        variant="destructive"
        onConfirm={() => {
          if (deleteVenue) {
            deleteMutation.mutate(deleteVenue.id);
            setDeleteVenue(null);
          }
        }}
      />
    </motion.div>
  );
}
