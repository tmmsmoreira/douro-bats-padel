export interface CreateVenueDto {
  name: string;
  address?: string;
  logo?: string; // URL to logo image
  courts: string[]; // Array of court labels
}

export interface UpdateVenueDto {
  name?: string;
  address?: string;
  logo?: string; // URL to logo image
  courts?: string[]; // Array of court labels
}
