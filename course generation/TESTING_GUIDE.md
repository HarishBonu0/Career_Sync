# Testing Guide - Course Generation Module

## Overview
This guide will help you test all components of the Course Generation Module.

## 🧪 Pre-Testing Checklist

- [ ] Node.js installed (v18 or higher)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured with OpenRouter API key
- [ ] Development server running (`npm run dev`)

## 📝 Test Cases

### 1. Course Generation Flow (E2E)

#### Test 1.1: Complete Course Generation
**Steps:**
1. Navigate to http://localhost:3000/home
2. Enter topic: "Machine Learning"
3. Click search or press Enter
4. Should redirect to `/generate/Machine%20Learning`

**Expected Result:**
- ✅ Page loads with first question
- ✅ Progress bar shows "1/4 - Start"
- ✅ Question is personalized with topic name

#### Test 1.2: Answer Questions
**Steps:**
1. Question 1 (Name):
   - Enter your name: "Alex"
   - Click arrow button or press Enter
2. Question 2-9: Select options
3. Question 10: Optional - skip or enter text

**Expected Result:**
- ✅ Each answer advances to next question
- ✅ Progress bar updates
- ✅ Previous answers are remembered
- ✅ "Go back" button works

#### Test 1.3: Review Page
**Steps:**
1. Complete all questions
2. Review page should appear

**Verify:**
- ✅ Shows "3/4 - Review" in progress
- ✅ Displays conversational summary
- ✅ Uses your name in text
- ✅ Summarizes all answers
- ✅ "Start Over" button works
- ✅ "Next" button is enabled

#### Test 1.4: Course Generation
**Steps:**
1. Click "Next" on review page

**Expected Result:**
- ✅ Loading screen appears
- ✅ Shows animated spinner
- ✅ Message: "Creating Your Personalized Course"
- ✅ After 10-30 seconds, redirects to course page

**If it fails:**
- Check browser console for errors
- Verify OpenRouter API key is valid
- Check you have credits in OpenRouter account

#### Test 1.5: View Generated Course
**Steps:**
1. Course page loads at `/course-generated/[id]`

**Verify:**
- ✅ Course title displays
- ✅ Course description shows
- ✅ Modules/topics are listed
- ✅ Each topic has title and description
- ✅ "Start" buttons are visible
- ✅ Prerequisites show (if any)
- ✅ Learning objectives display
- ✅ Resources section appears

#### Test 1.6: Save Course
**Steps:**
1. Click "Save to My Courses" button
2. Wait for confirmation

**Expected Result:**
- ✅ Button shows "Saving..."
- ✅ Success alert appears
- ✅ Button changes to "Saved" with checkmark
- ✅ Button becomes disabled

#### Test 1.7: Download Course
**Steps:**
1. Click "Download Course" button

**Expected Result:**
- ✅ JSON file downloads
- ✅ Filename: `[Course_Title]_curriculum.json`
- ✅ File contains course data
- ✅ Valid JSON format

---

### 2. Lesson/Topic Viewer

#### Test 2.1: Access Lesson
**Steps:**
1. From course page, click any "Start" button
2. Should navigate to `/course/[slug]/topic/1`

**Expected Result:**
- ✅ Page loads with two-column layout
- ✅ Video player on left
- ✅ Lesson content on right
- ✅ "Back to Course" link appears

#### Test 2.2: Video Player Controls
**Note:** Video playback requires actual video files. Test with placeholder:

**Basic Controls:**
- ✅ Play/Pause button toggles
- ✅ Progress bar updates during playback
- ✅ Time display shows current/total time
- ✅ Skip back (-10s) button works
- ✅ Skip forward (+10s) button works

**Advanced Controls:**
- ✅ Volume slider adjusts volume
- ✅ Speed menu opens when clicked
- ✅ Speed changes work (0.5x, 1x, 2x)
- ✅ Topics menu opens when clicked
- ✅ Topics menu shows all lessons
- ✅ Current topic is highlighted
- ✅ Clicking topic navigates correctly

#### Test 2.3: Progress Tracking
**Steps:**
1. Watch 90% of video OR
2. Click "Mark as Completed" button

**Expected Result:**
- ✅ Button changes to green "Completed ✓"
- ✅ Checkmark appears in topics menu
- ✅ Progress saved to localStorage
- ✅ Stays completed on page reload

#### Test 2.4: Lesson Navigation
**Steps:**
1. On topic 1, click "Next Topic"
2. Should navigate to topic 2
3. Click "Previous Topic"

**Expected Result:**
- ✅ Navigation works both directions
- ✅ Content updates correctly
- ✅ Video resets for new topic
- ✅ URL updates to correct topic ID
- ✅ Last topic shows "Complete Course"

#### Test 2.5: Lesson Content Display
**Verify:**
- ✅ Lesson title displays
- ✅ Duration shows
- ✅ Topic number correct (e.g., "Topic 1 of 3")
- ✅ Share button visible
- ✅ Content is readable
- ✅ Content area is scrollable
- ✅ Markdown formatting works

---

### 3. Search Functionality

#### Test 3.1: Search from Home
**Steps:**
1. Go to http://localhost:3000/home
2. Enter search term: "Python"
3. Press Enter

**Expected Result:**
- ✅ Redirects to generation page
- ✅ Topic name appears in questions

#### Test 3.2: Search API
**Steps:**
1. Open browser console
2. Run:
```javascript
fetch('/api/search?q=machine+learning')
  .then(r => r.json())
  .then(console.log)
```

