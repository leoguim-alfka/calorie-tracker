'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addExercise(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const exerciseType = String(
    formData.get('exercise_type') ?? ''
  )

  const durationMinutes = Number(
    formData.get('duration_minutes') ?? 0
  )

  const caloriesBurned = Number(
    formData.get('calories_burned') ?? 0
  )

  const notes =
    String(formData.get('notes') ?? '').trim() || null

  const { error } = await supabase
    .from('exercises')
    .insert({
      user_id: user.id,
      exercise_type: exerciseType,
      duration_minutes: durationMinutes,
      calories_burned: caloriesBurned,
      notes,
    })

  if (error) {
    console.error('Exercise insert error:', error)
    throw new Error('Unable to save exercise.')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function updateExercise(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = Number(formData.get('id'))

  const exerciseType = String(
    formData.get('exercise_type') ?? ''
  )

  const durationMinutes = Number(
    formData.get('duration_minutes') ?? 0
  )

  const caloriesBurned = Number(
    formData.get('calories_burned') ?? 0
  )

  const notes =
    String(formData.get('notes') ?? '').trim() || null

  const { error } = await supabase
    .from('exercises')
    .update({
      exercise_type: exerciseType,
      duration_minutes: durationMinutes,
      calories_burned: caloriesBurned,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Exercise update error:', error)
    throw new Error('Unable to update exercise.')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function deleteExercise(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = Number(formData.get('id'))

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Exercise delete error:', error)
    throw new Error('Unable to delete exercise.')
  }

  revalidatePath('/dashboard')
}