import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateExercise } from '../../actions'

export const instant = false

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: exercise } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', Number(id))
    .eq('user_id', user.id)
    .maybeSingle()

  if (!exercise) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-md">

        <div className="flex items-center justify-between">

          <h1 className="text-3xl font-bold">
            Edit Exercise
          </h1>

          <Link
            href="/dashboard"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </Link>

        </div>

        <form
          action={updateExercise}
          className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm"
        >

          <input
            type="hidden"
            name="id"
            value={exercise.id}
          />

          <div>

            <label className="mb-1 block font-medium">
              Exercise
            </label>

            <select
              name="exercise_type"
              defaultValue={exercise.exercise_type}
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

            <label className="mb-1 block font-medium">
              Duration
            </label>

            <input
              name="duration_minutes"
              type="number"
              min="1"
              required
              defaultValue={exercise.duration_minutes}
              className="w-full rounded-lg border px-4 py-3"
            />

            <p className="mt-1 text-sm text-gray-500">
              Minutes
            </p>

          </div>

          <div>

            <label className="mb-1 block font-medium">
              Calories Burned
            </label>

            <input
              name="calories_burned"
              type="number"
              min="0"
              required
              defaultValue={exercise.calories_burned}
              className="w-full rounded-lg border px-4 py-3"
            />

          </div>

          <div>

            <label className="mb-1 block font-medium">
              Notes
            </label>

            <textarea
              name="notes"
              rows={3}
              defaultValue={exercise.notes ?? ''}
              className="w-full rounded-lg border px-4 py-3"
            />

          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white"
          >
            Save Changes
          </button>

        </form>

      </div>

    </main>
  )
}