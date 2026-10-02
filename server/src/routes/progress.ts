import { Router, Request, Response } from 'express';
import { UserProgress } from '../models/UserProgress';

const router = Router();

// GET /api/progress/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const progress = await UserProgress.findOne({ user_id: req.params.userId });
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found for this user' });
    }
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// POST /api/progress
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, current_level, current_chapter_id = '' } = req.body;
    
    if (!user_id || !current_level) {
      return res.status(400).json({ error: 'user_id and current_level are required' });
    }

    let progress = await UserProgress.findOne({ user_id });
    if (progress) {
      return res.status(400).json({ error: 'User progress already initialized' });
    }

    progress = new UserProgress({
      user_id,
      current_level,
      current_chapter_id,
      completed_scenarios: [],
      mastered_redemittel: [],
      overall_fluency_score: 0
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize user progress' });
  }
});

// PATCH /api/progress/:userId
router.patch('/:userId', async (req: Request, res: Response) => {
  try {
    const progress = await UserProgress.findOneAndUpdate(
      { user_id: req.params.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!progress) {
      return res.status(404).json({ error: 'User progress not found' });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user progress' });
  }
});

// POST /api/progress/:userId/complete-scenario
router.post('/:userId/complete-scenario', async (req: Request, res: Response) => {
  try {
    const { scenario_id, score } = req.body;

    if (!scenario_id || typeof score !== 'number') {
      return res.status(400).json({ error: 'scenario_id and valid score are required' });
    }

    const progress = await UserProgress.findOne({ user_id: req.params.userId });
    if (!progress) {
      return res.status(404).json({ error: 'User progress not found' });
    }

    // Check if scenario is already completed
    const existingIdx = progress.completed_scenarios.findIndex(s => s.scenario_id === scenario_id);
    if (existingIdx >= 0) {
      // Update score if higher (or just overwrite)
      progress.completed_scenarios[existingIdx].score = Math.max(progress.completed_scenarios[existingIdx].score, score);
      progress.completed_scenarios[existingIdx].completed_at = new Date();
    } else {
      progress.completed_scenarios.push({
        scenario_id,
        score,
        completed_at: new Date()
      });
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark scenario as completed' });
  }
});

export default router;
