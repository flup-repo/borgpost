import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createSchedule, getCategories } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const schema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  daysOfWeek: z.array(z.string()).min(1, 'Select at least one day'),
  categoryId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const DAYS = [
  { label: 'Mon', value: 'MONDAY' },
  { label: 'Tue', value: 'TUESDAY' },
  { label: 'Wed', value: 'WEDNESDAY' },
  { label: 'Thu', value: 'THURSDAY' },
  { label: 'Fri', value: 'FRIDAY' },
  { label: 'Sat', value: 'SATURDAY' },
  { label: 'Sun', value: 'SUNDAY' },
];

export const CreateScheduleDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      daysOfWeek: [],
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createSchedule({
      ...data,
      categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
      daysOfWeek: data.daysOfWeek.join(','), // Convert array to string
      timezone: 'UTC' // Default
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      setIsOpen(false);
      reset();
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) {
    return <Button onClick={() => setIsOpen(true)}>Add Schedule</Button>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2" 
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-bold mb-4">Add Schedule Slot</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Time (UTC)</label>
            <input 
              type="time"
              {...register('time')}
              className="w-full p-2 border rounded-md bg-background"
            />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <label key={day.value} className="flex items-center space-x-2 border p-2 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    value={day.value}
                    {...register('daysOfWeek')}
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
            {errors.daysOfWeek && <p className="text-red-500 text-sm mt-1">{errors.daysOfWeek.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category (Optional)</label>
            <select 
              {...register('categoryId')}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Any Category</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding...' : 'Add Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
