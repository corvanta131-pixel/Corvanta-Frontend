import type { CustomerStatus } from '../../features/customers/types';
import { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_STYLES } from '../../features/customers/customerUtils';

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CUSTOMER_STATUS_STYLES[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {CUSTOMER_STATUS_LABELS[status]}
    </span>
  );
}
