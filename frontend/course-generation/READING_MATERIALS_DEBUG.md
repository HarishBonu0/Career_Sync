# Reading Materials - Debugging Guide

## Issue: Learning Materials Not Visible

### Step 1: Verify API is Generating Reading Materials
1. Open **Browser DevTools** (F12)
2. Go to **Network** tab
3. Generate a new course
4. Find the API call to `/api/generate-course`
5. Click on it and check the **Response** tab
6. Look for `readingMaterials` in the module objects
7. **Expected**: Each module should have a `readingMaterials` array with 4 items

```json
{
  "modules": [
    {
      "id": 1,
      "title": "Module 1: ...",
      "readingMaterials": [
        {
          "title": "GeeksforGeeks - ...",
          "source": "GeeksforGeeks",
          "url": "...",
          "difficulty": "beginner",
          "estimatedReadTime": "20 mins"
        },
        // ... 3 more materials
      ]
    }
  ]
}
```

### Step 2: Check Course Overview Page
1. Navigate to `/course-generated/[courseId]`
2. Open **Browser Console** (F12 → Console tab)
3. Look for logs like: `💾 Storing module data: { moduleNumber: 1, hasReadingMaterials: true, readingMaterialsCount: 4 }`
4. **If you see this**: Reading materials are in the module data ✅
5. **If you DON'T see this**: The API response doesn't include reading materials ❌

### Step 3: Check Reading Materials Display
1. On the course overview page, scroll down through each module
2. After the **blue "Module Project"** box, you should see an **amber "Recommended Reading Materials"** box
3. Each box should contain links like:
   - "GeeksforGeeks - [Module Topic]"
   - "[Module Topic] - Official Documentation"
   - "[Module Topic] Tutorial - Medium"
   - "[Module Topic] Guide - Dev.to"

### Step 4: Check Lesson Viewer Page
1. Click "Start Module" on any module
2. On the lesson page, you should see **two tabs** at the top:
   - 📺 Video Tutorial (default)
   - 📚 Reading Materials ([number])
3. Click the **Reading Materials** tab
4. You should see a list of resources to choose from
5. Select one to view in an embedded reader

### Step 5: Check Browser Console for Errors
1. Open DevTools Console (F12)
2. Look for any errors in red
3. Look for our custom logs:
   - API logs: `=== SUCCESS ===`, `Course modules count:`, `First module has reading materials:`
   - Course overview logs: `💾 Storing module data:`
   - Lesson viewer logs: `📚 Reading materials in module:`

---

## Common Issues & Solutions

### Issue: No reading materials at all

**Cause**: API response doesn't include `readingMaterials` field

**Solution**: 
1. Check if the API prompt was updated to request reading materials
2. The prompt should ask for "readingMaterials" array in each module
3. Verify the `generateReadingMaterials()` helper function is being called

### Issue: Reading materials only show sometimes

**Cause**: AI-generated courses might not include reading materials

**Solution**: The API now has a post-processing step that adds reading materials to any module missing them:
```typescript
if (!module.readingMaterials || !Array.isArray(module.readingMaterials) || module.readingMaterials.length === 0) {
  return {
    ...module,
    readingMaterials: generateReadingMaterials(moduleTopic, idx + 1, experience)
  }
}
```

### Issue: Reading materials show but with broken URLs

**Cause**: The URLs are template URLs (like `https://docs.example.com/...`)

**Solution**: Replace with real URLs in the `generateReadingMaterials()` function:
- GeeksforGeeks: `https://www.geeksforgeeks.org/search/?q={topic}` ✅
- Medium: `https://medium.com/search?q={topic}` ✅  
- Dev.to: `https://dev.to/search?q={topic}` ✅
- Official Docs: Replace `docs.example.com` with actual docs domain

---

## File Locations

- **API**: `app/api/generate-course/route.ts`
- **Course Overview**: `app/(main)/course-generated/[id]/page.tsx`
- **Lesson Viewer**: `app/(main)/course/[slug]/topic/[topicId]/page.tsx`

---

## Console Logs to Watch For

### In API (server console):
```
=== SUCCESS ===
Course modules count: 8
First module has reading materials: true
Reading materials count: 4
```

### In Course Overview Page:
```
💾 Storing module data: {
  moduleNumber: 1,
  courseId: "abc123...",
  moduleTitle: "Module 1: ...",
  hasReadingMaterials: true,
  readingMaterialsCount: 4
}
```

### In Lesson Viewer Page:
```
📦 Module data found: { ... }
📚 Reading materials in module: 4
```

---

## Next Steps if Still Not Working

1. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache** (DevTools → Application → Clear site data)
3. **Check localStorage**: In DevTools → Application → Local Storage → Look for `module_1`, `module_2`, etc.
4. **Generate a new course** to ensure you have fresh data
5. **Check all console logs** for errors

---

## What Should You See?

### Course Overview Page
Each module should display:
1. Module number badge
2. Module title
3. Module description
4. Topics & Activities grid
5. **Blue "Module Project"** box
6. **Amber "Recommended Reading Materials"** box with 4 resource links
7. "Start Module" button

### Lesson Viewer Page
You should see:
1. **Two tabs** at the top: 📺 Video Tutorial | 📚 Reading Materials
2. Video player with YouTube video
3. Lesson content (Overview, Topics, Activities, etc.)
4. **Blue "Project"** box
5. **Amber "Recommended Learning Materials"** box with resource links
6. "Back to Course" button

