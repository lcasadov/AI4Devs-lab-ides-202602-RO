import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import {
  getAll,
  getById,
  create,
  update,
  deleteUser,
  resetPassword,
} from '../presentation/controllers/UserController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         login:
 *           type: string
 *           example: jdoe
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: jdoe@example.com
 *         role:
 *           type: string
 *           enum: [ADMIN, RECRUITER]
 *           example: RECRUITER
 *         active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - login
 *         - firstName
 *         - lastName
 *         - email
 *         - role
 *       properties:
 *         login:
 *           type: string
 *           maxLength: 250
 *           example: jdoe
 *         firstName:
 *           type: string
 *           maxLength: 100
 *           example: John
 *         lastName:
 *           type: string
 *           maxLength: 150
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 250
 *           example: jdoe@example.com
 *         role:
 *           type: string
 *           enum: [ADMIN, RECRUITER]
 *           example: RECRUITER
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         login:
 *           type: string
 *           maxLength: 250
 *         firstName:
 *           type: string
 *           maxLength: 100
 *         lastName:
 *           type: string
 *           maxLength: 150
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 250
 *         role:
 *           type: string
 *           enum: [ADMIN, RECRUITER]
 *         active:
 *           type: boolean
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: login
 *         schema:
 *           type: string
 *         description: Filter by login (contains)
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Filter by first name (contains)
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Filter by last name (contains)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email (contains)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, RECRUITER]
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied (ADMIN role required)
 */
router.get('/', authMiddleware, roleMiddleware('ADMIN'), getAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get('/:id', authMiddleware, roleMiddleware('ADMIN'), getById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       409:
 *         description: Login or email already in use
 */
router.post('/', authMiddleware, roleMiddleware('ADMIN'), create);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 *       409:
 *         description: Login or email already in use
 */
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteUser);

/**
 * @swagger
 * /users/{id}/reset-password:
 *   post:
 *     summary: Reset a user's password (ADMIN only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Token missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.post('/:id/reset-password', authMiddleware, roleMiddleware('ADMIN'), resetPassword);

export default router;
