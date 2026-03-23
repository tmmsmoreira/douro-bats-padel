/**
 * Court entity
 */
export interface Court {
    id: string;
    label: string;
    venueId: string;
}
/**
 * Venue entity
 */
export interface Venue {
    id: string;
    name: string;
    address?: string | null;
    logo?: string | null;
    courts?: Court[];
}
/**
 * DTO for creating a venue
 */
export interface CreateVenueDto {
    name: string;
    address?: string;
    logo?: string;
    courts: string[];
}
/**
 * DTO for updating a venue
 */
export interface UpdateVenueDto {
    name?: string;
    address?: string;
    logo?: string;
    courts?: string[];
}
//# sourceMappingURL=venues.d.ts.map