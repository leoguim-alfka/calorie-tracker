'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addWeight(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const weight = Number(
    formData.get('weight')
  )

  const notes =
    String(
      formData.get('notes') ?? ''
    ).trim() || null

  const today =
    new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('weight_entries')
    .upsert(
      {
        user_id: user.id,
        entry_date: today,
        weight,
        notes,
      },
      {
        onConflict: 'user_id,entry_date',
      }
    )

  if (error) {
    console.error('Weight save error:', error)
    throw new Error('Unable to save weight.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/progress')

  redirect('/progress')
}

export async function updateWeight(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = Number(formData.get('id'))
  const weight = Number(formData.get('weight'))

  const notes =
    String(
      formData.get('notes') ?? ''
    ).trim() || null

  const { error } = await supabase
    .from('weight_entries')
    .update({
      weight,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Weight update error:', error)
    throw new Error('Unable to update weight.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/progress')

  redirect('/progress')
}

export async function deleteWeight(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const id = Number(formData.get('id'))

  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Weight delete error:', error)
    throw new Error('Unable to delete weight.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/progress')
}