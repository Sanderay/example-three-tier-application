import { getTasks, getUsers, createTask } from './actions';
import TaskList from './TaskList';

export default async function Home() {
  const [tasks, users] = await Promise.all([getTasks(), getUsers()]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          To-Do List
        </h1>

        {/* Add task form */}
        <form action={createTask} className="mb-8">
          <div className="flex gap-2 mb-3">
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
          {users.length > 0 && (
            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Assign to:
              </label>
              <select
                id="assigned_to"
                name="assigned_to"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
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
        </form>

        <TaskList initialTasks={tasks} users={users} />
      </div>
    </div>
  );
}
