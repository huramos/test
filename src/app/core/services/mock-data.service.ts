import { Injectable } from '@angular/core';
import {
  User,
  UserRole,
  UserStatus,
  Propietario,
  Roomie,
  Admin,
  RoomiePreferences
} from '../models/user.model';
import {
  Property,
  PropertyType,
  PropertyStatus,
  Room
} from '../models/property.model';
import {
  RoomRequest,
  RequestStatus,
  RequestType,
  Match,
  MatchStatus,
  Conversation,
  Message
} from '../models/room-request.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  private users: User[] = [];
  private properties: Property[] = [];
  private roomRequests: RoomRequest[] = [];
  private matches: Match[] = [];
  private conversations: Conversation[] = [];
  private messages: Message[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    this.initializeUsers();
    this.initializeProperties();
    this.initializeRoomRequests();
    this.initializeMatches();
    this.initializeConversations();
  }

  private initializeUsers(): void {
    const admin: Admin = {
      id: 'admin-1',
      firebaseUid: 'firebase-admin-1',
      email: 'admin@roommatch.cl',
      firstName: 'Admin',
      lastName: 'RoomMatch',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: '+56912345678',
      avatar: 'https://ui-avatars.com/api/?name=Admin+RoomMatch&background=6366f1&color=fff',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      permissions: ['all']
    };

    const propietarios: Propietario[] = [
      {
        id: 'prop-1',
        firebaseUid: 'firebase-prop-1',
        email: 'carlos.mendez@email.com',
        firstName: 'Carlos',
        lastName: 'Méndez',
        role: UserRole.PROPIETARIO,
        status: UserStatus.ACTIVE,
        phone: '+56987654321',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendez&background=10b981&color=fff',
        bio: 'Propietario con 5 años de experiencia en arriendos compartidos.',
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-06-01'),
        properties: ['prop-1', 'prop-2'],
        verifiedOwner: true,
        rating: 4.8,
        totalReviews: 23
      },
      {
        id: 'prop-2',
        firebaseUid: 'firebase-prop-2',
        email: 'maria.gonzalez@email.com',
        firstName: 'María',
        lastName: 'González',
        role: UserRole.PROPIETARIO,
        status: UserStatus.ACTIVE,
        phone: '+56976543210',
        avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff',
        bio: 'Dueña de departamentos en el centro de Santiago.',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-07-15'),
        properties: ['prop-3'],
        verifiedOwner: true,
        rating: 4.5,
        totalReviews: 12
      },
      {
        id: 'prop-3',
        firebaseUid: 'firebase-prop-3',
        email: 'pedro.silva@email.com',
        firstName: 'Pedro',
        lastName: 'Silva',
        role: UserRole.PROPIETARIO,
        status: UserStatus.ACTIVE,
        phone: '+56965432109',
        avatar: 'https://ui-avatars.com/api/?name=Pedro+Silva&background=10b981&color=fff',
        bio: 'Arriendo habitaciones a estudiantes universitarios.',
        createdAt: new Date('2024-04-20'),
        updatedAt: new Date('2024-08-01'),
        properties: ['prop-4', 'prop-5'],
        verifiedOwner: false,
        rating: 4.2,
        totalReviews: 8
      }
    ];

    const roomies: Roomie[] = [
      {
        id: 'roomie-1',
        firebaseUid: 'firebase-roomie-1',
        email: 'ana.torres@email.com',
        firstName: 'Ana',
        lastName: 'Torres',
        role: UserRole.ROOMIE,
        status: UserStatus.ACTIVE,
        phone: '+56954321098',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Torres&background=f59e0b&color=fff',
        bio: 'Estudiante de medicina en la Universidad de Chile. Busco un lugar tranquilo.',
        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-09-10'),
        preferences: {
          minBudget: 250000,
          maxBudget: 400000,
          preferredCommunas: ['Providencia', 'Ñuñoa', 'Santiago Centro'],
          smokingAllowed: false,
          petsAllowed: true,
          quietEnvironment: true,
          studentsOnly: true
        },
        hasRoom: false,
        occupation: 'Estudiante de Medicina',
        age: 23,
        verifiedIdentity: true,
        rating: 4.9,
        totalReviews: 5
      },
      {
        id: 'roomie-2',
        firebaseUid: 'firebase-roomie-2',
        email: 'diego.ramirez@email.com',
        firstName: 'Diego',
        lastName: 'Ramírez',
        role: UserRole.ROOMIE,
        status: UserStatus.ACTIVE,
        phone: '+56943210987',
        avatar: 'https://ui-avatars.com/api/?name=Diego+Ramirez&background=f59e0b&color=fff',
        bio: 'Ingeniero de software, trabajo remoto. Tengo una pieza disponible en mi depa.',
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date('2024-09-15'),
        preferences: {
          minBudget: 200000,
          maxBudget: 350000,
          preferredCommunas: ['Las Condes', 'Vitacura', 'Providencia'],
          smokingAllowed: false,
          petsAllowed: false,
          preferredGender: 'male',
          preferredAgeMin: 25,
          preferredAgeMax: 40,
          workersOnly: true
        },
        hasRoom: true,
        currentPropertyId: 'prop-6',
        occupation: 'Ingeniero de Software',
        age: 28,
        verifiedIdentity: true,
        rating: 4.7,
        totalReviews: 3
      },
      {
        id: 'roomie-3',
        firebaseUid: 'firebase-roomie-3',
        email: 'valentina.castro@email.com',
        firstName: 'Valentina',
        lastName: 'Castro',
        role: UserRole.ROOMIE,
        status: UserStatus.ACTIVE,
        phone: '+56932109876',
        avatar: 'https://ui-avatars.com/api/?name=Valentina+Castro&background=f59e0b&color=fff',
        bio: 'Diseñadora gráfica freelance. Me gustan las plantas y los animales.',
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-09-20'),
        preferences: {
          minBudget: 300000,
          maxBudget: 500000,
          preferredCommunas: ['Ñuñoa', 'La Reina', 'Peñalolén'],
          smokingAllowed: false,
          petsAllowed: true,
          preferredGender: 'female',
          quietEnvironment: true
        },
        hasRoom: false,
        occupation: 'Diseñadora Gráfica',
        age: 26,
        verifiedIdentity: true,
        rating: 4.6,
        totalReviews: 2
      },
      {
        id: 'roomie-4',
        firebaseUid: 'firebase-roomie-4',
        email: 'matias.fernandez@email.com',
        firstName: 'Matías',
        lastName: 'Fernández',
        role: UserRole.ROOMIE,
        status: UserStatus.ACTIVE,
        phone: '+56921098765',
        avatar: 'https://ui-avatars.com/api/?name=Matias+Fernandez&background=f59e0b&color=fff',
        bio: 'Estudiante de derecho en la PUC. Busco roomies responsables.',
        createdAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-09-25'),
        preferences: {
          minBudget: 280000,
          maxBudget: 450000,
          preferredCommunas: ['Santiago Centro', 'Providencia', 'Macul'],
          smokingAllowed: false,
          petsAllowed: false,
          quietEnvironment: true,
          studentsOnly: true
        },
        hasRoom: false,
        occupation: 'Estudiante de Derecho',
        age: 22,
        verifiedIdentity: false,
        rating: 4.4,
        totalReviews: 1
      },
      {
        id: 'roomie-5',
        firebaseUid: 'firebase-roomie-5',
        email: 'camila.herrera@email.com',
        firstName: 'Camila',
        lastName: 'Herrera',
        role: UserRole.ROOMIE,
        status: UserStatus.ACTIVE,
        phone: '+56910987654',
        avatar: 'https://ui-avatars.com/api/?name=Camila+Herrera&background=f59e0b&color=fff',
        bio: 'Profesora de inglés. Tengo una habitación disponible en mi casa en Ñuñoa.',
        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-10-01'),
        preferences: {
          minBudget: 250000,
          maxBudget: 380000,
          preferredCommunas: ['Ñuñoa', 'La Florida', 'Macul'],
          smokingAllowed: false,
          petsAllowed: true,
          preferredGender: 'female',
          preferredAgeMin: 20,
          preferredAgeMax: 35
        },
        hasRoom: true,
        currentPropertyId: 'prop-7',
        occupation: 'Profesora de Inglés',
        age: 30,
        verifiedIdentity: true,
        rating: 4.8,
        totalReviews: 6
      },
      {
        id: 'roomie-6',
        firebaseUid: 'firebase-roomie-6',
        email: 'nicolas.vargas@email.com',
        firstName: 'Nicolás',
        lastName: 'Vargas',
        role: UserRole.ROOMIE,
        status: UserStatus.ACTIVE,
        phone: '+56909876543',
        avatar: 'https://ui-avatars.com/api/?name=Nicolas+Vargas&background=f59e0b&color=fff',
        bio: 'Músico y bartender. Horarios nocturnos, busco ambiente relajado.',
        createdAt: new Date('2024-07-15'),
        updatedAt: new Date('2024-10-05'),
        preferences: {
          minBudget: 180000,
          maxBudget: 300000,
          preferredCommunas: ['Bellavista', 'Providencia', 'Santiago Centro'],
          smokingAllowed: true,
          petsAllowed: true,
          preferredGender: 'any'
        },
        hasRoom: false,
        occupation: 'Músico / Bartender',
        age: 27,
        verifiedIdentity: false,
        rating: 4.1,
        totalReviews: 2
      }
    ];

    this.users = [admin, ...propietarios, ...roomies];
  }

  private initializeProperties(): void {
    this.properties = [
      {
        id: 'prop-1',
        ownerId: 'prop-1',
        title: 'Departamento amplio en Providencia',
        description: 'Hermoso departamento de 3 habitaciones en el corazón de Providencia. Cerca del metro y áreas verdes. Ideal para profesionales jóvenes.',
        type: PropertyType.APARTMENT,
        status: PropertyStatus.AVAILABLE,
        address: {
          street: 'Av. Providencia',
          number: '1234',
          comuna: 'Providencia',
          city: 'Santiago',
          region: 'Metropolitana',
          nearbyPlaces: ['Metro Manuel Montt', 'Parque Balmaceda', 'Mall Costanera Center']
        },
        features: {
          totalRooms: 3,
          bathrooms: 2,
          squareMeters: 85,
          furnished: true,
          hasParking: true,
          hasLaundry: true,
          hasWifi: true,
          hasHeating: true,
          hasAC: false,
          hasTerrace: true,
          hasGarden: false,
          hasSecurity: true,
          hasElevator: true,
          floorNumber: 8
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
          visitorsAllowed: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          minStayMonths: 6,
          genderPreference: 'any'
        },
        rooms: [
          {
            id: 'room-1-1',
            propertyId: 'prop-1',
            name: 'Habitación Principal',
            description: 'Habitación grande con baño privado y closet amplio.',
            squareMeters: 18,
            monthlyRent: 380000,
            isPrivateBathroom: true,
            isAvailable: true,
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: true,
              hasWindow: true,
              hasBalcony: true,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800']
          },
          {
            id: 'room-1-2',
            propertyId: 'prop-1',
            name: 'Habitación Secundaria',
            description: 'Habitación cómoda con buena iluminación natural.',
            squareMeters: 14,
            monthlyRent: 320000,
            isPrivateBathroom: false,
            isAvailable: true,
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: false,
              hasWindow: true,
              hasBalcony: false,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
        ],
        monthlyRent: 350000,
        expenses: 50000,
        availableFrom: new Date('2024-11-01'),
        createdAt: new Date('2024-08-01'),
        updatedAt: new Date('2024-10-15')
      },
      {
        id: 'prop-2',
        ownerId: 'prop-1',
        title: 'Casa compartida en Ñuñoa',
        description: 'Linda casa de 4 habitaciones con jardín. Ambiente tranquilo, ideal para estudiantes.',
        type: PropertyType.HOUSE,
        status: PropertyStatus.AVAILABLE,
        address: {
          street: 'Calle Irarrázaval',
          number: '567',
          comuna: 'Ñuñoa',
          city: 'Santiago',
          region: 'Metropolitana',
          nearbyPlaces: ['Metro Irarrázaval', 'Plaza Ñuñoa', 'Universidad Católica']
        },
        features: {
          totalRooms: 4,
          bathrooms: 2,
          squareMeters: 120,
          furnished: true,
          hasParking: false,
          hasLaundry: true,
          hasWifi: true,
          hasHeating: true,
          hasAC: false,
          hasTerrace: false,
          hasGarden: true,
          hasSecurity: false,
          hasElevator: false
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: true,
          partiesAllowed: false,
          visitorsAllowed: true,
          quietHoursStart: '23:00',
          quietHoursEnd: '07:00',
          minStayMonths: 3,
          studentsOnly: true
        },
        rooms: [
          {
            id: 'room-2-1',
            propertyId: 'prop-2',
            name: 'Habitación con jardín',
            description: 'Habitación con vista al jardín, muy tranquila.',
            squareMeters: 15,
            monthlyRent: 280000,
            isPrivateBathroom: false,
            isAvailable: true,
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: true,
              hasWindow: true,
              hasBalcony: false,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800']
          },
          {
            id: 'room-2-2',
            propertyId: 'prop-2',
            name: 'Habitación frontal',
            description: 'Habitación amplia en la parte frontal de la casa.',
            squareMeters: 16,
            monthlyRent: 300000,
            isPrivateBathroom: false,
            isAvailable: false,
            currentOccupantId: 'roomie-4',
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: true,
              hasWindow: true,
              hasBalcony: false,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1486946255434-2466348c2166?w=800']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
          'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800'
        ],
        monthlyRent: 290000,
        expenses: 40000,
        availableFrom: new Date('2024-10-15'),
        createdAt: new Date('2024-07-15'),
        updatedAt: new Date('2024-10-10')
      },
      {
        id: 'prop-3',
        ownerId: 'prop-2',
        title: 'Estudio moderno en Santiago Centro',
        description: 'Estudio completamente equipado en edificio nuevo. Perfecto para una persona.',
        type: PropertyType.STUDIO,
        status: PropertyStatus.AVAILABLE,
        address: {
          street: 'Calle Morandé',
          number: '890',
          comuna: 'Santiago',
          city: 'Santiago',
          region: 'Metropolitana',
          nearbyPlaces: ['Metro La Moneda', 'Plaza de Armas', 'Biblioteca Nacional']
        },
        features: {
          totalRooms: 1,
          bathrooms: 1,
          squareMeters: 35,
          furnished: true,
          hasParking: false,
          hasLaundry: false,
          hasWifi: true,
          hasHeating: true,
          hasAC: true,
          hasTerrace: false,
          hasGarden: false,
          hasSecurity: true,
          hasElevator: true,
          floorNumber: 15
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
          visitorsAllowed: true,
          minStayMonths: 12
        },
        rooms: [
          {
            id: 'room-3-1',
            propertyId: 'prop-3',
            name: 'Estudio completo',
            description: 'Espacio único con kitchenette y baño privado.',
            squareMeters: 35,
            monthlyRent: 450000,
            isPrivateBathroom: true,
            isAvailable: true,
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: true,
              hasWindow: true,
              hasBalcony: false,
              hasPrivateEntrance: true
            },
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        ],
        monthlyRent: 450000,
        expenses: 30000,
        availableFrom: new Date('2024-12-01'),
        createdAt: new Date('2024-09-01'),
        updatedAt: new Date('2024-10-20')
      },
      {
        id: 'prop-4',
        ownerId: 'prop-3',
        title: 'Departamento compartido Las Condes',
        description: 'Excelente ubicación en Las Condes, cerca de todo. 2 habitaciones disponibles.',
        type: PropertyType.APARTMENT,
        status: PropertyStatus.AVAILABLE,
        address: {
          street: 'Av. Apoquindo',
          number: '4500',
          comuna: 'Las Condes',
          city: 'Santiago',
          region: 'Metropolitana',
          nearbyPlaces: ['Metro El Golf', 'Parque Araucano', 'Mall Parque Arauco']
        },
        features: {
          totalRooms: 3,
          bathrooms: 2,
          squareMeters: 95,
          furnished: true,
          hasParking: true,
          hasLaundry: true,
          hasWifi: true,
          hasHeating: true,
          hasAC: true,
          hasTerrace: true,
          hasGarden: false,
          hasSecurity: true,
          hasElevator: true,
          floorNumber: 12
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
          visitorsAllowed: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          minStayMonths: 6,
          workersOnly: true
        },
        rooms: [
          {
            id: 'room-4-1',
            propertyId: 'prop-4',
            name: 'Suite con baño',
            description: 'Habitación tipo suite con baño privado.',
            squareMeters: 20,
            monthlyRent: 480000,
            isPrivateBathroom: true,
            isAvailable: true,
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: true,
              hasWindow: true,
              hasBalcony: true,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800']
          },
          {
            id: 'room-4-2',
            propertyId: 'prop-4',
            name: 'Habitación estándar',
            description: 'Habitación cómoda con buena vista.',
            squareMeters: 15,
            monthlyRent: 380000,
            isPrivateBathroom: false,
            isAvailable: true,
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: true,
              hasWindow: true,
              hasBalcony: false,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        ],
        monthlyRent: 430000,
        expenses: 60000,
        availableFrom: new Date('2024-11-15'),
        createdAt: new Date('2024-08-15'),
        updatedAt: new Date('2024-10-18')
      },
      {
        id: 'prop-5',
        ownerId: 'prop-3',
        title: 'Habitación en casa familiar Macul',
        description: 'Habitación en casa familiar cerca de universidades. Ambiente tranquilo y seguro.',
        type: PropertyType.SHARED_APARTMENT,
        status: PropertyStatus.AVAILABLE,
        address: {
          street: 'Av. Macul',
          number: '2345',
          comuna: 'Macul',
          city: 'Santiago',
          region: 'Metropolitana',
          nearbyPlaces: ['Universidad de Chile - Campus JGM', 'Metro Macul']
        },
        features: {
          totalRooms: 1,
          bathrooms: 1,
          squareMeters: 14,
          furnished: true,
          hasParking: false,
          hasLaundry: true,
          hasWifi: true,
          hasHeating: true,
          hasAC: false,
          hasTerrace: false,
          hasGarden: true,
          hasSecurity: false,
          hasElevator: false
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
          visitorsAllowed: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
          minStayMonths: 3,
          studentsOnly: true,
          maxAge: 30
        },
        rooms: [
          {
            id: 'room-5-1',
            propertyId: 'prop-5',
            name: 'Habitación estudiante',
            description: 'Habitación ideal para estudiante, escritorio incluido.',
            squareMeters: 14,
            monthlyRent: 220000,
            isPrivateBathroom: false,
            isAvailable: true,
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: true,
              hasWindow: true,
              hasBalcony: false,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
        ],
        monthlyRent: 220000,
        expenses: 25000,
        availableFrom: new Date('2024-10-01'),
        createdAt: new Date('2024-09-10'),
        updatedAt: new Date('2024-10-22')
      },
      {
        id: 'prop-6',
        ownerId: 'roomie-2',
        title: 'Habitación en depto de profesional',
        description: 'Comparto mi departamento en Las Condes. Busco roomie responsable y ordenado.',
        type: PropertyType.SHARED_APARTMENT,
        status: PropertyStatus.AVAILABLE,
        address: {
          street: 'Av. Vitacura',
          number: '3200',
          comuna: 'Las Condes',
          city: 'Santiago',
          region: 'Metropolitana',
          nearbyPlaces: ['Metro Tobalaba', 'Mall Alto Las Condes']
        },
        features: {
          totalRooms: 1,
          bathrooms: 1,
          squareMeters: 16,
          furnished: false,
          hasParking: true,
          hasLaundry: true,
          hasWifi: true,
          hasHeating: true,
          hasAC: false,
          hasTerrace: true,
          hasGarden: false,
          hasSecurity: true,
          hasElevator: true,
          floorNumber: 6
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: false,
          partiesAllowed: false,
          visitorsAllowed: true,
          quietHoursStart: '23:00',
          quietHoursEnd: '08:00',
          minStayMonths: 6,
          genderPreference: 'male',
          minAge: 25,
          maxAge: 40,
          workersOnly: true
        },
        rooms: [
          {
            id: 'room-6-1',
            propertyId: 'prop-6',
            name: 'Habitación disponible',
            description: 'Habitación sin amueblar, puedes traer tus cosas.',
            squareMeters: 16,
            monthlyRent: 350000,
            isPrivateBathroom: false,
            isAvailable: true,
            features: {
              hasBed: false,
              hasCloset: true,
              hasDesk: false,
              hasWindow: true,
              hasBalcony: false,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        ],
        monthlyRent: 350000,
        expenses: 45000,
        availableFrom: new Date('2024-11-01'),
        createdAt: new Date('2024-09-20'),
        updatedAt: new Date('2024-10-25')
      },
      {
        id: 'prop-7',
        ownerId: 'roomie-5',
        title: 'Pieza en casa de profesora',
        description: 'Ofrezco una habitación en mi casa en Ñuñoa. Ambiente familiar y tranquilo.',
        type: PropertyType.SHARED_APARTMENT,
        status: PropertyStatus.AVAILABLE,
        address: {
          street: 'Calle Sucre',
          number: '456',
          comuna: 'Ñuñoa',
          city: 'Santiago',
          region: 'Metropolitana',
          nearbyPlaces: ['Metro Chile España', 'Estadio Nacional']
        },
        features: {
          totalRooms: 1,
          bathrooms: 1,
          squareMeters: 13,
          furnished: true,
          hasParking: false,
          hasLaundry: true,
          hasWifi: true,
          hasHeating: true,
          hasAC: false,
          hasTerrace: false,
          hasGarden: true,
          hasSecurity: false,
          hasElevator: false
        },
        rules: {
          smokingAllowed: false,
          petsAllowed: true,
          partiesAllowed: false,
          visitorsAllowed: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
          minStayMonths: 3,
          genderPreference: 'female',
          minAge: 20,
          maxAge: 35
        },
        rooms: [
          {
            id: 'room-7-1',
            propertyId: 'prop-7',
            name: 'Habitación acogedora',
            description: 'Habitación amoblada con buena luz natural.',
            squareMeters: 13,
            monthlyRent: 280000,
            isPrivateBathroom: false,
            isAvailable: true,
            features: {
              hasBed: true,
              hasCloset: true,
              hasDesk: true,
              hasWindow: true,
              hasBalcony: false,
              hasPrivateEntrance: false
            },
            images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800']
          }
        ],
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
        ],
        monthlyRent: 280000,
        expenses: 30000,
        availableFrom: new Date('2024-10-15'),
        createdAt: new Date('2024-09-25'),
        updatedAt: new Date('2024-10-28')
      }
    ];
  }

  private initializeRoomRequests(): void {
    this.roomRequests = [
      {
        id: 'req-1',
        type: RequestType.ROOMIE_TO_PROPERTY,
        status: RequestStatus.PENDING,
        senderId: 'roomie-1',
        receiverId: 'prop-1',
        propertyId: 'prop-1',
        roomId: 'room-1-1',
        message: 'Hola, soy estudiante de medicina y me interesa mucho la habitación principal. Soy muy ordenada y responsable. ¿Podríamos coordinar una visita?',
        moveInDate: new Date('2024-11-15'),
        stayDurationMonths: 12,
        createdAt: new Date('2024-10-20'),
        updatedAt: new Date('2024-10-20')
      },
      {
        id: 'req-2',
        type: RequestType.ROOMIE_TO_PROPERTY,
        status: RequestStatus.APPROVED,
        senderId: 'roomie-3',
        receiverId: 'prop-2',
        propertyId: 'prop-3',
        roomId: 'room-3-1',
        message: 'Me encanta el estudio, es justo lo que busco para trabajar tranquila.',
        moveInDate: new Date('2024-12-01'),
        stayDurationMonths: 12,
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-10-18'),
        respondedAt: new Date('2024-10-18'),
        responseMessage: '¡Bienvenida! Me parece perfecto, coordinemos la firma del contrato.'
      },
      {
        id: 'req-3',
        type: RequestType.ROOMIE_TO_ROOMIE,
        status: RequestStatus.PENDING,
        senderId: 'roomie-6',
        receiverId: 'roomie-2',
        propertyId: 'prop-6',
        roomId: 'room-6-1',
        message: 'Hola Diego, vi que ofreces una habitación. Soy músico pero trabajo de noche, así que durante el día soy muy tranquilo.',
        moveInDate: new Date('2024-11-01'),
        stayDurationMonths: 6,
        createdAt: new Date('2024-10-25'),
        updatedAt: new Date('2024-10-25')
      },
      {
        id: 'req-4',
        type: RequestType.ROOMIE_TO_ROOMIE,
        status: RequestStatus.REJECTED,
        senderId: 'roomie-4',
        receiverId: 'roomie-5',
        propertyId: 'prop-7',
        roomId: 'room-7-1',
        message: 'Hola Camila, me interesa la habitación. Soy estudiante de derecho.',
        moveInDate: new Date('2024-11-01'),
        createdAt: new Date('2024-10-10'),
        updatedAt: new Date('2024-10-12'),
        respondedAt: new Date('2024-10-12'),
        responseMessage: 'Lo siento, estoy buscando específicamente roomie mujer.'
      },
      {
        id: 'req-5',
        type: RequestType.ROOMIE_TO_PROPERTY,
        status: RequestStatus.PENDING,
        senderId: 'roomie-3',
        receiverId: 'prop-1',
        propertyId: 'prop-1',
        roomId: 'room-1-2',
        message: 'Me interesa la habitación secundaria. Trabajo desde casa como diseñadora.',
        moveInDate: new Date('2024-11-15'),
        stayDurationMonths: 6,
        createdAt: new Date('2024-10-28'),
        updatedAt: new Date('2024-10-28')
      }
    ];
  }

  private initializeMatches(): void {
    this.matches = [
      {
        id: 'match-1',
        requestId: 'req-2',
        propertyId: 'prop-3',
        roomId: 'room-3-1',
        participants: [
          { userId: 'prop-2', role: 'owner', joinedAt: new Date('2024-10-18') },
          { userId: 'roomie-3', role: 'roomie', joinedAt: new Date('2024-10-18') }
        ],
        status: MatchStatus.ACTIVE,
        startDate: new Date('2024-12-01'),
        monthlyRent: 450000,
        createdAt: new Date('2024-10-18'),
        updatedAt: new Date('2024-10-18')
      }
    ];
  }

  private initializeConversations(): void {
    this.conversations = [
      {
        id: 'conv-1',
        requestId: 'req-1',
        participants: ['roomie-1', 'prop-1'],
        lastMessage: {
          id: 'msg-1-3',
          conversationId: 'conv-1',
          senderId: 'prop-1',
          content: 'Perfecto, ¿te parece el sábado a las 11am?',
          isRead: false,
          createdAt: new Date('2024-10-21T10:30:00')
        },
        unreadCount: 1,
        createdAt: new Date('2024-10-20'),
        updatedAt: new Date('2024-10-21')
      },
      {
        id: 'conv-2',
        matchId: 'match-1',
        participants: ['roomie-3', 'prop-2'],
        lastMessage: {
          id: 'msg-2-5',
          conversationId: 'conv-2',
          senderId: 'roomie-3',
          content: 'Gracias por todo, nos vemos el 1 de diciembre.',
          isRead: true,
          createdAt: new Date('2024-10-25T15:00:00')
        },
        unreadCount: 0,
        createdAt: new Date('2024-10-18'),
        updatedAt: new Date('2024-10-25')
      }
    ];

    this.messages = [
      {
        id: 'msg-1-1',
        conversationId: 'conv-1',
        senderId: 'roomie-1',
        content: 'Hola, soy Ana y me interesa mucho la habitación.',
        isRead: true,
        createdAt: new Date('2024-10-20T14:00:00')
      },
      {
        id: 'msg-1-2',
        conversationId: 'conv-1',
        senderId: 'prop-1',
        content: 'Hola Ana, gracias por tu interés. ¿Cuándo podrías venir a verla?',
        isRead: true,
        createdAt: new Date('2024-10-20T16:00:00')
      },
      {
        id: 'msg-1-3',
        conversationId: 'conv-1',
        senderId: 'prop-1',
        content: 'Perfecto, ¿te parece el sábado a las 11am?',
        isRead: false,
        createdAt: new Date('2024-10-21T10:30:00')
      },
      {
        id: 'msg-2-1',
        conversationId: 'conv-2',
        senderId: 'roomie-3',
        content: '¡Qué bueno que aceptaste! Estoy muy emocionada.',
        isRead: true,
        createdAt: new Date('2024-10-18T18:00:00')
      },
      {
        id: 'msg-2-2',
        conversationId: 'conv-2',
        senderId: 'prop-2',
        content: 'Me alegra mucho. Te envío los datos para el contrato.',
        isRead: true,
        createdAt: new Date('2024-10-19T10:00:00')
      }
    ];
  }

  // ==================== USER METHODS ====================

  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  getUsersByRole(role: UserRole): User[] {
    return this.users.filter(u => u.role === role);
  }

  getPropietarios(): Propietario[] {
    return this.users.filter(u => u.role === UserRole.PROPIETARIO) as Propietario[];
  }

  getRoomies(): Roomie[] {
    return this.users.filter(u => u.role === UserRole.ROOMIE) as Roomie[];
  }

  getRoomiesWithRoom(): Roomie[] {
    return this.getRoomies().filter(r => r.hasRoom);
  }

  getRoomiesLookingForRoom(): Roomie[] {
    return this.getRoomies().filter(r => !r.hasRoom);
  }

  authenticateUser(email: string, firebaseUid: string): User | null {
    const user = this.users.find(u => u.email === email && u.firebaseUid === firebaseUid);
    return user || null;
  }

  // ==================== PROPERTY METHODS ====================

  getAllProperties(): Property[] {
    return this.properties;
  }

  getPropertyById(id: string): Property | undefined {
    return this.properties.find(p => p.id === id);
  }

  getPropertiesByOwner(ownerId: string): Property[] {
    return this.properties.filter(p => p.ownerId === ownerId);
  }

  getAvailableProperties(): Property[] {
    return this.properties.filter(p => p.status === PropertyStatus.AVAILABLE);
  }

  searchProperties(filters: {
    comuna?: string;
    minPrice?: number;
    maxPrice?: number;
    type?: PropertyType;
    petsAllowed?: boolean;
    smokingAllowed?: boolean;
  }): Property[] {
    return this.properties.filter(p => {
      if (p.status !== PropertyStatus.AVAILABLE) return false;
      if (filters.comuna && p.address.comuna !== filters.comuna) return false;
      if (filters.minPrice && p.monthlyRent < filters.minPrice) return false;
      if (filters.maxPrice && p.monthlyRent > filters.maxPrice) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.petsAllowed !== undefined && p.rules.petsAllowed !== filters.petsAllowed) return false;
      if (filters.smokingAllowed !== undefined && p.rules.smokingAllowed !== filters.smokingAllowed) return false;
      return true;
    });
  }

  getAvailableRooms(propertyId: string): Room[] {
    const property = this.getPropertyById(propertyId);
    return property?.rooms.filter(r => r.isAvailable) || [];
  }

  // ==================== REQUEST METHODS ====================

  getAllRequests(): RoomRequest[] {
    return this.roomRequests;
  }

  getRequestById(id: string): RoomRequest | undefined {
    return this.roomRequests.find(r => r.id === id);
  }

  getRequestsBySender(senderId: string): RoomRequest[] {
    return this.roomRequests.filter(r => r.senderId === senderId);
  }

  getRequestsByReceiver(receiverId: string): RoomRequest[] {
    return this.roomRequests.filter(r => r.receiverId === receiverId);
  }

  getPendingRequestsForUser(userId: string): RoomRequest[] {
    return this.roomRequests.filter(
      r => r.receiverId === userId && r.status === RequestStatus.PENDING
    );
  }

  // ==================== MATCH METHODS ====================

  getAllMatches(): Match[] {
    return this.matches;
  }

  getMatchById(id: string): Match | undefined {
    return this.matches.find(m => m.id === id);
  }

  getMatchesByUser(userId: string): Match[] {
    return this.matches.filter(m =>
      m.participants.some(p => p.userId === userId)
    );
  }

  getActiveMatchesByUser(userId: string): Match[] {
    return this.matches.filter(m =>
      m.status === MatchStatus.ACTIVE &&
      m.participants.some(p => p.userId === userId)
    );
  }

  // ==================== CONVERSATION METHODS ====================

  getConversationsByUser(userId: string): Conversation[] {
    return this.conversations.filter(c => c.participants.includes(userId));
  }

  getConversationById(id: string): Conversation | undefined {
    return this.conversations.find(c => c.id === id);
  }

  getMessagesByConversation(conversationId: string): Message[] {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  // ==================== STATISTICS (for Admin) ====================

  getStats() {
    return {
      totalUsers: this.users.length,
      totalPropietarios: this.getPropietarios().length,
      totalRoomies: this.getRoomies().length,
      roomiesWithRoom: this.getRoomiesWithRoom().length,
      roomiesLookingForRoom: this.getRoomiesLookingForRoom().length,
      totalProperties: this.properties.length,
      availableProperties: this.getAvailableProperties().length,
      totalRequests: this.roomRequests.length,
      pendingRequests: this.roomRequests.filter(r => r.status === RequestStatus.PENDING).length,
      approvedRequests: this.roomRequests.filter(r => r.status === RequestStatus.APPROVED).length,
      totalMatches: this.matches.length,
      activeMatches: this.matches.filter(m => m.status === MatchStatus.ACTIVE).length
    };
  }

  getComunas(): string[] {
    const comunas = new Set(this.properties.map(p => p.address.comuna));
    return Array.from(comunas).sort();
  }
}
