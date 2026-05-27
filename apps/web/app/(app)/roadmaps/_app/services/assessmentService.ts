import {
  AssessmentQuestion,
  AssessmentReport,
  AssessmentSession,
  QuestionOutcome,
  ResumeEvidence,
  SimulationInput,
  SkillProfile,
  SkillScoreBreakdown,
} from '../types/index';

type DifficultyLevel = AssessmentSession['difficulty'];

type BackendQuestion = {
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  practicalExample?: string;
  type?: 'theory' | 'practical' | 'logical';
};

type TechnicalTemplate = {
  type: 'theory' | 'practical' | 'logical';
  focusArea: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  practicalExample?: string;
};

type ProfileAnalysisResponse = {
  requiredSkills?: Array<{
    name?: string;
    priority?: 'high' | 'medium' | 'low';
    reason?: string;
  }>;
  resumeInsights?: {
    summary?: string;
    observedSkills?: string[];
    missingSkills?: string[];
    highlights?: string[];
  };
};

const PROJECT_KEYWORDS = [
  'project',
  'built',
  'developed',
  'implemented',
  'designed',
  'deployed',
  'created',
  'launched',
  'delivered',
  'engineered',
  'optimized',
  'led',
  'owned',
  'shipped',
];

const IMPACT_PATTERNS = [
  /\b\d+(?:\.\d+)?%\b/g,
  /\b\d+\+\b/g,
  /\b\d+\s*(?:users|clients|customers|projects|dashboards|models|days|weeks|months)\b/gi,
  /\b(?:reduced|improved|increased|saved|accelerated|automated)\b/gi,
];

