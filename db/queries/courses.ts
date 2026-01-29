import supabaseAdmin from '../supabaseAdmin'

export interface GeneratedModule {
  id?: number | string
  title: string
  duration?: string
  description?: string
  topics?: string[]
  activities?: string[]
  project?: string
  assessment?: string
}

export interface GeneratedCourse {
  title: string
  description?: string
  duration?: string
  difficulty?: string
  objectives?: string[]
  modules?: GeneratedModule[]
  resources?: { type?: string; title?: string; description?: string; url?: string }[]
  finalProject?: { title?: string; description?: string }
}

export async function saveGeneratedCourse(course: GeneratedCourse, userId?: string) {
  try {
    const { data: courseRow, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert([
        {
          user_id: userId || null,
          title: course.title,
          description: course.description || null,
          difficulty: course.difficulty || null,
          duration: course.duration || null,
          total_modules: course.modules?.length || 0,
          ai_generated_content: course,
        },
      ])
      .select('id')
      .single()

    if (courseError || !courseRow) {
      console.error('Course insert error:', courseError)
      throw new Error(courseError?.message || 'Failed to save course')
    }

    const courseId = courseRow.id as string

    const sections = (course.modules || []).map((mod, idx) => ({
      course_id: courseId,
      title: mod.title,
      order_index: idx + 1,
    }))

    if (sections.length) {
      const { error: sectionError } = await supabaseAdmin.from('course_sections').insert(sections)
      if (sectionError) throw new Error(sectionError.message)
    }

    // Optional: create one lesson per module to keep hierarchy intact
    if (course.modules && course.modules.length) {
      const lessons = course.modules.flatMap((mod, idx) => ({
        section_id: undefined as string | undefined, // will be updated after fetching sections
        title: mod.title,
        content: mod.description || null,
        order_index: 1,
      }))

      // Fetch inserted sections to wire lessons
      const { data: insertedSections, error: fetchSectionsError } = await supabaseAdmin
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

      if (fetchSectionsError) throw new Error(fetchSectionsError.message)

      const lessonsReady = lessons.map((lesson, idx) => ({
        ...lesson,
        section_id: insertedSections?.[idx]?.id,
      })).filter((l) => l.section_id)

      if (lessonsReady.length) {
        const { error: lessonError } = await supabaseAdmin.from('course_lessons').insert(lessonsReady)
        if (lessonError) throw new Error(lessonError.message)
      }
    }

    return { courseId }
  } catch (error) {
    console.error('Save course error:', error)
    throw error
  }
}

export async function getCourseWithContent(courseId: string) {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select(
      `*,
       course_sections(*, course_lessons(*, lesson_materials(*)))`
    )
    .eq('id', courseId)
    .single()

  if (error) throw new Error(error.message)
  return data
}
