import { auth } from './auth';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  private async getHeaders(): Promise<HeadersInit> {
    const session = await auth();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${path}`, { headers });

    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json();
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json();
  }

  async patch<T>(path: string, data?: any): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json();
  }

  async delete<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }

    return res.json();
  }
}

export const apiClient = new ApiClient();
