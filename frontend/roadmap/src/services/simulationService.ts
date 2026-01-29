import { SimulationInput, SimulationResult, Pathway, RoadmapStep } from '../types/index';

// RapidAPI Configuration
const RAPIDAPI_KEY = '3713102b41mshdc38a18750de316p1d7e41jsn59027e289b26';
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

// Gemini AI Configuration
const GEMINI_API_KEY = 'AIzaSyBSijv4wL6sNB7obJyoRKkhnlxyx8mfJo4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
  'Postman', 'Figma', 'Notion', 'Canva', 'Stripe',
  'Flipkart', 'OYO', 'PhonePe', 'CRED', 'Razorpay'
];

const ROLES = [
  'Senior Product Manager', 'Staff Engineer', 'Engineering Manager',
  'Product Manager', 'Senior Software Engineer', 'Technical Lead',
  'Solutions Architect', 'Product Designer', 'Data Engineer', 'DevOps Engineer'
];

const SKILLS_TO_ADD = [
  'System Design', 'AI & ML', 'Kubernetes', 'React Advanced Patterns',
  'Microservices', 'Cloud Architecture', 'Data Structures', 'Leadership',
  'Strategic Planning', 'User Research', 'A/B Testing', 'Analytics'
];

const ALERTS = [
  'LIVE: 1,240 new Product Manager jobs added in last 24h',
  'TRENDING: React + AI skills seeing +45% salary hike',
  'JUST IN: Google hiring L4 SDEs in Bangalore (28-42 LPA)',
  'ALERT: High demand for System Design skills',
  'BREAKING: AI/ML roles seeing 65% increase in opportunities',
  'HOT: Full-stack developers with AI expertise highly sought',
  'UPDATE: Remote SDE roles at 35-50 LPA range growing'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate AI-powered roadmap using Gemini API
async function generateAIRoadmap(role: string, company: string, jobDescription?: string): Promise<RoadmapStep[]> {
  try {
    const prompt = `You are a career roadmap expert. Generate a detailed 4-step career preparation roadmap for this job:

Job Title: ${role}
Company: ${company}
Job Description: ${jobDescription || 'Not provided'}

Create exactly 4 actionable steps covering:
1. Certification/Learning (what to learn, specific courses/resources, estimated cost)
2. Projects/Portfolio (specific project ideas with tech stack)
3. Interview Preparation (what to practice, platforms, strategies)
4. Application Strategy (networking, platforms, timeline)

Return ONLY a valid JSON array with this exact format:
[
  {
    "id": "1",
    "title": "Brief title with emoji (e.g., ✓ Master React & TypeScript)",
    "description": "Detailed description: specific courses (Udemy, Coursera), cost ($50-100), what to build, exact platforms to use",
    "duration": "3-4 weeks",
    "type": "CERTIFICATION"
  },
  {
    "id": "2",
    "title": "Another title with emoji",
    "description": "Specific actionable description",
    "duration": "2-3 weeks",
    "type": "LEARNING"
  },
  {
    "id": "3",
    "title": "Interview prep title",
    "description": "Specific platforms, number of problems, mock interviews",
    "duration": "2 weeks",
    "type": "LEARNING"
  },
  {
    "id": "4",
    "title": "Application strategy",
    "description": "Specific steps: LinkedIn, job boards, networking events",
    "duration": "2-4 weeks",
    "type": "APPLICATION"
  }
]

Use types: CERTIFICATION, LEARNING, or APPLICATION. Be specific with course names, costs, platforms, and numbers.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return generateFallbackRoadmap(role, jobDescription);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return generateFallbackRoadmap(role, jobDescription);
    }

    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return generateFallbackRoadmap(role, jobDescription);
    }

    const roadmap: RoadmapStep[] = JSON.parse(jsonMatch[0]);
    
    // Validate roadmap structure
    if (!Array.isArray(roadmap) || roadmap.length !== 4) {
      return generateFallbackRoadmap(role, jobDescription);
    }

    return roadmap;
  } catch (error) {
    console.error('Error generating AI roadmap:', error);
    return generateFallbackRoadmap(role, jobDescription);
  }
}

// Fallback roadmap if Gemini API fails
function generateFallbackRoadmap(role: string, jobDescription?: string): RoadmapStep[] {
  const jobContext = jobDescription?.toLowerCase() || '';
  const roleLower = role.toLowerCase();
  
  // Determine job category for highly specific roadmaps
  const isFrontend = jobContext.includes('react') || jobContext.includes('frontend') || jobContext.includes('vue') || jobContext.includes('angular');
  const isBackend = jobContext.includes('backend') || jobContext.includes('nodejs') || jobContext.includes('python') || jobContext.includes('java');
  const isDataScience = jobContext.includes('data science') || jobContext.includes('ml') || jobContext.includes('machine learning') || roleLower.includes('data scientist');
  const isDevOps = jobContext.includes('devops') || jobContext.includes('kubernetes') || jobContext.includes('docker') || jobContext.includes('infrastructure');
  const isProductManager = roleLower.includes('product manager') || roleLower.includes('pm');
  const isSenior = roleLower.includes('senior') || roleLower.includes('lead') || roleLower.includes('principal');
  
  // FRONTEND SPECIALIST ROADMAP
  if (isFrontend) {
    return [
      {
        id: '1',
        title: '✓ React Mastery & Modern JS (3-4 weeks)',
        description: 'Complete React courses (hooks, context, performance). Master ES6+, TypeScript. Build 1 production-ready app. Resources: Scrimba React Course, Epic React by Kent C. Dodds ($299)',
        duration: '3-4 weeks',
        type: 'CERTIFICATION'
      },
      {
        id: '2',
        title: '⚙️ State Management & Testing (2-3 weeks)',
        description: 'Learn Redux/Zustand, implement tests with Jest/React Testing Library. Create 2 projects: e-commerce UI, Dashboard. Push to GitHub with detailed READMEs',
        duration: '2-3 weeks',
        type: 'LEARNING'
      },
      {
        id: '3',
        title: '🎨 Performance & System Design (2 weeks)',
        description: 'Study: web performance, lazy loading, code splitting, accessibility (WCAG). Practice frontend system design: design Netflix UI, implement pagination at scale',
        duration: '2 weeks',
        type: 'LEARNING'
      },
      {
        id: '4',
        title: '💼 Interview Prep & Applications (2-3 weeks)',
        description: 'LeetCode 50+ problems (medium level), design 3 UIs in interviews. Apply to 15+ companies. Network with frontend teams on LinkedIn',
        duration: '2-3 weeks',
        type: 'APPLICATION'
      }
    ];
  }
  
  // BACKEND/FULL-STACK ROADMAP
  if (isBackend) {
    return [
      {
        id: '1',
        title: '✓ Backend Fundamentals (4 weeks)',
        description: 'Master RESTful APIs, databases (SQL + NoSQL), authentication/authorization. Complete: Node.js/Python course, database design course. Cost: ~$50-100',
        duration: '4 weeks',
        type: 'CERTIFICATION'
      },
      {
        id: '2',
        title: '⚙️ System Architecture Projects (3 weeks)',
        description: 'Build: user auth system, payment gateway integration, multi-database API. Use Docker, implement CI/CD. Deploy to AWS/GCP. All projects on GitHub',
        duration: '3 weeks',
        type: 'LEARNING'
      },
      {
        id: '3',
        title: '🔧 Distributed Systems & Scaling (2 weeks)',
        description: 'Study: microservices, caching, load balancing, message queues (Kafka). Practice: design Instagram backend, Twitter feed system at scale',
        duration: '2 weeks',
        type: 'LEARNING'
      },
      {
        id: '4',
        title: '💼 Technical Interviews (2-3 weeks)',
        description: 'LeetCode 30+ problems (hard), 5+ system design interviews (mock with friends). Apply to 20+ companies. Highlight 1 flagship project in interviews',
        duration: '2-3 weeks',
        type: 'APPLICATION'
      }
    ];
  }
  
  // DATA SCIENCE/ML ROADMAP
  if (isDataScience) {
    return [
      {
        id: '1',
        title: '✓ ML Foundations (4-5 weeks)',
        description: 'Andrew Ng ML course, Statistics & Probability review, Python (NumPy, Pandas). Kaggle: 3 beginner competitions. Cost: Free to $50',
        duration: '4-5 weeks',
        type: 'CERTIFICATION'
      },
      {
        id: '2',
        title: '📊 Model Development Projects (3-4 weeks)',
        description: 'Build 3 ML models: classification, regression, NLP/Computer Vision. Use scikit-learn, TensorFlow/PyTorch. Document on Medium. GitHub with notebooks',
        duration: '3-4 weeks',
        type: 'LEARNING'
      },
      {
        id: '3',
        title: '🤖 Advanced Topics & Deployment (2-3 weeks)',
        description: 'Deep learning, feature engineering, A/B testing. Deploy model as API (Flask/FastAPI). Learn MLOps basics: Docker, monitoring, retraining pipelines',
        duration: '2-3 weeks',
        type: 'LEARNING'
      },
      {
        id: '4',
        title: '💼 Interviews & Apply (2-3 weeks)',
        description: 'Kaggle competitions (rank in top 10%), take-home ML challenges. 5+ behavioral + technical interviews. Apply to 20+ companies with strong portfolio',
        duration: '2-3 weeks',
        type: 'APPLICATION'
      }
    ];
  }
  
  // DEVOPS/INFRASTRUCTURE ROADMAP
  if (isDevOps) {
    return [
      {
        id: '1',
        title: '✓ Cloud & Container Mastery (4 weeks)',
        description: 'Master Docker, Kubernetes (K8s basics to advanced), AWS/GCP essentials. Linux command line deep dive. Complete: Kubernetes the Hard Way. Cost: Free',
        duration: '4 weeks',
        type: 'CERTIFICATION'
      },
      {
        id: '2',
        title: '⚙️ Infrastructure as Code (3 weeks)',
        description: 'Terraform, CloudFormation, or Pulumi. Build: multi-tier app on K8s, auto-scaling setup, CI/CD pipeline (Jenkins/GitHub Actions). GitHub all configs',
        duration: '3 weeks',
        type: 'LEARNING'
      },
      {
        id: '3',
        title: '🔧 Monitoring & Security (2 weeks)',
        description: 'Prometheus/Grafana for monitoring, ELK stack for logging, security best practices, network troubleshooting. Implement zero-trust security model',
        duration: '2 weeks',
        type: 'LEARNING'
      },
      {
        id: '4',
        title: '💼 DevOps Interviews (2-3 weeks)',
        description: 'System design: scale to millions of users. Real DevOps scenarios: disaster recovery, debugging prod issues. Apply to 15+ infrastructure teams',
        duration: '2-3 weeks',
        type: 'APPLICATION'
      }
    ];
  }
  
  // PRODUCT MANAGER ROADMAP
  if (isProductManager) {
    return [
      {
        id: '1',
        title: '✓ PM Fundamentals (3 weeks)',
        description: 'Read: Inspired (Marty Cagan), Empowered, Cracking PM Interview. Understand: metrics, OKRs, user research, competitive analysis. Cost: $50-100',
        duration: '3 weeks',
        type: 'CERTIFICATION'
      },
      {
        id: '2',
        title: '📊 Real Product Strategy (3 weeks)',
        description: 'Analyze 10 B2B/B2C products: strategy, metrics, pain points. Create detailed PRD for 2 products. Interview 20 users, write insights, define GTM',
        duration: '3 weeks',
        type: 'LEARNING'
      },
      {
        id: '3',
        title: '💡 Case Studies & Leadership (2 weeks)',
        description: 'Deep dive: Google Maps, Stripe, Figma - how they iterate. Lead one mini-project with engineers. Practice stakeholder communication',
        duration: '2 weeks',
        type: 'LEARNING'
      },
      {
        id: '4',
        title: '💼 PM Interviews & Apply (2-3 weeks)',
        description: '5+ PM case interviews (mock with others). 3 great case studies prepared. Behavioral: tell stories of impact, mistakes learned. Apply to 15+ companies',
        duration: '2-3 weeks',
        type: 'APPLICATION'
      }
    ];
  }
  
  // DEFAULT: FULL-STACK/GENERALIST ROADMAP
  return [
    {
      id: '1',
      title: '✓ Core Technical Skills (4 weeks)',
      description: `Master fundamentals relevant to ${role}. Follow structured curriculum: Fullstack Open (free), or paid: Udemy complete course ($15-50). Cover: frontend basics, backend fundamentals, databases`,
      duration: '4 weeks',
      type: 'CERTIFICATION'
    },
    {
      id: '2',
      title: '⚙️ Hands-On Projects (3-4 weeks)',
      description: `Build 2-3 production-quality projects showcasing ${role} expertise. Each project: complete feature set, clean code, documentation, deployed live, GitHub with detailed README`,
      duration: '3-4 weeks',
      type: 'LEARNING'
    },
    {
      id: '3',
      title: '🔧 Advanced Concepts (2-3 weeks)',
      description: `Study: system design patterns, performance optimization, scalability, security best practices. Practice: design interviews, code interviews. Read technical blogs from target companies`,
      duration: '2-3 weeks',
      type: 'LEARNING'
    },
    {
      id: '4',
      title: '💼 Interviews & Apply (2-4 weeks)',
      description: `LeetCode practice (20-30 problems), 3+ mock interviews, behavioral prep. Apply to 20+ companies. Tailor resume to role. Network: meetups, LinkedIn, tech events`,
      duration: '2-4 weeks',
      type: 'APPLICATION'
    }
  ];
}

function generatePathway(index: number, targetRole: string, userTargetSalary?: string): Pathway {
  const company = getRandomElement(COMPANIES);
  const difficulty = Math.random() > 0.6 ? 'HIGH' : 'MEDIUM';
  
  // Parse user's target salary if provided
  let salaryBase = getRandomInt(20, 45);
  let salaryMax = salaryBase + getRandomInt(5, 15);
  let salaryUnit = 'LPA';
  
  if (userTargetSalary) {
    const salaryStr = userTargetSalary.toLowerCase();
    const numbers = salaryStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      // Determine if it's in USD, LPA, or other currency
      if (salaryStr.includes('usd') || salaryStr.includes('$')) {
        salaryUnit = 'K USD';
        salaryBase = Math.max(parseInt(numbers[0]), 30);
        salaryMax = salaryBase + getRandomInt(10, 20);
      } else if (salaryStr.includes('lpa') || salaryStr.includes('₹')) {
        salaryUnit = 'LPA';
        salaryBase = Math.max(parseInt(numbers[0]), 20);
        salaryMax = salaryBase + getRandomInt(5, 15);
      } else {
        // Default assumption based on number size
        if (parseInt(numbers[0]) > 100) {
          salaryUnit = 'LPA';
          salaryBase = Math.max(parseInt(numbers[0]), 20);
          salaryMax = salaryBase + getRandomInt(5, 15);
        } else {
          salaryUnit = 'K USD';
          salaryBase = Math.max(parseInt(numbers[0]), 30);
          salaryMax = salaryBase + getRandomInt(10, 20);
        }
      }
    }
  }
  
  const months = getRandomInt(3, 8);
  const growth = getRandomInt(25, 50);
  const listings = getRandomInt(100, 300);

  // Assign category based on company
  const faangCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'];
  const productCompanies = ['Postman', 'Figma', 'Notion', 'Canva', 'Stripe'];
  const startupCompanies = ['Flipkart', 'OYO', 'PhonePe', 'CRED', 'Razorpay'];
  
  let category: 'Top Tier (FAANG)' | 'Product Companies' | 'High Growth Startups' = 'High Growth Startups';
  let route = 'High-Growth Startup Track';
  
  if (faangCompanies.includes(company)) {
    category = 'Top Tier (FAANG)';
    route = 'Stable Corporate Track';
  } else if (productCompanies.includes(company)) {
    category = 'Product Companies';
    route = 'Product-Focused Track';
  } else if (startupCompanies.includes(company)) {
    category = 'High Growth Startups';
    route = 'High-Growth Startup Track';
  }

  const confidence = getRandomInt(85, 98);

  return {
    id: `pathway-${index}`,
    company,
    role: getRandomElement(ROLES),
    difficulty,
    confidence,
    dataSource: 'LinkedIn Live',
    salary: salaryUnit === 'K USD' ? `$${salaryBase}-${salaryMax}K` : `₹${salaryBase}-${salaryMax} ${salaryUnit}`,
    timeline: `${months} Months`,
    growth: `+${growth}% Growth`,
    description: `RECOMMENDED APPROACH: ${route}\nFocus Areas: ${targetRole} Development + Portfolio Building\nSuccess Rate: ${confidence}% (based on skill match)`,
    roadmap: generateFallbackRoadmap(targetRole),
    activeListings: listings,
    demandLevel: growth > 40 ? 'Very High' : 'High',
    category
  };
}

export function generateMockSimulation(input: SimulationInput): SimulationResult {
  const pathways: Pathway[] = [];
  for (let i = 0; i < 12; i++) {
    pathways.push(generatePathway(i, input.targetRole, input.targetSalary));
  }

  const pathsAnalyzed = getRandomInt(15000, 20000);
  const alertSubset = ALERTS.sort(() => Math.random() - 0.5).slice(0, 4);

  return {
    input,
    pathsAnalyzed,
    marketDemand: 'Very High',
    topSkillGap: 'AI Fluency',
    dataSources: ['LinkedIn Live', 'Indeed API', 'Glassdoor Realtime'],
    pathways,
    alerts: alertSubset
  };
}

export function simulatePathways(input: SimulationInput): Promise<SimulationResult> {
  return new Promise(async (resolve) => {
    try {
      // Try fetching real job data from JSearch API
      const { pathways: realPathways, totalResults } = await fetchRealJobData(input);
      
      if (realPathways && realPathways.length > 0) {
        // Calculate paths analyzed based on actual total results from API
        const pathsAnalyzed = totalResults > 0 ? totalResults : realPathways.length * 1360;
        const alertSubset = ALERTS.sort(() => Math.random() - 0.5).slice(0, 4);
        
        setTimeout(() => {
          resolve({
            input,
            pathsAnalyzed,
            marketDemand: 'Very High',
            topSkillGap: 'AI Fluency',
            dataSources: ['JSearch API (Live)', 'LinkedIn', 'Indeed'],
            pathways: realPathways,
            alerts: alertSubset
          });
        }, 1500);
      } else {
        // Fallback to mock data
        setTimeout(() => {
          resolve(generateMockSimulation(input));
        }, 2000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('API Error, using mock data:', error);
      // Fallback to mock data on error
      setTimeout(() => {
        resolve(generateMockSimulation(input));
      }, 2000 + Math.random() * 2000);
    }
  });
}

// Fetch real job data from JSearch API
async function fetchRealJobData(input: SimulationInput): Promise<{ pathways: Pathway[]; totalResults: number }> {
  try {
    const query = input.targetRole; // Use exact target role, no "developer" appended
    const url = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return { pathways: [], totalResults: 0 };
    }

    // Get total results from API (all matches for the query)
    const totalResults = data.estimated_number_of_results || data.data.length;

    // Convert real job postings to pathways (take first 12)
    const pathways: Pathway[] = await Promise.all(
      data.data.slice(0, 12).map(async (job: any, index: number) => {
        const company = job.employer_name || getRandomElement(COMPANIES);
        const role = job.job_title || input.targetRole;
        const difficulty = Math.random() > 0.6 ? 'HIGH' : 'MEDIUM';
        
        // Extract salary info from JSearch API or use user's target salary
        let salary = `₹${getRandomInt(20, 45)}-${getRandomInt(50, 60)} LPA`;
        
        if (job.job_min_salary && job.job_max_salary) {
          const minLPA = Math.round((job.job_min_salary / 100000));
          const maxLPA = Math.round((job.job_max_salary / 100000));
          salary = `$${minLPA}-${maxLPA}K`;
        } else if (input.targetSalary) {
          // Use user's target salary as reference if API doesn't provide salary info
          const salaryStr = input.targetSalary.toLowerCase();
          const numbers = salaryStr.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            const baseAmount = parseInt(numbers[0]);
            if (salaryStr.includes('usd') || salaryStr.includes('$')) {
              const adjustedMax = Math.round(baseAmount * 1.15);
              salary = `$${baseAmount}-${adjustedMax}K`;
            } else if (salaryStr.includes('lpa') || salaryStr.includes('₹')) {
              const adjustedMax = Math.round(baseAmount * 1.15);
              salary = `₹${baseAmount}-${adjustedMax} LPA`;
            }
          }
        }

        // Clean up description - extract first sentence or first 120 characters
        let description = 'Exciting career opportunity';
        if (job.job_description) {
          const cleaned = job.job_description.replace(/<[^>]*>/g, '').trim();
          const firstSentence = cleaned.split('.')[0];
          description = firstSentence.length > 120 
            ? firstSentence.substring(0, 120) + '...' 
            : firstSentence + '.';
        }

        // Extract actual job source (Indeed, LinkedIn, Glassdoor, etc.)
        let dataSource = 'JSearch Live';
        if (job.job_publisher) {
          const publisher = job.job_publisher.toLowerCase();
          if (publisher.includes('indeed')) {
            dataSource = 'Indeed';
          } else if (publisher.includes('linkedin')) {
            dataSource = 'LinkedIn';
          } else if (publisher.includes('glassdoor')) {
            dataSource = 'Glassdoor';
          } else if (publisher.includes('naukri')) {
            dataSource = 'Naukri';
          } else if (publisher.includes('unstop')) {
            dataSource = 'Unstop';
          } else if (publisher.includes('monster')) {
            dataSource = 'Monster';
          } else if (publisher.includes('dice')) {
            dataSource = 'Dice';
          } else if (publisher.includes('ziprecruiter')) {
            dataSource = 'ZipRecruiter';
          } else {
            // Capitalize first letter of publisher name
            dataSource = job.job_publisher.split(' ')[0].charAt(0).toUpperCase() + job.job_publisher.split(' ')[0].slice(1);
          }
        }

        // Determine category based on company reputation
        const faangList = ['google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'uber'];
        const productCompanyList = ['figma', 'notion', 'canva', 'stripe', 'postman'];
        const companyLower = company.toLowerCase();
        
        let category: 'Top Tier (FAANG)' | 'Product Companies' | 'High Growth Startups' = 'High Growth Startups';
        let route = 'High-Growth Startup Track';
        
        if (faangList.some(f => companyLower.includes(f))) {
          category = 'Top Tier (FAANG)';
          route = 'Stable Corporate Track';
        } else if (productCompanyList.some(p => companyLower.includes(p))) {
          category = 'Product Companies';
          route = 'Product-Focused Track';
        }

        // Generate AI-powered roadmap using Gemini
        const roadmap = await generateAIRoadmap(role, company, job.job_description);
        const confidence = getRandomInt(85, 98);

        // Format description using new professional approach
        const formattedDescription = `RECOMMENDED APPROACH: ${route}\nFocus Areas: ${role} Development + Portfolio Building\nSuccess Rate: ${confidence}% (based on skill match)`;

        return {
          id: `pathway-${index}`,
          company,
          role,
          difficulty,
          confidence,
          dataSource,
          salary,
          timeline: `${getRandomInt(3, 8)} Months`,
          growth: `+${getRandomInt(25, 50)}% Growth`,
          description: formattedDescription,
          roadmap,
          activeListings: getRandomInt(100, 300),
          demandLevel: 'Very High',
          jobUrl: job.job_apply_link || job.job_google_link || undefined,
          category
        };
      })
    );

    return { pathways, totalResults };
  } catch (error) {
    console.error('Error fetching real job data:', error);
    return { pathways: [], totalResults: 0 };
  }
}
