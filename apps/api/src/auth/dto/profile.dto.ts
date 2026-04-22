import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Locale } from '@padel/types';

export class UpdateProfilePhotoDto {
  @IsString()
  @MaxLength(2048)
  profilePhoto: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  profilePhoto?: string;

  @IsOptional()
  @IsBoolean()
  notificationsPaused?: boolean;

  @IsOptional()
  @IsEnum(Locale)
  preferredLanguage?: Locale;
}

export class VerifyEmailDto {
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  token: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email: string;
}
