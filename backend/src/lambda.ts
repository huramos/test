import 'reflect-metadata';
import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
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

const app = express();

// Security middleware - adjusted for Lambda
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
}));

app.use(cors({
  origin: envConfig.corsOrigin,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    environment: envConfig.nodeEnv,
    runtime: 'lambda'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'RoomMatch API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    health: '/api/v1/health'
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

import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

// Serverless handler
const serverlessHandler = serverless(app);

// Export handler for AWS Lambda
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Ensure Prisma connection is ready
  await prisma.$connect();

  // Make sure to add this so you can re-use `context.callbackWaitsForEmptyEventLoop`
  context.callbackWaitsForEmptyEventLoop = false;

  return serverlessHandler(event, context) as Promise<APIGatewayProxyResult>;
};