const FALLBACK_TECHNICAL_BANK: Record<string, TechnicalTemplate[]> = {
  python: [
    {
      type: 'theory',
      focusArea: 'functional patterns',
      question: 'What is the key property of a lambda function in Python?',
      options: [
        'It creates a small anonymous function limited to a single expression',
        'It creates a named function with multiple statements',
        'It is used only for class definitions',
        'It automatically memoizes results',
      ],
      correctAnswer: 'It creates a small anonymous function limited to a single expression',
      explanation: 'Python lambda functions are anonymous and constrained to a single expression, which makes them useful in functional-style pipelines.',
      practicalExample: 'sorted(items, key=lambda item: item[1])',
    },
    {
      type: 'logical',
      focusArea: 'iterators',
      question: 'Why is a generator expression often preferred over a list comprehension for large streams in Python?',
      options: [
        'It yields values lazily and avoids storing the whole sequence in memory',
        'It always runs faster because it is compiled to C',
        'It can mutate tuples in place',
        'It removes the need for exception handling',
      ],
      correctAnswer: 'It yields values lazily and avoids storing the whole sequence in memory',
      explanation: 'Generator expressions are lazy iterators, which makes them memory-efficient when processing large data streams.',
      practicalExample: 'total = sum(x * x for x in range(10_000_000))',
    },
    {
      type: 'practical',
      focusArea: 'object model',
      question: 'What is the purpose of the __init__ method in a Python class?',
      options: [
        'It initializes instance state after the object has been created',
        'It allocates memory before the class exists',
        'It replaces __new__ in metaclasses',
        'It makes every method static by default',
      ],
      correctAnswer: 'It initializes instance state after the object has been created',
      explanation: '__init__ configures the new instance after object creation and is typically used to attach initial attributes.',
      practicalExample: 'class User:\n    def __init__(self, name):\n        self.name = name',
    },
    {
      type: 'theory',
      focusArea: 'language semantics',
      question: 'What is the difference between == and is in Python?',
      options: [
        '== compares values, while is compares object identity',
        'is compares values, while == compares memory addresses',
        'Both are identical except for strings',
        '== works only for numbers',
      ],
      correctAnswer: '== compares values, while is compares object identity',
      explanation: 'Use == for value equality and is when checking whether two references point to the same object.',
      practicalExample: 'a = [1]\nb = [1]\na == b  # True\na is b  # False',
    },
  ],
  javascript: [
    {
      type: 'theory',
      focusArea: 'closures',
      question: 'What makes a closure in JavaScript useful?',
      options: [
        'It lets a function retain access to variables from its lexical scope after the outer function returns',
        'It closes all pending network requests automatically',
        'It converts callback code into synchronous code',
        'It freezes objects created inside the function',
      ],
      correctAnswer: 'It lets a function retain access to variables from its lexical scope after the outer function returns',
      explanation: 'Closures preserve lexical scope, which is why they are common in encapsulation, currying, and async handlers.',
      practicalExample: 'function counter(){ let c = 0; return () => ++c; }',
    },
    {
      type: 'logical',
      focusArea: 'async runtime',
      question: 'Why can a Promise callback run after synchronous logs even if the Promise is already resolved?',
      options: [
        'Because Promise callbacks are queued as microtasks and run after the current call stack clears',
        'Because resolved Promises block the event loop',
        'Because await converts Promises into macrotasks',
        'Because console.log is asynchronous by default',
      ],
      correctAnswer: 'Because Promise callbacks are queued as microtasks and run after the current call stack clears',
      explanation: 'Promise resolution handlers are scheduled in the microtask queue, so they run after current synchronous work completes.',
      practicalExample: 'Promise.resolve().then(() => console.log(2));\nconsole.log(1);',
    },
    {
      type: 'practical',
      focusArea: 'prototypes',
      question: 'How does prototype-based inheritance work in JavaScript?',
      options: [
        'Objects delegate property lookup through the prototype chain',
        'Every object copies all parent properties at creation time',
        'Classes prevent inheritance from changing at runtime',
        'Inheritance exists only with the class keyword',
      ],
      correctAnswer: 'Objects delegate property lookup through the prototype chain',
      explanation: 'If a property is not found on the object itself, JavaScript looks up the prototype chain to resolve it.',
      practicalExample: 'const child = Object.create(parent);',
    },
    {
      type: 'theory',
      focusArea: 'binding',
      question: 'What does Function.prototype.bind return?',
      options: [
        'A new function with a fixed this value and optional preset arguments',
        'The original function after immediate execution',
        'A Promise resolving to the current context',
        'A proxy that blocks all argument changes',
      ],
      correctAnswer: 'A new function with a fixed this value and optional preset arguments',
      explanation: 'bind does not execute the function immediately; it returns a new callable with this and optional leading args preconfigured.',
      practicalExample: 'const clickHandler = save.bind(service, userId);',
    },
  ],
  sql: [
    {
      type: 'theory',
      focusArea: 'joins',
      question: 'What is the key behavior of a LEFT JOIN in SQL?',
      options: [
        'It returns all rows from the left table and matching rows from the right table',
        'It returns only rows that exist in both tables',
        'It removes nulls from the right table automatically',
        'It sorts the result by the join column',
      ],
      correctAnswer: 'It returns all rows from the left table and matching rows from the right table',
      explanation: 'LEFT JOIN preserves the left-side result set even when there is no matching right-side row.',
      practicalExample: 'SELECT * FROM users u LEFT JOIN orders o ON u.id = o.user_id;',
    },
    {
      type: 'logical',
      focusArea: 'aggregations',
      question: 'Why would HAVING be used instead of WHERE in an aggregate query?',
      options: [
        'Because HAVING filters grouped results after aggregation',
        'Because WHERE cannot reference columns',
        'Because HAVING is always faster than WHERE',
        'Because HAVING is required for ORDER BY',
      ],
      correctAnswer: 'Because HAVING filters grouped results after aggregation',
      explanation: 'WHERE filters rows before grouping, while HAVING filters the grouped output after aggregate functions have been computed.',
      practicalExample: 'SELECT dept, COUNT(*) FROM employees GROUP BY dept HAVING COUNT(*) > 5;',
    },
    {
      type: 'practical',
      focusArea: 'indexing',
      question: 'What is the main reason to add an index to a frequently filtered column?',
      options: [
        'To speed up data retrieval by improving lookup efficiency',
        'To guarantee alphabetical ordering of the table',
        'To reduce the number of tables in the schema',
        'To replace the need for primary keys',
      ],
      correctAnswer: 'To speed up data retrieval by improving lookup efficiency',
      explanation: 'Indexes optimize reads for search patterns, though they usually add write overhead and storage cost.',
      practicalExample: 'CREATE INDEX idx_users_email ON users(email);',
    },
  ],
  react: [
    {
      type: 'theory',
      focusArea: 'rendering model',
      question: 'Why must React state be treated as immutable during updates?',
      options: [
        'Because React relies on reference changes to detect updates predictably',
        'Because mutable state breaks JavaScript itself',
        'Because hooks can only store primitive values',
        'Because JSX forbids array changes',
      ],
      correctAnswer: 'Because React relies on reference changes to detect updates predictably',
      explanation: 'Immutable updates help React reconcile changes correctly and avoid stale or missed renders.',
      practicalExample: 'setItems((prev) => [...prev, nextItem]);',
    },
    {
      type: 'logical',
      focusArea: 'effects',
      question: 'What problem does the dependency array of useEffect primarily control?',
      options: [
        'When the effect re-runs based on values captured from render',
        'Whether state updates are batched on the server',
        'Whether JSX compiles to HTML or DOM nodes',
        'How React memoizes children automatically',
      ],
      correctAnswer: 'When the effect re-runs based on values captured from render',
      explanation: 'The dependency array tells React when the effect must be re-synchronized with new render values.',
      practicalExample: 'useEffect(() => { fetchUser(userId); }, [userId]);',
    },
    {
      type: 'practical',
      focusArea: 'keys',
      question: 'Why are stable keys important when rendering a list in React?',
      options: [
        'They help React preserve identity across reorders and updates',
        'They are required to make CSS selectors work',
        'They force a component to rerender on every state change',
        'They prevent asynchronous effects from running',
      ],
      correctAnswer: 'They help React preserve identity across reorders and updates',
      explanation: 'Stable keys prevent incorrect DOM reuse and state leakage when items move or change.',
      practicalExample: 'items.map((item) => <Row key={item.id} item={item} />)',
    },
  ],
};

