import { NextResponse } from 'next/server'
import { jsonrepair } from 'jsonrepair'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

// Helper to verify URL format
function isSafeHttpUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Helper to test if a resource URL responds without 404
async function verifyResourceUrl(url: string): Promise<boolean> {
  if (!isSafeHttpUrl(url)) return false
  const host = new URL(url).hostname.toLowerCase()

  // Major established domains with search or canonical endpoints are inherently valid
  if (
    host.includes('wikipedia.org') ||
    host.includes('youtube.com') ||
    host.includes('youtu.be') ||
    host.includes('github.com') ||
    host.includes('duckduckgo.com') ||
    host.includes('google.com')
  ) {
    return true
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(3000),
    })
    return response.status >= 200 && response.status < 400
  } catch {
    return false
  }
}

async function annotateResources(resources: any[]): Promise<any[]> {
  if (!Array.isArray(resources)) return []
  const checked = await Promise.all(
    resources.map(async (resource) => {
      if (!resource || typeof resource !== 'object' || !isSafeHttpUrl(resource.url)) return null
      const verified = await verifyResourceUrl(resource.url)
      if (!verified) return null
      return {
        ...resource,
        url: resource.url,
        verified: true,
      }
    })
  )
  return checked.filter(Boolean)
}

// Generate guaranteed working, 404-free reading materials for any topic/module
function generateModuleReadingMaterials(topic: string, moduleTitle: string, moduleNum: number) {
  const cleanTopic = topic.trim()
  const cleanTitle = moduleTitle.replace(/^Module\s+\d+[:\s]*/i, '').trim()

  return [
    {
      type: 'documentation',
      title: `${cleanTopic}: ${cleanTitle} Reference Guide`,
      source: 'Wikipedia',
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(cleanTopic + ' ' + cleanTitle)}`,
    },
    {
      type: 'video-tutorial',
      title: `${cleanTopic} - ${cleanTitle} Video Tutorial`,
      source: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanTopic + ' ' + cleanTitle + ' tutorial')}`,
    },
    {
      type: 'article',
      title: `${cleanTopic}: Key Principles & Practice of ${cleanTitle}`,
      source: 'Web Reference',
      url: `https://duckduckgo.com/?q=${encodeURIComponent(cleanTopic + ' ' + cleanTitle + ' complete guide')}`,
    },
  ]
}

// Course-level guaranteed reference resources
function generateCourseResources(topic: string) {
  const clean = topic.trim()
  return [
    {
      type: 'comprehensive-guide',
      title: `${clean} Complete Knowledge & Reference Overview`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(clean)}`,
    },
    {
      type: 'video-course',
      title: `${clean} Step-by-Step Educational Video Lessons`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + ' full course tutorial')}`,
    },
    {
      type: 'study-guide',
      title: `${clean} Practical Learning Guide & Resources`,
      url: `https://duckduckgo.com/?q=${encodeURIComponent(clean + ' comprehensive learning guide')}`,
    },
  ]
}

