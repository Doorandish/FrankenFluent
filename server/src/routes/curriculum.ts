import { Router, Request, Response } from 'express';
import { Curriculum } from '../models/Curriculum';

const router = Router();

// GET /api/curriculum - Returns all curriculums
router.get('/', async (req: Request, res: Response) => {
  try {
    const curriculums = await Curriculum.find({});
    res.json(curriculums);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch curriculums' });
  }
});

// GET /api/curriculum/:level - Returns curriculum by level
router.get('/:level', async (req: Request, res: Response) => {
  try {
    const curriculum = await Curriculum.findOne({ level: req.params.level });
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' });
    }
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch curriculum' });
  }
});

// GET /api/curriculum/:level/chapter/:chapterId - Returns specific chapter
router.get('/:level/chapter/:chapterId', async (req: Request, res: Response) => {
  try {
    const curriculum = await Curriculum.findOne({ level: req.params.level });
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' });
    }

    const chapter = curriculum.chapters.find(c => c.chapter_id === req.params.chapterId);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

export default router;
