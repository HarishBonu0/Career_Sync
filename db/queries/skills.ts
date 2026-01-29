import supabaseAdmin from '../supabaseAdmin'

export interface SkillSessionPayload {
  user_id?: string | null
  topic: string
  total_questions?: number
  correct_answers?: number
  is_completed?: boolean
  questions?: {
    question_text: string
    correct_answer?: string
    explanation?: string
    order_index?: number
  }[]
}

export async function createSkillSession(payload: SkillSessionPayload) {
  const { questions = [], ...sessionFields } = payload
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('skill_sessions')
    .insert([{ ...sessionFields }])
    .select('id')
    .single()

  if (sessionError || !session) throw new Error(sessionError?.message || 'Failed to create session')
  const sessionId = session.id as string

  if (questions.length) {
    const qRows = questions.map((q, idx) => ({
      session_id: sessionId,
      question_text: q.question_text,
      correct_answer: q.correct_answer || null,
      explanation: q.explanation || null,
      order_index: q.order_index ?? idx + 1,
    }))
    const { error: qError } = await supabaseAdmin.from('skill_questions').insert(qRows)
    if (qError) throw new Error(qError.message)
  }

  return { sessionId }
}

export async function recordAnswer(params: {
  question_id: string
  user_id?: string | null
  user_answer: string
  is_correct?: boolean
  confidence_level?: number
}) {
  const { error } = await supabaseAdmin.from('skill_answers').insert([{ ...params }])
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function saveSkillGaps(sessionId: string, gaps: { concept: string; reason?: string; priority?: 'low' | 'medium' | 'high' }[]) {
  if (!gaps.length) return { success: true }
  const rows = gaps.map((g) => ({
    session_id: sessionId,
    concept: g.concept,
    reason: g.reason || null,
    priority: g.priority || 'medium',
  }))
  const { error } = await supabaseAdmin.from('skill_gaps').insert(rows)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function getSessionDeep(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('skill_sessions')
    .select('*, skill_questions(*, skill_answers(*))')
    .eq('id', sessionId)
    .single()

  if (error) throw new Error(error.message)
  return data
}
