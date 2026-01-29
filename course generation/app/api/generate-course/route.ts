import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, answers } = body

    console.log('=== COURSE GENERATION REQUEST ===')
    console.log('Topic:', topic)
    console.log('Answers received:', answers)

    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      console.error('OpenRouter API key is not configured')
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Extract user answers
    const userName = answers[1] || 'Student'
    const goal = answers[2] || 'general learning'
    const experience = answers[3] || 'beginner'
    const timeCommitment = answers[4] || '1-2 hours'
    const learningStyle = answers[5] || 'mixed'
    const timeline = answers[6] || '1 month'
    const interests = Array.isArray(answers[7]) ? answers[7].join(', ') : 'general topics'
    const preference = answers[8] || 'mix of both'
    const progressTracking = answers[9] || 'weekly'
    const specificFocus = answers[10] || 'comprehensive coverage'

    console.log('Extracted answers:', { userName, goal, experience, timeline, interests })

    // Build AI prompt
    const prompt = `You are an expert course curriculum designer. Create a highly personalized and complete course.

USER PROFILE:
- Name: ${userName}
- Goal: ${goal}
- Experience: ${experience}
- Daily Time: ${timeCommitment}
- Learning Style: ${learningStyle}
- Timeline: ${timeline}
- Interests: ${interests}
- Topic: ${topic}

CREATE A COMPLETE COURSE with realistic modules. Scale modules: 4 for 1 week, 6 for 2 weeks, 8 for 1 month, 12 for 3 months.

Respond with ONLY valid JSON (no markdown):
{
  "title": "Personalized ${topic} Course for ${userName}",
  "description": "A complete course helping ${userName} achieve: ${goal}",
  "duration": "${timeline}",
  "difficulty": "${experience}",
  "totalModules": 0,
  "objectives": ["Master ${topic}", "Achieve ${goal}", "Build skills in ${interests}"],
  "modules": [
    {
      "id": 1,
      "title": "Module Title",
      "duration": "1 week",
      "description": "Description",
      "topics": ["topic1"],
      "activities": ["activity1"],
      "project": "project name",
      "youtubeSearch": "search query"
    }
  ],
  "resources": [{"type": "docs", "title": "Title", "url": "https://example.com"}],
  "finalProject": {"title": "Final Project", "description": "Description"}
}`

    console.log('Sending to OpenRouter...')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Unfold',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: AbortSignal.timeout(180000),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Course generation failed', details: error },
        { status: 400 }
      )
    }

    const data = await response.json()
    let courseContent = data.choices?.[0]?.message?.content || ''

    // Parse JSON
    let course
    try {
      courseContent = courseContent.trim()
      if (courseContent.startsWith('```')) {
        courseContent = courseContent.replace(/```json\n?/, '').replace(/```\n?$/, '')
      }
      course = JSON.parse(courseContent.trim())
    } catch (e) {
      console.error('Parse error:', e)
      course = {
        title: `${topic} Course for ${userName}`,
        description: courseContent,
        duration: timeline,
        difficulty: experience,
        totalModules: 5,
        objectives: [goal],
        modules: [{
          id: 1,
          title: 'Course Module',
          duration: '1 week',
          description: courseContent,
          topics: interests.split(',').map(i => i.trim()),
          activities: ['Study', 'Practice'],
          project: 'Final Project',
        }],
        resources: [],
        finalProject: { title: 'Capstone', description: 'Final project' },
      }
    }

    console.log('=== SUCCESS ===')
    return NextResponse.json({
      success: true,
      course,
      topic,
      userName,
    })
  } catch (error) {
    console.error('ERROR:', error)
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
