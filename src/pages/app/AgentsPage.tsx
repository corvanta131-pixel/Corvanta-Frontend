import { Bot } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function AgentsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="AI Agents"
        description="Create and manage AI agents powered by your company knowledge"
        icon={Bot}
      />

      <Card>
        <CardHeader>
          <CardTitle>AI Agent Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            AI agents functionality will be implemented in Stage L.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}