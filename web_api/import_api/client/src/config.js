// API Configuration
export const API_BASE_URL = 'http://localhost:8000';  // Django backend URL

// Other configuration constants can be added here
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_ENVIRONMENT = 'test';

// Assigners configuration
export const ASSIGNERS = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Mike Johnson' },
  { id: 4, name: 'Sarah Wilson' },
  { id: 5, name: 'David Brown' }
];

// Status configuration
export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};
