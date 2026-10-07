'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  addFood,
  saveMeal,
} from './actions'

type FoodItem = {
  food_name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function AddFoodPage() {
  const [mealType, setMealType] =
    useState('breakfast')

  const [image, setImage] =
    useState<File | null>(null)

  const [preview, setPreview] =
    useState<string | null>(null)

  const [analyzing, setAnalyzing] =
    useState(false)

  const [error, setError] =
    useState('')

  const [items, setItems] =
    useState<FoodItem[]>([])

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(
          preview
        )
      }
    }
  }, [preview])

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    if (preview) {
      URL.revokeObjectURL(
        preview
      )
    }

    setImage(file)

    setPreview(
      URL.createObjectURL(file)
    )

    setItems([])
    setError('')
  }

  function clearPhoto() {
    if (preview) {
      URL.revokeObjectURL(
        preview
      )
    }

    setImage(null)
    setPreview(null)
    setItems([])
    setError('')
  }

  async function analyzePhoto() {
    if (!image) {
      setError(
        'Please take or upload a photo first.'
      )

      return
    }

    setAnalyzing(true)
    setError('')
    setItems([])

    try {
      const formData =
        new FormData()

      formData.append(
        'image',
        image
      )

      const response =
        await fetch(
          '/api/analyze-food',
          {
            method: 'POST',
            body: formData,
          }
        )

      const rawText =
        await response.text()

      if (!rawText) {
        throw new Error(
          'The server returned an empty response.'
        )
      }

      let result

      try {
        result =
          JSON.parse(rawText)
      } catch {
        throw new Error(
          'The server returned invalid data.'
        )
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Unable to analyze photo.'
        )
      }

      if (
        !Array.isArray(
          result.items
        )
      ) {
        throw new Error(
          'No food items were returned.'
        )
      }

      setItems(
        result.items
      )
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to analyze photo.'

      setError(message)
    } finally {
      setAnalyzing(false)
    }
  }

  function updateItem(
    index: number,
    field: keyof FoodItem,
    value: string
  ) {
    setItems(
      (currentItems) =>
        currentItems.map(
          (item, itemIndex) => {
            if (
              itemIndex !== index
            ) {
              return item
            }

            if (
              field ===
                'calories' ||
              field ===
                'protein' ||
              field ===
                'carbs' ||
              field ===
                'fat'
            ) {
              return {
                ...item,

                [field]:
                  Number(value) || 0,
              }
            }

            return {
              ...item,

              [field]:
                value,
            }
          }
        )
    )
  }

  function removeItem(
    index: number
  ) {
    setItems(
      (currentItems) =>
        currentItems.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    )
  }

  const totalCalories =
    items.reduce(
      (total, item) =>
        total +
        Number(
          item.calories || 0
        ),
      0
    )

  const totalProtein =
    items.reduce(
      (total, item) =>
        total +
        Number(
          item.protein || 0
        ),
      0
    )

  const totalCarbs =
    items.reduce(
      (total, item) =>
        total +
        Number(
          item.carbs || 0
        ),
      0
    )

  const totalFat =
    items.reduce(
      (total, item) =>
        total +
        Number(
          item.fat || 0
        ),
      0
    )

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-xl">

        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold">
              Add Food
            </h1>

            <p className="mt-2 text-gray-500">
              Add food manually or analyze a meal photo.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
          >
            Dashboard
          </a>

        </div>

        {/* MEAL SELECTOR */}

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <label className="mb-2 block font-semibold">
            Meal
          </label>

          <select
            value={mealType}
            onChange={(event) =>
              setMealType(
                event.target.value
              )
            }
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

        </section>

        {/* PHOTO */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Food Photo
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            AI estimates are approximate. Review all foods before saving.
          </p>

          {!preview && (

            <div className="mt-5">

              <label
                htmlFor="food-photo"
                className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:bg-gray-50"
              >

                <p className="text-lg font-semibold">
                  Take or Upload Photo
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Photograph the entire meal if possible.
                </p>

              </label>

              <input
                id="food-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                capture="environment"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

            </div>

          )}

          {preview && (

            <div className="mt-5">

              <img
                src={preview}
                alt="Meal preview"
                className="max-h-96 w-full rounded-xl object-cover"
              />

              <div className="mt-4 grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={
                    clearPhoto
                  }
                  disabled={
                    analyzing
                  }
                  className="rounded-lg border px-4 py-3 font-semibold"
                >
                  Change Photo
                </button>

                <button
                  type="button"
                  onClick={
                    analyzePhoto
                  }
                  disabled={
                    analyzing
                  }
                  className="rounded-lg bg-black px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {analyzing
                    ? 'Analyzing...'
                    : items.length > 0
                    ? 'Analyze Again'
                    : 'Analyze Photo'}
                </button>

              </div>

              {analyzing && (

                <div className="mt-5 rounded-xl bg-gray-50 p-4">

                  <p className="font-medium">
                    Analyzing your meal...
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Identifying foods and estimating portions, calories and macros.
                  </p>

                </div>

              )}

            </div>

          )}

          {error && (

            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>

          )}

        </section>

        {/* AI RESULTS */}

        {items.length > 0 && (

          <section className="mt-6">

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-semibold">
                    Meal Estimate
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review and edit before saving.
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                  {items.length}{' '}
                  {items.length === 1
                    ? 'item'
                    : 'items'}
                </span>

              </div>

              {/* TOTALS */}

              <div className="mt-6 rounded-xl bg-gray-50 p-5">

                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Estimated Meal Total
                </p>

                <p className="mt-2 text-4xl font-bold">
                  {Math.round(
                    totalCalories
                  )}
                </p>

                <p className="text-sm text-gray-500">
                  calories
                </p>

                <div className="mt-5 grid grid-cols-3 gap-4 text-center">

                  <MacroTotal
                    value={
                      totalProtein
                    }
                    label="Protein"
                  />

                  <MacroTotal
                    value={
                      totalCarbs
                    }
                    label="Carbs"
                  />

                  <MacroTotal
                    value={
                      totalFat
                    }
                    label="Fat"
                  />

                </div>

              </div>

            </div>

            {/* ITEMS */}

            <div className="mt-4 space-y-4">

              {items.map(
                (item, index) => (

                  <div
                    key={index}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >

                    <div className="flex items-center justify-between">

                      <h3 className="font-semibold">
                        Food Item{' '}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            index
                          )
                        }
                        className="text-sm font-medium text-red-600"
                      >
                        Remove
                      </button>

                    </div>

                    <div className="mt-5 space-y-4">

                      <div>

                        <label className="mb-1 block text-sm font-medium">
                          Food
                        </label>

                        <input
                          value={
                            item.food_name
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              'food_name',
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-lg border px-4 py-3"
                        />

                      </div>

                      <div>

                        <label className="mb-1 block text-sm font-medium">
                          Quantity
                        </label>

                        <input
                          value={
                            item.quantity
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              'quantity',
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-lg border px-4 py-3"
                        />

                      </div>

                      <div className="grid grid-cols-2 gap-4">

                        <NutritionField
                          label="Calories"
                          value={
                            item.calories
                          }
                          onChange={(value) =>
                            updateItem(
                              index,
                              'calories',
                              value
                            )
                          }
                        />

                        <NutritionField
                          label="Protein"
                          value={
                            item.protein
                          }
                          suffix="g"
                          onChange={(value) =>
                            updateItem(
                              index,
                              'protein',
                              value
                            )
                          }
                        />

                        <NutritionField
                          label="Carbs"
                          value={
                            item.carbs
                          }
                          suffix="g"
                          onChange={(value) =>
                            updateItem(
                              index,
                              'carbs',
                              value
                            )
                          }
                        />

                        <NutritionField
                          label="Fat"
                          value={
                            item.fat
                          }
                          suffix="g"
                          onChange={(value) =>
                            updateItem(
                              index,
                              'fat',
                              value
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

            {/* SAVE WHOLE MEAL */}

            {items.length > 0 && (

              <form
                action={saveMeal}
                className="mt-5"
              >

                <input
                  type="hidden"
                  name="meal_type"
                  value={
                    mealType
                  }
                />

                <input
                  type="hidden"
                  name="items_json"
                  value={JSON.stringify(
                    items
                  )}
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-black px-4 py-4 text-lg font-semibold text-white"
                >
                  Save Entire Meal
                </button>

                <p className="mt-2 text-center text-xs text-gray-500">
                  Saves all {items.length}{' '}
                  {items.length === 1
                    ? 'item'
                    : 'items'}{' '}
                  to {mealLabel(
                    mealType
                  )}.
                </p>

              </form>

            )}

          </section>

        )}

        {/* MANUAL ENTRY */}

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Manual Entry
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a food without using a photo.
          </p>

          <form
            action={addFood}
            className="mt-5 space-y-5"
          >

            <div>

              <label className="mb-1 block font-medium">
                Meal
              </label>

              <select
                name="meal_type"
                defaultValue={
                  mealType
                }
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
                placeholder="Grilled chicken"
                className="w-full rounded-lg border px-4 py-3"
              />

            </div>

            <div>

              <label className="mb-1 block font-medium">
                Quantity
              </label>

              <input
                name="quantity"
                placeholder="6 oz"
                className="w-full rounded-lg border px-4 py-3"
              />

            </div>

            <div className="grid grid-cols-2 gap-4">

              <NutritionInput
                label="Calories"
                name="calories"
              />

              <NutritionInput
                label="Protein"
                name="protein"
                suffix="g"
              />

              <NutritionInput
                label="Carbs"
                name="carbs"
                suffix="g"
              />

              <NutritionInput
                label="Fat"
                name="fat"
                suffix="g"
              />

            </div>

            <div className="flex gap-3">

              <a
                href="/dashboard"
                className="flex-1 rounded-lg border px-4 py-3 text-center font-semibold"
              >
                Cancel
              </a>

              <button
                type="submit"
                className="flex-1 rounded-lg bg-black px-4 py-3 font-semibold text-white"
              >
                Add Food
              </button>

            </div>

          </form>

        </section>

      </div>

    </main>
  )
}

function NutritionField({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string
  value: number
  suffix?: string
  onChange: (
    value: string
  ) => void
}) {
  return (
    <div>

      <label className="mb-1 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">

        <input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className={`w-full rounded-lg border px-4 py-3 ${
            suffix
              ? 'pr-10'
              : ''
          }`}
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

function NutritionInput({
  label,
  name,
  suffix,
}: {
  label: string
  name: string
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
          defaultValue="0"
          className={`w-full rounded-lg border px-4 py-3 ${
            suffix
              ? 'pr-10'
              : ''
          }`}
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

function MacroTotal({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <div>

      <p className="text-lg font-bold">
        {Math.round(value)}g
      </p>

      <p className="text-xs text-gray-500">
        {label}
      </p>

    </div>
  )
}

function mealLabel(
  value: string
) {
  switch (value) {
    case 'breakfast':
      return 'Breakfast'

    case 'lunch':
      return 'Lunch'

    case 'dinner':
      return 'Dinner'

    case 'snack':
      return 'Snacks'

    default:
      return 'your diary'
  }
}