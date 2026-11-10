import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import type {
  ListResponse,
  OwnerPharmacy,
  SessionUser,
  Subscription,
} from '@smartshelf/contracts';
import { businessDate, parseCalendarDate } from '../../common/business-date';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePharmacistDto,
  CreatePharmacyDto,
  OwnerQueryDto,
  SubscriptionDto,
} from './dto/owner.dto';
import { ownerPharmacyResponse, subscriptionResponse } from './owner.mapper';
import { escapeLikePattern } from '../pharmacy/adapters/like-pattern';

@Injectable()
export class OwnerService {
  private readonly logger = new Logger(OwnerService.name);
  constructor(private readonly prisma: PrismaService) {}

  async listPharmacies(
    query: OwnerQueryDto,
  ): Promise<ListResponse<OwnerPharmacy>> {
    const today = businessDate();
    const pharmacies = await this.prisma.pharmacy.findMany({
      where: query.q
        ? {
            name: { contains: escapeLikePattern(query.q), mode: 'insensitive' },
          }
        : {},
      include: { subscription: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    const items = pharmacies
      .map((pharmacy) => ownerPharmacyResponse(pharmacy, today))
      .filter(
        (pharmacy) =>
          !query.status || pharmacy.subscriptionStatus === query.status,
      );
    return { items, total: items.length };
  }

  async createPharmacy(dto: CreatePharmacyDto): Promise<OwnerPharmacy> {
    const today = businessDate();
    const pharmacy = await this.prisma.pharmacy.create({
      data: {
        name: dto.name,
        area: dto.area,
        address: dto.address,
        phone: dto.phone,
      },
      include: { subscription: true },
    });
    this.logger.log(`Created pharmacy ${pharmacy.id}`);
    return ownerPharmacyResponse(pharmacy, today);
  }

  private async requirePharmacy(id: string): Promise<void> {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!pharmacy) throw new NotFoundException('Pharmacy not found.');
  }

  async createPharmacist(dto: CreatePharmacistDto): Promise<SessionUser> {
    await this.requirePharmacy(dto.pharmacyId);
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await hash(dto.password, 10);
    try {
      const account = await this.prisma.account.create({
        data: {
          email,
          passwordHash,
          role: 'PHARMACIST',
          pharmacyId: dto.pharmacyId,
        },
        select: { id: true, email: true, role: true, pharmacyId: true },
      });
      this.logger.log(
        `Created pharmacist ${account.id} for pharmacy ${dto.pharmacyId}`,
      );
      return {
        id: account.id,
        email: account.email,
        role: account.role,
        pharmacyId: account.pharmacyId,
      };
    } catch (error) {
      this.rethrowDatabaseError(
        error,
        'An account with this email already exists.',
      );
    }
  }

  private subscriptionData(dto: SubscriptionDto) {
    const startDate = parseCalendarDate(dto.startDate);
    const endDate = parseCalendarDate(dto.endDate);
    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException('endDate must be after startDate.');
    }
    return { startDate, endDate, suspended: dto.suspended };
  }

  async createSubscription(
    pharmacyId: string,
    dto: SubscriptionDto,
  ): Promise<Subscription> {
    const data = this.subscriptionData(dto);
    await this.requirePharmacy(pharmacyId);
    try {
      const subscription = await this.prisma.subscription.create({
        data: { ...data, pharmacyId },
      });
      this.logger.log(
        `Created subscription ${subscription.id} for pharmacy ${pharmacyId}`,
      );
      return subscriptionResponse(subscription);
    } catch (error) {
      this.rethrowDatabaseError(
        error,
        'This pharmacy already has a subscription.',
      );
    }
  }

  async updateSubscription(
    pharmacyId: string,
    dto: SubscriptionDto,
  ): Promise<Subscription> {
    const data = this.subscriptionData(dto);
    await this.requirePharmacy(pharmacyId);
    try {
      const subscription = await this.prisma.subscription.update({
        where: { pharmacyId },
        data,
      });
      this.logger.log(
        `Updated subscription ${subscription.id} for pharmacy ${pharmacyId}; suspended=${subscription.suspended}`,
      );
      return subscriptionResponse(subscription);
    } catch (error) {
      this.rethrowDatabaseError(error, 'Subscription conflict.');
    }
  }

  async deleteSubscription(pharmacyId: string): Promise<void> {
    await this.requirePharmacy(pharmacyId);
    try {
      // Delete exactly one Subscription. Never delete a Pharmacy or its children.
      await this.prisma.subscription.delete({ where: { pharmacyId } });
      this.logger.log(
        `Deleted subscription for pharmacy ${pharmacyId}; pharmacy data retained`,
      );
    } catch (error) {
      this.rethrowDatabaseError(error, 'Subscription conflict.');
    }
  }

  private rethrowDatabaseError(error: unknown, conflictMessage: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw new ConflictException(conflictMessage);
      if (error.code === 'P2003')
        throw new NotFoundException('Pharmacy not found.');
      if (error.code === 'P2025')
        throw new NotFoundException('Subscription not found.');
    }
    throw error;
  }
}
