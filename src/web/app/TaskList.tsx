'use client';

import { useState } from 'react';
import { createTask, toggleTask, assignTask, type Task, type User } from './actions';

export default function TaskList({ 
  initialTasks, 
  users 
}: { 
  initialTasks: Task[];
  users: User[];
}) {
  const [filterUserId, setFilterUserId] = useState<number | null>(null);

  // Filter tasks based on selected user
  const filteredTasks = filterUserId 
    ? initialTasks.filter(task => task.assigned_user_id === filterUserId)
    : initialTasks;

  return (
    <>
      {/* Filter dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Filter by assignee
        </label>
        <select
          value={filterUserId ?? ''}
          onChange={(e) => setFilterUserId(e.target.value ? parseInt(e.target.value, 10) : null)}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          <option value="">All tasks</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>

      {/* Add task form */}
      <form action={createTask} className="mb-8 space-y-3">
        <div className="flex gap-2">
          <input
            name="title"
            type="text"
            required
            placeholder="Add a new task..."
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            name="assigned_user_id"
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* Task list */}
      <ul className="space-y-2">
        {filteredTasks.length === 0 && (
          <li className="text-zinc-400 text-center py-8">
            {filterUserId ? 'No tasks for this user.' : 'No tasks yet. Add one above!'}
          </li>
        )}
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <form
                action={async () => {
                  'use server';
                  await toggleTask(task.id, !task.completed);
                }}
              >
                <button
                  type="submit"
                  className={`h-5 w-5 rounded border-2 flex-shrink-0 transition-colors ${
                    task.completed
                      ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50'
                      : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500'
                  }`}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && (
                    <svg viewBox="0 0 12 12" className="text-white dark:text-zinc-900 w-full h-full p-0.5">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>
              <span
                className={`flex-1 text-sm ${
                  task.completed
                    ? 'line-through text-zinc-400'
                    : 'text-zinc-800 dark:text-zinc-100'
                }`}
              >
                {task.title}
              </span>
            </div>
            
            {/* Assignment selector */}
            <form
              action={async (formData) => {
                'use server';
                const userId = formData.get('user_id') as string;
                await assignTask(task.id, userId ? parseInt(userId, 10) : null);
              }}
              className="mt-2 flex items-center gap-2"
            >
              <label className="text-xs text-zinc-500 dark:text-zinc-400">
                Assigned to:
              </label>
              <select
                name="user_id"
                defaultValue={task.assigned_user_id ?? ''}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="text-xs flex-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </form>
          </li>
        ))}
      </ul>

      {filteredTasks.length > 0 && (
        <p className="mt-4 text-xs text-zinc-400 text-right">
          {filteredTasks.filter((t) => t.completed).length} / {filteredTasks.length} completed
        </p>
      )}
    </>
  );
}
