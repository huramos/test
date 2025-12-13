# RoomMatch

Plataforma que conecta propietarios de inmuebles con personas que buscan compartir arriendo (roomies).

## Descripción

RoomMatch facilita el proceso de encontrar compañeros de arriendo o habitaciones disponibles. Los propietarios pueden publicar sus propiedades y habitaciones, mientras que los roomies pueden buscar, filtrar y solicitar habitaciones que se ajusten a sus necesidades y estilo de vida.

## Tecnologías

### Frontend
- **Angular 19** - Framework de desarrollo
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos con variables CSS
- **Bootstrap 5** - Framework UI
- **FontAwesome 6** - Iconografía

### Backend
- **Node.js + Express** - Servidor API REST
- **TypeScript** - Tipado estático
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas

### Base de Datos
- **PostgreSQL** - Base de datos relacional

## Estructura del Proyecto

```
room-match/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── core/                 # Servicios, guards, modelos
│   │   ├── features/             # Módulos por funcionalidad
│   │   │   ├── auth/             # Login, registro
│   │   │   ├── properties/       # Gestión de propiedades
│   │   │   ├── rooms/            # Habitaciones
│   │   │   ├── requests/         # Solicitudes
│   │   │   ├── matches/          # Matches acordados
│   │   │   └── messages/         # Mensajería
│   │   └── shared/               # Componentes compartidos
│   └── environments/             # Configuración por entorno
│
├── backend/                      # API REST
│   ├── prisma/
│   │   ├── schema.prisma         # Esquema de base de datos
│   │   └── seed.ts               # Datos iniciales
│   ├── src/
│   │   ├── config/               # Configuraciones
│   │   ├── common/               # Guards, filters, pipes
│   │   └── modules/              # Módulos de la API
│   │       ├── auth/
│   │       ├── users/
│   │       ├── properties/
│   │       ├── rooms/
│   │       ├── requests/
│   │       ├── matches/
│   │       └── messages/
│   └── public/                   # Archivos estáticos
│
└── docs/                         # Documentación
    └── api-documentation.html    # Swagger UI
```

## Roles de Usuario

### Admin
- Gestión completa del sistema
- Verificación de propiedades
- Administración de usuarios

### Propietario
- Publicar propiedades y habitaciones
- Gestionar solicitudes recibidas
- Aceptar/rechazar roomies
- Comunicarse con roomies aceptados

### Roomie
- Buscar propiedades y habitaciones
- Crear perfil con preferencias y estilo de vida
- Enviar solicitudes de arriendo
- Comunicarse con propietarios

## Instalación

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Backend

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Generar cliente Prisma
npx prisma generate

# Crear base de datos y ejecutar migraciones
npx prisma migrate dev --name init

# Cargar datos de prueba (opcional)
npm run prisma:seed

# Iniciar servidor de desarrollo
npm run dev
```

### Frontend

```bash
# En el directorio raíz
npm install

# Iniciar servidor de desarrollo
npm start
```

## Variables de Entorno (Backend)

```env
# Servidor
NODE_ENV=development
PORT=8080

# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/roommatch?schema=public"

# JWT
JWT_SECRET=tu_secret_key_muy_segura
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200
```

## Comandos Disponibles

### Frontend
```bash
npm start           # Iniciar servidor de desarrollo
npm run build       # Compilar para producción
npm test            # Ejecutar tests
npm run lint        # Verificar código
```

### Backend
```bash
npm run dev         # Servidor con hot-reload
npm run build       # Compilar TypeScript
npm start           # Iniciar servidor compilado
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:seed      # Cargar datos de prueba
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/refresh` - Refrescar token

### Usuarios
- `GET /api/users` - Listar usuarios (Admin)
- `GET /api/users/:id` - Obtener usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `GET /api/users/roomies` - Buscar roomies
- `GET /api/users/profile/roomie` - Mi perfil de roomie
- `PATCH /api/users/profile/roomie` - Actualizar perfil

### Propiedades
- `GET /api/properties` - Listar propiedades
- `POST /api/properties` - Crear propiedad
- `GET /api/properties/:id` - Obtener propiedad
- `PATCH /api/properties/:id` - Actualizar propiedad
- `DELETE /api/properties/:id` - Eliminar propiedad

### Habitaciones
- `GET /api/rooms` - Listar habitaciones
- `POST /api/rooms` - Crear habitación
- `GET /api/rooms/:id` - Obtener habitación
- `PATCH /api/rooms/:id` - Actualizar habitación

### Solicitudes
- `POST /api/requests` - Crear solicitud
- `GET /api/requests/my` - Mis solicitudes
- `GET /api/requests/received` - Solicitudes recibidas
- `POST /api/requests/:id/respond` - Responder solicitud

### Matches
- `GET /api/matches` - Mis matches
- `GET /api/matches/:id` - Obtener match
- `PATCH /api/matches/:id` - Actualizar match
- `POST /api/matches/:id/rate/roomie` - Calificar roomie
- `POST /api/matches/:id/rate/owner` - Calificar propietario

### Mensajes
- `GET /api/messages/conversations` - Mis conversaciones
- `GET /api/messages/:conversationId` - Mensajes de conversación
- `POST /api/messages` - Enviar mensaje

## Documentación API

La documentación Swagger está disponible en:
- **Swagger UI**: `http://localhost:8080/api/docs`
- **HTML estático**: `http://localhost:8080/documentation`

## Usuarios de Prueba

Después de ejecutar el seed:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@roommatch.cl | admin123 | Admin |
| propietario1@test.cl | password123 | Propietario |
| propietario2@test.cl | password123 | Propietario |
| roomie1@test.cl | password123 | Roomie |
| roomie2@test.cl | password123 | Roomie |
| roomie3@test.cl | password123 | Roomie |

## Licencia

MIT
