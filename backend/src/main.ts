import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import prisma from './config/prisma';
import { envConfig } from './config/env.config';
import { swaggerSpec } from './config/swagger.config';
import { errorFilter } from './common/filters/error.filter';

// Routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import propertiesRoutes from './modules/properties/properties.routes';
import roomsRoutes from './modules/rooms/rooms.routes';
import requestsRoutes from './modules/requests/requests.routes';
import matchesRoutes from './modules/matches/matches.routes';
import messagesRoutes from './modules/messages/messages.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: envConfig.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: envConfig.rateLimit.windowMs,
  max: envConfig.rateLimit.max,
  message: {
    message: 'Demasiadas solicitudes, por favor intenta más tarde',
    error: 'Too Many Requests',
    statusCode: 429
  }
});
app.use('/api/v1', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(envConfig.upload.path));

// Static files (public - documentation)
app.use('/public', express.static(path.join(__dirname, '../public')));

// HTML Documentation - redirect root to docs
app.get('/documentation', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/documentation.html'));
});

// API Documentation (Swagger UI)
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RoomMatch API Documentation'
}));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: envConfig.nodeEnv
  });
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/properties', propertiesRoutes);
app.use('/api/v1/rooms', roomsRoutes);
app.use('/api/v1/requests', requestsRoutes);
app.use('/api/v1/matches', matchesRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/favorites', favoritesRoutes);

// 404 handler
app.use('/api/v1/*', (req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    error: 'Not Found',
    statusCode: 404
  });
});

// Error handler
app.use(errorFilter);

// Start server
const startServer = async () => {
  try {
    // Test database connection with Prisma
    await prisma.$connect();
    console.log('📦 Database connected successfully');

    // Start listening
    app.listen(envConfig.port, () => {
      console.log(`🚀 Server running on http://localhost:${envConfig.port}`);
      console.log(`📚 API Docs (Swagger): http://localhost:${envConfig.port}/api/v1/docs`);
      console.log(`📄 API Docs (HTML): http://localhost:${envConfig.port}/documentation`);
      console.log(`🔧 Environment: ${envConfig.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
