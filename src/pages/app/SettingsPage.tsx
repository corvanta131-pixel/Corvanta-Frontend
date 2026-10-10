import { Settings } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Settings"
        description="Configure your account and application settings"
        icon={Settings}
      />

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Settings functionality will be implemented in Stage S.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}