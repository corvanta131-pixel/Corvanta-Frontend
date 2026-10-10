import { FileText } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function AuditPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Audit"
        description="View audit logs and system activity"
        icon={FileText}
      />

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Audit functionality will be implemented in Stage Q.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}