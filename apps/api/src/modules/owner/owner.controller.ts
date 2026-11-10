import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common/security';
import {
  CreatePharmacistDto,
  CreatePharmacyDto,
  OwnerQueryDto,
  SubscriptionDto,
} from './dto/owner.dto';
import {
  CreatedPharmacistResponseDto,
  OwnerPharmacyListResponseDto,
  OwnerPharmacyResponseDto,
  SubscriptionResponseDto,
} from './dto/responses.dto';
import { OwnerService } from './owner.service';

@ApiTags('owner')
@ApiBearerAuth()
@ApiBadRequestResponse({ description: 'Invalid UUID, body, dates or filter.' })
@ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token.' })
@ApiForbiddenResponse({ description: 'Only OWNER may use these endpoints.' })
@ApiNotFoundResponse({ description: 'Pharmacy or subscription not found.' })
@ApiConflictResponse({ description: 'Duplicate email or second subscription.' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
@Controller('owner')
export class OwnerController {
  constructor(private readonly owner: OwnerService) {}

  @Get('pharmacies')
  @ApiOperation({
    summary:
      'List pharmacies by partial name and effective subscription status',
  })
  @ApiOkResponse({ type: OwnerPharmacyListResponseDto })
  list(@Query() query: OwnerQueryDto) {
    return this.owner.listPharmacies(query);
  }

  @Post('pharmacies')
  @ApiOperation({
    summary: 'Create a pharmacy; initial subscription status is NONE',
  })
  @ApiCreatedResponse({ type: OwnerPharmacyResponseDto })
  createPharmacy(@Body() dto: CreatePharmacyDto) {
    return this.owner.createPharmacy(dto);
  }

  @Post('pharmacists')
  @ApiOperation({
    summary:
      'Create a pharmacist in an existing pharmacy with a hashed initial password',
  })
  @ApiCreatedResponse({ type: CreatedPharmacistResponseDto })
  createPharmacist(@Body() dto: CreatePharmacistDto) {
    return this.owner.createPharmacist(dto);
  }

  @Post('pharmacies/:id/subscription')
  @ApiOperation({
    summary: 'Create the one subscription allowed for a pharmacy',
  })
  @ApiCreatedResponse({ type: SubscriptionResponseDto })
  createSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubscriptionDto,
  ) {
    return this.owner.createSubscription(id, dto);
  }

  @Patch('pharmacies/:id/subscription')
  @ApiOperation({
    summary: 'Replace startDate, endDate and suspended; all three required',
  })
  @ApiOkResponse({ type: SubscriptionResponseDto })
  updateSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubscriptionDto,
  ) {
    return this.owner.updateSubscription(id, dto);
  }

  @Delete('pharmacies/:id/subscription')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete only the subscription; preserve all other pharmacy data',
  })
  @ApiNoContentResponse({
    description: 'Subscription deleted; no response body.',
  })
  async deleteSubscription(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.owner.deleteSubscription(id);
  }
}
