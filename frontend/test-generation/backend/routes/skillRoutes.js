const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Create or get skill by name
router.post('/', async (req, res) => {
  try {
    const { skillName } = req.body;

    if (!skillName) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    // Check if skill exists
    const { data: existingSkills, error: searchError } = await supabase
      .from('test_skills')
      .select('*')
      .ilike('skill_name', skillName)
      .limit(1);

    if (searchError && searchError.code !== 'PGRST116') {
      throw searchError;
    }

    if (existingSkills && existingSkills.length > 0) {
      return res.json(existingSkills[0]);
    }

    // Create new skill
    const { data: newSkill, error: insertError } = await supabase
      .from('test_skills')
      .insert([{ skill_name: skillName, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

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

    const { data, error } = await supabase
      .from('test_skills')
      .select('*')
      .ilike('skill_name', `%${name}%`);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    console.error('Skill search error:', error);
    res.status(500).json({ message: 'Failed to search skills', error: error.message });
  }
});

module.exports = router;
