import { getTasks, getUsers, createTask, toggleTask, updateTaskAssignment } from './actions';

type Props = {
  searchParams: Promise<{ user?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const selectedUserId = params.user ? parseInt(params.user, 10) : undefined;
  
  const [tasks, users] = await Promise.all([
    getTasks(selectedUserId),
    getUsers(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          To-Do List
        </h1>

        {/* User filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Filter by person
          </label>
          <div className="flex gap-2 flex-wrap">
            <a
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !selectedUserId
                  ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
              }`}
            >
              All tasks
            </a>
            {users.map((user) => (
              <a
                key={user.id}
                href={`/?user=${user.id}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedUserId === user.id
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                }`}
              >
                {user.email.split('@')[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Add task form */}
        <form action={createTask} className="mb-8">
          <div className="flex gap-2 mb-2">
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
          <div className="flex items-center gap-2">
            <label htmlFor="assigned_user_id" className="text-sm text-zinc-600 dark:text-zinc-400">
              Assign to:
            </label>
            <select
              name="assigned_user_id"
              id="assigned_user_id"
              className="text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Task list */}
        <ul className="space-y-2">
          {tasks.length === 0 && (
            <li className="text-zinc-400 text-center py-8">
              {selectedUserId 
                ? `No tasks assigned to ${users.find(u => u.id === selectedUserId)?.email.split('@')[0]}.`
                : 'No tasks yet. Add one above!'}
            </li>
          )}
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
            >
              <form
                action={async () => {
                  'use server';
                  await toggleTask(task.id, !task.completed);
                }}
              >
                <button
                  type="submit"
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
              </form>
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
                <form
                  action={async (formData: FormData) => {
                    'use server';
                    const newUserId = formData.get('assigned_user_id') as string;
                    await updateTaskAssignment(
                      task.id,
                      newUserId === '' ? null : parseInt(newUserId, 10)
                    );
                  }}
                  className="mt-1.5 flex items-center gap-2"
                >
                  <label className="text-xs text-zinc-500 dark:text-zinc-500">
                    Assigned to:
                  </label>
                  <select
                    name="assigned_user_id"
                    defaultValue={task.assigned_user_id?.toString() || ''}
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                    className="text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-0.5 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                </form>
              </div>
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
