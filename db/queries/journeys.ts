import supabaseAdmin from '../supabaseAdmin'

export async function getLearningJourneys() {
  const { data, error } = await supabaseAdmin
    .from('learning_journeys')
    .select('*, learning_courses(*, learning_modules(*, learning_resources(*)))')

  if (error) throw new Error(error.message)
  return data
}

export async function getJourneyBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('learning_journeys')
    .select('*, learning_courses(*, learning_modules(*, learning_resources(*)))')
    .eq('slug', slug)
    .single()

  if (error) throw new Error(error.message)
  return data
}
