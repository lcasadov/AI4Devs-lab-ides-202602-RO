import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import candidateRoutes from './routes/candidate.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import sectorRoutes from './routes/sector.routes';
import jobtypeRoutes from './routes/jobtype.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

export const app = express();

const port = 3010;

// Security headers
app.use(helmet());

// CORS — origins driven by environment variable
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'LTI API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Auth routes (public — no authMiddleware)
app.use('/auth', authRoutes);

// User management routes (auth + role enforced per-route)
app.use('/users', userRoutes);

// Sector routes — auth required; mutations ADMIN only (enforced per-route)
app.use('/sectors', authMiddleware, sectorRoutes);

// JobType routes — auth required; mutations ADMIN only (enforced per-route)
app.use('/jobtypes', authMiddleware, jobtypeRoutes);

// Candidates routes — protected by JWT
app.use('/candidates', authMiddleware, candidateRoutes);

// Dashboard routes — protected by JWT
app.use('/dashboard', authMiddleware, dashboardRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    // Multer file validation errors → 400
    if (err.message === 'Only PDF and DOCX files are allowed') {
      res.status(400).json({ error: err.message });
      return;
    }
    // Multer file size exceeded → 400
    if ('code' in err && (err as NodeJS.ErrnoException).code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size exceeds the 5 MB limit' });
      return;
    }
    console.error(err.stack);
  } else {
    console.error(err);
  }
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
