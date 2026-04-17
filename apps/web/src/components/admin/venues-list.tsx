'use client';

import { useRef, useState } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useDeleteVenue, useVenues } from '@/hooks/use-venues';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SquarePenIcon,
  DeleteIcon,
  DeleteIconHandle,
  SquarePenIconHandle,
  MapPinIcon,
} from 'lucide-animated';
import { MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getShimmerDataURL } from '@/lib/image-blur';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { DataStateWrapper } from '@/components/shared/data-state-wrapper';
import { useIsFromBfcache } from '@/hooks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { Venue } from '@padel/types';

export function VenuesList() {
  const router = useRouter();
  const t = useTranslations('venuesList');
  const [deleteVenue, setDeleteVenue] = useState<{ id: string; name: string } | null>(null);
  const deleteIconRef = useRef<DeleteIconHandle>(null);
  const squarePenIconRef = useRef<SquarePenIconHandle>(null);

  const { data: venues, isLoading } = useVenues();

  // Use dedicated hook for deletion
  const deleteMutation = useDeleteVenue();

  const handleEdit = (venueId: string) => {
    router.push(`/venues/${venueId}/edit`);
  };

  const handleDelete = (venueId: string, venueName: string) => {
    setDeleteVenue({ id: venueId, name: venueName });
  };

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={venues}
      loadingMessage={t('loadingVenues')}
      emptyMessage={t('noVenuesAvailable')}
    >
      {(venues) => (
        <VenuesListContent
          venues={venues}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          deleteMutation={deleteMutation}
          deleteVenue={deleteVenue}
          setDeleteVenue={setDeleteVenue}
          deleteIconRef={deleteIconRef}
          squarePenIconRef={squarePenIconRef}
          t={t}
        />
      )}
    </DataStateWrapper>
  );
}

// Separate component for venues list content
function VenuesListContent({
  venues,
  handleEdit,
  handleDelete,
  deleteMutation,
  deleteVenue,
  setDeleteVenue,
  deleteIconRef,
  squarePenIconRef,
  t,
}: {
  venues: Venue[];
  handleEdit: (venueId: string) => void;
  handleDelete: (venueId: string, venueName: string) => void;
  deleteMutation: UseMutationResult<unknown, Error, string, unknown>;
  deleteVenue: { id: string; name: string } | null;
  setDeleteVenue: (value: { id: string; name: string } | null) => void;
  deleteIconRef: React.RefObject<DeleteIconHandle | null>;
  squarePenIconRef: React.RefObject<SquarePenIconHandle | null>;
  t: ReturnType<typeof useTranslations>;
}) {
  const isBackNav = useIsFromBfcache();

  return (
    <motion.div
      key="content"
      initial={isBackNav ? false : 'hidden'}
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: isBackNav ? 0 : 0.1,
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
            show: { opacity: 1, y: 0, transition: { duration: isBackNav ? 0 : 0.4 } },
          }}
          whileHover={{ scale: 1.01 }}
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
                          placeholder="blur"
                          blurDataURL={getShimmerDataURL(56, 56)}
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

                {/* Action Buttons - Desktop */}
                <div className="hidden sm:flex gap-2 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(venue.id)}
                        onMouseEnter={() => squarePenIconRef.current?.startAnimation()}
                        onMouseLeave={() => squarePenIconRef.current?.stopAnimation()}
                      >
                        <SquarePenIcon ref={squarePenIconRef} size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('edit')}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(venue.id, venue.name)}
                        disabled={deleteMutation.isPending}
                        onMouseEnter={() => deleteIconRef.current?.startAnimation()}
                        onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
                      >
                        <DeleteIcon ref={deleteIconRef} size={16} className="text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('delete')}</TooltipContent>
                  </Tooltip>
                </div>

                {/* Action Dropdown - Mobile */}
                <div className="sm:hidden shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" animate={false}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(venue.id)}>
                        <SquarePenIcon size={16} className="mr-2" />
                        {t('edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(venue.id, venue.name)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive focus:text-destructive"
                      >
                        <DeleteIcon size={16} className="mr-2" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* Bottom Section: Courts */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('courts')}</p>
                {venue.courts && venue.courts.length > 0 ? (
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
