require("dotenv").config();

const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const User = require("../models/User");
const Attempt = require("../models/TestAttempt");
const Question = require("../models/Question");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const normalizeQuestion = (q) => {
  const cleanedOptions = q.options.map(opt =>
    opt.replace(/^[A-Da-d]\.\s*/, "").trim()
  );

  let correct = q.correctAnswer;

  // if AI returned letter (A-D), convert to option text
  if (/^[A-Da-d]$/.test(correct)) {
    const idx = correct.toUpperCase().charCodeAt(0) - 65;
    correct = cleanedOptions[idx] || correct;
  } else {
    correct = correct.replace(/^[A-Da-d]\.\s*/, "").trim();
  }

  return {
    ...q,
    options: cleanedOptions,
    correctAnswer: correct
  };
};

exports.generateSkillQuestions = async (req, res) => {
  try {
    const { skillId, level } = req.body;

    if (!skillId || !level) {
      return res.status(400).json({ message: "skillId and level are required" });
    }

    const skill = await Skill.findById(skillId);
    if (!skill || !skill.skillName) {
      return res.status(404).json({ message: "Skill not found or missing name" });
    }

    // Always use environment variable API key (secure!)
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Server configuration error: API key not configured" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
      Generate 60 multiple-choice questions for the skill "${skill.skillName}" at "${level}" level.
      Each question must have:
        - A mainTopic (general category, e.g., "Machine Learning" or "OOP Concepts")
        - A subTopic (specific subcategory, e.g., "Training vs Testing" or "Polymorphism")
        - A clearly defined topic
        - 4 options (A, B, C, D) but answers should be text values
        - The correct answer (write the actual text of the correct option, not just "A" or "B")
      Return strictly valid JSON ONLY. Do NOT include markdown, code fences, or any explanation.

      Format:
      [
        {
          "mainTopic": "string",
          "subTopic": "string",
          "topic": "string",
          "question": "string",
          "options": ["A","B","C","D"], 
          "correctAnswer": "string" 
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response?.text?.() || "";

    const sanitizeJson = (text) => {
      return text
        .replace(/```json|```/g, "")
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/[\u0000-\u001F]+/g, '')
        .trim();
    };

    const cleanedText = sanitizeJson(rawText);

    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch (err) {
      return res.status(500).json({ message: "AI returned invalid JSON", error: err.message });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: "AI did not generate any questions" });
    }

    // Normalize + attach skill and level
    questions = questions.map(q => {
      const normalized = normalizeQuestion(q);
      return { ...normalized, skill: skillId, level };
    });

    // Remove duplicates
    const existingQuestions = await Question.find({ skill: skillId, level }).select("question");
    const existingTexts = existingQuestions.map(q => q.question);

    const filteredQuestions = questions.filter(q => !existingTexts.includes(q.question));

    if (filteredQuestions.length === 0) {
      return res.status(200).json({ message: "No new questions; all duplicates" });
    }

    const saved = await Question.insertMany(filteredQuestions);

    res.status(201).json({
      message: "AI-generated questions saved successfully",
      totalGenerated: questions.length,
      totalAdded: saved.length,
      data: saved
    });

  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({
      message: "Failed to generate questions",
      error: err.message,
      details: err.errorDetails || null
    });
  }
};

