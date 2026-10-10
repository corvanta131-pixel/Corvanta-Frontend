import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { PageContainer } from './PageContainer';
import { useState } from 'react';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar className={sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} />

      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity" aria-hidden="true">
        {sidebarOpen && (
          <div
            className="absolute inset-0"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <TopHeader />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          role="main"
          tabIndex={-1}
        >
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
}