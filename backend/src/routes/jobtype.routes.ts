import { Router } from 'express';
import { roleMiddleware } from '../middleware/role.middleware';
import { getAll, getById, create, update, deleteJobType } from '../presentation/controllers/JobTypeController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     JobType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Backend Developer
 *         sectorId:
 *           type: integer
 *           example: 1
 *         sector:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateJobTypeRequest:
 *       type: object
 *       required:
 *         - name
 *         - sectorId
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: Backend Developer
 *         sectorId:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /jobtypes:
 *   get:
 *     summary: Retrieve all job types
 *     tags: [JobTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sectorId
 *         schema:
 *           type: integer
 *         description: Filter by sector ID
 *     responses:
 *       200:
 *         description: List of job types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobType'
 *       401:
 *         description: Token missing or invalid
 */
router.get('/', getAll);

/**
 * @swagger
 * /jobtypes/{id}:
 *   get:
 *     summary: Retrieve a job type by ID
 *     tags: [JobTypes]
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
 *         description: JobType found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobType'
 *       401:
 *         description: Token missing or invalid
 *       404:
 *         description: JobType not found
 */
router.get('/:id', getById);

/**
 * @swagger
 * /jobtypes:
 *   post:
 *     summary: Create a new job type (ADMIN only)
 *     tags: [JobTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobTypeRequest'
 *     responses:
 *       201:
 *         description: JobType created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobType'
 *       400:
 *         description: Validation error or invalid sectorId
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied (ADMIN role required)
 *       409:
 *         description: Job type already exists in this sector
 */
router.post('/', roleMiddleware('ADMIN'), create);

/**
 * @swagger
 * /jobtypes/{id}:
 *   put:
 *     summary: Update a job type (ADMIN only)
 *     tags: [JobTypes]
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
 *             $ref: '#/components/schemas/CreateJobTypeRequest'
 *     responses:
 *       200:
 *         description: JobType updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobType'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: JobType not found
 *       409:
 *         description: Job type already exists in this sector
 */
router.put('/:id', roleMiddleware('ADMIN'), update);

/**
 * @swagger
 * /jobtypes/{id}:
 *   delete:
 *     summary: Delete a job type (ADMIN only)
 *     tags: [JobTypes]
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
 *         description: JobType deleted
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: JobType not found
 */
router.delete('/:id', roleMiddleware('ADMIN'), deleteJobType);

export default router;
