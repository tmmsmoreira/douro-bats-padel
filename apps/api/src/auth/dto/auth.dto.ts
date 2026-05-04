import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Locale } from '@padel/types';
import type {
  ForgotPasswordDto as IForgotPasswordDto,
  GoogleAuthDto as IGoogleAuthDto,
  LoginDto as ILoginDto,
  ResetPasswordDto as IResetPasswordDto,
  SignupDto as ISignupDto,
} from '@padel/types';

// bcrypt silently truncates input at 72 bytes, so cap MaxLength here to keep
// the hashing behavior explicit and reject clearly oversized inputs earlier.
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

export class LoginDtoClass implements ILoginDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}

export class SignupDtoClass implements ISignupDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(32)
  dateOfBirth: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  phoneNumber: string;

  @IsString()
  @MinLength(1)
  @MaxLength(512)
  invitationToken: string;

  @IsOptional()
  @IsEnum(Locale)
  language?: Locale;
}

export class ForgotPasswordDtoClass implements IForgotPasswordDto {
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class ResetPasswordDtoClass implements IResetPasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  token: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  password: string;
}

export class GoogleAuthDtoClass implements IGoogleAuthDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  profilePhoto?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  invitationToken?: string;

  @IsOptional()
  @IsEnum(Locale)
  language?: Locale;
}
