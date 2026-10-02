import axios from 'axios';
import { Curriculum, Chapter, UserProgress, Mistake, ChatRequest, AIResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCurriculums = () => api.get<Curriculum[]>('/curriculum');
export const getCurriculum = (level: string) => api.get<Curriculum>(`/curriculum/${level}`);
export const getChapter = (level: string, chapterId: string) => api.get<Chapter>(`/curriculum/${level}/chapter/${chapterId}`);

export const getProgress = (userId: string) => api.get<UserProgress>(`/progress/${userId}`);
export const createProgress = (userId: string, level: string) => api.post<UserProgress>('/progress', { user_id: userId, current_level: level });
export const updateProgress = (userId: string, data: Partial<UserProgress>) => api.patch<UserProgress>(`/progress/${userId}`, data);
export const completeScenario = (userId: string, scenarioId: string, score: number) => api.post<UserProgress>(`/progress/${userId}/complete-scenario`, { scenario_id: scenarioId, score });

export const sendChatMessage = (data: ChatRequest) => api.post<AIResponse>('/chat', data);

export const getMistakes = (userId: string, filters?: any) => api.get<Mistake[]>(`/mistakes/${userId}`, { params: filters });
export const markMistakeReviewed = (mistakeId: string) => api.patch<Mistake>(`/mistakes/${mistakeId}/review`);
export const getMistakeStats = (userId: string) => api.get<any>(`/mistakes/${userId}/stats`);

export default api;
