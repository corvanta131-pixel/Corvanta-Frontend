import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { CUSTOMER_STATUS_LABELS, type CustomerFilterState } from '../../features/customers/customerUtils';
import { CUSTOMER_STATUSES, type CustomerStatus } from '../../features/customers/types';

interface CustomerFiltersProps {
  filters: CustomerFilterState;
  onChange: (next: CustomerFilterState) => void;
}

export function CustomerFilters({ filters, onChange }: CustomerFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by name, email, or phone"
          className="pl-9"
          aria-label="Search customers"
        />
      </div>
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as '' | CustomerStatus })}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {CUSTOMER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {CUSTOMER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
