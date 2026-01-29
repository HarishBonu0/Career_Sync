import supabaseAdmin from '../supabaseAdmin'

export interface RoadmapPayload {
  user_id?: string | null
  current_role?: string
  target_role?: string
  known_skills?: string[]
  expected_salary?: number
  stages?: {
    title: string
    description?: string
    order_index?: number
    tasks?: {
      title: string
      description?: string
      resource_link?: string
      is_optional?: boolean
      order_index?: number
    }[]
  }[]
}

export async function createRoadmap(payload: RoadmapPayload) {
  const { stages = [], ...roadmapFields } = payload
  const { data: roadmap, error: roadmapError } = await supabaseAdmin
    .from('roadmaps')
    .insert([{ ...roadmapFields }])
    .select('id')
    .single()

  if (roadmapError || !roadmap) throw new Error(roadmapError?.message || 'Failed to create roadmap')
  const roadmapId = roadmap.id as string

  if (stages.length) {
    const stagedRows = stages.map((s, idx) => ({
      roadmap_id: roadmapId,
      title: s.title,
      description: s.description || null,
      order_index: s.order_index ?? idx + 1,
    }))

    const { data: insertedStages, error: stageError } = await supabaseAdmin
      .from('roadmap_stages')
      .insert(stagedRows)
      .select('id')

    if (stageError) throw new Error(stageError.message)

    // tasks
    const tasks = stages.flatMap((stage, idx) => {
      const stageId = insertedStages?.[idx]?.id
      return (stage.tasks || []).map((t, tIdx) => ({
        stage_id: stageId,
        title: t.title,
        description: t.description || null,
        resource_link: t.resource_link || null,
        is_optional: t.is_optional ?? false,
        order_index: t.order_index ?? tIdx + 1,
      }))
    }).filter((t) => t.stage_id)

    if (tasks.length) {
      const { error: taskError } = await supabaseAdmin.from('roadmap_tasks').insert(tasks)
      if (taskError) throw new Error(taskError.message)
    }
  }

  return { roadmapId }
}

export async function getRoadmapDeep(roadmapId: string) {
  const { data, error } = await supabaseAdmin
    .from('roadmaps')
    .select('*, roadmap_stages(*, roadmap_tasks(*))')
    .eq('id', roadmapId)
    .single()

  if (error) throw new Error(error.message)
  return data
}
