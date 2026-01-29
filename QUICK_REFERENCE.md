# Dynamic Module Generation - Quick Reference

## Module Count Formula
```
Base: min(experience) = beginner ? 4 : 5
Module Count = Math.min(Math.max(minModules, ⌈timelineWeeks/2⌉ + numInterests), 12)
```

## Timeline Mapping
| Input | Weeks | Example Modules |
|-------|-------|-----------------|
| 1 week | 1 | 4-5 |
| 2 weeks | 2 | 5-6 |
| 1 month | 4 | 6-8 |
| 3 months | 12 | 10-12 |

## Module Structure

### Always Generated
- **Module 1:** Getting Started / Introduction
- **Final Module:** Capstone / Advanced Mastery
- **Middle Modules:** Interest-focused deep dives

### Module Naming Pattern
```
Module 1:  "Getting Started with [Topic]" (beginner)
          OR "Introduction to [Topic]" (advanced)

Modules 2-N: "Deep Dive: [Interest] with [Topic] (Part X)"

Final:     "Advanced Mastery & Industry Patterns" (advanced)
          OR "Capstone Project & Next Steps" (beginner)
```

## Learning Style Matching

| Style | Activities |
|-------|-----------|
| Visual | Video tutorials, diagrams, flowcharts |
| Hands-on | Code-along, mini-projects, practice |
| Reading | Documentation, case studies, examples |

## Experience Adaptation

| Experience | First Module | Capstone | Duration per Module |
|------------|-------------|----------|-------------------|
| Beginner | Full foundations | 1 week project | 1-2 weeks setup, 5-7 days middle |
| Advanced | Refresh essentials | Industry patterns | 3-5 days setup, 5-7 days middle |

## Dynamic Content Examples

**Input:** Python, Beginner, 1 week, 2 interests (Web & Data)
- Module Count: 5
- **Module 1:** Getting Started with Python
- **Module 2:** Deep Dive: Web with Python (Part 1)
- **Module 3:** Deep Dive: Data with Python (Part 1)
- **Module 4:** Deep Dive: Web with Python (Part 2) [rotates interests]
- **Module 5:** Capstone Project & Next Steps

**Input:** JavaScript, Advanced, 3 months, 3 interests (React, Node, DevOps)
- Module Count: 12
- **Module 1:** Introduction to JavaScript
- **Modules 2-5:** React, Node, DevOps, React
- **Modules 6-9:** Node, DevOps, React, Node  
- **Modules 10-11:** DevOps, React
- **Module 12:** Advanced Mastery & Industry Patterns

## Implementation Files

### Main File
[app/api/generate-course/route.ts](app/api/generate-course/route.ts)

### Key Functions
1. `generateModuleTemplate()` - Creates all module objects
2. `getModuleDuration()` - Sets realistic timelines
3. `generateTopics()` - Lists module topics
4. `generateActivities()` - Matches learning style
5. `generateProject()` - Creates module projects
6. `generateAssessment()` - Determines assessment type

## Prompt Features

The AI prompt now receives:
- ✅ Exact module count to generate
- ✅ User's timeline and experience level
- ✅ All stated interests and learning goals
- ✅ Preferred learning style
- ✅ Daily time commitment
- ✅ Progress tracking preference
- ✅ Real URL requirement (no placeholders)

## Testing Checklist

- [ ] Beginner, 1 week, 2 interests → 5 modules
- [ ] Beginner, 1 month, 3 interests → 7 modules
- [ ] Intermediate, 2 weeks, 1 interest → 6 modules
- [ ] Advanced, 3 months, 3 interests → 12 modules (max)
- [ ] Each module title is unique and specific
- [ ] Each interest appears in at least one module
- [ ] Module durations sum to approximately user's timeline
- [ ] Activities match learning style
- [ ] Final project reflects all modules

## API Model
- **Model:** mistralai/mixtral-8x7b-instruct
- **Timeout:** 120s (higher quality, slower generation)
- **Max Tokens:** 1800
- **Temperature:** 0.7

## Success Indicators

When a course is generated, look for:
1. **Module Count:** Should be 4-12, matching formula
2. **Module Titles:** Specific to topic and user interests
3. **Module Descriptions:** Personalized, not generic templates
4. **Activities:** Matched to learning style choice
5. **Projects:** Appropriate to skill level and timeline
6. **Resources:** Real URLs, not placeholders
