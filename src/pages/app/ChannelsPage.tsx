import { MessageCircle } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function ChannelsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Channels"
        description="Manage communication channels and their connections"
        icon={MessageCircle}
      />

      <Card>
        <CardHeader>
          <CardTitle>Channel Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Channel management functionality will be implemented in Stage M.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}