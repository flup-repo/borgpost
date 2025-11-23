import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Calendar, Settings, FileText, Hash, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: List, label: 'Queue', to: '/queue' },
  { icon: FileText, label: 'Posts', to: '/posts' },
  { icon: Hash, label: 'Categories', to: '/categories' },
  { icon: FileText, label: 'Prompts', to: '/prompts' },
  { icon: Calendar, label: 'Schedule', to: '/schedule' },
  { icon: BarChart, label: 'Analytics', to: '/analytics' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            BorgPost
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