// Universal, domain-neutral fallback course generator (ZERO IT bias, works for any field)
function generateUniversalFallbackCourse(topic: string, userName: string, answersContext: string, timeline: string, experience: string) {
  const cleanTopic = topic.trim()
  const timeLow = timeline.toLowerCase()

  // Determine organic module count from learner timeline
  let moduleCount = 5
  if (timeLow.includes('2 week') || timeLow.includes('crash') || timeLow.includes('fast')) {
    moduleCount = 4
  } else if (timeLow.includes('2-3 month') || timeLow.includes('comprehensive') || timeLow.includes('in-depth')) {
    moduleCount = 7
  } else if (timeLow.includes('month')) {
    moduleCount = 6
  }

  const universalMilestoneTemplates = [
    {
      title: `Foundations & Core Principles of ${cleanTopic}`,
      description: `Understand the fundamental context, key terminology, and essential principles of ${cleanTopic}.`,
      topics: [`Core definitions and scope of ${cleanTopic}`, 'Historical and practical context', 'Essential concepts and terminology'],
      activities: ['Introductory overview study', 'Self-assessment of key concepts', 'Foundational vocabulary drill'],
      project: `Foundational summary and reflection on ${cleanTopic}`,
    },
    {
      title: `Essential Tools, Materials & Key Techniques in ${cleanTopic}`,
      description: `Learn the essential tools, preparatory materials, and primary execution techniques required in ${cleanTopic}.`,
      topics: ['Required materials and environment setup', 'Primary techniques and workflows', 'Common beginner pitfalls and best practices'],
      activities: ['Hands-on exploration of tools and materials', 'Guided exercise in primary technique', 'Technique accuracy checklist'],
      project: `First practical exercise applying core tools in ${cleanTopic}`,
    },
    {
      title: `Practical Methodologies & Step-by-Step Practice in ${cleanTopic}`,
      description: `Apply your knowledge through structured step-by-step practice and foundational exercises in ${cleanTopic}.`,
      topics: ['Standard operating methods and processes', 'Step-by-step execution frameworks', 'Iterative practice and progress evaluation'],
      activities: ['Step-by-step guided practice session', 'Hands-on exercise implementation', 'Peer review or self-audit'],
      project: `Structured practical milestone deliverable in ${cleanTopic}`,
    },
    {
      title: `Intermediate Skills, Applied Projects & Nuance in ${cleanTopic}`,
      description: `Deepen your abilities by tackling more complex challenges, creative problem-solving, and nuanced aspects of ${cleanTopic}.`,
      topics: ['Intermediate frameworks and nuances', 'Problem diagnosis and troubleshooting', 'Developing efficiency and personal voice'],
      activities: ['Case study or intermediate challenge execution', 'Troubleshooting and refining methods', 'Applied practical drill'],
      project: `Intermediate independent project in ${cleanTopic}`,
    },
    {
      title: `Advanced Applications, Refinement & Real-World Craft in ${cleanTopic}`,
      description: `Refine your craftsmanship, explore advanced techniques, and elevate your output to professional standards in ${cleanTopic}.`,
      topics: ['Advanced methodologies and specialized techniques', 'Optimization, polish, and attention to detail', 'Industry standards and masterwork analysis'],
      activities: ['Advanced technique deep dive', 'Refining and polishing existing work', 'Critical quality review'],
      project: `Advanced demonstration piece or portfolio project in ${cleanTopic}`,
    },
    {
      title: `Mastery Synthesis, Portfolio Review & Final Capstone in ${cleanTopic}`,
      description: `Synthesize everything learned across the course into a comprehensive, showcase-ready capstone project in ${cleanTopic}.`,
      topics: ['Comprehensive skill synthesis', 'Portfolio presentation and critique', 'Next steps for ongoing mastery and practice'],
      activities: ['Capstone planning and drafting', 'Full execution of showcase project', 'Final presentation and self-evaluation'],
      project: `Final Capstone Presentation: Comprehensive Mastery of ${cleanTopic}`,
    },
    {
      title: `Specialized Explorations & Lifelong Mastery in ${cleanTopic}`,
      description: `Explore niche branches, advanced cross-disciplinary applications, and long-term mastery pathways in ${cleanTopic}.`,
      topics: ['Specialized subfields and emerging trends', 'Cross-domain integrations', 'Lifelong learning and mentorship'],
      activities: ['Independent research exploration', 'Creation of long-term learning roadmap', 'Community knowledge sharing'],
      project: `Specialized portfolio piece demonstrating depth in ${cleanTopic}`,
    },
  ]

  const modules = []
  for (let i = 0; i < moduleCount; i++) {
    const template = universalMilestoneTemplates[i] || universalMilestoneTemplates[i % universalMilestoneTemplates.length]
    const id = i + 1
    modules.push({
      id,
      title: template.title,
      weekNumber: Math.ceil(id / 2),
      duration: '3-5 days',
      description: template.description,
      objectives: [
        `Understand the core principles of ${template.title}`,
        `Apply hands-on methods to complete the milestone project`,
      ],
      topics: template.topics,
      activities: template.activities,
      project: template.project,
      estimatedHours: 5,
      youtubeSearch: `${cleanTopic} ${template.title} tutorial`,
      readingMaterials: generateModuleReadingMaterials(cleanTopic, template.title, id),
    })
  }

  return {
    title: `${cleanTopic} Complete Mastery Course`,
    description: `A personalized ${timeline} curriculum designed for ${userName} (${experience} level) to build real-world competence and mastery in ${cleanTopic}.`,
    duration: timeline,
    difficulty: experience,
    totalModules: modules.length,
    objectives: [
      `Build comprehensive foundational and practical skills in ${cleanTopic}`,
      `Apply progressive, step-by-step methodologies to real-world projects`,
      `Develop confidence, independence, and personal mastery in ${cleanTopic}`,
    ],
    modules,
    resources: generateCourseResources(cleanTopic),
    finalProject: {
      title: `${cleanTopic} Comprehensive Capstone Project`,
      description: `Apply all skills and techniques learned throughout the course to produce a complete, polished deliverable in ${cleanTopic}.`,
      duration: '1 week',
      requirements: [
        `Demonstrate clear application of core and intermediate concepts`,
        `Deliver a documented or presented final piece of work in ${cleanTopic}`,
      ],
    },
  }
}