const GENERIC_TECHNICAL_BLUEPRINTS = [
  {
    type: 'theory' as const,
    focusArea: 'core concept',
    question: (skill: string) => `Which statement best describes the core purpose of ${skill}?`,
    correct: (_skill: string) => `It provides a domain-specific capability that must be understood conceptually and applied correctly in implementation`,
    wrong: (_skill: string) => [
      `It is only valuable as a keyword on a resume and not in actual systems`,
      `It replaces the need to understand debugging or tradeoffs`,
      `It works the same way in every stack without domain-specific rules`,
    ],
    explanation: (skill: string) => `${skill} should be assessed on concepts, behavior, and implementation details rather than generic learning choices.`,
  },
  {
    type: 'logical' as const,
    focusArea: 'debugging',
    question: (skill: string) => `When diagnosing a bug in ${skill}, what is the strongest first principle?`,
    correct: (skill: string) => `Trace the real behavior, isolate the failing assumption, and verify how ${skill} behaves in that scenario`,
    wrong: (_skill: string) => [
      `Skip directly to rewriting the full feature without isolating the fault`,
      `Assume the framework is wrong before checking the local logic`,
      `Judge correctness only by whether the code compiles`,
    ],
    explanation: (skill: string) => `Strong technical assessment for ${skill} should check whether the candidate understands observable behavior and root-cause debugging.`,
  },
  {
    type: 'practical' as const,
    focusArea: 'implementation detail',
    question: (skill: string) => `Which approach best demonstrates practical depth in ${skill}?`,
    correct: (skill: string) => `Explaining the implementation details, tradeoffs, and failure modes while solving a concrete ${skill} problem`,
    wrong: (skill: string) => [
      `Reciting only definitions without describing behavior or constraints`,
      `Avoiding edge cases because they are handled by default`,
      `Treating ${skill} as interchangeable with unrelated tools`,
    ],
    explanation: (skill: string) => `Technical depth in ${skill} comes from understanding mechanics, tradeoffs, and edge cases in realistic use.`,
  },
];

function getDifficulty(input: SimulationInput): DifficultyLevel {
  const normalizedRole = input.currentRole.trim().toLowerCase();
  const averageSelfScore =
    input.skills.reduce((total, skill) => total + skill.selfScore, 0) / Math.max(input.skills.length, 1);

  if (normalizedRole === 'student') {
    return 'beginner';
  }

  if (averageSelfScore >= 75) {
    return 'advanced';
  }

  return 'intermediate';
}

