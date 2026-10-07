import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteWeight } from '@/app/weight/actions'

export const instant = false

export default async function ProgressPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: weights } = await supabase
    .from('weight_entries')
    .select('*')
    .order('entry_date', { ascending: true })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const weightEntries =
    weights ?? []

  const latestWeight =
    weightEntries.length > 0
      ? Number(
          weightEntries[
            weightEntries.length - 1
          ].weight
        )
      : null

  const startingWeight =
    profile?.starting_weight != null
      ? Number(profile.starting_weight)
      : weightEntries.length > 0
      ? Number(weightEntries[0].weight)
      : null

  const goalWeight =
    profile?.goal_weight != null
      ? Number(profile.goal_weight)
      : null

  const poundsLost =
    startingWeight != null &&
    latestWeight != null
      ? startingWeight - latestWeight
      : null

  const totalGoalLoss =
    startingWeight != null &&
    goalWeight != null
      ? startingWeight - goalWeight
      : null

  let progressPercent = 0

  if (
    poundsLost != null &&
    totalGoalLoss != null &&
    totalGoalLoss > 0
  ) {
    progressPercent =
      (poundsLost / totalGoalLoss) * 100

    progressPercent =
      Math.max(
        0,
        Math.min(
          progressPercent,
          100
        )
      )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-3xl">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              Progress
            </h1>

            <p className="mt-2 text-gray-500">
              Track your weight-loss progress.
            </p>

          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
          >
            Dashboard
          </Link>

        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">

            <Stat
              label="Current"
              value={
                latestWeight != null
                  ? `${latestWeight.toFixed(1)} lb`
                  : '—'
              }
            />

            <Stat
              label="Starting"
              value={
                startingWeight != null
                  ? `${startingWeight.toFixed(1)} lb`
                  : '—'
              }
            />

            <Stat
              label="Goal"
              value={
                goalWeight != null
                  ? `${goalWeight.toFixed(1)} lb`
                  : '—'
              }
            />

            <Stat
              label="Lost"
              value={
                poundsLost != null
                  ? `${poundsLost.toFixed(1)} lb`
                  : '—'
              }
            />

          </div>

        </section>

        {startingWeight != null &&
          latestWeight != null &&
          goalWeight != null && (

            <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

              <div className="flex justify-between">

                <h2 className="text-xl font-semibold">
                  Goal Progress
                </h2>

                <span className="font-semibold">
                  {Math.round(progressPercent)}%
                </span>

              </div>

              <div className="mt-4 h-4 overflow-hidden rounded-full bg-gray-200">

                <div
                  className="h-full rounded-full bg-black"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />

              </div>

            </section>

          )}

        <Link
          href="/weight"
          className="mt-6 block w-full rounded-xl bg-black px-4 py-4 text-center font-semibold text-white"
        >
          + Log Weight
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Weight History
          </h2>

          {weightEntries.length === 0 ? (

            <p className="mt-4 text-gray-500">
              No weight entries yet.
            </p>

          ) : (

            <div className="mt-4 divide-y">

              {[...weightEntries]
                .reverse()
                .map((entry) => (

                  <div
                    key={entry.id}
                    className="py-4"
                  >

                    <div className="flex justify-between">

                      <div>

                        <p className="font-medium">
                          {formatDate(
                            entry.entry_date
                          )}
                        </p>

                        {entry.notes && (
                          <p className="mt-1 text-sm text-gray-500">
                            {entry.notes}
                          </p>
                        )}

                      </div>

                      <p className="text-lg font-semibold">
                        {Number(
                          entry.weight
                        ).toFixed(1)}{' '}
                        lb
                      </p>

                    </div>

                    <div className="mt-3 flex gap-3">

                      <Link
                        href={`/weight/${entry.id}/edit`}
                        className="text-sm font-semibold underline"
                      >
                        Edit
                      </Link>

                      <form action={deleteWeight}>

                        <input
                          type="hidden"
                          name="id"
                          value={entry.id}
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

      </div>

    </main>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  )
}

function formatDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  )
}