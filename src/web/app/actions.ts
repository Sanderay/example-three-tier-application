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
  created_at: string;
  assigned_to: number | null;
  assigned_to_email: string | null;
};

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getTasks(assignedTo?: number): Promise<Task[]> {
  const url = assignedTo 
    ? `${API_URL}/tasks?assigned_to=${assignedTo}`
    : `${API_URL}/tasks`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const assignedTo = formData.get('assigned_to') as string;
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      title,
      assigned_to: assignedTo || null,
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

export async function updateTaskAssignment(id: number, assignedTo: number | null) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assigned_to: assignedTo }),
  });
  revalidatePath('/');
}
