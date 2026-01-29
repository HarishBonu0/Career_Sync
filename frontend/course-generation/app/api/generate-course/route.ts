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

    // Helper function to generate specific YouTube search queries per module
    const generateModuleVideoSearch = (moduleTitle: string, moduleTopic: string, moduleNum: number, totalModules: number) => {
      // Clean up module topic - remove "Module X:" prefix
      const cleanTopic = moduleTopic.replace(/^Module\s*\d+[:\s]*/i, '').trim()
      
      // Determine difficulty level based on module position
      const progressPercentage = (moduleNum / totalModules)
      let difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
      
      if (progressPercentage < 0.35) {
        difficultyLevel = 'beginner'
      } else if (progressPercentage < 0.75) {
        difficultyLevel = 'intermediate'
      } else {
        difficultyLevel = 'advanced'
      }
      
      // Build targeted search query - focus on the SPECIFIC module topic
      // Don't try to combine with course title, as that dilutes the search
      return `${cleanTopic} tutorial ${difficultyLevel}`
    }

    // Helper function to generate reading materials for a module
    const generateReadingMaterials = (moduleTopic: string, moduleNum: number, difficulty: string) => {
      // Clean up module topic for better URL matching
      const cleanTopic = moduleTopic.replace(/^Module\s+\d+:\s*/i, '').trim()
      const topicLower = cleanTopic.toLowerCase()

      // Curated keyword-to-resource mapping for higher precision
      const keywordResources: Record<string, { official?: { title: string; url: string }; gfg?: string; fcc?: string; devto?: string }> = {
        // JavaScript core
        'variables': { official: { title: 'MDN - Values, Variables, and Literals', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types' }, gfg: 'https://www.geeksforgeeks.org/variables-in-javascript/' },
        'data types': { official: { title: 'MDN - Data Types and Structures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures' }, gfg: 'https://www.geeksforgeeks.org/javascript-data-types/' },
        'functions': { official: { title: 'MDN - Functions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' }, gfg: 'https://www.geeksforgeeks.org/javascript-functions/' },
        'promises': { official: { title: 'MDN - Using Promises', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises' }, gfg: 'https://www.geeksforgeeks.org/javascript-promises/' },
        'async': { official: { title: 'MDN - Async/Await', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function' }, gfg: 'https://www.geeksforgeeks.org/async-await-function-in-javascript/' },
        'dom': { official: { title: 'MDN - DOM Introduction', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction' }, gfg: 'https://www.geeksforgeeks.org/dom-document-object-model/' },
        'event': { official: { title: 'MDN - Events Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events' }, gfg: 'https://www.geeksforgeeks.org/javascript-events/' },

        // CSS
        'flexbox': { official: { title: 'MDN - CSS Flexible Box Layout', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout' }, gfg: 'https://www.geeksforgeeks.org/css-flexbox-complete-guide/', fcc: 'https://www.freecodecamp.org/news/css-flexbox-tutorial-with-cheatsheet/', devto: 'https://dev.to/t/flexbox' },
        'grid': { official: { title: 'MDN - CSS Grid Layout', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout' }, gfg: 'https://www.geeksforgeeks.org/css-grid-layout/', fcc: 'https://www.freecodecamp.org/news/css-grid-tutorial-with-cheatsheet/', devto: 'https://dev.to/t/cssgrid' },
        'responsive': { official: { title: 'MDN - Responsive Design', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design' }, gfg: 'https://www.geeksforgeeks.org/what-is-responsive-web-design/', fcc: 'https://www.freecodecamp.org/news/what-is-responsive-web-design/' },
        'accessibility': { official: { title: 'MDN - Accessibility Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/Accessibility' }, gfg: 'https://www.geeksforgeeks.org/web-accessibility-guide/', devto: 'https://dev.to/t/a11y' },

        // React
        'react components': { official: { title: 'React - Describing the UI', url: 'https://react.dev/learn/describing-the-ui' }, gfg: 'https://www.geeksforgeeks.org/reactjs-components/' },
        'react hooks': { official: { title: 'React Hooks - Reference', url: 'https://react.dev/reference/react' }, gfg: 'https://www.geeksforgeeks.org/react-hooks/' },
        'state management': { official: { title: 'React - Managing State', url: 'https://react.dev/learn/managing-state' }, gfg: 'https://www.geeksforgeeks.org/state-management-in-reactjs/' },
        'routing': { official: { title: 'React Router - Getting Started', url: 'https://reactrouter.com/en/main/start/tutorial' }, gfg: 'https://www.geeksforgeeks.org/reactjs-router/' },

        // Node / Backend
        'express': { official: { title: 'Express Official Guide', url: 'https://expressjs.com/en/starter/installing.html' }, gfg: 'https://www.geeksforgeeks.org/express-js/' },
        'rest': { official: { title: 'MDN - REST Concepts', url: 'https://developer.mozilla.org/en-US/docs/Glossary/REST' }, gfg: 'https://www.geeksforgeeks.org/rest-api-introduction/' },
        'authentication': { official: { title: 'OWASP - Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' }, gfg: 'https://www.geeksforgeeks.org/authentication-vs-authorization/' },
        'jwt': { official: { title: 'JWT - Introduction', url: 'https://jwt.io/introduction' }, gfg: 'https://www.geeksforgeeks.org/jwt-authentication-with-node-js/' },
        'mongodb': { official: { title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/' }, gfg: 'https://www.geeksforgeeks.org/mongodb-tutorial/' },
        'sql joins': { official: { title: 'W3Schools - SQL Joins', url: 'https://www.w3schools.com/sql/sql_join.asp' }, gfg: 'https://www.geeksforgeeks.org/sql-join-set-1-inner-left-right-and-full-joins/' },

        // Tooling
        'git': { official: { title: 'Git Book - Pro Git', url: 'https://git-scm.com/book/en/v2' }, gfg: 'https://www.geeksforgeeks.org/git-tutorial/' },
        'docker': { official: { title: 'Docker Docs - Get Started', url: 'https://docs.docker.com/get-started/' }, gfg: 'https://www.geeksforgeeks.org/docker-tutorial/' },

        // Testing
        'jest': { official: { title: 'Jest Docs', url: 'https://jestjs.io/docs/getting-started' }, gfg: 'https://www.geeksforgeeks.org/introduction-to-jest-testing-framework/' },
        'cypress': { official: { title: 'Cypress Docs - Core Concepts', url: 'https://docs.cypress.io/guides/core-concepts/introduction-to-cypress' }, gfg: 'https://www.geeksforgeeks.org/cypress-an-overview-and-its-commands/' },

        // Python / Data
        'pandas': { official: { title: 'Pandas Docs - Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/index.html' }, gfg: 'https://www.geeksforgeeks.org/pandas-tutorial/' },
        'numpy': { official: { title: 'NumPy User Guide', url: 'https://numpy.org/doc/stable/user/' }, gfg: 'https://www.geeksforgeeks.org/numpy/' },
        'oop': { official: { title: 'Python OOP Tutorial', url: 'https://docs.python.org/3/tutorial/classes.html' }, gfg: 'https://www.geeksforgeeks.org/python-oops-concepts/' },
      }

      const matchedKeyword = Object.keys(keywordResources).find((key) => topicLower.includes(key))
      
      // GeeksforGeeks topic mapping to actual article URLs
      const getGeeksforGeeksUrl = (topic: string): string => {
        const topicMap: { [key: string]: string } = {
          // JavaScript
          'javascript': 'https://www.geeksforgeeks.org/javascript/',
          'javascript basics': 'https://www.geeksforgeeks.org/introduction-to-javascript/',
          'javascript fundamentals': 'https://www.geeksforgeeks.org/javascript-tutorial/',
          'js': 'https://www.geeksforgeeks.org/javascript/',
          // TypeScript
          'typescript': 'https://www.geeksforgeeks.org/typescript/',
          // React
          'react': 'https://www.geeksforgeeks.org/react-tutorial/',
          'react basics': 'https://www.geeksforgeeks.org/reactjs-tutorials/',
          'react components': 'https://www.geeksforgeeks.org/react-components/',
          'react hooks': 'https://www.geeksforgeeks.org/reactjs-hooks/',
          // Node.js
          'node': 'https://www.geeksforgeeks.org/nodejs/',
          'nodejs': 'https://www.geeksforgeeks.org/nodejs-tutorial/',
          'node.js': 'https://www.geeksforgeeks.org/nodejs/',
          // Python
          'python': 'https://www.geeksforgeeks.org/python-programming-language/',
          'python basics': 'https://www.geeksforgeeks.org/python-programming-language-tutorial/',
          'python fundamentals': 'https://www.geeksforgeeks.org/python-basics/',
          // CSS
          'css': 'https://www.geeksforgeeks.org/css-tutorial/',
          'css basics': 'https://www.geeksforgeeks.org/css/',
          // HTML
          'html': 'https://www.geeksforgeeks.org/html-tutorial/',
          'html basics': 'https://www.geeksforgeeks.org/html/',
          // SQL
          'sql': 'https://www.geeksforgeeks.org/sql-tutorial/',
          'database': 'https://www.geeksforgeeks.org/dbms/',
          'databases': 'https://www.geeksforgeeks.org/introduction-of-dbms/',
          // Git
          'git': 'https://www.geeksforgeeks.org/git-tutorial/',
          'version control': 'https://www.geeksforgeeks.org/version-control-systems/',
          // Data Structures
          'arrays': 'https://www.geeksforgeeks.org/array-data-structure/',
          'linked list': 'https://www.geeksforgeeks.org/data-structures/linked-list/',
          'trees': 'https://www.geeksforgeeks.org/binary-tree-data-structure/',
          'graphs': 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/',
          // Algorithms
          'sorting': 'https://www.geeksforgeeks.org/sorting-algorithms/',
          'searching': 'https://www.geeksforgeeks.org/searching-algorithms/',
          'dynamic programming': 'https://www.geeksforgeeks.org/dynamic-programming/',
          'algorithms': 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
        }
        
        // Try exact match first
        const lower = topic.toLowerCase()
        if (topicMap[lower]) return topicMap[lower]
        
        // Try partial matches
        for (const [key, url] of Object.entries(topicMap)) {
          if (lower.includes(key) || key.includes(lower.split(' ')[0])) {
            return url
          }
        }
        
        // Fallback to search
        return `https://www.geeksforgeeks.org/?s=${encodeURIComponent(topic)}`
      }
      
      // Map topics to their official documentation
      const getOfficialDocs = (topic: string): { title: string; url: string } => {
        const topicLower = topic.toLowerCase()
        
        // JavaScript/TypeScript
        if (topicLower.includes('javascript') || topicLower.includes('js')) {
          return { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' }
        }
        if (topicLower.includes('typescript') || topicLower.includes('ts')) {
          return { title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' }
        }
        // React
        if (topicLower.includes('react')) {
          return { title: 'React Official Documentation', url: 'https://react.dev/learn' }
        }
        // Node.js
        if (topicLower.includes('node')) {
          return { title: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs/' }
        }
        // Python
        if (topicLower.includes('python')) {
          return { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' }
        }
        // CSS
        if (topicLower.includes('css')) {
          return { title: 'MDN CSS Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }
        }
        // HTML
        if (topicLower.includes('html')) {
          return { title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }
        }
        // SQL
        if (topicLower.includes('sql') || topicLower.includes('database')) {
          return { title: 'SQL Tutorial - W3Schools', url: 'https://www.w3schools.com/sql/' }
        }
        // Git
        if (topicLower.includes('git')) {
          return { title: 'Git Official Documentation', url: 'https://git-scm.com/doc' }
        }
        // W3Schools for web technologies
        if (topicLower.includes('web') || topicLower.includes('http') || topicLower.includes('api')) {
          return { title: `${cleanTopic} - W3Schools`, url: 'https://www.w3schools.com/' }
        }
        // Default to MDN Web Docs
        return { title: `${cleanTopic} - Web Documentation`, url: 'https://developer.mozilla.org/en-US/' }
      }
      
      const officialDocs = matchedKeyword && keywordResources[matchedKeyword].official
        ? keywordResources[matchedKeyword].official!
        : getOfficialDocs(cleanTopic)

      const gfgUrl = matchedKeyword && keywordResources[matchedKeyword].gfg
        ? keywordResources[matchedKeyword].gfg!
        : getGeeksforGeeksUrl(cleanTopic)

      const fccUrl = matchedKeyword && keywordResources[matchedKeyword].fcc
        ? keywordResources[matchedKeyword].fcc!
        : `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(cleanTopic)}`

      const devtoUrl = matchedKeyword && keywordResources[matchedKeyword].devto
        ? keywordResources[matchedKeyword].devto!
        : `https://dev.to/search?q=${encodeURIComponent(cleanTopic)}`
      
      const readingMaterials = [
        {
          title: `${cleanTopic} - GeeksforGeeks`,
          source: 'GeeksforGeeks',
          url: gfgUrl,
          difficulty: difficulty || 'beginner',
          estimatedReadTime: moduleNum <= 3 ? '20 mins' : '30 mins',
        },
        {
          title: officialDocs.title,
          source: 'Official Documentation',
          url: officialDocs.url,
          difficulty: difficulty || 'intermediate',
          estimatedReadTime: '25 mins',
        },
        {
          title: `${cleanTopic} Tutorial - freeCodeCamp`,
          source: 'freeCodeCamp',
          url: fccUrl,
          difficulty: difficulty || 'beginner',
          estimatedReadTime: '15 mins',
        },
        {
          title: `${cleanTopic} Guide - Dev.to`,
          source: 'Dev.to',
          url: devtoUrl,
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

      // Fallback: Generate high-quality resources based on topic and level
      const genericResources: Array<{ type: string; title: string; url: string }> = []

      if (userLevel === 'beginner') {
        genericResources.push({
          type: 'official-docs',
          title: `${courseTopic} - MDN Web Docs`,
          url: `https://developer.mozilla.org/en-US/`,
        })
        genericResources.push({
          type: 'video-course',
          title: `${courseTopic} Complete Course - freeCodeCamp`,
          url: `https://www.freecodecamp.org/`,
        })
        genericResources.push({
          type: 'interactive-tutorial',
          title: `${courseTopic} - Codecademy Learn Platform`,
          url: `https://www.codecademy.com/`,
        })
        genericResources.push({
          type: 'documentation',
          title: `${courseTopic} - GeeksforGeeks Tutorial`,
          url: `https://www.geeksforgeeks.org/`,
        })
      } else if (userLevel === 'intermediate') {
        genericResources.push({
          type: 'official-docs',
          title: `${courseTopic} Official Documentation`,
          url: `https://developer.mozilla.org/en-US/`,
        })
        genericResources.push({
          type: 'video-course',
          title: `Advanced ${courseTopic} - Frontend Masters`,
          url: `https://frontendmasters.com/`,
        })
        genericResources.push({
          type: 'practice-platform',
          title: `${courseTopic} Practice - LeetCode`,
          url: `https://leetcode.com/`,
        })
        genericResources.push({
          type: 'documentation',
          title: `${courseTopic} Code Examples - GitHub`,
          url: `https://github.com/`,
        })
      } else {
        genericResources.push({
          type: 'official-docs',
          title: `${courseTopic} API Reference & Specification`,
          url: `https://developer.mozilla.org/en-US/`,
        })
        genericResources.push({
          type: 'video-course',
          title: `${courseTopic} System Design & Architecture - Udemy`,
          url: `https://www.udemy.com/`,
        })
        genericResources.push({
          type: 'github-resources',
          title: `${courseTopic} Design Patterns - Awesome Lists`,
          url: `https://github.com/`,
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

    // Determine number of modules based on timeline + depth signals
    const getModuleCount = (
      timeline: string,
      experience: string,
      goal: string,
      timeCommitment: string
    ): number => {
      const toAverageNumber = (value: string): number | null => {
        const matches = value.match(/(\d+(?:\.\d+)?)/g)
        if (!matches) return null
        const nums = matches.map(Number)
        return nums.reduce((a, b) => a + b, 0) / nums.length
      }

      const parseTimelineToWeeks = (value: string): number => {
        const normalized = value.toLowerCase()
        const avg = toAverageNumber(normalized)
        if (!avg) return 6 // fallback baseline
        if (normalized.includes('week')) return avg
        if (normalized.includes('month')) return avg * 4
        if (normalized.includes('day')) return Math.max(1, avg / 7)
        if (normalized.includes('year')) return avg * 52
        return avg >= 1 ? avg * 4 : 6
      }

      const parseHoursPerWeek = (value: string): number => {
        const normalized = value.toLowerCase()
        const avg = toAverageNumber(normalized)
        if (!avg) return 5
        if (normalized.includes('hour')) return avg
        if (normalized.includes('day')) return avg * 7
        return avg
      }

      const weeks = parseTimelineToWeeks(timeline)
      const hoursPerWeek = parseHoursPerWeek(timeCommitment)

      // Base modules scale with available weeks (roughly 1.2 modules per week plus a starter buffer)
      let modules = Math.round(weeks * 1.2 + 2)

      // Depth adjustments
      const goalLower = goal.toLowerCase()
      const experienceLower = experience.toLowerCase()
      const deepDiveSignals = ['deep', 'advance', 'expert', 'career', 'master', 'intensive']
      if (deepDiveSignals.some((signal) => goalLower.includes(signal))) modules += 2
      if (experienceLower.includes('advanced') || experienceLower.includes('intermediate')) modules += 1

      // Time commitment adjustments
      if (hoursPerWeek >= 10) modules += 2
      else if (hoursPerWeek >= 6) modules += 1
      else if (hoursPerWeek <= 3) modules -= 1

      // Clamp to a reasonable range so short courses stay short and long ones are rich but not bloated
      modules = Math.min(18, Math.max(5, modules))
      return modules
    }

    const numModules = getModuleCount(timeline, experience, goal, timeCommitment)

    // Build AI prompt with detailed instructions for SPECIFIC, SEARCHABLE module topics
    const prompt = `You are an expert course curriculum designer creating a professional learning path.

USER PROFILE:
- Name: ${userName}
- Primary Goal: ${goal}
- Experience Level: ${experience}
- Available Time: ${timeCommitment}
- Timeline: ${timeline}
- Topic: ${topic}

CRITICAL REQUIREMENTS FOR MODULE TITLES:
1. Create EXACTLY ${numModules} separate modules
2. Module titles MUST be SPECIFIC and SEARCHABLE (e.g., "JavaScript Variables and Data Types" NOT "Foundations")
3. Use CONCRETE technical terms that match real tutorials and documentation
4. Each module must have DISTINCT, practical topics that can be found on GeeksforGeeks, MDN, or official docs
5. Avoid vague titles like "Introduction", "Basics", "Fundamentals" - use specific concepts instead

EXAMPLES OF GOOD MODULE TITLES:
- "JavaScript Variables, Data Types, and Operators" ✓
- "React Components and Props" ✓  
- "Python Functions and Modules" ✓
- "CSS Flexbox and Grid Layout" ✓
- "SQL Joins and Subqueries" ✓

EXAMPLES OF BAD MODULE TITLES:
- "Foundations of Programming" ✗
- "Introduction to Concepts" ✗
- "Basic Principles" ✗

MODULE STRUCTURE:
- Each module must focus on 2-4 specific, searchable concepts
- Build progressively from basic to advanced
- Use terminology that matches official documentation
- Ensure each module title contains keywords that will match real tutorials

For each module include:
- SPECIFIC title with technical keywords (this is critical for resource matching!)
- Clear learning objectives using concrete terms
- Specific topics to cover (actual concepts, not generic descriptions)
- youtubeSearch: Use EXACT technical terms (e.g., "React useState Hook tutorial" not "React basics")
- readingMaterials: Will be auto-generated based on title keywords

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "title": "Complete ${topic} Mastery Course for ${userName}",
  "description": "A comprehensive ${timeline} course covering ${topic} from fundamentals to advanced concepts. Designed for ${experience} level learners.",
  "duration": "${timeline}",
  "difficulty": "${experience}",
  "totalModules": ${numModules},
  "objectives": [
    "Master ${topic} fundamentals and core concepts",
    "Build practical applications using ${topic}",
    "Understand ${topic} best practices and patterns",
    "Complete real-world ${topic} projects"
  ],
  "modules": [
    {
      "id": 1,
      "title": "JavaScript Variables and Data Types",
      "weekNumber": 1,
      "duration": "3-5 days",
      "description": "Learn JavaScript variables (var, let, const), primitive data types (string, number, boolean), and type conversion",
      "objectives": ["Understand JavaScript variables and scope", "Master primitive data types", "Learn type conversion and coercion"],
      "topics": ["var, let, const keywords", "Primitive types: string, number, boolean", "Type conversion and checking", "Variable hoisting"],
      "activities": ["Video tutorials", "Coding exercises", "Practice problems", "Mini project"],
      "project": "Variable and data type practice exercises",
      "estimatedHours": 5,
      "youtubeSearch": "JavaScript variables data types tutorial"
    }
  ],
  "resources": [
    {"type": "official-docs", "title": "Official ${topic} Documentation", "url": "https://docs.example.com"},
    {"type": "video-course", "title": "${topic} Video Course", "url": "https://youtube.com"}
  ],
  "finalProject": {
    "title": "Complete ${topic} Application",
    "description": "Build a real-world application using all learned ${topic} concepts",
    "duration": "1-2 weeks",
    "requirements": ["Implement core ${topic} features", "Follow best practices", "Complete documentation"]
  }
}

REMEMBER: 
- Generate ALL ${numModules} modules with SPECIFIC, SEARCHABLE titles
- Use CONCRETE technical terms in every module title
- NO vague or generic titles
- Think: "Would this title match a real tutorial on GeeksforGeeks or YouTube?"
`

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
      
      // Ensure all modules have reading materials AND unique youtube search queries
      if (course.modules && Array.isArray(course.modules)) {
        course.modules = course.modules.map((module: any, idx: number) => {
          const moduleNum = idx + 1
          const moduleTopic = module.title || topic
          const updatedModule = {
            ...module,
          }
          
          // Always regenerate reading materials for consistency/accuracy
          updatedModule.readingMaterials = generateReadingMaterials(moduleTopic, moduleNum, experience)
          
          // Ensure unique YouTube search query for each module
          if (!module.youtubeSearch || module.youtubeSearch.includes('${')) {
            updatedModule.youtubeSearch = generateModuleVideoSearch(moduleTopic, moduleTopic, moduleNum, numModules)
          }
          
          return updatedModule
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
          youtubeSearch: generateModuleVideoSearch(`Module ${moduleNum}: ${currentModuleTopic}`, currentModuleTopic, moduleNum, numModules),
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
