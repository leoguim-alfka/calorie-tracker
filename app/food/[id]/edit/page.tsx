import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateFood } from '../../actions'

export const instant = false

export default async function EditFoodPage({
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

  const { data: food, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('id', Number(id))
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !food) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              Edit Food
            </h1>

            <p className="mt-2 text-gray-500">
              Update this food entry.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </Link>

        </div>

        <form
          action={updateFood}
          className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm"
        >

          <input
            type="hidden"
            name="id"
            value={food.id}
          />

          <div>
            <label className="mb-1 block font-medium">
              Meal
            </label>

            <select
              name="meal_type"
              defaultValue={food.meal_type}
              className="w-full rounded-lg border bg-white px-4 py-3"
            >
              <option value="breakfast">
                Breakfast
              </option>

              <option value="lunch">
                Lunch
              </option>

              <option value="dinner">
                Dinner
              </option>

              <option value="snack">
                Snack
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Food
            </label>

            <input
              name="food_name"
              required
              defaultValue={food.food_name}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Quantity
            </label>

            <input
              name="quantity"
              defaultValue={food.quantity ?? ''}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <NumberField
              label="Calories"
              name="calories"
              value={food.calories}
            />

            <NumberField
              label="Protein"
              name="protein"
              value={food.protein}
              suffix="g"
            />

            <NumberField
              label="Carbs"
              name="carbs"
              value={food.carbs}
              suffix="g"
            />

            <NumberField
              label="Fat"
              name="fat"
              value={food.fat}
              suffix="g"
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

function NumberField({
  label,
  name,
  value,
  suffix,
}: {
  label: string
  name: string
  value: number
  suffix?: string
}) {
  return (
    <div>

      <label className="mb-1 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">

        <input
          name={name}
          type="number"
          min="0"
          step="0.1"
          defaultValue={value ?? 0}
          className="w-full rounded-lg border px-4 py-3"
        />

        {suffix && (
          <span className="absolute right-3 top-3 text-gray-400">
            {suffix}
          </span>
        )}

      </div>

    </div>
  )
}