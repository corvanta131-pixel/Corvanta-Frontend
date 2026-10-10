import { Users } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Customers"
        description="Manage your customers and their information"
        icon={Users}
      />

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Customer management functionality will be implemented in Stage I.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}