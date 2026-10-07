'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type MealItem = {
  food_name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

const allowedMealTypes = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
]

export async function addFood(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const foodName = String(
    formData.get('food_name') ?? ''
  ).trim()

  const quantity = String(
    formData.get('quantity') ?? ''
  ).trim()

  const mealType = String(
    formData.get('meal_type') ?? ''
  )

  const calories = Number(
    formData.get('calories') ?? 0
  )

  const protein = Number(
    formData.get('protein') ?? 0
  )

  const carbs = Number(
    formData.get('carbs') ?? 0
  )

  const fat = Number(
    formData.get('fat') ?? 0
  )

  if (!foodName) {
    throw new Error('Food name is required.')
  }

  if (!allowedMealTypes.includes(mealType)) {
    throw new Error('Invalid meal type.')
  }

  const { error } = await supabase
    .from('food_entries')
    .insert({
      user_id: user.id,
      food_name: foodName,
      quantity,
      meal_type: mealType,
      calories,
      protein,
      carbs,
      fat,
    })

  if (error) {
    console.error('Food save error:', error)
    throw new Error('Unable to save food.')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function saveMeal(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const mealType = String(
    formData.get('meal_type') ?? ''
  )

  const itemsJson = String(
    formData.get('items_json') ?? ''
  )

  if (!allowedMealTypes.includes(mealType)) {
    throw new Error('Invalid meal type.')
  }

  let items: MealItem[]

  try {
    items = JSON.parse(itemsJson)
  } catch {
    throw new Error('Unable to read meal items.')
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No food items were provided.')
  }

  const rows = items.map((item) => ({
    user_id: user.id,
    meal_type: mealType,
    food_name: item.food_name.trim(),
    quantity: item.quantity?.trim() || '',
    calories: Number(item.calories) || 0,
    protein: Number(item.protein) || 0,
    carbs: Number(item.carbs) || 0,
    fat: Number(item.fat) || 0,
  }))

  const { error } = await supabase
    .from('food_entries')
    .insert(rows)

  if (error) {
    console.error('Meal save error:', error)
    throw new Error('Unable to save meal.')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function updateFood(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = Number(formData.get('id'))

  const foodName = String(
    formData.get('food_name') ?? ''
  ).trim()

  const quantity = String(
    formData.get('quantity') ?? ''
  ).trim()

  const mealType = String(
    formData.get('meal_type') ?? ''
  )

  const calories = Number(
    formData.get('calories') ?? 0
  )

  const protein = Number(
    formData.get('protein') ?? 0
  )

  const carbs = Number(
    formData.get('carbs') ?? 0
  )

  const fat = Number(
    formData.get('fat') ?? 0
  )

  if (!id) {
    throw new Error('Food ID is missing.')
  }

  if (!foodName) {
    throw new Error('Food name is required.')
  }

  if (!allowedMealTypes.includes(mealType)) {
    throw new Error('Invalid meal type.')
  }

  const { error } = await supabase
    .from('food_entries')
    .update({
      food_name: foodName,
      quantity,
      meal_type: mealType,
      calories,
      protein,
      carbs,
      fat,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Food update error:', error)
    throw new Error('Unable to update food.')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function deleteFood(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = Number(formData.get('id'))

  if (!id) {
    throw new Error('Food ID is missing.')
  }

  const { error } = await supabase
    .from('food_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Food delete error:', error)
    throw new Error('Unable to delete food.')
  }

  revalidatePath('/dashboard')
}