function getBackendBaseUrl(): string {
  // NEXT_PUBLIC_API_URL is "https://.../api" — strip the trailing /api for the base host.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api\/?$/, '');
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildContext(input: SimulationInput): string {
  const skillSummary = input.skills
    .map((skill) => `${skill.name} (${skill.selfScore}% self-score)`)
    .join(', ');

  return [
    `Current Role: ${input.currentRole}`,
    `Target Role: ${input.targetRole}`,
    `Experience: ${input.experienceYears || 'Not provided'}`,
    `Current Salary: ${input.currentSalary || 'Not provided'}`,
    `Expected Salary: ${input.targetSalary || 'Not provided'}`,
    `Daily Learning Time: ${input.dailyLearningTime}`,
    `Skills: ${skillSummary}`,
    `Resume Extract: ${input.resumeText || 'No resume text available.'}`,
  ].join('\n');
}

function normalizeSkillName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCaseSkill(name: string): string {
  return name
    .split(' ')
    .map((chunk) => (chunk ? chunk[0].toUpperCase() + chunk.slice(1) : chunk))
    .join(' ');
}

function inferRoleFallbackSkills(targetRole: string): string[] {
  const role = targetRole.toLowerCase();

  if (role.includes('frontend')) {
    return ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS'];
  }
  if (role.includes('backend')) {
    return ['Node.js', 'API Design', 'SQL', 'System Design', 'Testing'];
  }
  if (role.includes('data')) {
    return ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization'];
  }
  if (role.includes('devops')) {
    return ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud'];
  }

  return ['Problem Solving', 'System Design', 'Communication'];
}

function mergeDerivedSkills(
  userSkills: SkillProfile[],
  requiredSkillNames: string[],
): SkillProfile[] {
  const byKey = new Map<string, SkillProfile>();

  for (const skill of userSkills) {
    const key = normalizeSkillName(skill.name);
    if (!key) {
      continue;
    }
    byKey.set(key, {
      name: titleCaseSkill(skill.name.trim()),
      selfScore: Math.max(0, Math.min(100, Math.round(skill.selfScore))),
    });
  }

  for (const skillName of requiredSkillNames) {
    const key = normalizeSkillName(skillName);
    if (!key || byKey.has(key)) {
      continue;
    }

    // Required skills inferred by AI are added with a neutral baseline score.
    byKey.set(key, {
      name: titleCaseSkill(skillName.trim()),
      selfScore: 55,
    });
  }

  return Array.from(byKey.values()).slice(0, 8);
}

async function analyzeProfileWithGemini(input: SimulationInput): Promise<ProfileAnalysisResponse | null> {
  try {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('careersync_token') || localStorage.getItem('Career_Sync_token')
        : null;
    const response = await fetch(`${getBackendBaseUrl()}/api/skills/analyze-profile`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        currentRole: input.currentRole,
        targetRole: input.targetRole,
        userSkills: input.skills.map((skill) => ({ name: skill.name, selfScore: skill.selfScore })),
        resumeText: input.resumeText || '',
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ProfileAnalysisResponse;
    return payload || null;
  } catch (_error) {
    return null;
  }
}

function allocateQuestionCounts(total: number, skills: SkillProfile[]): Array<{ skill: SkillProfile; count: number }> {
  const activeSkills = skills.length > 0 ? skills : [{ name: 'General', selfScore: 60 }];
  const baseCount = Math.floor(total / activeSkills.length);
  let remainder = total % activeSkills.length;

  return activeSkills.map((skill) => {
    const count = baseCount + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);
    return { skill, count };
  });
}

function interleaveQuestions(grouped: AssessmentQuestion[][]): AssessmentQuestion[] {
  const output: AssessmentQuestion[] = [];
  const queues = grouped.map((items) => [...items]);

  while (queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      if (queue.length > 0) {
        output.push(queue.shift() as AssessmentQuestion);
      }
    }
  }

  return output.slice(0, 20).map((question, index) => ({
    ...question,
    id: `q-${index + 1}`,
  }));
}