exports.randomTestQuestions = async (req, res) => {
  try {
    const { skillId, level, userId } = req.body;

    if (!skillId || !level) {
      return res.status(400).json({ message: "skillId and level are required" });
    }

    // For guest users without authentication
    const userIdToUse = userId || (req.user ? req.user._id : 'guest-' + Date.now());

    const skillObjectId = new mongoose.Types.ObjectId(skillId);
    const skill = await Skill.findById(skillObjectId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    // Pick 20 random questions
    const questions = await Question.aggregate([
      { $match: { skill: skillObjectId, level } },
      { $sample: { size: 20 } }
    ]);
    
    if (!questions.length) {
      return res.status(404).json({ message: "No questions found for this skill/level" });
    }

    // Save attempt with TTL (1 hour expiration)
    const attempt = await Attempt.create({
      user: userIdToUse,
      skill: skillObjectId,
      level,
      totalQuestions: questions.length,
      questions: questions.map(q => ({ questionId: q._id })),
      submitted: false,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // expires in 1 hour
    });

    // Return questions without correct answers
    res.status(200).json({
      message: "Random test questions retrieved successfully",
      attemptId: attempt._id,
      data: questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        mainTopic: q.mainTopic,
        subTopic: q.subTopic,
        topic: q.topic,
        level: q.level,
      }))
    });
  } catch (err) {
    console.error("Random test error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const { getYoutubeVideos } = require('../utils/youtubeService.js');

// Helper function to check and award badges
const checkAndAwardBadges = async (user, attempt) => {
  const newBadges = [];
  
  if (!user.badges) user.badges = [];
  if (!user.badgeHistory) user.badgeHistory = [];

  // 1. First Test Badge
  const totalTests = await Attempt.countDocuments({ user: user._id, submitted: true });
  if (totalTests === 1 && !user.badges.includes('first-test')) {
    user.badges.push('first-test');
    user.badgeHistory.push({ badge: 'first-test', earnedAt: new Date() });
    newBadges.push('first-test');
  }

  // 2. Perfect Score Badge
  if (attempt.score === 100 && !user.badges.includes('perfect-score')) {
    user.badges.push('perfect-score');
    user.badgeHistory.push({ badge: 'perfect-score', earnedAt: new Date() });
    newBadges.push('perfect-score');
  }

  // 3. Skill Master Badge (10 tests in a skill)
  const skillTestCount = await Attempt.countDocuments({ 
    user: user._id, 
    skill: attempt.skill, 
    submitted: true 
  });
  if (skillTestCount >= 10 && !user.badges.includes('skill-master')) {
    user.badges.push('skill-master');
    user.badgeHistory.push({ badge: 'skill-master', earnedAt: new Date() });
    newBadges.push('skill-master');
  }

  // 4. Expert Badge (90%+ on advanced level test)
  if (attempt.level === 'advanced' && attempt.score >= 90 && !user.badges.includes('expert')) {
    user.badges.push('expert');
    user.badgeHistory.push({ badge: 'expert', earnedAt: new Date() });
    newBadges.push('expert');
  }

  // 5. Dedicated Badge (25 total tests)
  if (totalTests >= 25 && !user.badges.includes('dedicated')) {
    user.badges.push('dedicated');
    user.badgeHistory.push({ badge: 'dedicated', earnedAt: new Date() });
    newBadges.push('dedicated');
  }

  return newBadges;
};

exports.submitTest = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || typeof answers !== "object") {
      return res.status(400).json({ message: "Missing or invalid attemptId and answers" });
    }

    const attempt = await Attempt.findById(attemptId).populate({
      path: "questions.questionId",
      select: "correctAnswer topic subTopic"
    });
    
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });
    if (attempt.submitted) return res.status(400).json({ message: "This test has already been submitted" });

    // Evaluate answers
    attempt.questions.forEach(q => {
      const userAnswer = answers[q.questionId._id.toString()] ?? null;
      q.selectedAnswer = userAnswer;
      q.isCorrect = userAnswer &&
        q.questionId.correctAnswer &&
        userAnswer.trim().toLowerCase() === q.questionId.correctAnswer.trim().toLowerCase();
    });

    attempt.correctAnswers = attempt.questions.filter(q => q.isCorrect).length;
    attempt.totalQuestions = attempt.questions.length;
    attempt.score = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);

    // Identify weak topics
    const weakTopicsSet = new Set();
    attempt.questions.forEach(q => {
      if (!q.isCorrect) {
        const subTopic = q.questionId.subTopic?.trim();
        const topic = q.questionId.topic?.trim();
        if (subTopic) weakTopicsSet.add(subTopic);
        else if (topic) weakTopicsSet.add(topic);
      }
    });
    attempt.weakTopics = Array.from(weakTopicsSet);

    // Fetch YouTube links
    const skillDoc = await Skill.findById(attempt.skill);
    attempt.youtubeVideoLinks = await getYoutubeVideos(skillDoc?.skillName || "Skill", attempt.weakTopics, "en");

    // Mark submitted & remove TTL
    attempt.submitted = true;
    attempt.expiresAt = undefined;
    await attempt.save();

    // Award badges if user is logged in
    let newBadges = [];
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        // Update skill level if passed
        if (attempt.score >= 75) {
          const regSkill = user.registeredSkills?.find(s => s.skill.toString() === attempt.skill.toString());
          if (regSkill) {
            if (regSkill.level === "beginner") regSkill.level = "intermediate";
            else if (regSkill.level === "intermediate") regSkill.level = "advanced";
            regSkill.lastUpdated = new Date();
          }
        }
        
        // Check and award badges
        newBadges = await checkAndAwardBadges(user, attempt);
        await user.save();
      }
    }

    res.status(200).json({
      message: "Your test has been submitted successfully",
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      weakTopics: attempt.weakTopics,
      youtubeVideoLinks: attempt.youtubeVideoLinks,
      newBadges: newBadges || []
    });

  } catch (err) {
    console.error("Submit test error:", err);
    res.status(500).json({ message: "Something went wrong while submitting your test", error: err.message });
  }
};

exports.getTestHistoryBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user?._id || req.query.userId;

    if (!skillId) {
      return res.status(400).json({ message: "Skill ID is required" });
    }

    // Fetch all submitted attempts for this user and skill
    const attempts = await Attempt.find({ skill: skillId, user: userId, submitted: true })
      .populate({
        path: "questions.questionId",
        select: "question mainTopic subTopic topic options correctAnswer"
      })
      .populate({
        path: "skill",
        select: "skillName description"
      })
      .sort({ takenAt: -1 }); // latest first

    res.status(200).json({ attempts });

  } catch (err) {
    console.error("Error fetching test history:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

exports.getAttemptById = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({ message: "Attempt ID is required" });
    }

    // Fetch attempt with questions and selected options
    const attempt = await Attempt.findOne({ _id: attemptId })
      .populate({
        path: 'questions.questionId',
        select: 'question options correctAnswer topic subTopic',
      });

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    res.status(200).json({ attempt });
  } catch (err) {
    console.error("Error fetching attempt:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
