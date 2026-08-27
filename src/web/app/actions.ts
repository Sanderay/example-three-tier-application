'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export type User = {
  id: number;
  email: string;
};

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  assigned_user_id: number | null;
  assigned_user_email: string | null;
};

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getTasks(assignedUserId?: number): Promise<Task[]> {
  const url = assignedUserId 
    ? `${API_URL}/tasks?assigned_user_id=${assignedUserId}`
    : `${API_URL}/tasks`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  const assignedUserId = formData.get('assigned_user_id') as string;
  
  const body: { title: string; assigned_user_id?: number } = { title };
  if (assignedUserId && assignedUserId !== '') {
    body.assigned_user_id = parseInt(assignedUserId, 10);
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

export async function assignTask(id: number, assignedUserId: number | null) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assigned_user_id: assignedUserId }),
  });
  revalidatePath('/');
}
