'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const sex = formData.get('sex') as string
  const age = Number(formData.get('age'))
  const heightInches = Number(formData.get('height_inches'))
  const currentWeight = Number(formData.get('starting_weight'))
  const goalWeight = Number(formData.get('goal_weight'))
  const activityLevel = formData.get('activity_level') as string
  const weeklyLoss = Number(formData.get('weekly_loss'))

  const weightKg = currentWeight * 0.453592
  const heightCm = heightInches * 2.54

  let bmr = 0

  if (sex === 'male') {
    bmr =
      10 * weightKg +
      6.25 * heightCm -
      5 * age +
      5
  } else {
    bmr =
      10 * weightKg +
      6.25 * heightCm -
      5 * age -
      161
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  }

  const activityMultiplier =
    activityMultipliers[activityLevel] ?? 1.2

  const maintenanceCalories =
    bmr * activityMultiplier

  const dailyDeficit =
    (weeklyLoss * 3500) / 7

  let calorieTarget =
    maintenanceCalories - dailyDeficit

  const minimumCalories =
    sex === 'male' ? 1500 : 1200

  calorieTarget = Math.max(
    calorieTarget,
    minimumCalories
  )

  calorieTarget =
    Math.round(calorieTarget / 10) * 10

  const proteinTarget =
    Math.round(currentWeight * 0.8)

  const fatTarget =
    Math.round(
      (calorieTarget * 0.3) / 9
    )

  const proteinCalories =
    proteinTarget * 4

  const fatCalories =
    fatTarget * 9

  const remainingCalories =
    calorieTarget -
    proteinCalories -
    fatCalories

  const carbTarget =
    Math.max(
      0,
      Math.round(remainingCalories / 4)
    )

  const today =
    new Date().toISOString().split('T')[0]

  const { error: profileError } =
    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        sex,
        height_inches: heightInches,
        starting_weight: currentWeight,
        goal_weight: goalWeight,
        activity_level: activityLevel,
        updated_at: new Date().toISOString(),
      })

  if (profileError) {
    console.error(
      'Profile save error:',
      profileError
    )

    throw new Error(
      'Unable to save profile'
    )
  }

  const { error: goalError } =
    await supabase
      .from('daily_goals')
      .insert({
        user_id: user.id,
        effective_date: today,
        calorie_target: calorieTarget,
        protein_target: proteinTarget,
        carb_target: carbTarget,
        fat_target: fatTarget,
      })

  if (goalError) {
    console.error(
      'Goal save error:',
      goalError
    )

    throw new Error(
      'Unable to save calorie goal'
    )
  }

  revalidatePath('/dashboard')
  revalidatePath('/progress')
  revalidatePath('/settings')

  redirect('/dashboard')
}