**Expected Result:**
- ✅ Returns JSON response
- ✅ Contains courses array
- ✅ Contains journeys array
- ✅ Results match search query

---

### 4. API Endpoints

#### Test 4.1: Generate Course API
**Method:** POST `/api/generate-course`

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python Programming",
    "answers": {
      "1": "Alex",
      "2": "I want strong fundamentals",
      "3": "Complete beginner"
    }
  }'
```

**Expected:**
- ✅ 200 OK status
- ✅ JSON response with course object
- ✅ Response within 30 seconds

**Error Cases to Test:**
- Missing API key → 500 error
- Invalid topic → Still generates
- Empty answers → Uses defaults

#### Test 4.2: Save Course API
**Method:** POST `/api/courses/save`

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/courses/save \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "A test course",
    "topic": "Testing"
  }'
```

**Expected:**
- ✅ 200 OK status
- ✅ Returns course ID and slug
- ✅ Success message

#### Test 4.3: Progress API
**Method:** POST `/api/courses/[courseId]/progress`

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/courses/test-course/progress \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "completed": true,
    "timeSpent": 15
  }'
```

**Expected:**
- ✅ 200 OK status
- ✅ Success message

---

### 5. Error Handling

#### Test 5.1: Missing API Key
**Steps:**
1. Temporarily remove OpenRouter key from `.env.local`
2. Try to generate a course

**Expected:**
- ✅ Error message: "OpenRouter API key not configured"
- ✅ 500 error status
- ✅ User-friendly error display

#### Test 5.2: Network Failure
**Steps:**
1. Turn off internet
2. Try to generate course

**Expected:**
- ✅ Error caught gracefully
- ✅ Alert shown to user
- ✅ Generation stops
- ✅ User can retry

#### Test 5.3: Invalid Course ID
**Steps:**
1. Navigate to `/course-generated/invalid-id`

**Expected:**
- ✅ "Course not found" message
- ✅ Link to go back home

---

### 6. UI/UX Testing

#### Test 6.1: Responsive Design
**Test on different screen sizes:**

**Mobile (375px):**
- ✅ Questions fit screen
- ✅ Buttons are tappable
- ✅ No horizontal scroll
- ✅ Video player works
- ✅ Two-column becomes one

**Tablet (768px):**
- ✅ Layout adjusts appropriately
- ✅ All elements visible
- ✅ Touch-friendly controls

**Desktop (1920px):**
- ✅ Content centered
- ✅ Good spacing
- ✅ Two-column layout works

#### Test 6.2: Loading States
**Verify loading indicators:**
- ✅ Course generation shows spinner
- ✅ "Saving..." appears when saving
- ✅ Skeleton loaders for content
- ✅ Disabled buttons during actions

#### Test 6.3: Animations
**Check smooth transitions:**
- ✅ Progress bar animates
- ✅ Question transitions smooth
- ✅ Button hover effects work
- ✅ No janky animations

---

### 7. Browser Compatibility

Test on multiple browsers:

**Chrome/Edge:**
- ✅ All features work
- ✅ Video plays
- ✅ No console errors

**Firefox:**
- ✅ All features work
- ✅ Video plays
- ✅ No console errors

**Safari:**
- ✅ All features work
- ✅ Video plays
- ✅ Check video formats

---

## 🐛 Common Issues & Solutions

### Issue: "OpenRouter API key not configured"
**Solution:**
1. Check `.env.local` file exists
2. Verify key starts with `sk-or-v1-`
3. Restart dev server

### Issue: Course generation takes too long
**Solution:**
- Normal: 10-30 seconds
- If longer: Check OpenRouter status
- Try a different model

### Issue: Video not playing
**Solution:**
- Videos need to be actual video files
- YouTube embeds won't work with `<video>` tag
- Use supported formats: MP4, WebM

### Issue: Progress not saving
**Solution:**
- Check browser localStorage
- Ensure JavaScript is enabled
- Check for ad blockers

---

## 📊 Test Coverage Summary

| Feature | Manual Tests | Status |
|---------|-------------|--------|
| Course Generation Wizard | 7 tests | ✅ |
| Lesson Viewer | 5 tests | ✅ |
| Video Player | 8 tests | ✅ |
| API Endpoints | 4 tests | ✅ |
| Error Handling | 3 tests | ✅ |
| UI/UX | 3 tests | ✅ |
| Browser Compat | 3 tests | ✅ |

**Total: 33 Test Cases**

---

## 🚀 Running Tests

### Quick Test Suite
```bash
# 1. Start dev server
npm run dev

# 2. Run through this checklist:
□ Generate a course (any topic)
□ View the generated course
□ Save the course
□ Download the course
□ Open a lesson
□ Mark a lesson complete
□ Navigate between lessons
□ Test video controls
□ Search for a course
```

### Full Test Suite
Complete all 33 test cases above for comprehensive coverage.

---

## 📝 Test Report Template

```
Date: _______________
Tester: _____________
Version: ____________

RESULTS:
[ ] Course Generation: PASS / FAIL
[ ] Lesson Viewer: PASS / FAIL
[ ] Video Player: PASS / FAIL
[ ] API Endpoints: PASS / FAIL
[ ] Error Handling: PASS / FAIL
[ ] UI/UX: PASS / FAIL

ISSUES FOUND:
1. _______________________________
2. _______________________________
3. _______________________________

NOTES:
________________________________
________________________________
```

---

**Happy Testing! 🧪**

Report any bugs or issues to the development team.
