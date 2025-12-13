# 🛒 Marketplace Multiseller - Sistema Completo

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Actores del Sistema](#actores-del-sistema)
- [Funcionalidades por Rol](#funcionalidades-por-rol)
- [Modelo de Datos](#modelo-de-datos)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Configuración del Proyecto](#configuración-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Servicios Principales](#servicios-principales)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🎯 Descripción General

Sistema de marketplace completo que conecta tres tipos de usuarios en un ecosistema de comercio electrónico:

- **Proveedores**: Crean productos y definen comisiones
- **Vendedores**: Revenden productos con su propia tienda
- **Clientes**: Compran productos de las tiendas de vendedores

### Características Principales

✅ Autenticación con Firebase Auth
✅ Almacenamiento en tiempo real con Firestore
✅ Gestión de productos con stock e imágenes
✅ Sistema de comisiones automático
✅ Carrito de compras persistente
✅ Gestión de órdenes con estados
✅ Diseño moderno estilo Notion/ChatGPT
✅ Responsive y mobile-first

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Flujo

```
┌─────────────┐
│  PROVEEDOR  │
└──────┬──────┘
       │ Crea productos
       │ Define precios
       │ Establece comisiones
       ↓
┌─────────────┐
│  PRODUCTOS  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  VENDEDOR   │
└──────┬──────┘
       │ Se suscribe
       │ Publica en su tienda
       │ Recibe órdenes
       ↓
┌─────────────┐
│   TIENDA    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   CLIENTE   │
└──────┬──────┘
       │ Navega
       │ Agrega al carrito
       │ Realiza compra
       ↓
┌─────────────┐
│   ÓRDENES   │
└─────────────┘
```

### Stack Tecnológico

**Frontend:**
- Angular 19 (Standalone Components)
- TypeScript 5.7
- Bootstrap 5.3 + SCSS
- RxJS + Signals

**Backend:**
- Firebase Authentication
- Cloud Firestore
- Firebase Storage (para imágenes)

**Herramientas:**
- Angular CLI
- Git

---

## 👥 Actores del Sistema

### 1. Proveedor (Provider)
- **Rol**: `UserRole.PROVIDER`
- **Permisos**: Crear/editar/eliminar sus propios productos
- **Dashboard**: `/provider/dashboard`

### 2. Vendedor (Seller)
- **Rol**: `UserRole.SELLER`
- **Permisos**: Suscribirse a productos, publicar en su tienda, gestionar órdenes
- **Dashboard**: `/seller/dashboard`

### 3. Cliente (Customer)
- **Rol**: `UserRole.CUSTOMER`
- **Permisos**: Navegar, comprar, ver historial
- **Dashboard**: `/customer/catalog`

---

## 🔧 Funcionalidades por Rol

### 🏭 Proveedor

#### Gestión de Productos
- ✅ Crear nuevo producto
  - Nombre, descripción, categoría
  - Precio de venta
  - Stock inicial
  - Imagen del producto
  - Tasa de comisión para vendedores (%)
- ✅ Editar productos existentes
- ✅ Eliminar productos
- ✅ Actualizar stock
- ✅ Activar/desactivar productos

#### Dashboard
- 📊 Total de productos creados
- 📊 Productos activos vs inactivos
- 📊 Total de órdenes recibidas
- 📊 Ingresos totales
- 📊 Comisiones pagadas a vendedores

#### Gestión de Órdenes
- Ver todas las órdenes de sus productos
- Actualizar estados:
  - `PENDING` → Pendiente
  - `CONFIRMED` → Confirmada
  - `SHIPPED` → Enviada
  - `DELIVERED` → Entregada
  - `CANCELLED` → Cancelada

---

### 🏪 Vendedor

#### Catálogo de Productos
- ✅ Ver todos los productos disponibles de proveedores
- ✅ Filtrar por categoría
- ✅ Buscar productos
- ✅ Ver detalles (precio, comisión, stock)

#### Suscripción a Productos
- ✅ Suscribirse a productos de interés
- ✅ Ver lista de productos suscritos
- ✅ Publicar/despublicar en su tienda
- ✅ Cancelar suscripción

#### Mi Tienda
- Ver productos publicados
- URL única: `/seller/{sellerId}/store`
- Gestionar visibilidad de productos

#### Gestión de Órdenes
- Ver órdenes recibidas
- Filtrar por estado
- Ver detalles de cada orden
- Calcular comisiones ganadas

#### Dashboard
- 📊 Total de productos publicados
- 📊 Órdenes recibidas
- 📊 Ventas totales
- 📊 Comisiones ganadas
- 📊 Productos más vendidos

---

### 🛍️ Cliente

#### Navegación y Búsqueda
- ✅ Explorar catálogo completo
- ✅ Buscar productos por nombre
- ✅ Filtrar por categoría
- ✅ Ver detalles del producto
- ✅ Ver información del vendedor

#### Carrito de Compras
- ✅ Agregar productos al carrito
- ✅ Modificar cantidades
- ✅ Eliminar productos
- ✅ Ver subtotal en tiempo real
- ✅ Persistencia (localStorage)

#### Proceso de Checkout
- ✅ Ingresar dirección de envío
- ✅ Dirección de facturación (opcional)
- ✅ Ver resumen de la orden
- ✅ Confirmar compra
- ✅ Generación automática de órdenes

#### Historial de Compras
- Ver todas las órdenes realizadas
- Filtrar por estado
- Ver detalles de cada orden
- Seguimiento de envíos

#### Sistema de Reseñas
- Calificar productos (1-5 estrellas)
- Escribir comentarios
- Ver reseñas de otros clientes

---

## 📊 Modelo de Datos

### User (Firestore: `users`)
```typescript
{
  id: string;              // UID de Firebase Auth
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;          // PROVIDER | SELLER | CUSTOMER
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

**Extensiones por Rol:**

**Provider:**
```typescript
{
  ...User,
  businessName: string;
  description?: string;
  phone?: string;
  address?: string;
}
```

**Seller:**
```typescript
{
  ...User,
  storeName: string;
  storeDescription?: string;
  phone?: string;
  subscribedProducts: string[];  // Array de product IDs
}
```

**Customer:**
```typescript
{
  ...User,
  phone?: string;
  shippingAddress?: string;
  billingAddress?: string;
}
```

### Product (Firestore: `products`)
```typescript
{
  id: string;
  providerId: string;       // Referencia al proveedor
  name: string;
  description: string;
  category: string;
  price: number;
  commissionRate: number;   // Porcentaje (ej: 10 = 10%)
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### SellerProduct (Firestore: `seller_products`)
```typescript
{
  id: string;
  productId: string;        // Referencia al producto
  sellerId: string;         // Referencia al vendedor
  isPublished: boolean;     // Visible en su tienda
  customPrice?: number;     // Precio personalizado (opcional)
  subscribedAt: Date;
}
```

### Order (Firestore: `orders`)
```typescript
{
  id: string;
  customerId: string;
  sellerId: string;
  providerId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  totalCommission: number;
  status: OrderStatus;
  shippingAddress: string;
  billingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OrderItem
```typescript
{
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  commission: number;       // Comisión del vendedor
  subtotal: number;
}
```

### Review (Firestore: `reviews`)
```typescript
{
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  orderId: string;
  rating: number;           // 1-5 estrellas
  comment: string;
  createdAt: Date;
}
```

### Cart (localStorage)
```typescript
{
  items: CartItem[];
}

interface CartItem {
  productId: string;
  sellerId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
}
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Angular | 19.2 | Framework principal |
| TypeScript | 5.7 | Lenguaje de programación |
| Bootstrap | 5.3 | UI Framework |
| SCSS | - | Preprocesador CSS |
| RxJS | 7.8 | Programación reactiva |
| Angular Signals | - | Estado reactivo |

### Firebase

| Servicio | Propósito |
|----------|-----------|
| Firebase Auth | Autenticación de usuarios |
| Cloud Firestore | Base de datos NoSQL |
| Firebase Storage | Almacenamiento de imágenes |
| Firebase Hosting | Deploy (opcional) |

### Herramientas de Desarrollo

- **Angular CLI**: Generación y desarrollo
- **Git**: Control de versiones
- **VS Code**: Editor recomendado
- **Chrome DevTools**: Debugging

---

## ⚙️ Configuración del Proyecto

### Prerrequisitos

```bash
Node.js >= 18.x
npm >= 9.x
Angular CLI >= 19.x
```

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd vumer-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**

Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebase: {
    projectId: 'tu-project-id',
    appId: 'tu-app-id',
    storageBucket: 'tu-storage-bucket',
    apiKey: 'tu-api-key',
    authDomain: 'tu-auth-domain',
    messagingSenderId: 'tu-messaging-sender-id',
    measurementId: 'tu-measurement-id'
  }
};
```

4. **Iniciar servidor de desarrollo**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

---

## 📁 Estructura del Proyecto

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts           # Protección de rutas
│   ├── models/
│   │   ├── user.model.ts           # Modelos de usuario
│   │   ├── product.model.ts        # Modelos de producto
│   │   ├── order.model.ts          # Modelos de orden
│   │   └── review.model.ts         # Modelo de reseña
│   └── services/
│       ├── auth.service.ts         # Autenticación Firebase
│       ├── product.service.ts      # CRUD de productos
│       ├── seller.service.ts       # Gestión de vendedores
│       ├── cart.service.ts         # Carrito de compras
│       ├── order.service.ts        # Gestión de órdenes
│       └── local-storage.service.ts # Persistencia local
├── features/
│   ├── auth/                        # Módulo de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── provider/                    # Módulo de proveedor
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── orders/
│   ├── seller/                      # Módulo de vendedor
│   │   ├── dashboard/
│   │   ├── catalog/
│   │   ├── my-store/
│   │   └── orders/
│   └── customer/                    # Módulo de cliente
│       ├── catalog/
│       ├── product-detail/
│       ├── cart/
│       ├── checkout/
│       └── orders/
├── shared/                          # Componentes compartidos
│   └── components/
│       ├── layout/
│       ├── navbar/
│       └── sidebar/
├── app.component.ts
├── app.config.ts                    # Configuración de la app
└── app.routes.ts                    # Rutas principales
```

---

## 🔌 Servicios Principales

### AuthService

Gestiona la autenticación con Firebase Auth y datos de usuario en Firestore.

**Métodos principales:**
```typescript
async register(userData: Partial<User>, password: string)
async login(email: string, password: string)
async logout()
async updateProfile(userData: Partial<User>)
hasRole(role: UserRole): boolean
getDashboardRoute(): string
```

### ProductService

CRUD completo de productos para proveedores.

**Métodos principales:**
```typescript
async createProduct(productData: Partial<Product>)
async updateProduct(productId: string, productData: Partial<Product>)
async deleteProduct(productId: string)
async getProductById(productId: string)
async getProviderProducts(providerId?: string)
async getActiveProducts()
async searchProducts(query: string, category?: string)
async updateStock(productId: string, quantity: number)
```

### SellerService

Gestión de suscripciones y publicación de productos.

**Métodos principales:**
```typescript
async subscribeToProduct(productId: string)
async unsubscribeFromProduct(productId: string)
async publishProduct(productId: string, publish: boolean)
async getSubscribedProducts(sellerId?: string)
async getPublishedProducts(sellerId?: string)
async isSubscribed(productId: string)
```

### CartService

Gestión del carrito de compras con persistencia local.

**Métodos principales:**
```typescript
addItem(item: Omit<CartItem, 'quantity'>)
removeItem(productId: string, sellerId: string)
updateQuantity(productId: string, sellerId: string, quantity: number)
clearCart()
getTotal(): number
getItemCount(): number
```

### OrderService

Creación y gestión de órdenes.

**Métodos principales:**
```typescript
async createOrder(shippingAddress: string, billingAddress?: string)
async updateOrderStatus(orderId: string, status: OrderStatus)
async getOrderById(orderId: string)
async getCustomerOrders(customerId?: string)
async getSellerOrders(sellerId?: string)
async getProviderOrders(providerId?: string)
```

---

## 🔄 Flujo de Trabajo

### 1. Registro de Usuarios

```
Cliente accede a /auth/register
  ↓
Selecciona rol (Provider/Seller/Customer)
  ↓
Completa formulario
  ↓
AuthService.register()
  ↓
Firebase Auth crea usuario
  ↓
Firestore guarda datos adicionales
  ↓
Redirige a dashboard según rol
```

### 2. Proveedor Crea Producto

```
Proveedor accede a /provider/products/new
  ↓
Completa formulario:
  - Nombre, descripción, categoría
  - Precio, stock
  - Tasa de comisión (%)
  - Imagen (opcional)
  ↓
ProductService.createProduct()
  ↓
Producto guardado en Firestore
  ↓
Aparece en catálogo de proveedores
```

### 3. Vendedor Se Suscribe a Producto

```
Vendedor navega /seller/catalog
  ↓
Busca/filtra productos
  ↓
Click en "Suscribirse"
  ↓
SellerService.subscribeToProduct()
  ↓
Registro en Firestore (seller_products)
  ↓
Producto disponible para publicar
```

### 4. Cliente Realiza Compra

```
Cliente navega /customer/catalog
  ↓
Selecciona productos
  ↓
Agrega al carrito (CartService)
  ↓
Click en "Checkout"
  ↓
Ingresa dirección de envío
  ↓
Confirma compra
  ↓
OrderService.createOrder()
  ↓
Crea órdenes por vendedor
  ↓
Actualiza stock (ProductService)
  ↓
Limpia carrito
  ↓
Notificación de éxito
```

---

## 🎨 Diseño UI/UX

### Paleta de Colores (Notion-inspired)

```scss
// Colores principales
$primary: #2563eb;       // Azul brillante
$success: #10b981;       // Verde esmeralda
$danger: #ef4444;        // Rojo
$warning: #f59e0b;       // Ámbar

// Grises neutrales
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-500: #6b7280;
$gray-900: #111827;
```

### Componentes Personalizados

- **Cards**: Sombras suaves, hover con elevación
- **Buttons**: Bordes redondeados, transiciones suaves
- **Inputs**: Enfoque con anillo azul sutil
- **Tables**: Filas con hover, encabezados en mayúsculas
- **Sidebar**: Estilo Notion, navegación con iconos
- **Scrollbar**: Delgado y discreto

### Tipografía

- **Fuente**: Inter (system fonts fallback)
- **Tamaño base**: 15px
- **Line height**: 1.6
- **Pesos**: 400 (regular), 500 (medium), 600 (semibold)

---

## 📱 Responsive Design

El diseño es mobile-first y se adapta a:

- **Desktop**: >= 1024px (Sidebar fijo)
- **Tablet**: 768px - 1023px (Sidebar colapsable)
- **Mobile**: < 768px (Sidebar overlay)

---

## 🔐 Seguridad

### Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: Solo lectura propia y actualización
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Products: Proveedores pueden CRUD sus productos
    match /products/{productId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                      request.resource.data.providerId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.providerId;
    }

    // Seller Products: Vendedores gestionan sus suscripciones
    match /seller_products/{sellerProductId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.resource.data.sellerId == request.auth.uid;
    }

    // Orders: Usuarios ven sus propias órdenes
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                    (request.auth.uid == resource.data.customerId ||
                     request.auth.uid == resource.data.sellerId ||
                     request.auth.uid == resource.data.providerId);
      allow create: if request.auth != null &&
                      request.resource.data.customerId == request.auth.uid;
      allow update: if request.auth != null &&
                      (request.auth.uid == resource.data.sellerId ||
                       request.auth.uid == resource.data.providerId);
    }

    // Reviews: Clientes pueden crear/editar sus reseñas
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.resource.data.customerId == request.auth.uid;
    }
  }
}
```

### Guards de Angular

**AuthGuard**: Protege rutas que requieren autenticación
**RoleGuard**: Valida que el usuario tenga el rol correcto

---

## 🚀 Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar tests
npm test

# Linting
npm run lint

# Deploy a Firebase Hosting
firebase deploy
```

