import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BASE_URL, getHeaders, handleApiError, fetchApi, uploadFile, uploadMultipleFiles } from './api';
import { toast } from '@/hooks/use-toast';

// Mock the toast function
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();
global.localStorage = localStorageMock;

describe('API Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getHeaders', () => {
    it('should return basic headers without auth token', () => {
      const headers = getHeaders(false);
      expect(headers).toEqual({
        'Content-Type': 'application/json'
      });
    });

    it('should include auth token when available', () => {
      localStorage.setItem('token', 'test-token');
      const headers = getHeaders(true);
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });
    });
  });

  describe('handleApiError', () => {
    it('should handle response errors', async () => {
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' }
        }
      };

      await expect(handleApiError(error)).rejects.toEqual(error);
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Resource not found',
        variant: 'destructive'
      });
    });

    it('should handle network errors', async () => {
      const error = { request: {} };
      await expect(handleApiError(error)).rejects.toEqual(error);
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'No response received from server. Please check your connection.',
        variant: 'destructive'
      });
    });
  });

  describe('fetchApi', () => {
    it('should make successful API calls', async () => {
      const mockResponse = { data: 'test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await fetchApi('/test');
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/test`, expect.any(Object));
    });

    it('should handle 204 responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204
      });

      const result = await fetchApi('/test');
      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      const errorResponse = { message: 'Bad Request' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve(errorResponse)
      });

      await expect(fetchApi('/test')).rejects.toEqual(expect.any(Object));
    });
  });

  describe('uploadFile', () => {
    it('should upload a single file successfully', async () => {
      const mockResponse = { fileUrl: 'http://example.com/file.jpg' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadFile('/upload', file);
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/upload`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files successfully', async () => {
      const mockResponse = { fileUrls: ['http://example.com/file1.jpg', 'http://example.com/file2.jpg'] };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];
      
      const result = await uploadMultipleFiles('/upload-multiple', files);
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/upload-multiple`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });
  });
});