function buildQuestionKey(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function takeUniqueQuestions(
  pool: AssessmentQuestion[],
  maxCount: number,
  seenKeys: Set<string>,
): AssessmentQuestion[] {
  const selected: AssessmentQuestion[] = [];

  for (const question of pool) {
    if (selected.length >= maxCount) {
      break;
    }

    const key = buildQuestionKey(question.prompt);
    if (!key || seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    selected.push(question);
  }

  return selected;
}

function createEmergencyUniqueQuestion(skill: string, serial: number, difficulty: DifficultyLevel): AssessmentQuestion {
  const prompt = `In ${skill}, solve scenario ${serial}: identify the bug, fix it, and explain why your fix is correct.`;
  const correctAnswer = `Isolate the root cause, apply a standards-compliant fix, and validate with a reproducible test for ${skill}.`;

  return {
    id: `emergency-${skill}-${serial}`,
    prompt,
    options: sanitizeOptions(correctAnswer, [
      `Change syntax without validating behavior in ${skill}`,
      'Rewrite everything from scratch with no regression checks',
      'Ignore the root cause and patch only visible symptoms',
    ]),
    correctAnswer,
    explanation: `The best response is to diagnose first, implement the smallest reliable fix, and prove correctness with tests in ${skill}.`,
    type: 'practical',
    sourceSkill: skill,
    focusArea: `${difficulty} debugging and validation`,
  };
}

function sanitizeOptions(correct: string, options?: string[]): string[] {
  const baseOptions = Array.isArray(options) ? options.filter(Boolean) : [];
  const merged = [correct, ...baseOptions].filter(Boolean);
  const unique = Array.from(new Set(merged));

  while (unique.length < 4) {
    unique.push(`Plausible but incomplete choice ${unique.length}`);
  }

  return unique.slice(0, 4);
}

function inferSkill(prompt: string, skills: SkillProfile[], index: number): string {
  const promptLower = prompt.toLowerCase();
  const directMatch = skills.find((skill) => promptLower.includes(skill.name.toLowerCase()));
  if (directMatch) {
    return directMatch.name;
  }

  return skills[index % skills.length].name;
}

function normalizeQuestions(
  questions: BackendQuestion[],
  input: SimulationInput,
  difficulty: DifficultyLevel,
  forcedSkill?: string,
): AssessmentQuestion[] {
  return questions.slice(0, 20).map((question, index) => {
    const prompt = question.question?.trim() || `Question ${index + 1}`;
    const sourceSkill = forcedSkill || inferSkill(prompt, input.skills, index);
    const correctAnswer = question.correctAnswer?.trim() || 'Applying the skill with clear reasoning';

    return {
      id: `q-${index + 1}`,
      prompt,
      options: sanitizeOptions(correctAnswer, question.options),
      correctAnswer,
      explanation:
        question.explanation?.trim() ||
        `${sourceSkill} questions in this assessment are tied back to your target role and the evidence available in the resume.`,
      practicalExample: question.practicalExample?.trim(),
      type: question.type || 'theory',
      sourceSkill,
      focusArea: `${difficulty} application`,
    };
  });
}

function buildFallbackQuestionsForSkill(skill: string, count: number, difficulty: DifficultyLevel): AssessmentQuestion[] {
  const normalizedSkill = skill.trim().toLowerCase();
  const bank = FALLBACK_TECHNICAL_BANK[normalizedSkill] || [];
  const questions: AssessmentQuestion[] = [];

  for (let index = 0; index < count; index += 1) {
    const template = bank[index % bank.length];

    if (template) {
      questions.push({
        id: `fallback-${normalizedSkill}-${index + 1}`,
        prompt: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        practicalExample: template.practicalExample,
        type: template.type,
        sourceSkill: skill,
        focusArea: `${difficulty} ${template.focusArea}`,
      });
      continue;
    }

    const generic = GENERIC_TECHNICAL_BLUEPRINTS[index % GENERIC_TECHNICAL_BLUEPRINTS.length];
    const correct = generic.correct(skill);
    questions.push({
      id: `fallback-${normalizedSkill}-${index + 1}`,
      prompt: generic.question(skill),
      options: sanitizeOptions(correct, generic.wrong(skill)),
      correctAnswer: correct,
      explanation: generic.explanation(skill),
      type: generic.type,
      sourceSkill: skill,
      focusArea: `${difficulty} ${generic.focusArea}`,
    });
  }

  return questions;
}

export async function generateAssessmentSession(input: SimulationInput): Promise<AssessmentSession> {
  const difficulty = getDifficulty(input);
  const profileAnalysis = await analyzeProfileWithGemini(input);

  const aiRequiredSkills = (profileAnalysis?.requiredSkills || [])
    .map((item) => item?.name?.trim() || '')
    .filter(Boolean);

  const fallbackRoleSkills = inferRoleFallbackSkills(input.targetRole);
  const mergedSkillProfiles = mergeDerivedSkills(input.skills, [...aiRequiredSkills, ...fallbackRoleSkills]);

  const context = [
    buildContext({ ...input, skills: mergedSkillProfiles }),
    `AI Required Skills: ${aiRequiredSkills.length > 0 ? aiRequiredSkills.join(', ') : 'Not available'}`,
    `Resume Insights: ${profileAnalysis?.resumeInsights?.summary || 'Not available'}`,
    `Resume Observed Skills: ${(profileAnalysis?.resumeInsights?.observedSkills || []).join(', ') || 'Not available'}`,
    `Resume Missing Skills: ${(profileAnalysis?.resumeInsights?.missingSkills || []).join(', ') || 'Not available'}`,
  ].join('\n');

  const skillAllocations = allocateQuestionCounts(20, mergedSkillProfiles);
  const groupedQuestions: AssessmentQuestion[][] = [];
  const globalSeenKeys = new Set<string>();
  let emergencySerial = 1;

  for (const allocation of skillAllocations) {
    const normalizedFromBackend: AssessmentQuestion[] = [];

    try {
      const response = await fetch(`${getBackendBaseUrl()}/api/skills/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillName: allocation.skill.name,
          difficulty,
          questionCount: allocation.count,
          context: `${context}\nFocus Skill: ${allocation.skill.name}\nAssessment Rule: Ask technical, in-depth questions on this skill only. Avoid questions about choosing skills or generic learning habits.`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Question generation failed with status ${response.status}`);
      }

      const payload = await response.json();
      const normalized = normalizeQuestions(
        payload.questions || [],
        { ...input, skills: mergedSkillProfiles },
        difficulty,
        allocation.skill.name,
      );

      normalizedFromBackend.push(...normalized);
    } catch (error) {
      console.warn(`Falling back to local question generation for ${allocation.skill.name}:`, error);
    }

    // Blend backend + fallback pools, then strictly dedupe against global set.
    const fallbackPool = buildFallbackQuestionsForSkill(
      allocation.skill.name,
      Math.max(allocation.count * 4, 8),
      difficulty,
    );

    const blendedPool = [...normalizedFromBackend, ...fallbackPool];
    const uniqueForSkill = takeUniqueQuestions(blendedPool, allocation.count, globalSeenKeys);

    while (uniqueForSkill.length < allocation.count) {
      const emergency = createEmergencyUniqueQuestion(allocation.skill.name, emergencySerial, difficulty);
      emergencySerial += 1;

      const picked = takeUniqueQuestions([emergency], 1, globalSeenKeys);
      if (picked.length === 0) {
        continue;
      }

      uniqueForSkill.push(picked[0]);
    }

    groupedQuestions.push(uniqueForSkill);
  }

  const interleavedQuestions = interleaveQuestions(groupedQuestions);

  // Final safety net: enforce global uniqueness again after interleave and refill if needed.
  const finalSeen = new Set<string>();
  const finalUnique = takeUniqueQuestions(interleavedQuestions, 20, finalSeen);

  if (finalUnique.length < 20) {
    const refillPool = skillAllocations.flatMap((allocation) =>
      buildFallbackQuestionsForSkill(allocation.skill.name, 20, difficulty),
    );
    finalUnique.push(...takeUniqueQuestions(refillPool, 20 - finalUnique.length, finalSeen));
  }

  while (finalUnique.length < 20) {
    const skillName = skillAllocations[finalUnique.length % skillAllocations.length]?.skill.name || 'General';
    const emergency = createEmergencyUniqueQuestion(skillName, emergencySerial, difficulty);
    emergencySerial += 1;
    const picked = takeUniqueQuestions([emergency], 1, finalSeen);
    if (picked.length === 0) {
      continue;
    }
    finalUnique.push(picked[0]);
  }

  const technicalQuestions = finalUnique.slice(0, 20).map((question, index) => ({
    ...question,
    id: `q-${index + 1}`,
  }));

  return {
    title: `${input.targetRole} Skill Assessment`,
    difficulty,
    generatedAt: new Date().toISOString(),
    questions: technicalQuestions,
    derivedSkills: mergedSkillProfiles,
    profileInsights: {
      summary:
        profileAnalysis?.resumeInsights?.summary ||
        `Assessment enriched using role requirements and resume evidence for ${input.targetRole}.`,
      observedSkills: profileAnalysis?.resumeInsights?.observedSkills || [],
      missingSkills: profileAnalysis?.resumeInsights?.missingSkills || [],
      highlights: profileAnalysis?.resumeInsights?.highlights || [],
    },
  };
}

function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function analyzeResumeEvidence(input: SimulationInput): ResumeEvidence {
  const resumeText = input.resumeText?.trim() || '';
  if (!resumeText) {
    return {
      evidenceScore: 25,
      projectMentions: 0,
      impactMentions: 0,
      skillMentions: [],
      highlights: ['No resume evidence was uploaded, so the project signal score is conservative.'],
      wordCount: 0,
      hasEducation: false,
      hasExperience: false,
      hasCertifications: false,
      extractedSections: [],
    };
  }

  const normalizedText = resumeText.toLowerCase();
  const wordCount = resumeText.trim().split(/\s+/).length;

  // Detect sections
  const hasExperience = /\b(experience|work history|employment|internship|position held|professional background)\b/i.test(resumeText);
  const hasEducation = /\b(education|degree|university|college|bachelor|master|b\.tech|m\.tech|b\.e|m\.e|phd|higher secondary|secondary school)\b/i.test(resumeText);
  const hasCertifications = /\b(certif|certified|credential|coursera|udemy|aws certified|google certified|microsoft certified|linkedin learning)\b/i.test(resumeText);
  const hasProjects = /\b(project|github|portfolio|demo|deployed|built|developed|created)\b/i.test(resumeText);
  const hasSkillsSection = /\b(skills|technologies|tech stack|tools|programming languages|frameworks)\b/i.test(resumeText);
  const hasSummary = /\b(summary|objective|profile|about me|professional summary)\b/i.test(resumeText);

  const extractedSections: string[] = [];
  if (hasExperience) extractedSections.push('Work Experience');
  if (hasEducation) extractedSections.push('Education');
  if (hasCertifications) extractedSections.push('Certifications');
  if (hasProjects) extractedSections.push('Projects');
  if (hasSkillsSection) extractedSections.push('Skills');
  if (hasSummary) extractedSections.push('Summary');

  const projectMentions = PROJECT_KEYWORDS.reduce((count, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    return count + countMatches(normalizedText, regex);
  }, 0);

  const impactMentions = IMPACT_PATTERNS.reduce(
    (count, pattern) => count + countMatches(resumeText, pattern),
    0,
  );

  const skillMentions = input.skills
    .map((skill) => skill.name)
    .filter((skillName) => normalizedText.includes(skillName.toLowerCase()));

  // Scoring: comprehensive formula
  const skillCoverageScore = (skillMentions.length / Math.max(input.skills.length, 1)) * 40;
  const projectScore = Math.min(projectMentions, 8) * 3;          // max 24
  const impactScore = Math.min(impactMentions, 6) * 4;            // max 24
  const sectionBonus = Math.min(extractedSections.length, 5) * 2; // max 10
  const certBonus = hasCertifications ? 5 : 0;
  const lengthBonus = wordCount >= 150 && wordCount <= 1500 ? 5 : wordCount >= 80 ? 2 : 0;
  const evidenceScore = clampScore(skillCoverageScore + projectScore + impactScore + sectionBonus + certBonus + lengthBonus + 10);

  const highlights: string[] = [];

  if (wordCount > 0) {
    highlights.push(`Resume contains ${wordCount} words spanning ${extractedSections.length} detected section${extractedSections.length !== 1 ? 's' : ''}.`);
  }
  if (extractedSections.length > 0) {
    highlights.push(`Sections found: ${extractedSections.join(', ')}.`);
  }
  if (skillMentions.length > 0) {
    highlights.push(`${skillMentions.length} of your declared skills (${skillMentions.join(', ')}) appear in the resume.`);
  } else {
    highlights.push('None of your declared skills were found in the resume text. Add them explicitly.');
  }
  if (projectMentions > 0) {
    highlights.push(`${projectMentions} project or ownership keywords detected in the resume.`);
  } else {
    highlights.push('Project ownership keywords (built, developed, deployed…) were not found. Add project descriptions.');
  }
  if (impactMentions > 0) {
    highlights.push(`${impactMentions} measurable impact signals found (numbers, percentages, results).`);
  } else {
    highlights.push('No quantified outcomes detected. Add metrics like "reduced load time by 40%" to increase credibility.');
  }
  if (hasCertifications) {
    highlights.push('Certification signals detected — a strong differentiator for recruiters.');
  }

  return {
    evidenceScore,
    projectMentions,
    impactMentions,
    skillMentions,
    highlights,
    wordCount,
    hasEducation,
    hasExperience,
    hasCertifications,
    extractedSections,
  };
}

function getResumeScoreForSkill(skill: string, resumeEvidence: ResumeEvidence): number {
  if (resumeEvidence.skillMentions.includes(skill)) {
    return clampScore(70 + Math.min(resumeEvidence.projectMentions, 3) * 8);
  }

  if (resumeEvidence.projectMentions > 0) {
    return 45;
  }

  return 25;
}

export function calculateAssessmentReport(
  input: SimulationInput,
  session: AssessmentSession,
  answers: Record<string, string>,
): AssessmentReport {
  const resumeEvidence = analyzeResumeEvidence(input);

  if (session.profileInsights?.highlights && session.profileInsights.highlights.length > 0) {
    const mergedHighlights = [...resumeEvidence.highlights, ...session.profileInsights.highlights]
      .filter(Boolean)
      .filter((value, idx, arr) => arr.indexOf(value) === idx)
      .slice(0, 10);

    resumeEvidence.highlights = mergedHighlights;
  }

  const questionOutcomes: QuestionOutcome[] = session.questions.map((question) => ({
    questionId: question.id,
    sourceSkill: question.sourceSkill,
    selectedAnswer: answers[question.id] || '',
    isCorrect: answers[question.id] === question.correctAnswer,
  }));

  const correctCount = questionOutcomes.filter((result) => result.isCorrect).length;
  const assessmentScore = clampScore((correctCount / Math.max(session.questions.length, 1)) * 100);
  const selfScoreAverage = clampScore(
    input.skills.reduce((total, skill) => total + skill.selfScore, 0) / Math.max(input.skills.length, 1),
  );

  const scoreBreakdown: SkillScoreBreakdown[] = input.skills.map((skill) => {
    const skillOutcomes = questionOutcomes.filter((question) => question.sourceSkill === skill.name);
    const correctForSkill = skillOutcomes.filter((question) => question.isCorrect).length;
    const assessedScore = skillOutcomes.length
      ? clampScore((correctForSkill / skillOutcomes.length) * 100)
      : assessmentScore;
    const resumeScore = getResumeScoreForSkill(skill.name, resumeEvidence);
    const combinedScore = clampScore(assessedScore * 0.5 + skill.selfScore * 0.3 + resumeScore * 0.2);

    return {
      skill: skill.name,
      selfScore: skill.selfScore,
      assessedScore,
      resumeScore,
      combinedScore,
      questionCount: skillOutcomes.length,
      correctCount: correctForSkill,
    };
  });

  const resumeScore = resumeEvidence.evidenceScore;
  const finalScore = clampScore(assessmentScore * 0.55 + selfScoreAverage * 0.25 + resumeScore * 0.2);

  const strengths = scoreBreakdown
    .filter((item) => item.combinedScore >= 70)
    .sort((left, right) => right.combinedScore - left.combinedScore)
    .slice(0, 3)
    .map((item) => item.skill);

  const priorities = scoreBreakdown
    .sort((left, right) => left.combinedScore - right.combinedScore)
    .slice(0, 3)
    .map((item) => item.skill);

  const recommendations = [
    strengths.length > 0
      ? `Anchor your next applications around ${strengths[0]} because it is your strongest validated signal.`
      : `Build one visible project aligned to ${input.targetRole} to create stronger evidence.` ,
    priorities.length > 0
      ? `Create a two-week drill for ${priorities[0]} using your daily ${input.dailyLearningTime} commitment.`
      : `Increase assessment coverage by answering more skill-specific exercises.` ,
    resumeEvidence.impactMentions > 0
      ? 'Keep the quantified impact statements in your resume; they are improving project credibility.'
      : 'Add measurable outcomes to each project in the resume so recruiters can see the weight of your work.',
  ];

  let readinessLabel = 'Foundation Stage';
  if (finalScore >= 80) {
    readinessLabel = 'Interview Ready';
  } else if (finalScore >= 65) {
    readinessLabel = 'Market Building';
  } else if (finalScore >= 50) {
    readinessLabel = 'Growth Mode';
  }

  return {
    answeredCount: Object.keys(answers).length,
    correctCount,
    assessmentScore,
    selfScoreAverage,
    resumeScore,
    finalScore,
    readinessLabel,
    scoreBreakdown,
    resumeEvidence,
    strengths,
    priorities,
    recommendations,
    questionOutcomes,
  };
}