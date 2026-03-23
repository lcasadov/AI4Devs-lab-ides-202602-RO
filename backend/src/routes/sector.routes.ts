import { Router } from 'express';
import { roleMiddleware } from '../middleware/role.middleware';
import { getAll, getById, create, update, deleteSector } from '../presentation/controllers/SectorController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Sector:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Technology
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateSectorRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: Technology
 */

/**
 * @swagger
 * /sectors:
 *   get:
 *     summary: Retrieve all sectors
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sectors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sector'
 *       401:
 *         description: Token missing or invalid
 */
router.get('/', getAll);

/**
 * @swagger
 * /sectors/{id}:
 *   get:
 *     summary: Retrieve a sector by ID
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sector found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sector'
 *       401:
 *         description: Token missing or invalid
 *       404:
 *         description: Sector not found
 */
router.get('/:id', getById);

/**
 * @swagger
 * /sectors:
 *   post:
 *     summary: Create a new sector (ADMIN only)
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSectorRequest'
 *     responses:
 *       201:
 *         description: Sector created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sector'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied (ADMIN role required)
 *       409:
 *         description: Sector name already in use
 */
router.post('/', roleMiddleware('ADMIN'), create);

/**
 * @swagger
 * /sectors/{id}:
 *   put:
 *     summary: Update a sector (ADMIN only)
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSectorRequest'
 *     responses:
 *       200:
 *         description: Sector updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sector'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: Sector not found
 *       409:
 *         description: Sector name already in use
 */
router.put('/:id', roleMiddleware('ADMIN'), update);

/**
 * @swagger
 * /sectors/{id}:
 *   delete:
 *     summary: Delete a sector (ADMIN only)
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Sector deleted
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: Sector not found
 *       409:
 *         description: Sector has associated job types
 */
router.delete('/:id', roleMiddleware('ADMIN'), deleteSector);

export default router;
