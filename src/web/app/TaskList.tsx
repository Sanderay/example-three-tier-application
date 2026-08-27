'use client';

import { useState } from 'react';
import { toggleTask, updateTaskAssignment, type Task, type User } from './actions';

type TaskListProps = {
  initialTasks: Task[];
  users: User[];
};

export default function TaskList({ initialTasks, users }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<number | null | 'all'>('all');

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.assigned_to === filter);

  const handleToggle = async (taskId: number, completed: boolean) => {
    await toggleTask(taskId, completed);
    // Optimistically update the UI
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed } : t));
  };

  const handleAssignmentChange = async (taskId: number, assignedTo: number | null) => {
    await updateTaskAssignment(taskId, assignedTo);
    // Optimistically update the UI
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const user = assignedTo ? users.find(u => u.id === assignedTo) : null;
        return { 
          ...t, 
          assigned_to: assignedTo,
          assigned_to_email: user?.email || null
        };
      }
      return t;
    }));
  };

  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      setFilter('all');
    } else if (value === '') {
      setFilter(null);
    } else {
      setFilter(parseInt(value, 10));
    }
  };

  return (
    <>
      {/* Filter dropdown */}
      {users.length > 0 && (
        <div className="mb-6">
          <label htmlFor="filter" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Filter by assignee:
          </label>
          <select
            id="filter"
            value={filter === null ? '' : filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="all">All tasks</option>
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Task list */}
      <ul className="space-y-2">
        {filteredTasks.length === 0 && (
          <li className="text-zinc-400 text-center py-8">
            {filter === 'all' ? 'No tasks yet. Add one above!' : 'No tasks match this filter.'}
          </li>
        )}
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
          >
            <button
              onClick={() => handleToggle(task.id, !task.completed)}
              className={`h-5 w-5 rounded border-2 flex-shrink-0 transition-colors mt-0.5 ${
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
            <div className="flex-1 min-w-0">
              <span
                className={`block text-sm ${
                  task.completed
                    ? 'line-through text-zinc-400'
                    : 'text-zinc-800 dark:text-zinc-100'
                }`}
              >
                {task.title}
              </span>
              {users.length > 0 && (
                <div className="mt-2">
                  <select
                    value={task.assigned_to || ''}
                    onChange={(e) => handleAssignmentChange(task.id, e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
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
