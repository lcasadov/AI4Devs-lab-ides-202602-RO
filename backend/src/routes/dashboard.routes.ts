import { Router } from 'express';
import { getStats } from '../presentation/controllers/DashboardController';

const router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get candidate statistics grouped by job type, province, and municipality
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 byJobType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       count: { type: integer }
 *                 byProvince:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       count: { type: integer }
 *                 byMunicipality:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name: { type: string }
 *                       count: { type: integer }
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getStats);

export default router;
