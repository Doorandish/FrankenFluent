import { Router, Request, Response } from 'express';
import { Curriculum } from '../models/Curriculum';

const router = Router();

import fs from 'fs';
import path from 'path';

// GET /api/curriculum - Returns all curriculums
router.get('/', async (req: Request, res: Response) => {
  try {
    let curriculums = await Curriculum.find({});
    
    // Direct JSON Fallback if DB is empty/slow to seed
    if (curriculums.length === 0) {
      // Find Resource folder relative to the server root (where package.json is)
      const resourcesDir = path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '../../../Resource' : '../../../Resource'); 
      // Actually, from dist/routes/curriculum.js, we go up to routes -> dist -> server -> root -> Resource
      const absoluteResourceDir = path.join(process.cwd(), '../Resource');
      if (fs.existsSync(absoluteResourceDir)) {
        const files = fs.readdirSync(absoluteResourceDir).filter(f => f.endsWith('.json'));
        curriculums = files.map(file => {
          const rawData = fs.readFileSync(path.join(absoluteResourceDir, file), 'utf-8');
          return JSON.parse(rawData);
        }) as any;
      }
    }
    
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
