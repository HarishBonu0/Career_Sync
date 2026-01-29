const express = require('express');
const Skill = require('../models/Skill');

const router = express.Router();

// Create or get skill by name
router.post('/', async (req, res) => {
  try {
    const skillName = (req.body.skillName || req.body.name || '').trim();

    if (!skillName) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const existingSkill = await Skill.findOne({
      skillName: { $regex: new RegExp(`^${skillName}$`, 'i') }
    });

    if (existingSkill) {
      return res.json(existingSkill);
    }

    const newSkill = await Skill.create({
      skillName,
      name: skillName
    });

    res.status(201).json(newSkill);
  } catch (error) {
    console.error('Skill creation error:', error);
    res.status(500).json({ message: 'Failed to create skill', error: error.message });
  }
});

// Search skills by name
router.get('/search/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const skills = await Skill.find({
      skillName: { $regex: name, $options: 'i' }
    }).limit(50);

    res.json(skills);
  } catch (error) {
    console.error('Skill search error:', error);
    res.status(500).json({ message: 'Failed to search skills', error: error.message });
  }
});

module.exports = router;