---

## 📈 Métricas y Analytics

### Dashboard del Proveedor

- Total de productos
- Productos activos
- Total de ventas
- Comisiones pagadas
- Gráfico de ventas por mes

### Dashboard del Vendedor

- Productos publicados
- Órdenes recibidas
- Ventas totales
- Comisiones ganadas
- Top 5 productos más vendidos

### Dashboard del Cliente

- Total de compras
- Dinero gastado
- Productos favoritos
- Historial de reseñas

---

## 🔮 Próximas Características

- [ ] Notificaciones push
- [ ] Chat en tiempo real (proveedor-vendedor)
- [ ] Sistema de puntos/descuentos
- [ ] Reportes avanzados (PDF)
- [ ] Integración con pasarelas de pago (Stripe, PayPal)
- [ ] Sistema de envíos con tracking
- [ ] Multi-idioma (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Dark mode
- [ ] Exportar datos a Excel

---

## 👨‍💻 Guía de Desarrollo

### Crear un Nuevo Componente

```bash
ng generate component features/provider/dashboard
```

### Crear un Nuevo Servicio

```bash
ng generate service core/services/notification
```

### Estructura de Commits

```
feat: Agregar funcionalidad de reseñas
fix: Corregir cálculo de comisiones
style: Actualizar estilos del sidebar
docs: Actualizar PROJECT.md
refactor: Mejorar ProductService
```

### Testing

```typescript
// Ejemplo de test para ProductService
it('should create product successfully', async () => {
  const productData = {
    name: 'Test Product',
    price: 100,
    category: 'Electronics'
  };

  const result = await productService.createProduct(productData);

  expect(result.success).toBe(true);
  expect(result.product).toBeDefined();
});
```

---

## 📞 Soporte

Para problemas o preguntas:
- Crear un issue en GitHub
- Revisar la documentación de Firebase
- Consultar la documentación de Angular

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 🙏 Créditos

Desarrollado con ❤️ usando Angular y Firebase.

**Inspirado en:**
- Notion (UI/UX)
- ChatGPT (Diseño limpio)
- Shopify (Funcionalidad marketplace)

---

*Última actualización: 2025-09-30*