import { createApiClient } from '../../lib/api';
import type {
  CreatePharmacyInput,
  ListResponse,
  OwnerPharmacy,
  OwnerPharmacyFilters,
  CreatePharmacistInput,
  SessionUser,
  Subscription,
  SubscriptionInput,
} from '@smartshelf/contracts';

export interface OwnerPharmacyService {
  list: (
    filters: OwnerPharmacyFilters,
    signal?: AbortSignal,
  ) => Promise<ListResponse<OwnerPharmacy>>;
  create: (input: CreatePharmacyInput) => Promise<OwnerPharmacy>;
  createPharmacist: (input: CreatePharmacistInput) => Promise<SessionUser>;
  saveSubscription: (
    pharmacyId: string,
    input: SubscriptionInput,
    exists: boolean,
  ) => Promise<Subscription>;
  deleteSubscription: (pharmacyId: string) => Promise<void>;
}

export function createOwnerPharmacyService(
  accessToken: string,
  onUnauthorized: () => void,
): OwnerPharmacyService {
  const request = createApiClient(accessToken, onUnauthorized);

  return {
    list(filters, signal) {
      const query = new URLSearchParams();
      if (filters.q?.trim()) query.set('q', filters.q.trim());
      if (filters.status) query.set('status', filters.status);
      return request<ListResponse<OwnerPharmacy>>(
        `/owner/pharmacies?${query}`,
        { signal },
      );
    },
    create(input) {
      return request<OwnerPharmacy>('/owner/pharmacies', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    createPharmacist(input) {
      return request<SessionUser>('/owner/pharmacists', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    saveSubscription(pharmacyId, input, exists) {
      return request<Subscription>(
        `/owner/pharmacies/${encodeURIComponent(pharmacyId)}/subscription`,
        {
          method: exists ? 'PATCH' : 'POST',
          body: JSON.stringify(input),
        },
      );
    },
    deleteSubscription(pharmacyId) {
      return request<void>(
        `/owner/pharmacies/${encodeURIComponent(pharmacyId)}/subscription`,
        {
          method: 'DELETE',
        },
      );
    },
  };
}
