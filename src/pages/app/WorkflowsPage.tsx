import { GitBranch } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Workflows"
        description="Create and manage automated business workflows"
        icon={GitBranch}
      />

      <Card>
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Workflow management functionality will be implemented in Stage P.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}