# 🎨 Branding & Title Customization Guide

## Overview
This guide shows you exactly where to change all titles, names, and branding across your entire SkillRoute AI platform.

---

## 📚 Landing Page (Port 4173)

### File: `SkillRoute_AI_LandingPage/index.html`

**Line ~27 - Brand Name:**
```html
<a href="/" class="brand">
    <div class="brand-icon"></div>
    SkillRoute UK  <!-- CHANGE THIS -->
</a>
```

**Line ~32-36 - Navigation Links:**
```html
<a href="#" data-module-target="course">Course Gen</a>  <!-- CHANGE -->
<a href="#" data-module-target="roadmap">Roadmaps</a>    <!-- CHANGE -->
<a href="#" data-module-target="skillEval">Evaluator</a> <!-- CHANGE -->
```

### File: `SkillRoute_AI_LandingPage/style.css`
Search and replace:
- Colors for branding
- Font families
- Logo URL (if using custom logo)

---

## 📚 Course Generation Module (Port 3000)

### File: `course generation/app/layout.tsx`
```typescript
export const metadata = {
  title: 'Course Generation Platform', // CHANGE THIS
  description: 'AI-powered course creation...' // CHANGE THIS
}
```

### File: `course generation/app/(main)/home/page.tsx`
- Change page titles and headings
- Update feature descriptions
- Modify button labels

### Files to Check:
- `course generation/components/home/HeroSection.tsx` - Hero title & description
- `course generation/components/home/TopicPills.tsx` - Topic names
- `course generation/app/(main)/generate/page.tsx` - Generation UI labels

### Colors & Styling:
- File: `course generation/app/globals.css`
- Update primary colors, fonts, and theme

---

## 🗺️ Roadmap Module (Port 5173)

### File: `roadmap_module/index.html`
```html
<title>Roadmap Module</title>  <!-- CHANGE THIS -->
```

### File: `roadmap_module/src/App.tsx`
- Update component titles
- Change heading text
- Modify button labels

### File: `roadmap_module/src/App.css`
- Colors, fonts, and theme

---

## 📝 Skill Evaluator (Port 3001)

### File: `test generation/public/index.html`
```html
<title>Knowledge Assessment Platform</title>  <!-- CHANGE THIS -->
```

### File: `test generation/src/index.js`
- Check for hardcoded titles
- Update API endpoints if needed

### File: `test generation/styles.css`
- Theme colors
- Font families

### File: `test generation/script.js`
- Button labels
- Form labels
- Result messages

---

## 🔤 Quick Find & Replace

Use VS Code Find & Replace (Ctrl+H) to change across multiple files:

### Change 1: Brand Name
- **Find**: `SkillRoute AI`
- **Replace**: `Your New Name`
- **Files**: All `.html`, `.tsx`, `.jsx`, `.js` files

### Change 2: Module Names
- **Find**: `Course Generation`
- **Replace**: `Your Course Title`

### Change 3: Colors
- **Find**: `#6366f1` (Indigo - primary color)
- **Replace**: `#your-color-code`
- **Files**: All `.css` and `globals.css`

---

## 📋 Branding Checklist

### Text to Update:
- [ ] Landing page brand name
- [ ] Landing page navigation labels
- [ ] Course Gen page titles
- [ ] Roadmap page titles
- [ ] Skill Evaluator titles
- [ ] All button labels
- [ ] All form labels
- [ ] All headings and descriptions
- [ ] Footer text (if any)
- [ ] Copyright information

### Visual to Update:
- [ ] Primary color (#6366f1)
- [ ] Secondary color
- [ ] Font family (currently Poppins)
- [ ] Logo/brand icon
- [ ] Hero background images
- [ ] Button styles
- [ ] Navigation bar colors

### Metadata to Update:
- [ ] Page titles (`<title>`)
- [ ] Meta descriptions
- [ ] Favicon
- [ ] OG tags for social sharing

---

## 🛠️ Files by Module

### Landing Page Files:
```
SkillRoute_AI_LandingPage/
├── index.html           (Main content)
├── auth.html           (Auth page)
├── style.css           (Styling)
├── main.js             (Navigation logic)
└── vite.config.js      (Port config)
```

### Course Generation Files:
```
course generation/
├── app/layout.tsx           (Metadata)
├── app/globals.css          (Global styles)
├── components/              (UI components)
├── app/(main)/home/         (Home page)
├── app/(main)/generate/     (Generation page)
└── .env                     (Secrets)
```

### Roadmap Module Files:
```
roadmap_module/
├── index.html               (Entry point)
├── src/App.tsx             (Main component)
├── src/App.css             (Styles)
└── vite.config.ts          (Config)
```

### Skill Evaluator Files:
```
test generation/
├── public/index.html        (Entry point)
├── script.js               (Logic)
├── styles.css              (Styling)
└── serve.js                (Server)
```

---

## 💡 Pro Tips

1. **Backup First**: Copy your project folder before making changes
2. **Use Find & Replace**: VS Code's Find & Replace (Ctrl+H) is your friend
3. **Test Each Module**: After each change, restart the module and verify
4. **Consistent Naming**: Use the same names across all modules
5. **Brand Guidelines**: Keep a document of your new brand colors and fonts

---

## Example: Changing "SkillRoute UK" to "CareerBoost"

### Step 1: Landing Page
- Open `SkillRoute_AI_LandingPage/index.html`
- Find: `SkillRoute UK`
- Replace: `CareerBoost`

### Step 2: Course Generation
- Open `course generation/app/layout.tsx`
- Update metadata title to include "CareerBoost"

### Step 3: All Pages
- Use Find & Replace in entire workspace
- Find: `SkillRoute` | Replace: `CareerBoost`

### Step 4: Test
- Restart all modules
- Verify branding is consistent

---

## Need Help?

Check individual module guides:
- `LAUNCH_GUIDE.md` - Complete launch instructions
- `course generation/COURSE_GEN_GUIDE.md` - Course Gen specific guide
- Each module has its own README.md

---

## Ready to Rebrand!

Once you've updated all titles and colors:

1. Stop all modules (Ctrl+C in each terminal)
2. Run: `.\START_ALL_ORIGINAL.bat`
3. Open: http://localhost:4173
4. Verify all changes are applied

Your rebrand is complete! 🎉
