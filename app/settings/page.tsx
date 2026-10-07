import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { saveSettings } from './actions'

export const instant = false

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Goals & Settings
            </h1>

            <p className="mt-2 text-gray-500">
              Set your information so we can estimate your daily calorie target.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold"
          >
            Dashboard
          </a>
        </div>

        <form
          action={saveSettings}
          className="mt-8 space-y-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="sex"
              className="mb-1 block font-medium"
            >
              Sex
            </label>

            <select
              id="sex"
              name="sex"
              required
              defaultValue={profile?.sex ?? 'male'}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="age"
              className="mb-1 block font-medium"
            >
              Age
            </label>

            <input
              id="age"
              name="age"
              type="number"
              min="18"
              max="100"
              required
              defaultValue="50"
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="height_inches"
              className="mb-1 block font-medium"
            >
              Height
            </label>

            <div className="relative">
              <input
                id="height_inches"
                name="height_inches"
                type="number"
                step="0.1"
                min="48"
                max="96"
                required
                defaultValue={profile?.height_inches ?? 69}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16"
              />

              <span className="absolute right-4 top-3 text-gray-400">
                in
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="starting_weight"
              className="mb-1 block font-medium"
            >
              Current Weight
            </label>

            <div className="relative">
              <input
                id="starting_weight"
                name="starting_weight"
                type="number"
                step="0.1"
                min="80"
                required
                defaultValue={profile?.starting_weight ?? 188}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16"
              />

              <span className="absolute right-4 top-3 text-gray-400">
                lb
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="goal_weight"
              className="mb-1 block font-medium"
            >
              Goal Weight
            </label>

            <div className="relative">
              <input
                id="goal_weight"
                name="goal_weight"
                type="number"
                step="0.1"
                min="80"
                required
                defaultValue={profile?.goal_weight ?? 168}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16"
              />

              <span className="absolute right-4 top-3 text-gray-400">
                lb
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="activity_level"
              className="mb-1 block font-medium"
            >
              Activity Level
            </label>

            <select
              id="activity_level"
              name="activity_level"
              required
              defaultValue={profile?.activity_level ?? 'moderate'}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
            >
              <option value="sedentary">
                Sedentary
              </option>

              <option value="light">
                Lightly Active
              </option>

              <option value="moderate">
                Moderately Active
              </option>

              <option value="very_active">
                Very Active
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="weekly_loss"
              className="mb-1 block font-medium"
            >
              Desired Weekly Weight Loss
            </label>

            <select
              id="weekly_loss"
              name="weekly_loss"
              required
              defaultValue="1"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
            >
              <option value="0.5">
                0.5 lb per week
              </option>

              <option value="1">
                1 lb per week
              </option>

              <option value="1.5">
                1.5 lb per week
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white"
          >
            Calculate & Save Goal
          </button>
        </form>
      </div>
    </main>
  )
}