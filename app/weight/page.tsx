import { addWeight } from './actions'

export default function WeightPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-gray-900">
          Log Weight
        </h1>

        <p className="mt-2 text-gray-500">
          Record your weight for today.
        </p>

        <form
          action={addWeight}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="weight"
              className="mb-1 block font-medium"
            >
              Weight
            </label>

            <div className="relative">
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min="1"
                required
                placeholder="188.0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-14"
              />

              <span className="absolute right-4 top-3 text-gray-400">
                lb
              </span>
            </div>
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
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="/dashboard"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-semibold"
            >
              Cancel
            </a>

            <button
              type="submit"
              className="flex-1 rounded-lg bg-black px-4 py-3 font-semibold text-white"
            >
              Save Weight
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}