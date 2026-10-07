import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold">
          Calorie Tracker
        </h1>

        <p className="mb-8 text-gray-500">
          Sign in to track your meals, workouts and weight.
        </p>

        <form className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <button
            formAction={login}
            className="w-full rounded-lg bg-black px-4 py-3 text-white"
          >
            Sign In
          </button>

          <button
            formAction={signup}
            className="w-full rounded-lg border px-4 py-3"
          >
            Create Account
          </button>
        </form>
      </div>
    </main>
  )
}