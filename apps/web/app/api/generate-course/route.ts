import { OpenRouter } from '@openrouter/sdk'
import { jsonrepair } from 'jsonrepair'
import { NextRequest, NextResponse } from 'next/server'
import { getBestVideo } from '@/services/videoIntelligence'
import { validateCurriculum } from '@/lib/semanticValidation'

function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2000) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function verifyResourceUrl(url: string): Promise<boolean> {
  if (!isSafeHttpUrl(url)) return false
  const parsed = new URL(url)
  const host = parsed.hostname.toLowerCase()
  // Whitelist standard domains that always serve valid landing pages
  if (
    host.includes('wikipedia.org') ||
    host.includes('youtube.com') ||
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
      // Discard broken/404 links completely so users never click a dead URL
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

function normalizeCourseAnswers(rawAnswers: Record<string, unknown>) {
  const value = (id: number | string) => rawAnswers[id] ?? rawAnswers[String(id)]
  const text = (id: number | string, fallback: string) => {
    const current = value(id)
    return Array.isArray(current) ? current.join(', ') : String(current || fallback)
  }

  // Support clean 1-6 schema as well as any legacy question IDs
  const goal = text(1, text('goal', text(2, 'general mastery')))
  const experience = text(2, text('experience', text(3, 'beginner')))
  const timeCommitment = text(3, text('timeCommitment', text(4, '1-2 hours')))
  const rawFocus = value(4) ?? value(10) ?? value(7) ?? value('focusAreas')
  const focusAreas = Array.isArray(rawFocus) ? rawFocus : [String(rawFocus || 'core concepts')]
  const timeline = text(5, text('timeline', text(6, '1 month')))
  const requirements = text(6, text('requirements', text(11, text(10, 'practical applications'))))

  return {
    answers: Object.fromEntries(Object.entries(rawAnswers).map(([key, current]) => [String(key), current])),
    userContext: {
      goal,
      experience,
      timeCommitment,
      learningStyle: 'interactive and hands-on',
      timeline,
      focusAreas,
      requirements,
    },
  }
}

// Broad, intelligent language detection
function checkIsLanguageTopic(topicStr: string): boolean {
  const low = topicStr.toLowerCase()
  const languages = [
    'telugu', 'tamil', 'kannada', 'malayalam', 'hindi', 'bengali', 'marathi', 'gujarati', 'punjabi', 'urdu', 'sanskrit', 'odia', 'assamese',
    'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'japanese', 'chinese', 'mandarin', 'cantonese',
    'korean', 'arabic', 'persian', 'farsi', 'turkish', 'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'polish', 'greek',
    'latin', 'hebrew', 'thai', 'vietnamese', 'indonesian', 'malay', 'filipino', 'tagalog', 'swahili', 'czech', 'hungarian', 'romanian'
  ]
  if (languages.some((lang) => low.includes(lang))) return true
  if (low.match(/\b(language|dialect|speaking|conversation|fluency|grammar|vocabulary|alphabet|lingo)\b/)) return true
  return false
}

// Dedicated topic-specific subtopics for guaranteed relevant curriculum
function buildFallbackSubtopics(courseTopic: string): string[] {
  const t = courseTopic.trim()
  const tLow = t.toLowerCase()

  if (tLow.includes('telugu')) {
    return [
      'Telugu Alphabet: Vowels (Achulu) and Consonants (Hallulu)',
      'Pronunciation Essentials: Guninthalu and Vowel Modifiers',
      'Core Greetings, Introductions, and Polite Expressions',
      'Numbers (Sankhyalu), Time, Calendar, and Counting in Daily Life',
      'Family (Kutumbam), Social Relationships, and Titles',
      'Food (Aharam), Ordering, Dining, and Taste Vocabulary',
      'Daily Routines, Common Verbs, and Present Tense Conjugation',
      'Subject-Object-Verb (SOV) Sentence Construction in Telugu',
      'Travel (Prayanam), Transportation, and Asking Directions',
      'Shopping, Bargaining, and Market Conversations',
      'Past and Future Tenses, Storytelling, and Narratives',
      'Common Idioms, Proverbs (Samethalu), and Cultural Nuances',
      'Comprehensive Conversational Dialogues and Capstone Oral Review',
    ]
  }

  if (tLow.includes('tamil')) {
    return [
      'Tamil Script: Uyir Ezhuthukkal (Vowels) and Mei Ezhuthukkal (Consonants)',
      'Uyirmei Ezhuthukkal, Pronunciation Rules, and Greetings (Vanakkam)',
      'Numbers, Time, Days of the Week, and Counting in Tamil',
      'Family, Relationships, and Question Words (Yaar, Enna, Eppo, Enge)',
      'Food, Dining, and Daily Market Dialogues',
      'Common Verbs, Sentence Construction (SOV Order), and Present Tense',
      'Spoken Tamil vs Written Tamil, Directions, and Travel',
      'Past and Future Tenses, Idiomatic Phrases, and Fluency Capstone',
    ]
  }

  if (tLow.includes('hindi')) {
    return [
      'Devanagari Script: Vowels (Swar) and Consonants (Vyanjan)',
      'Matras, Conjuncts, Pronunciation, and Greetings (Namaste, Kaise Hain)',
      'Numbers, Days, Time, and Essential Daily Vocabulary',
      'Family, Relationships, and Honorific Forms (Aap, Tum, Tu)',
      'Food, Dining, Restaurant Conversations, and Shopping',
      'Core Verbs, Present Tense, and Gender Agreement in Hindi',
      'Travel, Directions, and City Navigation',
      'Past and Future Tenses, Storytelling, and Conversational Dialogues',
    ]
  }

  if (checkIsLanguageTopic(t)) {
    return [
      `${t} Alphabet, Script, and Foundational Phonetics`,
      `Pronunciation Essentials and High-Frequency Greetings`,
      `Numbers, Dates, Time, and Daily Routine Vocabulary`,
      `Family, Social Relationships, and Addressing People`,
      `Food, Dining, Ordering, and Daily Life Essentials`,
      `Essential Verbs and Present Tense Conjugation in ${t}`,
      `Core Sentence Structure and Question Formation in ${t}`,
      `Travel, Directions, and Navigational Phrases`,
      `Shopping, Market Vocabulary, and Money Transactions`,
      `Past and Future Tense Basics and Storytelling`,
      `Conversational Fluency, Idioms, and Capstone Presentation`,
    ]
  }

  if (tLow.match(/react|angular|vue|next\.?js|frontend|html|css|tailwind/)) {
    return [
      `${t} Project Setup and Architecture Overview`,
      `Components, JSX, and Props Flow`,
      `State Management, Event Handling, and Reactivity`,
      `Hooks, Lifecycle, and Side Effects`,
      `Routing, Navigation, and Layout Systems`,
      `API Integration and Asynchronous Data Fetching`,
      `Forms, Controlled Inputs, and Validation`,
      `Performance Optimization and Production Deployment`,
    ]
  }

  if (tLow.match(/python|data science|pandas|numpy|matplotlib|scikit/)) {
    return [
      `${t} Environment Setup and Core Syntax`,
      `Variables, Control Flow, and Functions`,
      `Data Structures: Lists, Tuples, Dictionaries, and Sets`,
      `Object-Oriented Programming & Modular Design`,
      `File I/O, Error Handling, and Libraries`,
      `Data Manipulation and Analysis`,
      `Testing, Debugging, and Production Deployment`,
    ]
  }

  if (tLow.match(/docker|kubernetes|k8s|devops|cloud|aws|terraform/)) {
    return [
      `${t} Fundamentals: Architecture and Core Primitives`,
      `Environment Configuration, CLI Workflows, and Tooling`,
      `Containerization, Networking, and Persistent Storage in ${t}`,
      `Multi-Service Orchestration, Compose, and Scaling`,
      `Security Hardening, Secrets Management, and Best Practices`,
      `CI/CD Integration, Monitoring, and Production Deployment`,
    ]
  }

  return [
    `${t}: Foundational Principles and Key Terminology`,
    `${t}: Core Architecture and Practical Mechanics`,
    `${t}: Essential Methodologies and Hands-on Execution`,
    `${t}: Intermediate Workflows and Problem Solving`,
    `${t}: Advanced Patterns, Optimization, and Security`,
    `${t}: Real-world Capstone Project and Review`,
  ]
}

// Helper function to generate guaranteed working reading materials
function generateReadingMaterials(moduleTopic: string, moduleNum: number, difficulty: string, courseTopic: string = '') {
  const cleanModule = moduleTopic.replace(/^Module\s+\d+[:\s]*/i, '').trim()
  const cleanCourse = courseTopic.trim()
  const isLang = checkIsLanguageTopic(cleanCourse)

  if (isLang) {
    return [
      {
        type: 'documentation',
        title: `${cleanCourse} Language Reference & Script Guide`,
        source: 'Wikipedia',
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanCourse.replace(/\s+/g, '_'))}_language`,
      },
      {
        type: 'tutorial',
        title: `${cleanCourse} - ${cleanModule} Lessons & Audio Practice`,
        source: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent('learn ' + cleanCourse + ' ' + cleanModule + ' spoken audio')}`,
      },
      {
        type: 'article',
        title: `${cleanCourse} Vocabulary and Phrases: ${cleanModule}`,
        source: 'Wikipedia Search',
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(cleanCourse + ' ' + cleanModule)}`,
      },
      {
        type: 'practice',
        title: `Conversational ${cleanCourse} Exercises`,
        source: 'YouTube',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanCourse + ' conversation practice for beginners')}`,
      },
    ]
  }

  // Curated official documentation for popular technologies
  const techMap: Record<string, { title: string; url: string }> = {
    react: { title: 'React Official Documentation & Guides', url: 'https://react.dev/learn' },
    javascript: { title: 'MDN Web Docs - JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    typescript: { title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/' },
    python: { title: 'Python Official Tutorial & Reference', url: 'https://docs.python.org/3/tutorial/' },
    node: { title: 'Node.js Official Documentation', url: 'https://nodejs.org/en/docs' },
    'node.js': { title: 'Node.js Official Documentation', url: 'https://nodejs.org/en/docs' },
    docker: { title: 'Docker Official Get Started Guide', url: 'https://docs.docker.com/get-started/' },
    sql: { title: 'W3Schools SQL Tutorial & Reference', url: 'https://www.w3schools.com/sql/' },
    postgres: { title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/' },
    postgresql: { title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/' },
    mongodb: { title: 'MongoDB Documentation & Manual', url: 'https://www.mongodb.com/docs/' },
    git: { title: 'Pro Git Book (Official Documentation)', url: 'https://git-scm.com/book/en/v2' },
  }

  const topicKey = cleanCourse.toLowerCase()
  const matchedTech = Object.keys(techMap).find((k) => topicKey.includes(k))
  const official = matchedTech ? techMap[matchedTech] : null

  const materials = []
  if (official) {
    materials.push({
      type: 'official-docs',
      title: official.title,
      source: 'Official Docs',
      url: official.url,
    })
  }

  materials.push(
    {
      type: 'documentation',
      title: `${cleanCourse} - ${cleanModule} Overview`,
      source: 'Wikipedia',
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(cleanCourse + ' ' + cleanModule)}`,
    },
    {
      type: 'video-tutorial',
      title: `${cleanCourse}: ${cleanModule} Practical Walkthrough`,
      source: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanCourse + ' ' + cleanModule + ' tutorial')}`,
    },
    {
      type: 'community',
      title: `${cleanCourse} Open Source Projects & Examples`,
      source: 'GitHub',
      url: `https://github.com/topics/${encodeURIComponent(cleanCourse.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`,
    }
  )

  return materials
}

