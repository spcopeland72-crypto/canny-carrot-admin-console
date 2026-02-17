/**
 * Compute effective business status for sorting (RENEWAL, ACTIVE, PENDING, ARCHIVED).
 * Mirrors canny-carrot-api/src/lib/businessStatus.ts logic.
 */

export type BusinessStatusValue = 'PENDING' | 'ACTIVE' | 'RENEWAL' | 'ARCHIVED';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RENEWAL_WINDOW_DAYS = 60;

function getStoredStatus(business: Record<string, unknown> | null): string | undefined {
  if (!business) return undefined;
  const s = (business.status ?? (business as any).profile?.status) as string | undefined;
  return s ? String(s).trim().toUpperCase() : undefined;
}

function getCreatedAt(business: Record<string, unknown> | null): Date | null {
  if (!business) return null;
  const v = business.createdAt ?? (business as any).joinDate ?? (business as any).profile?.createdAt ?? (business as any).profile?.joinDate;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function getRenewalDate(business: Record<string, unknown> | null): Date | null {
  if (!business) return null;
  const explicit = (business.renewalDate ?? (business as any).nextRenewalDate) as string | undefined;
  if (explicit) {
    const d = new Date(explicit);
    return isNaN(d.getTime()) ? null : d;
  }
  const created = getCreatedAt(business);
  if (!created) return null;
  const d = new Date(created);
  d.setDate(d.getDate() + 365);
  return d;
}

export function getEffectiveStatus(business: Record<string, unknown> | null): BusinessStatusValue {
  if (!business) return 'PENDING';
  const stored = getStoredStatus(business);
  const storedLower = stored ? stored.toLowerCase() : '';

  if (['archived', 'closed', 'exiting', 'suspended', 'cancelled'].includes(storedLower)) {
    return 'ARCHIVED';
  }
  if (storedLower === 'pending' || !stored) {
    return 'PENDING';
  }
  if (['active', 'renewal', 'renewal_due'].includes(storedLower)) {
    const renewalDate = getRenewalDate(business);
    if (!renewalDate) return 'ACTIVE';
    const now = Date.now();
    const renewalMs = renewalDate.getTime();
    const windowStart = renewalMs - RENEWAL_WINDOW_DAYS * MS_PER_DAY;
    if (now >= windowStart && now <= renewalMs + MS_PER_DAY) return 'RENEWAL';
    return 'ACTIVE';
  }
  return 'PENDING';
}

/** Sort order: RENEWAL (0), ACTIVE (1), PENDING (2), ARCHIVED (3) */
export function statusSortOrder(status: BusinessStatusValue): number {
  const order: Record<BusinessStatusValue, number> = {
    RENEWAL: 0,
    ACTIVE: 1,
    PENDING: 2,
    ARCHIVED: 3,
  };
  return order[status] ?? 4;
}
