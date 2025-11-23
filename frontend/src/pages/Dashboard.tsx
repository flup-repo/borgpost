import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api';
import { Activity, Calendar, Layers, FileText } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, description }: any) => (
  <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="tracking-tight text-sm font-medium">{title}</h3>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="pt-4">
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground pt-1">{description}</p>
    </div>
  </div>
);

export const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Overview of your social media activity.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Posts" 
          value={stats?.totalPosts || 0} 
          icon={FileText}
          description="All time posts"
        />
        <StatsCard 
          title="Scheduled" 
          value={stats?.scheduledPosts || 0} 
          icon={Calendar}
          description="Posts waiting in queue"
        />
        <StatsCard 
          title="Active Prompts" 
          value={stats?.activePrompts || 0} 
          icon={Layers}
          description="Content generation templates"
        />
        <StatsCard 
          title="Categories" 
          value={stats?.categoriesCount || 0} 
          icon={Activity}
          description="Active content categories"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         {/* Placeholder for charts or recent activity */}
         <div className="col-span-4 border rounded-lg bg-card p-6 h-[300px] flex items-center justify-center text-muted-foreground">
            Recent Activity Chart (Coming Soon)
         </div>
         <div className="col-span-3 border rounded-lg bg-card p-6 h-[300px] flex items-center justify-center text-muted-foreground">
            Upcoming Posts (Coming Soon)
         </div>
      </div>
    </div>
  );
};
