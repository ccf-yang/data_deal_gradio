// API Configuration
export const API_BASE_URL = 'http://localhost:8000';  // Django backend URL

// Other configuration constants can be added here
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_ENVIRONMENT = 'test';

// Assigners configuration
export const ASSIGNERS = [
  { id: 1, name: '阿斯兰' },
  { id: 2, name: '竹清' },
  { id: 3, name: '汤姆' },
  { id: 4, name: '可莉' },
  { id: 5, name: '小明' },
  { id: 6, name: '露羽' }
];

// Status configuration
export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};
