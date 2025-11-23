import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// Categories
export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const createCategory = async (category: { name: string; description?: string }) => {
  const { data } = await api.post('/categories', category);
  return data;
};

// Prompts
export const getPrompts = async () => {
  const { data } = await api.get('/prompts');
  return data;
};

export const createPrompt = async (prompt: { name: string; content: string; categoryId?: number }) => {
  const { data } = await api.post('/prompts', prompt);
  return data;
};

// Schedule
export const getSchedules = async () => {
  const { data } = await api.get('/schedule');
  return data;
};

export const createSchedule = async (schedule: any) => {
  const { data } = await api.post('/schedule', schedule);
  return data;
};

// Dashboard
export const getDashboardStats = async () => {
  // const { data } = await api.get('/analytics/stats');
  // return data;
  return {
    totalPosts: 0,
    scheduledPosts: 0,
    activePrompts: 0,
    categoriesCount: 0
  };
};
