import { Router } from 'express';
import {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  upload,
  uploadCv,
  uploadCandidateCv,
} from '../presentation/controllers/candidate.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Candidate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         firstName:
 *           type: string
 *           example: Jane
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: jane.doe@example.com
 *         phone:
 *           type: string
 *           example: "+34600000000"
 *         address:
 *           type: string
 *           example: "123 Main St"
 *         postalCode:
 *           type: string
 *           example: "28001"
 *         province:
 *           type: string
 *           example: "Madrid"
 *         municipality:
 *           type: string
 *           example: "Madrid"
 *         sectorId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         jobTypeId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         sector:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         jobType:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         education:
 *           type: object
 *           nullable: true
 *         workExperience:
 *           type: object
 *           nullable: true
 *         cvFileName:
 *           type: string
 *           nullable: true
 *           example: cv-1234567890-123456789.pdf
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *               phone:
 *                 type: string
 *                 example: "+34600000000"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               postalCode:
 *                 type: string
 *                 example: "28001"
 *               province:
 *                 type: string
 *                 example: "Madrid"
 *               municipality:
 *                 type: string
 *                 example: "Madrid"
 *               sectorId:
 *                 type: integer
 *                 example: 1
 *               jobTypeId:
 *                 type: integer
 *                 example: 2
 *               education:
 *                 type: string
 *                 description: JSON string representing education history
 *               workExperience:
 *                 type: string
 *                 description: JSON string representing work experience
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file (PDF or DOCX, max 5MB)
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', upload.single('cv'), createCandidate);

/**
 * @swagger
 * /candidates:
 *   get:
 *     summary: Retrieve all candidates
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: List of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Candidate'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllCandidates);

/**
 * @swagger
 * /candidates/{id}:
 *   get:
 *     summary: Retrieve a candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getCandidateById);

/**
 * @swagger
 * /candidates/{id}:
 *   put:
 *     summary: Update a candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *               phone:
 *                 type: string
 *                 example: "+34600000000"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               postalCode:
 *                 type: string
 *                 example: "28001"
 *               province:
 *                 type: string
 *                 example: "Madrid"
 *               municipality:
 *                 type: string
 *                 example: "Madrid"
 *               sectorId:
 *                 type: integer
 *                 example: 1
 *               jobTypeId:
 *                 type: integer
 *                 example: 2
 *               education:
 *                 type: string
 *                 description: JSON string representing education history
 *               workExperience:
 *                 type: string
 *                 description: JSON string representing work experience
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', updateCandidate);

/**
 * @swagger
 * /candidates/{id}/cv:
 *   post:
 *     summary: Upload a CV file for a candidate
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file (PDF or DOCX, max 5MB)
 *     responses:
 *       200:
 *         description: CV uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/cv', uploadCv.single('cv'), uploadCandidateCv);

/**
 * @swagger
 * /candidates/{id}:
 *   delete:
 *     summary: Delete a candidate by ID (GDPR right to erasure)
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       204:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', deleteCandidate);

export default router;
