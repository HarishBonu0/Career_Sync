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

    // Helper function to generate reading materials for a module
    const generateReadingMaterials = (moduleTopic: string, moduleNum: number, difficulty: string) => {
      const readingMaterials = [
        {
          title: `GeeksforGeeks - ${moduleTopic}`,
          source: 'GeeksforGeeks',
          url: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(moduleTopic)}`,
          difficulty: difficulty || 'beginner',
          estimatedReadTime: moduleNum <= 3 ? '20 mins' : '30 mins',
        },
        {
          title: `${moduleTopic} - Official Documentation`,
          source: 'Official Documentation',
          url: `https://docs.example.com/${moduleTopic.toLowerCase().replace(/\s+/g, '-')}`,
          difficulty: difficulty || 'intermediate',
          estimatedReadTime: '25 mins',
        },
        {
          title: `${moduleTopic} Tutorial - Medium`,
          source: 'Medium',
          url: `https://medium.com/search?q=${encodeURIComponent(moduleTopic)}`,
          difficulty: difficulty || 'beginner',
          estimatedReadTime: '15 mins',
        },
        {
          title: `${moduleTopic} Guide - Dev.to`,
          source: 'Dev.to',
          url: `https://dev.to/search?q=${encodeURIComponent(moduleTopic)}`,
          difficulty: difficulty || 'intermediate',
          estimatedReadTime: '20 mins',
        },
      ]
      return readingMaterials
    }

    // Helper function to generate real course-level resources based on user profile and topic
    const generateCourseResources = (
      courseTopic: string,
      userGoal: string,
      experience: string,
      timeline: string,
      learningStyle: string
    ) => {
      // Comprehensive mapping of topics to real, complete learning resources
      // Each resource is a full course, playlist, or documentation - NOT just search results
      const topicResourceMap: {
        [key: string]: {
          beginner: Array<{ type: string; title: string; url: string }>;
          intermediate: Array<{ type: string; title: string; url: string }>;
          advanced: Array<{ type: string; title: string; url: string }>;
        };
      } = {
        react: {
          beginner: [
            { type: 'official-docs', title: 'React Official Documentation - Beginner', url: 'https://react.dev/learn' },
            { type: 'video-course', title: 'React Complete Guide - freeCodeCamp (7 hours)', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8' },
            { type: 'interactive-tutorial', title: 'Scrimba - Learn React', url: 'https://scrimba.com/learn/learnreact' },
            { type: 'documentation', title: 'React TypeScript Cheatsheet', url: 'https://react-typescript-cheatsheet.netlify.app' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'React Advanced Patterns', url: 'https://react.dev/reference' },
            { type: 'video-course', title: 'Advanced React Patterns - Frontend Masters', url: 'https://frontendmasters.com/courses/advanced-react-patterns/' },
            { type: 'documentation', title: 'React Hooks Deep Dive', url: 'https://www.epicreact.dev' },
            { type: 'github-resources', title: 'Awesome React - Comprehensive Collection', url: 'https://github.com/enaqx/awesome-react' },
          ],
          advanced: [
            { type: 'official-docs', title: 'React Internals & Architecture', url: 'https://github.com/facebook/react/tree/main/docs' },
            { type: 'video-course', title: 'React Performance Optimization - Kent C. Dodds', url: 'https://egghead.io/courses/fix-common-performance-issues-that-expose-you-to-react-anti-patterns' },
            { type: 'documentation', title: 'React Server Components', url: 'https://react.dev/reference/react/use-server' },
            { type: 'github-resources', title: 'React Design Patterns & Best Practices', url: 'https://github.com/alan2207/bulletproof-react' },
          ],
        },
        javascript: {
          beginner: [
            { type: 'official-docs', title: 'MDN JavaScript Guide for Beginners', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript' },
            { type: 'video-course', title: 'JavaScript Basics - freeCodeCamp (8 hours)', url: 'https://www.youtube.com/watch?v=jS4aFq5-91M' },
            { type: 'interactive-tutorial', title: 'JavaScript.info - Beginner Track', url: 'https://javascript.info' },
            { type: 'documentation', title: 'You Don\'t Know JS (Book Series)', url: 'https://github.com/getify/You-Dont-Know-JS' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'MDN Web Docs - Advanced JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
            { type: 'video-course', title: 'JavaScript Advanced Concepts - Frontend Masters', url: 'https://frontendmasters.com/courses/javascript-hardparts/' },
            { type: 'practice-platform', title: 'LeetCode - JavaScript Medium Problems', url: 'https://leetcode.com/problemset/?difficulty=MEDIUM&lang=javascript' },
            { type: 'documentation', title: 'Eloquent JavaScript (Interactive Book)', url: 'https://eloquentjavascript.net' },
          ],
          advanced: [
            { type: 'official-docs', title: 'ECMA-262 JavaScript Specification', url: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-262/' },
            { type: 'video-course', title: 'JavaScript: The Hard Parts - Will Sentance', url: 'https://frontendmasters.com/courses/javascript-hard-parts/' },
            { type: 'practice-platform', title: 'LeetCode - JavaScript Hard Problems', url: 'https://leetcode.com/problemset/?difficulty=HARD&lang=javascript' },
            { type: 'github-resources', title: '33 JavaScript Concepts Every Developer Should Know', url: 'https://github.com/leonardomso/33-js-concepts' },
          ],
        },
        python: {
          beginner: [
            { type: 'official-docs', title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' },
            { type: 'video-course', title: 'Python for Beginners - freeCodeCamp (4 hours)', url: 'https://www.youtube.com/watch?v=rfscVS0vtik' },
            { type: 'interactive-tutorial', title: 'Real Python Tutorials - Beginner', url: 'https://realpython.com/start-here/' },
            { type: 'documentation', title: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'Python Documentation - Full Reference', url: 'https://docs.python.org/3/library/index.html' },
            { type: 'video-course', title: 'Intermediate Python - Real Python', url: 'https://realpython.com/intermediate-python/' },
            { type: 'practice-platform', title: 'HackerRank - Python Intermediate', url: 'https://www.hackerrank.com/domains/python' },
            { type: 'documentation', title: 'Fluent Python (Book Series)', url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492077459/' },
          ],
          advanced: [
            { type: 'official-docs', title: 'Python Enhancement Proposals (PEPs)', url: 'https://peps.python.org/' },
            { type: 'video-course', title: 'Python Design Patterns - Real Python', url: 'https://realpython.com/design-patterns/' },
            { type: 'practice-platform', title: 'LeetCode - Python Hard Problems', url: 'https://leetcode.com/problemset/?difficulty=HARD&lang=python' },
            { type: 'github-resources', title: 'Awesome Python - Curated List', url: 'https://github.com/vinta/awesome-python' },
          ],
        },
        'web development': {
          beginner: [
            { type: 'official-docs', title: 'MDN Web Docs - Get Started', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
            { type: 'video-course', title: 'Web Development for Beginners - freeCodeCamp', url: 'https://www.youtube.com/watch?v=zJSY8tbf_ys' },
            { type: 'interactive-tutorial', title: 'Codecademy - Full Stack Engineer Path', url: 'https://www.codecademy.com/learn/full-stack-engineer' },
            { type: 'documentation', title: 'Web.dev by Google - Learn Web Development', url: 'https://web.dev/learn' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'MDN Web Docs - Complete Reference', url: 'https://developer.mozilla.org/en-US/' },
            { type: 'video-course', title: 'The Web Developer Bootcamp 2024 - Udemy', url: 'https://www.udemy.com/course/the-web-developer-bootcamp/' },
            { type: 'practice-platform', title: 'Frontend Mentor - Real Projects', url: 'https://www.frontendmentor.io' },
            { type: 'documentation', title: 'Web Accessibility Guidelines (WCAG)', url: 'https://www.w3.org/WAI/WCAG21/quickref/' },
          ],
          advanced: [
            { type: 'official-docs', title: 'W3C Web Standards Specifications', url: 'https://www.w3.org/TR/' },
            { type: 'video-course', title: 'Advanced Web Development Patterns - Frontend Masters', url: 'https://frontendmasters.com' },
            { type: 'practice-platform', title: 'Frontend Challenges - Advanced', url: 'https://www.codementor.io/projects' },
            { type: 'github-resources', title: 'Awesome Web Development Resources', url: 'https://github.com/markodenic/web-development-resources' },
          ],
        },
        nodejs: {
          beginner: [
            { type: 'official-docs', title: 'Node.js Official Getting Started', url: 'https://nodejs.org/en/docs/guides/' },
            { type: 'video-course', title: 'Node.js Complete Course - freeCodeCamp (7 hours)', url: 'https://www.youtube.com/watch?v=Oe421DxqdiA' },
            { type: 'interactive-tutorial', title: 'The Node.js Way - Codecademy', url: 'https://www.codecademy.com/learn/learn-node-js' },
            { type: 'documentation', title: 'Express.js Beginner Guide', url: 'https://expressjs.com/en/starter/basic-routing.html' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'Node.js API Documentation', url: 'https://nodejs.org/en/docs/api/' },
            { type: 'video-course', title: 'Node.js Advanced Patterns - Frontend Masters', url: 'https://frontendmasters.com/courses/nodejs-v3/' },
            { type: 'practice-platform', title: 'Real World Node.js Applications', url: 'https://github.com/EbookFoundation/free-programming-books#nodejs' },
            { type: 'documentation', title: 'You Don\'t Know Node.js', url: 'https://github.com/azat-co/you-dont-know-node' },
          ],
          advanced: [
            { type: 'official-docs', title: 'Node.js Internals & Performance', url: 'https://nodejs.org/en/docs/guides/nodejs-performance-monitoring/' },
            { type: 'video-course', title: 'Node.js Performance & Scaling - egghead.io', url: 'https://egghead.io/courses/scaling-nodejs-applications' },
            { type: 'documentation', title: 'Microservices with Node.js', url: 'https://github.com/goldbergyoni/nodebestpractices' },
            { type: 'github-resources', title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices' },
          ],
        },
        typescript: {
          beginner: [
            { type: 'official-docs', title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/' },
            { type: 'video-course', title: 'TypeScript for Beginners - freeCodeCamp (1 hour)', url: 'https://www.youtube.com/watch?v=BwuLSPajF40' },
            { type: 'interactive-tutorial', title: 'TypeScript Playground & Tutorials', url: 'https://www.typescriptlang.org/play' },
            { type: 'documentation', title: 'Learn TypeScript Step by Step', url: 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'TypeScript Handbook - Advanced Types', url: 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html' },
            { type: 'video-course', title: 'TypeScript Complete Guide - Udemy', url: 'https://www.udemy.com/course/understanding-typescript/' },
            { type: 'practice-platform', title: 'TypeScript Exercises', url: 'https://github.com/type-challenges/type-challenges' },
            { type: 'documentation', title: 'Advanced TypeScript Patterns', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' },
          ],
          advanced: [
            { type: 'official-docs', title: 'TypeScript Internals & Compiler API', url: 'https://www.typescriptlang.org/docs/handbook/compiler-options.html' },
            { type: 'video-course', title: 'Advanced TypeScript - Frontend Masters', url: 'https://frontendmasters.com/courses/typescript-practice/' },
            { type: 'practice-platform', title: 'TypeScript Type Challenges', url: 'https://github.com/type-challenges/type-challenges/blob/main/README.en.md' },
            { type: 'github-resources', title: 'Advanced TypeScript Concepts', url: 'https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md' },
          ],
        },
        sql: {
          beginner: [
            { type: 'official-docs', title: 'SQL Tutorial - W3Schools Complete', url: 'https://www.w3schools.com/sql/' },
            { type: 'video-course', title: 'SQL for Beginners - freeCodeCamp (5 hours)', url: 'https://www.youtube.com/watch?v=5OdSS3D7Qmk' },
            { type: 'interactive-tutorial', title: 'SQLiteOnline - Practice SQL', url: 'https://sqliteonline.com' },
            { type: 'practice-platform', title: 'SQLZoo Interactive Lessons', url: 'https://sqlzoo.net/wiki/SQL_Tutorial' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/' },
            { type: 'video-course', title: 'Advanced SQL - Mode Analytics', url: 'https://mode.com/sql-tutorial/advanced-sql/' },
            { type: 'practice-platform', title: 'LeetCode SQL Medium Problems', url: 'https://leetcode.com/problemset/?topicSlugs=database&difficulty=MEDIUM' },
            { type: 'documentation', title: 'SQL Window Functions Complete Guide', url: 'https://mode.com/sql-tutorial/sql-window-functions/' },
          ],
          advanced: [
            { type: 'official-docs', title: 'PostgreSQL Advanced Features', url: 'https://www.postgresql.org/docs/current/advanced.html' },
            { type: 'video-course', title: 'SQL Query Optimization & Performance Tuning', url: 'https://www.udemy.com/course/sql-and-database-design-tutorial-relational-sql-databases/' },
            { type: 'practice-platform', title: 'LeetCode SQL Hard Problems', url: 'https://leetcode.com/problemset/?topicSlugs=database&difficulty=HARD' },
            { type: 'documentation', title: 'Database Optimization Best Practices', url: 'https://use-the-index-luke.com' },
          ],
        },
        database: {
          beginner: [
            { type: 'official-docs', title: 'MongoDB Getting Started Guide', url: 'https://docs.mongodb.com/manual/introduction/' },
            { type: 'video-course', title: 'Database Design Basics - freeCodeCamp', url: 'https://www.youtube.com/watch?v=4cWkVbC2bNE' },
            { type: 'interactive-tutorial', title: 'Firebase Documentation & Guides', url: 'https://firebase.google.com/docs' },
            { type: 'documentation', title: 'Relational Database Fundamentals', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'MongoDB Advanced Patterns', url: 'https://docs.mongodb.com/manual/core/data-modeling-introduction/' },
            { type: 'video-course', title: 'Database Design & Optimization Course', url: 'https://www.udemy.com/course/ultimate-mysql-bootcamp-go-from-sql-beginner-to-expert/' },
            { type: 'documentation', title: 'NoSQL vs SQL Comprehensive Guide', url: 'https://www.mongodb.com/resources/languages/nosql-vs-sql' },
            { type: 'practice-platform', title: 'Design Real Database Schemas', url: 'https://dbdiagram.io' },
          ],
          advanced: [
            { type: 'official-docs', title: 'Database Internals & Architecture', url: 'https://www.postgresql.org/docs/current/internals.html' },
            { type: 'video-course', title: 'Advanced Database Optimization', url: 'https://www.coursera.org/learn/database-design-tuning' },
            { type: 'documentation', title: 'Designing Data-Intensive Applications (Book)', url: 'https://dataintensive.net' },
            { type: 'github-resources', title: 'Database Sharding & Replication Patterns', url: 'https://github.com/donnemartin/system-design-primer' },
          ],
        },
      }

      // Get base resources for the topic
      const normalizedTopic = courseTopic.toLowerCase().trim()
      let topicResources = null
      
      for (const [key, resources] of Object.entries(topicResourceMap)) {
        if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
          topicResources = resources
          break
        }
      }

      // Determine user experience level (normalize)
      const userLevel =
        experience.toLowerCase().includes('beginner') ? 'beginner'
          : experience.toLowerCase().includes('intermediate') ? 'intermediate'
          : 'advanced'

      // If we have topic-specific resources, use them with the right experience level
      if (topicResources) {
        return topicResources[userLevel] || topicResources.beginner
      }

      // Fallback: Generate generic resources based on topic and level
      const genericResources: Array<{ type: string; title: string; url: string }> = []

      if (userLevel === 'beginner') {
        genericResources.push({
          type: 'official-docs',
          title: `Official ${courseTopic} Documentation for Beginners`,
          url: `https://www.google.com/search?q=${encodeURIComponent(courseTopic)}+beginner+tutorial+official`,
        })
        genericResources.push({
          type: 'video-course',
          title: `Complete ${courseTopic} Course - freeCodeCamp`,
          url: `https://www.youtube.com/results?search_query=freeCodeCamp+${encodeURIComponent(courseTopic)}+complete+course`,
        })
        genericResources.push({
          type: 'interactive-tutorial',
          title: `${courseTopic} Interactive Learning Platform`,
          url: `https://www.codecademy.com/catalog/subject/`,
        })
        genericResources.push({
          type: 'documentation',
          title: `${courseTopic} Best Books for Beginners`,
          url: `https://www.amazon.com/s?k=${encodeURIComponent(courseTopic)}+for+beginners&i=digital-text`,
        })
      } else if (userLevel === 'intermediate') {
        genericResources.push({
          type: 'official-docs',
          title: `${courseTopic} Full API Reference & Documentation`,
          url: `https://www.google.com/search?q=${encodeURIComponent(courseTopic)}+api+documentation`,
        })
        genericResources.push({
          type: 'video-course',
          title: `Advanced ${courseTopic} - Frontend Masters`,
          url: `https://frontendmasters.com/search/?q=${encodeURIComponent(courseTopic)}`,
        })
        genericResources.push({
          type: 'practice-platform',
          title: `${courseTopic} Practice Problems & Challenges`,
          url: `https://leetcode.com/search/?q=${encodeURIComponent(courseTopic)}`,
        })
        genericResources.push({
          type: 'documentation',
          title: `${courseTopic} Advanced Patterns & Best Practices`,
          url: `https://github.com/search?q=${encodeURIComponent(courseTopic)}+advanced+patterns`,
        })
      } else {
        genericResources.push({
          type: 'official-docs',
          title: `${courseTopic} Language Specification & Internals`,
          url: `https://www.google.com/search?q=${encodeURIComponent(courseTopic)}+specification+internals`,
        })
        genericResources.push({
          type: 'video-course',
          title: `${courseTopic} Advanced System Design - Udemy`,
          url: `https://www.udemy.com/search/?q=${encodeURIComponent(courseTopic)}+advanced`,
        })
        genericResources.push({
          type: 'github-resources',
          title: `${courseTopic} High-Performance Implementation Patterns`,
          url: `https://github.com/search?q=${encodeURIComponent(courseTopic)}+high+performance`,
        })
        genericResources.push({
          type: 'documentation',
          title: `${courseTopic} Architecture & System Design Patterns`,
          url: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(courseTopic)}`,
        })
      }

      return genericResources
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

    // Determine number of modules based on timeline
    const getModuleCount = (timeline: string): number => {
      if (timeline.includes('week') && timeline.includes('1')) return 4
      if (timeline.includes('week') && timeline.includes('2')) return 6
      if (timeline.includes('month') && timeline.includes('1')) return 8
      if (timeline.includes('month') && timeline.includes('2')) return 10
      if (timeline.includes('month') && timeline.includes('3')) return 12
      if (timeline.includes('4') || timeline.includes('6')) return 15
      return 6 // default
    }

    const numModules = getModuleCount(timeline)

    // Build AI prompt with detailed instructions
    const prompt = `You are an expert course curriculum designer. Your task is to create a highly detailed, comprehensive course with MULTIPLE well-structured modules.

USER PROFILE:
- Name: ${userName}
- Primary Goal: ${goal}
- Experience Level: ${experience}
- Available Time: ${timeCommitment}
- Preferred Learning Style: ${learningStyle}
- Timeline: ${timeline}
- Areas of Interest: ${interests}
- Topic: ${topic}
- Progress Tracking: ${progressTracking}

CRITICAL REQUIREMENTS:
1. Create EXACTLY ${numModules} separate modules (not 1!)
2. Each module must have a unique, descriptive title
3. Each module must build on previous ones progressively
4. Distribute content evenly across all modules
5. Include specific, actionable topics for each module
6. Include different types of activities for each module
7. IMPORTANT: Ensure modules are logically grouped and thematically distinct

MODULE STRUCTURE (follow this exactly):
- Module 1: Foundations & Basics (cover fundamental concepts)
- Module 2-N: Progressive advancement (each module adds complexity)
- Module N: Advanced applications or capstone project

For each module include:
- Clear learning objectives
- Specific topics to cover
- Multiple practical activities (not just one)
- Real-world applications
- Key concepts to master
- IMPORTANT: Curated reading materials from reliable sources (GeeksforGeeks, official docs, MDN, tutorials, etc.)

RESPONSE FORMAT - Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Complete ${topic} Mastery Course for ${userName}",
  "description": "A comprehensive ${timeline} course designed to help ${userName} ${goal}. This course is divided into ${numModules} distinct, progressive modules covering all aspects of ${topic}.",
  "duration": "${timeline}",
  "difficulty": "${experience}",
  "totalModules": ${numModules},
  "objectives": [
    "Master the fundamentals of ${topic}",
    "Achieve: ${goal}",
    "Build practical skills in: ${interests}",
    "Complete real-world projects"
  ],
  "modules": [
    {
      "id": 1,
      "title": "Module 1: Foundations of ${topic}",
      "weekNumber": 1,
      "duration": "3-5 days",
      "description": "Introduction and core concepts of ${topic}",
      "objectives": ["Understand basic concepts", "Learn terminology"],
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "activities": ["Reading", "Video lessons", "Practice exercises", "Quiz"],
      "project": "Knowledge check assignment",
      "estimatedHours": 5,
      "youtubeSearch": "Introduction to ${topic}",
      "readingMaterials": [
        {
          "title": "Resource Title",
          "source": "GeeksforGeeks or other platform",
          "url": "https://example.com",
          "difficulty": "beginner",
          "estimatedReadTime": "15 mins"
        }
      ]
    }
  ],
  "resources": [
    {"type": "documentation", "title": "Official Documentation", "url": "https://example.com"},
    {"type": "videos", "title": "Learning Videos", "url": "https://youtube.com"}
  ],
  "finalProject": {
    "title": "Capstone Project: Complete ${topic} Application",
    "description": "Apply all learned concepts to build a real-world project",
    "duration": "1-2 weeks",
    "requirements": ["Use learned concepts", "Complete documentation", "Present results"]
  }
}

REMEMBER: Generate ALL ${numModules} modules, not just 1 or 2!`

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
      
      // Ensure all modules have reading materials
      if (course.modules && Array.isArray(course.modules)) {
        course.modules = course.modules.map((module: any, idx: number) => {
          if (!module.readingMaterials || !Array.isArray(module.readingMaterials) || module.readingMaterials.length === 0) {
            const moduleTopic = module.title || topic
            return {
              ...module,
              readingMaterials: generateReadingMaterials(moduleTopic, idx + 1, experience)
            }
          }
          return module
        })
      }

      // Ensure course has real, accurate resources
      if (!course.resources || !Array.isArray(course.resources) || course.resources.length === 0 || 
          (course.resources.some((r: any) => r.url?.includes('example.com') || r.url === 'https://youtube.com'))) {
        course.resources = generateCourseResources(topic, goal, experience, timeline, learningStyle)
      }
    } catch (e) {
      console.error('Parse error:', e)
      
      // Create fallback course with multiple modules
      const fallbackModules = []
      const moduleTopics = interests.split(',').map(i => i.trim())
      
      // Create 4-12 modules based on timeline
      for (let i = 0; i < numModules; i++) {
        const moduleNum = i + 1
        const currentModuleTopic = moduleTopics[i % moduleTopics.length] || topic
        fallbackModules.push({
          id: moduleNum,
          title: `Module ${moduleNum}: ${currentModuleTopic}`,
          weekNumber: Math.ceil(moduleNum / 2),
          duration: '3-5 days',
          description: `Deep dive into ${currentModuleTopic} - Part ${moduleNum}`,
          objectives: [
            `Master ${currentModuleTopic}`,
            `Apply concepts to real scenarios`,
          ],
          topics: [
            `${currentModuleTopic} Basics`,
            `Advanced Concepts`,
            `Best Practices`,
          ],
          activities: [
            'Video lectures',
            'Interactive exercises',
            'Case studies',
            'Hands-on practice',
            'Quizzes',
          ],
          project: `Project ${moduleNum}: Build ${currentModuleTopic} application`,
          estimatedHours: 5 + i,
          youtubeSearch: `${currentModuleTopic} tutorial part ${moduleNum}`,
          readingMaterials: generateReadingMaterials(currentModuleTopic, moduleNum, experience),
        })
      }
      
      course = {
        title: `Complete ${topic} Course for ${userName}`,
        description: `A comprehensive ${timeline} course designed to help ${userName} ${goal}. This course is divided into ${numModules} distinct modules.`,
        duration: timeline,
        difficulty: experience,
        totalModules: numModules,
        objectives: [
          `Master the fundamentals of ${topic}`,
          `Achieve: ${goal}`,
          `Build practical skills in: ${interests}`,
          `Complete real-world projects`,
        ],
        modules: fallbackModules,
        resources: generateCourseResources(topic, goal, experience, timeline, learningStyle),
        finalProject: {
          title: `Capstone Project: Complete ${topic} Application`,
          description: `Apply all learned concepts to build a real-world ${topic} project`,
          duration: '1-2 weeks',
          requirements: [
            'Use learned concepts',
            'Complete documentation',
            'Present results',
          ],
        },
      }
    }

    console.log('=== SUCCESS ===')
    console.log('Course modules count:', course.modules?.length)
    console.log('First module has reading materials:', !!course.modules?.[0]?.readingMaterials)
    if (course.modules?.[0]?.readingMaterials) {
      console.log('Reading materials count:', course.modules[0].readingMaterials.length)
    }
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
