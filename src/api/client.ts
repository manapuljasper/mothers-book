/**
 * Mock API Client
 *
 * This simulates network requests with configurable delay.
 * When transitioning to a real backend, replace these functions
 * with actual fetch/axios calls.
 */

// Simulate network delay (ms)
const MOCK_DELAY = 300;

export async function mockDelay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock API response wrapper
 * Simulates a network request with delay
 */
export async function mockRequest<T>(
  getData: () => T,
  delay: number = MOCK_DELAY
): Promise<T> {
  await mockDelay(delay);
  return getData();
}

/**
 * Mock mutation wrapper
 * Simulates a POST/PUT/DELETE request with delay
 */
export async function mockMutation<T, R>(
  mutationFn: (data: T) => R,
  data: T,
  delay: number = MOCK_DELAY
): Promise<R> {
  await mockDelay(delay);
  return mutationFn(data);
}

// API error class for consistent error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Types for API responses (will match backend structure)
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
