'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export type User = {
  id: number;
  email: string;
  created_at: string;
};

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  assigned_to: number | null;
  created_at: string;
};

export async function getTasks(assignedTo?: number): Promise<Task[]> {
  const url = new URL(`${API_URL}/tasks`);
  if (assignedTo !== undefined) {
    url.searchParams.append('assigned_to', assignedTo.toString());
  }
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const assigned_to = formData.get('assigned_to') as string;
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      title,
      assigned_to: assigned_to ? parseInt(assigned_to, 10) : null,
    }),
  });
  revalidatePath('/');
}

export async function toggleTask(id: number, completed: boolean) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  revalidatePath('/');
}

export async function assignTask(id: number, assigned_to: number | null) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assigned_to }),
  });
  revalidatePath('/');
}
