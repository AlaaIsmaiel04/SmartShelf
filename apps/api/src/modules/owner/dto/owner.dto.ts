import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import type { SubscriptionStatus } from '@smartshelf/contracts';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePharmacyDto {
  @ApiProperty({ example: 'Al Amal Pharmacy' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'North' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  area!: string;

  @ApiProperty({ example: 'Main Street 12' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  address!: string;

  @ApiProperty({ example: '0991234567' })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  phone!: string;
}

export class CreatePharmacistDto {
  @ApiProperty({ example: 'pharmacist@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'DemoPass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  pharmacyId!: string;
}

export class SubscriptionDto {
  @ApiProperty({ example: '2026-11-02', pattern: '^\\d{4}-\\d{2}-\\d{2}$' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate!: string;

  @ApiProperty({ example: '2027-11-02', pattern: '^\\d{4}-\\d{2}-\\d{2}$' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  suspended!: boolean;
}

export class OwnerQueryDto {
  @ApiPropertyOptional({ example: 'amal' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'NONE'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'EXPIRED', 'SUSPENDED', 'NONE'])
  status?: SubscriptionStatus;
}