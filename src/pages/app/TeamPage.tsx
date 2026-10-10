import { Users } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function TeamPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Team"
        description="Manage team members and their roles"
        icon={Users}
      />

      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Team and employee management functionality will be implemented in Stage H.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}