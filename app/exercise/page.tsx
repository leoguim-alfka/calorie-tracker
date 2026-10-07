import { addExercise } from './actions'

export default function ExercisePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">
          Add Exercise
        </h1>

        <p className="mt-2 text-gray-500">
          Log your workout for today.
        </p>

        <form
          action={addExercise}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="exercise_type"
              className="mb-1 block font-medium"
            >
              Exercise
            </label>

            <select
              id="exercise_type"
              name="exercise_type"
              required
              className="w-full rounded-lg border bg-white px-4 py-3"
            >
              <option value="Strength Training">
                Strength Training
              </option>

              <option value="Tennis">
                Tennis
              </option>

              <option value="Running">
                Running
              </option>

              <option value="Walking">
                Walking
              </option>

              <option value="Cycling">
                Cycling
              </option>

              <option value="Swimming">
                Swimming
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="duration_minutes"
              className="mb-1 block font-medium"
            >
              Duration
            </label>

            <input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              min="1"
              required
              placeholder="60"
              className="w-full rounded-lg border px-4 py-3"
            />

            <p className="mt-1 text-sm text-gray-500">
              Minutes
            </p>
          </div>

          <div>
            <label
              htmlFor="calories_burned"
              className="mb-1 block font-medium"
            >
              Calories Burned
            </label>

            <input
              id="calories_burned"
              name="calories_burned"
              type="number"
              min="0"
              required
              placeholder="300"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1 block font-medium"
            >
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Optional workout notes"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="/dashboard"
              className="flex-1 rounded-lg border bg-white px-4 py-3 text-center font-semibold"
            >
              Cancel
            </a>

            <button
              type="submit"
              className="flex-1 rounded-lg bg-black px-4 py-3 font-semibold text-white"
            >
              Add Exercise
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}