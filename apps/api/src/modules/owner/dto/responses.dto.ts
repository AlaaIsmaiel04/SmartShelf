import { ApiProperty } from '@nestjs/swagger';
import type { SubscriptionStatus } from '@smartshelf/contracts';

export class SubscriptionResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: '2026-11-02' }) startDate!: string;
  @ApiProperty({ example: '2027-11-02' }) endDate!: string;
  @ApiProperty() suspended!: boolean;
}

export class OwnerPharmacyResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() area!: string;
  @ApiProperty() address!: string;
  @ApiProperty() phone!: string;
  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  inventoryUpdatedAt!: string | null;
  @ApiProperty({ type: SubscriptionResponseDto, nullable: true })
  subscription!: SubscriptionResponseDto | null;
  @ApiProperty({ enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'NONE'] })
  subscriptionStatus!: SubscriptionStatus;
}

export class OwnerPharmacyListResponseDto {
  @ApiProperty({ type: [OwnerPharmacyResponseDto] })
  items!: OwnerPharmacyResponseDto[];
  @ApiProperty({ type: 'integer' }) total!: number;
}

export class CreatedPharmacistResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: ['PHARMACIST'] }) role!: 'PHARMACIST';
  @ApiProperty({ format: 'uuid' }) pharmacyId!: string;
}