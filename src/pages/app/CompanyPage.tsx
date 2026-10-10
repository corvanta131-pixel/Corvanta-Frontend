import { useEffect } from 'react';
import { useAppSelector } from '../../hooks';
import { useCompany, useCurrentUser } from '../../features/companies/hooks';
import { can } from '../../utils/permissions';
import {
  Building2,
  Calendar,
  Hash,
  Shield,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { EmptyState, ErrorState } from '../../components/dashboard/EmptyState';
import type { Company, User as UserType } from '../../features/auth/types';

type UserWithRole = {
  _id: string;
  name: string;
  email: string;
  roleId: { name: string; slug: string } | string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export function CompanyPage() {
  const { user: authUser, company: authCompany } = useAppSelector((state) => state.auth);
  const { data: company, isLoading: companyLoading, isError: companyError, refetch: refetchCompany } = useCompany();
  const { data: currentUser } = useCurrentUser();
  const hasPermission = can('companies:read', authUser);

  useEffect(() => {
    refetchCompany();
  }, [refetchCompany]);

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Company"
          description="Restricted access"
          icon={Shield}
        />
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-1">
                Access restricted
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                You do not have permission to view company information. Contact your administrator for access.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (companyLoading) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Company"
          description="Manage your Corvanta workspace and company information"
          icon={Building2}
        />
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-2">
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Company"
          description="Manage your Corvanta workspace and company information"
          icon={Building2}
        />
        <ErrorState
          title="Unable to load company information"
          onRetry={() => refetchCompany()}
        />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Company"
          description="Manage your Corvanta workspace and company information"
          icon={Building2}
        />
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No company found"
          description="No company information is currently associated with your account."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle
        title="Company"
        description="Manage your Corvanta workspace and company information"
        icon={Building2}
      />

      <section aria-labelledby="company-overview">
        <h2 id="company-overview" className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-4 sr-only">
          Company Overview
        </h2>
        <CompanyOverview company={company} authCompany={authCompany} />
      </section>

      <section aria-labelledby="workspace-context">
        <h2 id="workspace-context" className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-4">
          Workspace Context
        </h2>
        <WorkspaceContext company={company} user={currentUser ?? authUser} />
      </section>

      <section aria-labelledby="company-readonly">
        <h2 id="company-readonly" className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-4">
          Company Information
        </h2>
        <CompanyInfoCard company={company} />
      </section>
    </div>
  );
}

function CompanyOverview({
  company,
  authCompany,
}: {
  company: Company;
  authCompany: Company | null;
}) {
  const displayName = company.name || authCompany?.name || 'Your Company';

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <CompanyAvatar name={displayName} />

        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-950 dark:text-slate-50">{displayName}</h3>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Hash className="h-4 w-4" aria-hidden="true" />
              <span className="font-mono">{company._id}</span>
            </div>
            {company.industry && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                <span>{company.industry}</span>
              </div>
            )}
            {company.status && (
              <StatusBadge status={company.status} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    suspended: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  const variant = variants[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variant}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

function CompanyAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-violet-500', 'bg-slate-500'];
  const colorIndex = Math.abs(name.length) % colors.length;

  return (
    <div
      className={`w-20 h-20 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-3xl font-bold`}
      aria-label={`Company avatar for ${name}`}
    >
      {initials}
    </div>
  );
}

function WorkspaceContext({
  company,
  user,
}: {
  company: Company;
  user: UserWithRole | UserType | null;
}) {
  if (!user) {
    return (
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <p className="text-slate-500 dark:text-slate-400">User information not available.</p>
      </div>
    );
  }

  const roleName = typeof user.roleId === 'object' ? user.roleId.name : user.roleId;
  const roleSlug = typeof user.roleId === 'object' ? user.roleId.slug : '';

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Workspace</p>
          <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">{company.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Role</p>
          <p className="text-lg font-semibold text-slate-950 dark:text-slate-50 capitalize">{roleName}</p>
          {roleSlug && (
            <p className="text-xs text-slate-500 dark:text-slate-400">slug: {roleSlug}</p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Relationship</p>
          <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">User → Role → Company</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticated company: {company.slug}
          </p>
        </div>
      </div>
    </div>
  );
}

function CompanyInfoCard({ company }: { company: Company }) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Details</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Company information is managed by your Corvanta administrator.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <InfoRow
          icon={<Building2 className="h-4 w-4 text-slate-400" />}
          label="Company Name"
          value={company.name}
        />
        <InfoRow
          icon={<Hash className="h-4 w-4 text-slate-400" />}
          label="Company ID"
          value={company._id}
          mono
        />
        <InfoRow
          icon={<Briefcase className="h-4 w-4 text-slate-400" />}
          label="Industry"
          value={company.industry || 'Not specified'}
        />
        <InfoRow
          icon={<Calendar className="h-4 w-4 text-slate-400" />}
          label="Created"
          value={new Date(company.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        />
        <InfoRow
          icon={<Calendar className="h-4 w-4 text-slate-400" />}
          label="Last Updated"
          value={new Date(company.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        />
        {company.status && (
          <InfoRow
            icon={<Shield className="h-4 w-4 text-slate-400" />}
            label="Status"
            value={company.status}
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">{icon}</div>
      <div className="flex-1">
        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </dt>
        <dd className={`mt-0.5 text-sm text-slate-950 dark:text-slate-50 ${mono ? 'font-mono' : ''}`}>
          {value}
        </dd>
      </div>
    </div>
  );
}