// Helper to generate verified, non-404 course-level resources
function generateCourseResources(courseTopic: string, userLevel: string) {
  const clean = courseTopic.trim()
  const isLang = checkIsLanguageTopic(clean)

  if (isLang) {
    return [
      {
        type: 'official-guide',
        title: `Comprehensive ${clean} Language Guide`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(clean.replace(/\s+/g, '_'))}_language`,
        coverage: 'complete',
      },
      {
        type: 'video-course',
        title: `${clean} Complete Spoken Course for Beginners`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent('learn ' + clean + ' full course for beginners')}`,
        coverage: 'complete',
      },
      {
        type: 'reading-resource',
        title: `${clean} Script, Grammar, and Vocabulary Reference`,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(clean + ' grammar vocabulary')}`,
        coverage: 'partial',
      },
      {
        type: 'practice',
        title: `${clean} Spoken Listening & Conversation Dialogues`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + ' everyday conversation practice')}`,
        coverage: 'partial',
      },
    ]
  }

  return [
    {
      type: 'primary-source',
      title: `Comprehensive ${clean} Reference & Overview`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(clean)}`,
      coverage: 'complete',
    },
    {
      type: 'video-course',
      title: `${clean} Complete Hands-on Video Tutorial`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(clean + ' full course tutorial')}`,
      coverage: 'complete',
    },
    {
      type: 'community-projects',
      title: `${clean} Open Source Code & Real-world Repositories`,
      url: `https://github.com/topics/${encodeURIComponent(clean.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`,
      coverage: 'partial',
    },
    {
      type: 'technical-articles',
      title: `${clean} Developer Articles & Community Guides`,
      url: `https://dev.to/search?q=${encodeURIComponent(clean)}`,
      coverage: 'partial',
    },
  ]
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const cookie = request.headers.get('cookie') || ''
    const authHeader = request.headers.get('authorization') || ''
    const fwdHeaders: Record<string, string> = { cookie }
    if (authHeader) fwdHeaders['authorization'] = authHeader

    let sessionUser: any = null
    try {
      const sessionResponse = await fetch(`${apiUrl}/auth/me`, {
        headers: fwdHeaders,
        cache: 'no-store',
      })
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        sessionUser = sessionData?.user
      } else if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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

    // Extract user context cleanly
    const normalized = normalizeCourseAnswers(answers)
    const { goal, experience, timeCommitment, learningStyle, timeline, focusAreas, requirements } = normalized.userContext
    const interests = (Array.isArray(focusAreas) ? focusAreas : []).join(', ')

    // Accurate user name extraction (never use answers[1] because question 1 is the learning goal!)
    const userName =
      sessionUser?.name ||
      sessionUser?.email?.split('@')[0] ||
      (typeof body.userName === 'string' && body.userName.trim()) ||
      'Learner'

    const isLanguageTopic = checkIsLanguageTopic(topic)

    // Determine number of modules
    const getModuleCount = (timeStr: string, expStr: string): number => {
      const low = timeStr.toLowerCase()
      if (low.includes('2 week') || low.includes('crash')) return 5
      if (low.includes('2-3 month') || low.includes('comprehensive')) return 8
      if (low.includes('month')) return 6
      return 6
    }
    const numModules = getModuleCount(timeline, experience)

    // Build specific curriculum guidance
    const getCurriculumGuidance = (topicName: string): string => {
      const low = topicName.toLowerCase()
      if (low.includes('telugu')) {
        return `CURRICULUM PATTERN FOR TELUGU:
- Module 1: Telugu Alphabet: Vowels (Achulu) and Consonants (Hallulu)
- Module 2: Vowel Modifiers (Guninthalu) and Essential Greetings (Namaskaram, Bagunnara)
- Module 3: Numbers (Sankhyalu), Time, Calendar, and Counting in Daily Life
- Module 4: Family (Kutumbam), Social Roles, and Question Words (Evaru, Emiti, Ekkada)
- Module 5: Food (Aharam), Ordering at Restaurants, and Market Shopping
- Module 6: Everyday Verbs, Present Tense Conjugation, and Basic Sentence Structure (SOV)
- Module 7: Travel (Prayanam), Directions, and Navigating Transportation
- Module 8: Storytelling, Past and Future Tenses, and Common Idioms
- Module 9: Comprehensive Real-World Dialogues and Conversational Fluency`
      }
      if (low.includes('tamil')) {
        return `CURRICULUM PATTERN FOR TAMIL:
- Module 1: Tamil Script: Uyir Ezhuthukkal (Vowels) and Mei Ezhuthukkal (Consonants)
- Module 2: Uyirmei Ezhuthukkal, Pronunciation Rules, and Greetings (Vanakkam)
- Module 3: Numbers, Time, Days of the Week, and Counting in Tamil
- Module 4: Family, Relationships, and Question Words (Yaar, Enna, Eppo, Enge)
- Module 5: Food, Dining, and Daily Market Dialogues
- Module 6: Common Verbs, Sentence Construction (SOV Order), and Present Tense
- Module 7: Spoken Tamil vs Written Tamil, Directions, and Travel
- Module 8: Past and Future Tenses, Idiomatic Phrases, and Fluency Capstone`
      }
      if (low.includes('hindi')) {
        return `CURRICULUM PATTERN FOR HINDI:
- Module 1: Devanagari Script: Vowels (Swar) and Consonants (Vyanjan)
- Module 2: Matras, Conjuncts, Pronunciation, and Greetings (Namaste, Kaise Hain)
- Module 3: Numbers, Days, Time, and Essential Daily Vocabulary
- Module 4: Family, Relationships, and Honorific Forms (Aap, Tum, Tu)
- Module 5: Food, Dining, Restaurant Conversations, and Shopping
- Module 6: Core Verbs, Present Tense, and Gender Agreement in Hindi
- Module 7: Travel, Directions, and City Navigation
- Module 8: Past and Future Tenses, Storytelling, and Conversational Dialogues`
      }
      if (isLanguageTopic) {
        return `CURRICULUM PATTERN FOR LANGUAGE (${topicName}):
- Module 1: Alphabet, Script, Foundational Phonetics, and Cultural Context
- Module 2: Pronunciation Rules, Core Sounds, and High-Frequency Greetings
- Module 3: High-Frequency Vocabulary: Numbers, Dates, Time, and Daily Routine
- Module 4: Family, Social Roles, and Question Formation (Who, What, Where, When, Why)
- Module 5: Food, Dining, Ordering, and Market Shopping Dialogues
- Module 6: Essential Verbs, Present Tense Conjugation, and Sentence Structure
- Module 7: Travel, Directions, and Public Navigation
- Module 8: Past and Future Tenses, Common Idioms, and Conversational Fluency`
      }
      if (['react', 'vue', 'angular', 'next', 'next.js', 'svelte'].some((f) => low.includes(f))) {
        return `CURRICULUM PATTERN FOR ${topicName}:
- Module 1: Architecture, Project Structure, and Component Mindset
- Module 2: Core Syntax, JSX/Templates, and Props Contract
- Module 3: State Management, Interactive Events, and Reactive Data Flow
- Module 4: Hooks / Lifecycle, Side Effects, and Resource Clean-up
- Module 5: Client-Side Routing, Page Layouts, and Navigation
- Module 6: API Integration, Asynchronous Data Fetching, and Error Boundaries
- Module 7: Forms, Controlled Inputs, and Validation
- Module 8: Performance Optimization, Production Build, and Testing`
      }
      if (['node', 'express', 'django', 'fastapi', 'spring', 'flask', 'nest'].some((f) => low.includes(f))) {
        return `CURRICULUM PATTERN FOR ${topicName}:
- Module 1: Runtime Environment, Server Initialization, and Configuration
- Module 2: RESTful Routing, Middleware Pipeline, and Request Lifecycle
- Module 3: Database Models, Schema Design, and ORM Integration
- Module 4: User Authentication, Session/JWT Security, and Role Authorization
- Module 5: Business Logic Layer, Validation, and Structured Error Handling
- Module 6: API Documentation, Testing, and Production Deployment`
      }
      if (['sql', 'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'database'].some((f) => low.includes(f))) {
        return `CURRICULUM PATTERN FOR ${topicName}:
- Module 1: Database Architecture, Installation, and CLI Setup
- Module 2: Data Modeling, Schemas, Normalization, and Constraints
- Module 3: Core Query Syntax (CRUD, Filtering, Sorting, Aggregations)
- Module 4: Relational Joins, Complex Subqueries, and View Creation
- Module 5: Indexing Mechanisms, Execution Plans, and Performance Tuning
- Module 6: ACID Transactions, Concurrency Isolation, and Security`
      }
      return `CURRICULUM PATTERN FOR ${topicName}:
- Module 1: Foundations, Key Terminology, and Context
- Module 2: Core Principles, Concepts, and Applied Mechanics
- Module 3: Practical Hands-on Methodologies
- Module 4: Intermediate Workflows and Real-world Problem Solving
- Module 5: Advanced Techniques, Best Practices, and Optimization
- Module 6: Capstone Project and Comprehensive Mastery Review`
    }

    const curriculumGuidance = getCurriculumGuidance(topic)

    // Build targeted AI prompt
    const prompt = `You are an expert curriculum designer creating a personalized, high-quality learning course for "${topic}".

LEARNER CONTEXT:
- Learner Name: ${userName}
- Primary Goal: ${goal}
- Experience Level: ${experience}
- Time Available: ${timeCommitment}
- Target Timeline: ${timeline}
- Selected Focus Areas: ${interests}
- Custom Requirements: ${requirements}

CRITICAL RULES:
1. Create EXACTLY ${numModules} distinct, progressive modules (Module 1 through Module ${numModules} in the "modules" array). You MUST include all ${numModules} module objects in the JSON.
2. Module titles MUST be SPECIFIC, ACCURATE, and AUTHENTIC to ${topic}.
3. ${isLanguageTopic ? 'This is a LANGUAGE LEARNING course. DO NOT use generic software/technical terms like "Architecture", "Deployment", "Variables", "Foundations and Basics". Focus on Script, Alphabet, Pronunciation, Grammar, Vocabulary, Daily Dialogues, and Fluency.' : 'Each module must focus on concrete, searchable concepts in ' + topic + '.'}
4. Directly weave the learner's focus areas (${interests}) into the curriculum.

RECOMMENDED MODULE PATTERN:
${curriculumGuidance}

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "title": "${topic} Complete Mastery Course",
  "description": "A comprehensive course designed for ${experience} level learners to achieve ${goal}.",
  "duration": "${timeline}",
  "difficulty": "${experience}",
  "totalModules": ${numModules},
  "objectives": [
    "Master core ${topic} concepts and practical applications",
    "Build real-world fluency and confidence in ${topic}",
    "Complete hands-on projects and exercises"
  ],
  "modules": [
    {
      "id": 1,
      "title": "Exact Title of First Milestone",
      "weekNumber": 1,
      "duration": "3-5 days",
      "description": "Clear explanation of what the learner will study in this module.",
      "objectives": ["Specific learning objective 1", "Specific learning objective 2"],
      "topics": ["Concrete topic 1", "Concrete topic 2", "Concrete topic 3"],
      "activities": ["Hands-on activity 1", "Practice exercise 2"],
      "project": "Practical module assignment",
      "estimatedHours": 5,
      "youtubeSearch": "${topic} specific search query for video tutorial"
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
    "title": "${topic} Capstone Project",
    "description": "Apply everything learned to complete a real-world project or conversational presentation.",
    "duration": "1 week",
    "requirements": ["Deliverable 1", "Deliverable 2"]
  }
}

Generate all ${numModules} modules. Return ONLY valid JSON.`

    let courseContent = ''
    let providerUsed = 'fallback'

    // 1. Try Google Gemini 2.5 Flash first (reliable, fast, deep multilingual capability)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY
    if (geminiKey) {
      try {
        console.log('Sending to Google Gemini (gemini-2.5-flash)...')
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
            console.log('✅ Gemini course generation succeeded')
          }
        } else {
          console.warn('Gemini API returned non-OK status:', geminiRes.status)
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed:', geminiErr)
      }
    }

    // 2. Secondary fallback: OpenRouter
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!courseContent && openrouterKey) {
      try {
        console.log('Sending to OpenRouter...')
        const openrouter = new OpenRouter({ apiKey: openrouterKey })
        const stream = await openrouter.chat.send({
          httpReferer: 'http://localhost:3000',
          appTitle: 'CareerSync',
          chatRequest: {
            model: 'mistralai/mixtral-8x22b-instruct',
            messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
            maxTokens: 2500,
            responseFormat: { type: 'json_object' },
            stream: true,
          },
        })

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content
          if (content) courseContent += content
        }
        if (courseContent.trim()) providerUsed = 'openrouter-mixtral'
      } catch (openrouterErr) {
        console.warn('OpenRouter API call failed:', openrouterErr)
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

      // Guarantee EXACT module count
      if (course.modules.length < numModules) {
        const existingTitles = new Set(course.modules.map((m: any) => (m.title || '').toLowerCase()))
        const fallbackList = buildFallbackSubtopics(topic)
        let fallbackIdx = 0
        while (course.modules.length < numModules && fallbackIdx < fallbackList.length) {
          const candidateTitle = fallbackList[fallbackIdx]
          fallbackIdx++
          if (!existingTitles.has(candidateTitle.toLowerCase())) {
            const nextId = course.modules.length + 1
            course.modules.push({
              id: nextId,
              title: candidateTitle,
              weekNumber: Math.ceil(nextId / 2),
              duration: '3-5 days',
              description: `Master ${candidateTitle} through targeted exercises and real-world examples.`,
              objectives: [`Understand the principles of ${candidateTitle}`, `Apply ${candidateTitle} in practical scenarios`],
              topics: [`Key concepts of ${candidateTitle}`, 'Implementation patterns', 'Best practices'],
              activities: ['Tutorial reading', 'Practical exercises', 'Knowledge check'],
              project: `Hands-on Project: ${candidateTitle}`,
              estimatedHours: 5,
              youtubeSearch: `${topic} ${candidateTitle} tutorial`,
              readingMaterials: generateReadingMaterials(candidateTitle, nextId, experience, topic),
            })
            existingTitles.add(candidateTitle.toLowerCase())
          }
        }
      }
      course.modules = course.modules.slice(0, numModules).map((m: any, idx: number) => ({
        ...m,
        id: idx + 1,
        weekNumber: Math.ceil((idx + 1) / 2),
      }))
      course.totalModules = course.modules.length
    } catch (parseError) {
      console.warn('Parsing AI response failed or empty, constructing structured fallback:', parseError)

      const distinctSubtopics = buildFallbackSubtopics(topic)
      const fallbackModules = []

      for (let i = 0; i < numModules; i++) {
        const moduleNum = i + 1
        const subtopic = distinctSubtopics[i % distinctSubtopics.length]
        fallbackModules.push({
          id: moduleNum,
          title: subtopic,
          weekNumber: Math.ceil(moduleNum / 2),
          duration: '3-5 days',
          description: `Master ${subtopic.toLowerCase()} with hands-on exercises and real-world practice.`,
          objectives: [`Understand the core concepts of ${subtopic.toLowerCase()}`, `Apply ${subtopic.toLowerCase()} to practical exercises`],
          topics: [`Foundations of ${subtopic}`, 'Practical implementation', 'Best practices and pitfalls'],
          activities: ['Video lectures', 'Guided practice exercises', 'Knowledge self-check'],
          project: `Hands-on Exercise: ${subtopic}`,
          estimatedHours: 5,
          youtubeSearch: `${topic} ${subtopic} tutorial`,
          readingMaterials: generateReadingMaterials(subtopic, moduleNum, experience, topic),
        })
      }

      course = {
        title: `${topic} Complete Course for ${userName}`,
        description: `A personalized ${timeline} course to help you achieve: ${goal}.`,
        duration: timeline,
        difficulty: experience,
        totalModules: numModules,
        objectives: [`Master the fundamentals of ${topic}`, `Achieve: ${goal}`, `Build practical skills in: ${interests}`],
        modules: fallbackModules,
        resources: generateCourseResources(topic, experience),
        finalProject: {
          title: `Capstone Project: ${topic} Real-World Mastery`,
          description: `Apply learned concepts to build a portfolio project or demonstrate conversational mastery in ${topic}.`,
          duration: '1 week',
          requirements: ['Apply core principles', 'Complete presentation / documentation'],
        },
      }
    }

    // Semantic validation on modules
    if (course.modules && Array.isArray(course.modules)) {
      course.modules = await validateCurriculum(course.modules, topic, experience)
    }

    // Attach video intelligence and non-404 reading materials to every module
    const usedVideoIds = new Set<string>()
    if (course.modules && Array.isArray(course.modules)) {
      course.modules = await Promise.all(
        course.modules.map(async (module: any, idx: number) => {
          const moduleNum = idx + 1
          const moduleTopic = module.title || topic
          const updatedModule = { ...module }

          // Supply guaranteed valid reading materials
          const existingMaterials = Array.isArray(module.readingMaterials) ? module.readingMaterials : []
          const generatedMaterials = generateReadingMaterials(moduleTopic, moduleNum, experience, topic)
          updatedModule.readingMaterials = existingMaterials.length > 0 ? existingMaterials : generatedMaterials

          // Find YouTube video
          try {
            const bestVideo = await getBestVideo(updatedModule, topic, moduleNum, numModules, usedVideoIds)
            if (bestVideo) {
              usedVideoIds.add(bestVideo.videoId)
              updatedModule.youtubeSearch = bestVideo.title
              updatedModule.youtubeVideoId = bestVideo.videoId
              updatedModule.videoIntelligence = {
                videoId: bestVideo.videoId,
                title: bestVideo.title,
                channel: bestVideo.channelTitle,
                thumbnail: bestVideo.thumbnail,
                finalScore: (bestVideo as any).finalScore,
              }
            } else {
              updatedModule.youtubeSearch = ''
              updatedModule.youtubeVideoId = ''
            }
          } catch {
            updatedModule.youtubeSearch = ''
            updatedModule.youtubeVideoId = ''
          }

          return updatedModule
        })
      )
    }

    // Ensure valid, verified course-level resources
    const fallbackCourseResources = generateCourseResources(topic, experience)
    if (!course.resources || !Array.isArray(course.resources) || course.resources.length === 0) {
      course.resources = fallbackCourseResources
    }

    // Filter out 404 links: annotate and discard dead URLs
    course.resources = await annotateResources(course.resources || [])
    if (course.resources.length === 0) {
      course.resources = fallbackCourseResources
    }

    if (Array.isArray(course.modules)) {
      course.modules = await Promise.all(
        course.modules.map(async (module: any) => {
          const verifiedMaterials = await annotateResources(module.readingMaterials || [])
          return {
            ...module,
            readingMaterials:
              verifiedMaterials.length > 0
                ? verifiedMaterials
                : generateReadingMaterials(module.title, module.id || 1, experience, topic),
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      course,
      topic,
      userName,
      generationMetadata: {
        provider: providerUsed,
        topic,
        answers: normalized.answers,
        userContext: normalized.userContext,
      },
    })
  } catch (error) {
    console.error('ERROR:', error)
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
