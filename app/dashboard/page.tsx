import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/logout/actions'
import { deleteFood } from '@/app/food/actions'
import { deleteExercise } from '@/app/exercise/actions'

export const instant = false

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = getLocalDateString(new Date())

  const selectedDate =
    isValidDate(params.date)
      ? params.date!
      : today

  const { data: foods } = await supabase
    .from('food_entries')
    .select('*')
    .eq('entry_date', selectedDate)
    .order('created_at', { ascending: true })

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('exercise_date', selectedDate)
    .order('created_at', { ascending: true })

  const { data: goals } = await supabase
    .from('daily_goals')
    .select('*')
    .lte('effective_date', selectedDate)
    .order('effective_date', { ascending: false })
    .limit(1)

  const { data: latestWeights } = await supabase
    .from('weight_entries')
    .select('*')
    .lte('entry_date', selectedDate)
    .order('entry_date', { ascending: false })
    .limit(1)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const calorieTarget =
    Number(goals?.[0]?.calorie_target ?? 2000)

  const proteinTarget =
    Number(goals?.[0]?.protein_target ?? 150)

  const carbTarget =
    Number(goals?.[0]?.carb_target ?? 180)

  const fatTarget =
    Number(goals?.[0]?.fat_target ?? 70)

  const caloriesConsumed =
    foods?.reduce(
      (sum, food) =>
        sum + Number(food.calories || 0),
      0
    ) ?? 0

  const protein =
    foods?.reduce(
      (sum, food) =>
        sum + Number(food.protein || 0),
      0
    ) ?? 0

  const carbs =
    foods?.reduce(
      (sum, food) =>
        sum + Number(food.carbs || 0),
      0
    ) ?? 0

  const fat =
    foods?.reduce(
      (sum, food) =>
        sum + Number(food.fat || 0),
      0
    ) ?? 0

  const exerciseCalories =
    exercises?.reduce(
      (sum, exercise) =>
        sum +
        Number(exercise.calories_burned || 0),
      0
    ) ?? 0

  const netCalories =
    caloriesConsumed - exerciseCalories

  const remainingCalories =
    calorieTarget -
    caloriesConsumed +
    exerciseCalories

  const breakfast =
    foods?.filter(
      (food) => food.meal_type === 'breakfast'
    ) ?? []

  const lunch =
    foods?.filter(
      (food) => food.meal_type === 'lunch'
    ) ?? []

  const dinner =
    foods?.filter(
      (food) => food.meal_type === 'dinner'
    ) ?? []

  const snacks =
    foods?.filter(
      (food) => food.meal_type === 'snack'
    ) ?? []

  const currentWeight =
    latestWeights?.[0]?.weight != null
      ? Number(latestWeights[0].weight)
      : null

  const goalWeight =
    profile?.goal_weight != null
      ? Number(profile.goal_weight)
      : null

  const previousDate =
    shiftDate(selectedDate, -1)

  const nextDate =
    shiftDate(selectedDate, 1)

  const formattedDate =
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(
      new Date(
        `${selectedDate}T12:00:00`
      )
    )

  const isToday =
    selectedDate === today

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">

        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              {isToday ? 'Today' : 'Daily Summary'}
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {formattedDate}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {user.email}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/settings"
              className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
            >
              Settings
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* DATE NAVIGATION */}

        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">

            <Link
              href={`/dashboard?date=${previousDate}`}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              ← Previous
            </Link>

            {!isToday && (
              <Link
                href="/dashboard"
                className="text-sm font-semibold underline"
              >
                Today
              </Link>
            )}

            {nextDate <= today ? (
              <Link
                href={`/dashboard?date=${nextDate}`}
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Next →
              </Link>
            ) : (
              <button
                disabled
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-300"
              >
                Next →
              </button>
            )}

          </div>
        </section>

        {/* CALORIES */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="text-center">

            <p className="text-sm uppercase tracking-wide text-gray-500">
              Calories Remaining
            </p>

            <p
              className={`mt-2 text-5xl font-bold ${
                remainingCalories < 0
                  ? 'text-red-600'
                  : ''
              }`}
            >
              {Math.round(remainingCalories)}
            </p>

          </div>

          <div className="mt-8 grid grid-cols-3 divide-x text-center">

            <StatSmall
              value={calorieTarget}
              label="Goal"
            />

            <StatSmall
              value={caloriesConsumed}
              label="Food"
            />

            <StatSmall
              value={exerciseCalories}
              label="Exercise"
            />

          </div>

          <div className="mt-6 border-t pt-4">

            <div className="flex justify-between text-sm">

              <span className="text-gray-500">
                Net calories
              </span>

              <span className="font-semibold">
                {Math.round(netCalories)}
              </span>

            </div>

          </div>

        </section>

        {/* MACROS */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Macros
          </h2>

          <div className="mt-5 space-y-5">

            <MacroRow
              label="Protein"
              current={protein}
              target={proteinTarget}
            />

            <MacroRow
              label="Carbs"
              current={carbs}
              target={carbTarget}
            />

            <MacroRow
              label="Fat"
              current={fat}
              target={fatTarget}
            />

          </div>

        </section>

        {/* WEIGHT */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Weight
              </p>

              <p className="mt-1 text-3xl font-bold">
                {currentWeight != null
                  ? `${currentWeight.toFixed(1)} lb`
                  : '—'}
              </p>

              {goalWeight != null && (
                <p className="mt-1 text-sm text-gray-500">
                  Goal {goalWeight.toFixed(1)} lb
                </p>
              )}

            </div>

            <div className="flex flex-col gap-2">

              {isToday && (
                <Link
                  href="/weight"
                  className="rounded-lg bg-black px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Log Weight
                </Link>
              )}

              <Link
                href="/progress"
                className="rounded-lg border px-4 py-2 text-center text-sm font-semibold"
              >
                View Progress
              </Link>

            </div>

          </div>

        </section>

        {/* FOOD */}

        <div className="mt-8 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Food
          </h2>

          {isToday && (
            <Link
              href="/food"
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              + Add Food
            </Link>
          )}

        </div>

        <MealSection
          title="Breakfast"
          foods={breakfast}
        />

        <MealSection
          title="Lunch"
          foods={lunch}
        />

        <MealSection
          title="Dinner"
          foods={dinner}
        />

        <MealSection
          title="Snacks"
          foods={snacks}
        />

        {/* EXERCISE */}

        <div className="mt-8 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Exercise
          </h2>

          {isToday && (
            <Link
              href="/exercise"
              className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
            >
              + Add Exercise
            </Link>
          )}

        </div>

        <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">

          {!exercises ||
          exercises.length === 0 ? (

            <p className="py-4 text-center text-gray-500">
              No exercise logged.
            </p>

          ) : (

            <div className="space-y-4">

              {exercises.map((exercise) => (

                <div
                  key={exercise.id}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >

                  <div className="flex justify-between">

                    <div>

                      <p className="font-medium">
                        {exercise.exercise_type}
                      </p>

                      <p className="text-sm text-gray-500">
                        {exercise.duration_minutes} minutes
                      </p>

                    </div>

                    <p className="font-semibold">
                      {exercise.calories_burned} cal
                    </p>

                  </div>

                  <div className="mt-3 flex gap-3">

                    <Link
                      href={`/exercise/${exercise.id}/edit`}
                      className="text-sm font-semibold underline"
                    >
                      Edit
                    </Link>

                    <form action={deleteExercise}>

                      <input
                        type="hidden"
                        name="id"
                        value={exercise.id}
                      />

                      <button
                        type="submit"
                        className="text-sm font-semibold text-red-600 underline"
                      >
                        Delete
                      </button>

                    </form>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        <div className="h-12" />

      </div>
    </main>
  )
}

function MealSection({
  title,
  foods,
}: {
  title: string
  foods: any[]
}) {
  const total =
    foods.reduce(
      (sum, food) =>
        sum + Number(food.calories || 0),
      0
    )

  return (
    <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">

      <div className="flex justify-between">

        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        <span className="font-semibold">
          {Math.round(total)} cal
        </span>

      </div>

      {foods.length === 0 ? (

        <p className="mt-4 text-sm text-gray-400">
          Nothing logged.
        </p>

      ) : (

        <div className="mt-4 space-y-4">

          {foods.map((food) => (

            <div
              key={food.id}
              className="border-b border-gray-100 pb-4 last:border-0"
            >

              <div className="flex justify-between">

                <div>

                  <p className="font-medium">
                    {food.food_name}
                  </p>

                  {food.quantity && (
                    <p className="text-sm text-gray-500">
                      {food.quantity}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-400">
                    P {Math.round(Number(food.protein || 0))}g
                    {' · '}
                    C {Math.round(Number(food.carbs || 0))}g
                    {' · '}
                    F {Math.round(Number(food.fat || 0))}g
                  </p>

                </div>

                <p className="font-semibold">
                  {Math.round(Number(food.calories || 0))} cal
                </p>

              </div>

              <div className="mt-3 flex gap-3">

                <Link
                  href={`/food/${food.id}/edit`}
                  className="text-sm font-semibold underline"
                >
                  Edit
                </Link>

                <form action={deleteFood}>

                  <input
                    type="hidden"
                    name="id"
                    value={food.id}
                  />

                  <button
                    type="submit"
                    className="text-sm font-semibold text-red-600 underline"
                  >
                    Delete
                  </button>

                </form>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  )
}

function StatSmall({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <div>

      <p className="text-2xl font-semibold">
        {Math.round(value)}
      </p>

      <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

    </div>
  )
}

function MacroRow({
  label,
  current,
  target,
}: {
  label: string
  current: number
  target: number
}) {
  const percent =
    target > 0
      ? Math.min(
          (current / target) * 100,
          100
        )
      : 0

  return (
    <div>

      <div className="flex justify-between">

        <span className="font-medium">
          {label}
        </span>

        <span className="text-sm text-gray-500">
          {Math.round(current)} / {Math.round(target)} g
        </span>

      </div>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-200">

        <div
          className="h-full rounded-full bg-black"
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  )
}

function shiftDate(
  date: string,
  days: number
) {
  const value =
    new Date(
      `${date}T12:00:00`
    )

  value.setDate(
    value.getDate() + days
  )

  return getLocalDateString(value)
}

function getLocalDateString(
  date: Date
) {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      date.getDate()
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isValidDate(
  value?: string
) {
  if (!value) {
    return false
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(
    value
  )
}