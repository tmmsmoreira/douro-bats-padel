import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class DrawConstraintsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(52)
  avoidRecentSessions?: number;

  @IsOptional()
  @IsBoolean()
  balanceStrength?: boolean;

  @IsOptional()
  @IsBoolean()
  allowTierMixing?: boolean;
}

export class SelectedCourtsDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  masters?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  explorers?: string[];
}

export class GenerateDrawDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DrawConstraintsDto)
  constraints?: DrawConstraintsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SelectedCourtsDto)
  selectedCourts?: SelectedCourtsDto;
}

export class UpdateAssignmentDto {
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  teamA: string[];

  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  teamB: string[];
}
