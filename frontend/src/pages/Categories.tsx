import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/lib/api';
import { CreateCategoryDialog } from '@/components/categories/CreateCategoryDialog';

export const Categories = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <CreateCategoryDialog />
      </div>
      <div className="grid gap-4">
        {categories?.length === 0 && (
            <p className="text-muted-foreground">No categories found. Create one to get started.</p>
        )}
        {categories?.map((category: any) => (
          <div key={category.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
