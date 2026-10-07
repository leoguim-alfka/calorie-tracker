import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateWeight } from '../../actions'

export const instant = false

export default async function EditWeightPage({
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

  const { data: entry } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('id', Number(id))
    .eq('user_id', user.id)
    .maybeSingle()

  if (!entry) {
    redirect('/progress')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-md">

        <div className="flex items-center justify-between">

          <h1 className="text-3xl font-bold">
            Edit Weight
          </h1>

          <Link
            href="/progress"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </Link>

        </div>

        <form
          action={updateWeight}
          className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm"
        >

          <input
            type="hidden"
            name="id"
            value={entry.id}
          />

          <div>

            <label className="mb-1 block font-medium">
              Weight
            </label>

            <div className="relative">

              <input
                name="weight"
                type="number"
                step="0.1"
                min="1"
                required
                defaultValue={entry.weight}
                className="w-full rounded-lg border px-4 py-3 pr-14"
              />

              <span className="absolute right-4 top-3 text-gray-400">
                lb
              </span>

            </div>

          </div>

          <div>

            <label className="mb-1 block font-medium">
              Notes
            </label>

            <textarea
              name="notes"
              rows={3}
              defaultValue={entry.notes ?? ''}
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