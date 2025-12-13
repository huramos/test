import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RoomMatch API',
      version: '1.0.0',
      description: 'API para conectar propietarios con personas que buscan compartir arriendo',
      contact: {
        name: 'RoomMatch Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'PROPIETARIO', 'ROOMIE'] },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'BANNED'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['APARTMENT', 'HOUSE', 'STUDIO', 'LOFT', 'SHARED_APARTMENT'] },
            status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'INACTIVE'] },
            monthlyRent: { type: 'number' },
            address: { type: 'object' },
            features: { type: 'object' }
          }
        },
        Room: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            propertyId: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'UNAVAILABLE'] },
            monthlyRent: { type: 'number' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['PROPIETARIO', 'ROOMIE'] }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
