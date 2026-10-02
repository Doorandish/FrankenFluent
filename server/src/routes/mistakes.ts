import { Router, Request, Response } from 'express';
import { MistakeLedger } from '../models/MistakeLedger';

const router = Router();

// GET /api/mistakes/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { chapter_id, error_category, reviewed } = req.query;
    const query: any = { user_id: req.params.userId };

    if (chapter_id) query.chapter_id = chapter_id;
    if (error_category) query.error_category = error_category;
    if (reviewed !== undefined) query.reviewed = reviewed === 'true';

    const mistakes = await MistakeLedger.find(query).sort({ created_at: -1 });
    res.json(mistakes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mistakes' });
  }
});

// PATCH /api/mistakes/:mistakeId/review
router.patch('/:mistakeId/review', async (req: Request, res: Response) => {
  try {
    const mistake = await MistakeLedger.findByIdAndUpdate(
      req.params.mistakeId,
      { $set: { reviewed: true } },
      { new: true }
    );

    if (!mistake) {
      return res.status(404).json({ error: 'Mistake not found' });
    }

    res.json(mistake);
  } catch (error) {
    res.status(500).json({ error: 'Failed to review mistake' });
  }
});

// GET /api/mistakes/:userId/stats
router.get('/:userId/stats', async (req: Request, res: Response) => {
  try {
    const stats = await MistakeLedger.aggregate([
      { $match: { user_id: req.params.userId } },
      {
        $group: {
          _id: '$error_category',
          count: { $sum: 1 },
          reviewedCount: {
            $sum: { $cond: ['$reviewed', 1, 0] }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mistake statistics' });
  }
});

export default router;
