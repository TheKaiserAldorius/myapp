import { Router } from 'express';
import { pool } from './db/db';


const router = Router();

router.get('/cases', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, price, image_url
      FROM cases
      ORDER BY id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
