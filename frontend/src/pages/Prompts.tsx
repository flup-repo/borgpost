import { useQuery } from '@tanstack/react-query';
import { getPrompts } from '@/lib/api';
import { CreatePromptDialog } from '@/components/prompts/CreatePromptDialog';

export const Prompts = () => {
  const { data: prompts, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: getPrompts,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Prompts</h2>
        <CreatePromptDialog />
      </div>
      <div className="grid gap-4">
        {prompts?.length === 0 && (
            <p className="text-muted-foreground">No prompts found. Create one to get started.</p>
        )}
        {prompts?.map((prompt: any) => (
          <div key={prompt.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold">{prompt.name}</h3>
                {prompt.category && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full">{prompt.category.name}</span>
                )}
            </div>
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{prompt.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
