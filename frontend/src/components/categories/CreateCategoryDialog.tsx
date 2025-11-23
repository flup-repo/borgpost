import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const CreateCategoryDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsOpen(false);
      reset();
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) {
    return <Button onClick={() => setIsOpen(true)}>Add Category</Button>;
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
        
        <h2 className="text-xl font-bold mb-4">Add New Category</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              {...register('name')}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="Category Name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              {...register('description')}
              className="w-full p-2 border rounded-md bg-background"
              placeholder="Description (optional)"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
