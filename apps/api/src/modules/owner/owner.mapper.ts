import type { Pharmacy, Subscription as SubscriptionRow } from '@prisma/client';
import type { OwnerPharmacy, Subscription } from '@smartshelf/contracts';
import { calendarString } from '../../common/business-date';
import { effectiveSubscriptionStatus } from '../../common/subscription-status';

export function subscriptionResponse(
  subscription: SubscriptionRow,
): Subscription {
  return {
    id: subscription.id,
    startDate: calendarString(subscription.startDate),
    endDate: calendarString(subscription.endDate),
    suspended: subscription.suspended,
  };
}

export function ownerPharmacyResponse(
  pharmacy: Pharmacy & { subscription: SubscriptionRow | null },
  today: string,
): OwnerPharmacy {
  return {
    id: pharmacy.id,
    name: pharmacy.name,
    area: pharmacy.area,
    address: pharmacy.address,
    phone: pharmacy.phone,
    inventoryUpdatedAt: pharmacy.inventoryUpdatedAt?.toISOString() ?? null,
    subscription: pharmacy.subscription
      ? subscriptionResponse(pharmacy.subscription)
      : null,
    subscriptionStatus: effectiveSubscriptionStatus(
      pharmacy.subscription,
      today,
    ),
  };
}