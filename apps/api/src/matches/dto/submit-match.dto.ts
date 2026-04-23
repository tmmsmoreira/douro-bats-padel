import { IsEnum, IsInt, IsString, Max, Min, MinLength } from 'class-validator';
import { Tier } from '@padel/types';

export class SubmitMatchDto {
  @IsString()
  @MinLength(1)
  eventId: string;

  @IsString()
  @MinLength(1)
  courtId: string;

  @IsInt()
  @Min(1)
  round: number;

  @IsInt()
  @Min(0)
  @Max(20)
  setsA: number;

  @IsInt()
  @Min(0)
  @Max(20)
  setsB: number;

  @IsEnum(Tier)
  tier: Tier;
}
