import { MessageSquare } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function InboxPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Inbox"
        description="Centralized customer conversations across all channels"
        icon={MessageSquare}
      />

      <Card>
        <CardHeader>
          <CardTitle>Unified Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Conversations and inbox functionality will be implemented in Stage J.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}