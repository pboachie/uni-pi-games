import { Router } from 'express';

const router = Router();

// Simple health check endpoint
router.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
