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

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createUser(email: string): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create user');
  }
  return res.json();
}

export async function getTasks(assignedTo?: number): Promise<Task[]> {
  let url = `${API_URL}/tasks`;
  if (assignedTo !== undefined) {
    url += `?assigned_to=${assignedTo}`;
  }
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const assignedTo = formData.get('assigned_to') as string;
  
  const body: { title: string; assigned_to?: number } = { title };
  if (assignedTo) {
    body.assigned_to = parseInt(assignedTo, 10);
  }
  
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

export async function assignTask(id: number, assignedTo: number | null) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assigned_to: assignedTo }),
  });
  revalidatePath('/');
}
