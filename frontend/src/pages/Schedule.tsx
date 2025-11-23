import { useQuery } from '@tanstack/react-query';
import { getSchedules } from '@/lib/api';
import { CreateScheduleDialog } from '@/components/schedule/CreateScheduleDialog';

export const Schedule = () => {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: getSchedules,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Posting Schedule</h2>
        <CreateScheduleDialog />
      </div>
      <div className="grid gap-4">
        {schedules?.length === 0 && (
            <p className="text-muted-foreground">No schedule slots configured.</p>
        )}
        {schedules?.map((slot: any) => (
          <div key={slot.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm flex justify-between items-center">
            <div>
                <div className="text-2xl font-bold">{slot.time}</div>
                <div className="text-sm text-muted-foreground">{slot.daysOfWeek.replace(/,/g, ', ')}</div>
            </div>
            {slot.category && (
                <span className="bg-secondary px-3 py-1 rounded-full text-sm">{slot.category.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
