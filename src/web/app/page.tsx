import { getTasks, createTask, toggleTask, getUsers, assignTask } from './actions';

export default async function Home({ searchParams }: { searchParams: { assignee?: string } }) {
  const assigneeId = searchParams.assignee ? parseInt(searchParams.assignee, 10) : undefined;
  const tasks = await getTasks(assigneeId);
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          To-Do List
        </h1>

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
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Add
            </button>
          </div>
          <select
            name="assigned_to"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </form>

        {/* Filter by assignee */}
        <div className="mb-6 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">Filter by assignee:</p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/"
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !assigneeId
                  ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
                  : 'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              All
            </a>
            {users.map((user) => (
              <a
                key={user.id}
                href={`/?assignee=${user.id}`}
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  assigneeId === user.id
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
                    : 'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                {user.email}
              </a>
            ))}
          </div>
        </div>

        {/* Task list */}
        <ul className="space-y-2">
          {tasks.length === 0 && (
            <li className="text-zinc-400 text-center py-8">No tasks yet. Add one above!</li>
          )}
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
            >
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
              <div className="flex-1">
                <span
                  className={`block text-sm ${
                    task.completed
                      ? 'line-through text-zinc-400'
                      : 'text-zinc-800 dark:text-zinc-100'
                  }`}
                >
                  {task.title}
                </span>
                {task.assigned_to && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Assigned to: {users.find(u => u.id === task.assigned_to)?.email || 'Unknown'}
                  </span>
                )}
              </div>
              <form
                action={async () => {
                  'use server';
                  const newAssignee = task.assigned_to ? null : users[0]?.id || null;
                  await assignTask(task.id, newAssignee);
                }}
                className="flex-shrink-0"
              >
                <button
                  type="submit"
                  className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  title={task.assigned_to ? 'Unassign' : 'Quick assign to first user'}
                >
                  {task.assigned_to ? '✓ Assigned' : 'Assign'}
                </button>
              </form>
            </li>
          ))}
        </ul>

        {tasks.length > 0 && (
          <p className="mt-4 text-xs text-zinc-400 text-right">
            {tasks.filter((t) => t.completed).length} / {tasks.length} completed
          </p>
        )}
      </div>
    </div>
  );
}