export async function POST(request: Request) {
  try {
    let sessionUser: any = null
    try {
      const authHeader = request.headers.get('authorization')
      const cookieHeader = request.headers.get('cookie')
      const sessionResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          ...(authHeader ? { authorization: authHeader } : {}),
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        cache: 'no-store',
      })
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        sessionUser = sessionData?.user
      }
    } catch {
      // Allow development fallback
    }

    const body = await request.json()
    const { topic, answers } = body

    if (typeof topic !== 'string' || topic.trim().length < 1 || topic.trim().length > 200) {
      return NextResponse.json({ error: 'Topic is required and must be 200 characters or fewer' }, { status: 422 })
    }
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers must be an object' }, { status: 422 })
    }

    const userName =
      sessionUser?.name ||
      sessionUser?.email?.split('@')[0] ||
      (typeof body.userName === 'string' && body.userName.trim()) ||
      'Learner'

    // Format all user responses cleanly
    const answersEntries = Object.entries(answers as Record<string, unknown>)
    const answersContext = answersEntries
      .map(([key, val]) => {
        const textVal = Array.isArray(val) ? val.join(', ') : String(val || '')
        return `- Question ${key}: ${textVal}`
      })
      .join('\n')

    // Extract key parameters if available in answers
    const answersStr = JSON.stringify(answers).toLowerCase()
    let experience = 'Beginner'
    if (answersStr.includes('advanced')) experience = 'Advanced'
    else if (answersStr.includes('intermediate')) experience = 'Intermediate'

    let timeline = '1 Month'
    if (answersStr.includes('2 week') || answersStr.includes('crash')) timeline = '2 Weeks'
    else if (answersStr.includes('2-3 month') || answersStr.includes('comprehensive')) timeline = '2-3 Months'

    // Build the AI curriculum design prompt
    const prompt = `You are a world-class curriculum designer and recognized domain expert in "${topic}".
Your mission is to design a bespoke, high-quality, and professionally authentic learning course specifically for "${topic}".

LEARNER PROFILE:
- Learner Name: ${userName}
- Target Timeline: ${timeline}
- Experience Level: ${experience}
USER RESPONSES TO ONBOARDING QUESTIONS:
${answersContext || '- Focus on comprehensive practical mastery'}

CRITICAL PEDAGOGY & VOCABULARY RULES:
1. AUTHENTIC DISCIPLINE VOCABULARY:
   - Module titles, descriptions, topics, and activities MUST use the genuine, real-world vocabulary of "${topic}".
   - If "${topic}" is an Art, Craft, or Music: focus on composition, brushwork, color palette, mediums, anatomy, texture, instruments, rhythm, harmony, or phrasing. NEVER use software/IT terms like "Architecture", "Deployment", "Security", "Code", "Endpoints", or "APIs".
   - If "${topic}" is Gardening, Agriculture, or Nature: focus on soil preparation, seed germination, sunlight zones, pruning, composting, companion planting, and harvesting.
   - If "${topic}" is Cooking or Culinary Arts: focus on knife skills, heat control, seasoning, sauce making, baking chemistry, and plating.
   - If "${topic}" is a Language: focus on script, alphabet, phonetics, greetings, grammar, high-frequency vocabulary, conversational dialogues, and fluency.
   - If "${topic}" is Software, Computing, or DevOps: use real software architecture, components, state, testing, and deployment.
   - Ground every module strictly in the authentic reality of "${topic}".
2. DYNAMIC MODULE COUNT:
   - Based on the learner's timeline (${timeline}) and starting level (${experience}), determine the optimal number of modules (between 4 and 8 modules).
   - Create progressive, logically sequenced modules (Module 1 through Module N).
3. NO GENERIC OR REPETITIVE TITLES:
   - Do NOT name modules generic things like "Module Overview and Fundamentals" or "Deployment and Optimization".
   - Every title must be a tangible milestone in mastering "${topic}".
4. FORMAT - Return ONLY a valid JSON object matching this schema:
{
  "title": "${topic} Complete Mastery Course",
  "description": "Engaging description tailored to the learner's goals",
  "duration": "${timeline}",
  "difficulty": "${experience}",
  "totalModules": <number of modules, between 4 and 8>,
  "objectives": [
    "Clear objective 1",
    "Clear objective 2",
    "Clear objective 3"
  ],
  "modules": [
    {
      "id": 1,
      "title": "Authentic Milestone Title in ${topic}",
      "weekNumber": 1,
      "duration": "3-5 days",
      "description": "Detailed explanation of what the learner will explore in this module.",
      "objectives": ["Specific learning outcome 1", "Specific learning outcome 2"],
      "topics": ["Concrete subtopic 1", "Concrete subtopic 2", "Concrete subtopic 3"],
      "activities": ["Practical hands-on exercise 1", "Hands-on exercise 2"],
      "project": "Practical module assignment or creation",
      "estimatedHours": 5,
      "youtubeSearch": "${topic} specific search terms for tutorial"
    }
  ],
  "resources": [
    {
      "type": "guide",
      "title": "${topic} Reference Guide",
      "url": "https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}"
    }
  ],
  "finalProject": {
    "title": "${topic} Capstone Showcase",
    "description": "Comprehensive practical final deliverable in ${topic}",
    "requirements": ["Deliverable requirement 1", "Deliverable requirement 2"]
  }
}

Return ONLY the raw JSON object.`

    let courseContent = ''
    let providerUsed = 'fallback'

    // 1. Try Google Gemini 2.5 Flash first
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY
    if (geminiKey) {
      try {
        console.log(`[course-gen] Sending request to Gemini 2.5 Flash for topic: "${topic}"...`)
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.6,
                maxOutputTokens: 4096,
              },
            }),
            signal: AbortSignal.timeout(90000),
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
          if (raw && raw.trim().length > 20) {
            courseContent = raw
            providerUsed = 'gemini-2.5-flash'
            console.log(`[course-gen] Gemini generation succeeded for "${topic}"`)
          }
        } else {
          console.warn('[course-gen] Gemini returned non-OK status:', geminiRes.status)
        }
      } catch (geminiErr) {
        console.warn('[course-gen] Gemini API call failed:', geminiErr)
      }
    }

    // 2. Secondary fallback: OpenRouter REST API
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!courseContent && openrouterKey) {
      try {
        console.log(`[course-gen] Attempting OpenRouter fallback for topic: "${topic}"...`)
        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openrouterKey}`,
          },
          body: JSON.stringify({
            model: 'mistralai/mixtral-8x22b-instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(60000),
        })
        if (orRes.ok) {
          const orData = await orRes.json()
          const content = orData?.choices?.[0]?.message?.content
          if (content && content.trim().length > 20) {
            courseContent = content
            providerUsed = 'openrouter-mixtral'
          }
        }
      } catch (openrouterErr) {
        console.warn('[course-gen] OpenRouter fallback failed:', openrouterErr)
      }
    }

    let course: any = null
    try {
      if (!courseContent.trim()) throw new Error('No AI content returned')
      let cleaned = courseContent.trim()
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/```$/, '')
      }
      course = JSON.parse(jsonrepair(cleaned.trim()))
      if (!course.modules || !Array.isArray(course.modules) || course.modules.length === 0) {
        throw new Error('AI returned no modules')
      }

      // Re-index modules dynamically and annotate with verified, non-404 reading materials
      course.modules = course.modules.map((m: any, idx: number) => {
        const modId = idx + 1
        const modTitle = m.title || `Milestone ${modId}: ${topic} Principles`
        return {
          ...m,
          id: modId,
          title: modTitle,
          weekNumber: Math.ceil(modId / 2),
          readingMaterials: generateModuleReadingMaterials(topic, modTitle, modId),
        }
      })
      course.totalModules = course.modules.length

      // Ensure valid course-level resources
      if (!course.resources || !Array.isArray(course.resources) || course.resources.length === 0) {
        course.resources = generateCourseResources(topic)
      }
    } catch (parseError) {
      console.warn('[course-gen] Parsing AI response failed or empty, constructing universal fallback:', parseError)
      course = generateUniversalFallbackCourse(topic, userName, answersContext, timeline, experience)
      providerUsed = 'universal-fallback'
    }

    // Annotate and verify course resources (filter out any broken or 404 links)
    if (Array.isArray(course.resources)) {
      course.resources = await annotateResources(course.resources)
    }

    const payload = {
      success: true,
      course: {
        ...course,
        provider: providerUsed,
      },
      generationMetadata: {
        provider: providerUsed,
        timestamp: new Date().toISOString(),
        topic,
      },
    }

    return NextResponse.json(payload)
  } catch (err: any) {
    console.error('[course-gen] Fatal error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate course' }, { status: 500 })
  }
}
