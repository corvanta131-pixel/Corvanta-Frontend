import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
}

export function EmployeeFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, department, or title"
          className="pl-9"
          aria-label="Search employees"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="invited">Invited</option>
        <option value="disabled">Disabled</option>
      </select>

      <Input
        value={departmentFilter}
        onChange={(e) => onDepartmentFilterChange(e.target.value)}
        placeholder="Filter by department"
        className="sm:w-48"
        aria-label="Filter by department"
      />
    </div>
  );
}

export type { EmployeeFiltersProps };