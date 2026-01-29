# Reading Materials - Quick Check List

## How to Verify Reading Materials are Working

### 1. Generate a New Course
1. Go to the course generation page
2. Enter a topic (e.g., "Python Programming", "Web Development", "JavaScript")
3. Answer all personalization questions
4. Click "Generate Course"

### 2. Open Browser Developer Tools
- Press **F12** or **Right-click → Inspect**
- Go to **Console** tab
- Look for these logs in order:

#### Step 1: Course Generation API
```
=== SUCCESS ===
Course modules count: 8
First module has reading materials: true
Reading materials count: 4
```

#### Step 2: Storing Course Data
```
📚 Modules count: 8
📚 First module has reading materials: true
📚 Reading materials count: 4
Storing course in localStorage...
Course stored. Data length: xxxxx
Navigating to: /course-generated/xxxxx
```

#### Step 3: Course Overview Page Loads
```
📚 Course loaded. Modules: 8
📚 First module has reading materials: true
📚 Reading materials count: 4
```

#### Step 4: Storing Module Data
When you click "Start Module", you should see:
```
💾 Storing module data: {
  moduleNumber: 1,
  courseId: "...",
  moduleTitle: "Module 1: ...",
  hasReadingMaterials: true,
  readingMaterialsCount: 4
}
```

#### Step 5: Lesson Viewer Loads Module
```
📚 Reading materials in module: 4
```

---

## If You Don't See These Logs

### ❌ Reading materials NOT in API response
- **Check**: Network tab → `/api/generate-course` → Response
- **Look for**: `"readingMaterials"` field in modules
- **Solution**: API might not be generating them properly

### ❌ Reading materials in API but NOT in localStorage
- **Check**: Do you see the storage logs in Console?
- **Solution**: The course data might not be saved properly

### ❌ All logs look good but materials not displaying
- **Check**: Hard refresh (Ctrl+Shift+R)
- **Check**: Clear localStorage and regenerate
- **Solution**: Browser cache issue

---

## What You Should See on Each Page

### Course Overview Page (`/course-generated/[id]`)
For each module, scroll down and look for:

**BLUE BOX** (Module Project)
- Title: "Module Project"
- Color: Light blue background

**AMBER/GOLD BOX** (Reading Materials) ← This is what's missing
- Title: "Recommended Reading Materials"
- Color: Light amber/gold background
- Should contain 4 links to:
  - GeeksforGeeks
  - Official Documentation
  - Medium
  - Dev.to

### Lesson Page (`/course/[slug]/topic/[topicId]`)
At the top, you should see **TWO TABS**:
- 📺 Video Tutorial (default)
- 📚 Reading Materials (4) ← Click this to see resources

At the bottom (above "Back to Course" button), you should see:
- AMBER BOX: "Recommended Learning Materials"
- 4 resource links

---

## Troubleshooting Steps

### Step 1: Hard Refresh
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Step 2: Clear Everything
1. DevTools → Application tab
2. Click "Local Storage"
3. Click "Clear site data"
4. Refresh the page
5. Generate a new course

### Step 3: Check localStorage Manually
1. DevTools → Application tab
2. Click "Local Storage"
3. Look for `generatedCourse` key
4. The value should contain JSON with `modules` array
5. Each module should have `readingMaterials` array with 4 items

### Step 4: Generate Fresh Course
1. Use a different topic name
2. Answer all questions differently
3. Watch console logs appear in real-time

---

## Files That Generate Reading Materials

### API Generation: 
- **File**: `app/api/generate-course/route.ts`
- **Function**: `generateReadingMaterials(moduleTopic, moduleNum, difficulty)`
- **Lines**: 23-43 (function definition)
- **Lines**: 246-250 (post-processing to ensure all modules have materials)

### Course Overview Display:
- **File**: `app/(main)/course-generated/[id]/page.tsx`
- **Condition**: `module.readingMaterials && module.readingMaterials.length > 0`
- **Lines**: 338-380 (rendering the amber box)

### Lesson Viewer Display:
- **File**: `app/(main)/course/[slug]/topic/[topicId]/page.tsx`
- **Tab Toggle**: Lines 243-261 (tabs)
- **Reading Materials Tab**: Lines 318-401 (tab content)
- **Bottom Section**: Lines 475-524 (recommended materials)

---

## Expected Reading Material Format

```json
{
  "title": "GeeksforGeeks - Python Programming",
  "source": "GeeksforGeeks",
  "url": "https://www.geeksforgeeks.org/search/?q=Python%20Programming",
  "difficulty": "beginner",
  "estimatedReadTime": "20 mins"
}
```

Each module should have 4 materials:
1. GeeksforGeeks
2. Official Documentation  
3. Medium Tutorial
4. Dev.to Guide

---

## Report Issues With These Details

If reading materials still don't appear, share:
1. **Browser Console logs** (screenshot or copy-paste)
2. **Network tab response** from `/api/generate-course`
3. **localStorage data** (DevTools → Application → Local Storage → generatedCourse)
4. **Topic used** to generate the course
5. **All answers** you provided during personalization

This will help debug exactly where the issue is!
