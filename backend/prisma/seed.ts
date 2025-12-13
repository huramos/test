import { PrismaClient, UserRole, UserStatus, PropertyType, PropertyStatus, RoomStatus, BedType, Gender, Occupation } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Generate fake Firebase UIDs for seed data (format: 28 characters)
const generateFakeFirebaseUid = () => `seed_${uuidv4().replace(/-/g, '').slice(0, 22)}`;

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.roomRequest.deleteMany();
  await prisma.room.deleteMany();
  await prisma.property.deleteMany();
  await prisma.roomieProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Datos existentes eliminados');

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      firebaseUid: generateFakeFirebaseUid(),
      email: 'admin@roommatch.cl',
      firstName: 'Admin',
      lastName: 'RoomMatch',
      phone: '+56912345678',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true
    }
  });
  console.log('👤 Admin creado:', admin.email);

  // Create propietarios
  const propietario1 = await prisma.user.create({
    data: {
      firebaseUid: generateFakeFirebaseUid(),
      email: 'propietario1@test.cl',
      firstName: 'Carlos',
      lastName: 'González',
      phone: '+56987654321',
      role: UserRole.PROPIETARIO,
      status: UserStatus.ACTIVE,
      emailVerified: true
    }
  });

  const propietario2 = await prisma.user.create({
    data: {
      firebaseUid: generateFakeFirebaseUid(),
      email: 'propietario2@test.cl',
      firstName: 'María',
      lastName: 'Silva',
      phone: '+56976543210',
      role: UserRole.PROPIETARIO,
      status: UserStatus.ACTIVE,
      emailVerified: true
    }
  });
  console.log('👤 Propietarios creados');

  // Create roomies
  const roomie1 = await prisma.user.create({
    data: {
      firebaseUid: generateFakeFirebaseUid(),
      email: 'roomie1@test.cl',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+56965432109',
      role: UserRole.ROOMIE,
      status: UserStatus.ACTIVE,
      emailVerified: true
    }
  });

  const roomie2 = await prisma.user.create({
    data: {
      firebaseUid: generateFakeFirebaseUid(),
      email: 'roomie2@test.cl',
      firstName: 'Ana',
      lastName: 'Martínez',
      phone: '+56954321098',
      role: UserRole.ROOMIE,
      status: UserStatus.ACTIVE,
      emailVerified: true
    }
  });

  const roomie3 = await prisma.user.create({
    data: {
      firebaseUid: generateFakeFirebaseUid(),
      email: 'roomie3@test.cl',
      firstName: 'Pedro',
      lastName: 'López',
      phone: '+56943210987',
      role: UserRole.ROOMIE,
      status: UserStatus.ACTIVE,
      emailVerified: true
    }
  });
  console.log('👤 Roomies creados');

  // Create roomie profiles
  await prisma.roomieProfile.createMany({
    data: [
      {
        userId: roomie1.id,
        hasRoom: false,
        birthdate: new Date('1995-05-15'),
        gender: Gender.MALE,
        occupation: Occupation.STUDENT,
        bio: 'Estudiante de ingeniería buscando departamento cerca de la universidad',
        preferences: {
          preferredLocations: ['Providencia', 'Ñuñoa', 'Santiago Centro'],
          budgetMin: 200000,
          budgetMax: 400000,
          moveInDate: '2024-02-01',
          petFriendly: true,
          smokingAllowed: false
        },
        lifestyle: {
          sleepSchedule: 'night_owl',
          workSchedule: 'flexible',
          cleanlinessLevel: 'moderate',
          socialLevel: 'moderate'
        },
        interests: ['música', 'deportes', 'tecnología'],
        languages: ['español', 'inglés'],
        profileCompletion: 85
      },
      {
        userId: roomie2.id,
        hasRoom: false,
        birthdate: new Date('1998-08-22'),
        gender: Gender.FEMALE,
        occupation: Occupation.PROFESSIONAL,
        bio: 'Profesional joven buscando compartir depa con personas tranquilas',
        preferences: {
          preferredLocations: ['Las Condes', 'Vitacura'],
          budgetMin: 300000,
          budgetMax: 500000,
          moveInDate: '2024-01-15',
          petFriendly: false,
          smokingAllowed: false
        },
        lifestyle: {
          sleepSchedule: 'early_bird',
          workSchedule: 'office_hours',
          cleanlinessLevel: 'high',
          socialLevel: 'low'
        },
        interests: ['lectura', 'yoga', 'cocina'],
        languages: ['español'],
        profileCompletion: 90
      },
      {
        userId: roomie3.id,
        hasRoom: true,
        birthdate: new Date('1992-12-10'),
        gender: Gender.MALE,
        occupation: Occupation.FREELANCER,
        bio: 'Freelancer con pieza disponible en mi depto en Providencia',
        preferences: {
          preferredLocations: ['Providencia'],
          budgetMin: 250000,
          budgetMax: 350000
        },
        lifestyle: {
          sleepSchedule: 'flexible',
          workSchedule: 'flexible',
          cleanlinessLevel: 'moderate',
          socialLevel: 'high'
        },
        interests: ['fotografía', 'viajes', 'gaming'],
        languages: ['español', 'inglés', 'portugués'],
        profileCompletion: 75
      }
    ]
  });
  console.log('📝 Perfiles de roomies creados');

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      ownerId: propietario1.id,
      title: 'Departamento amplio en Providencia',
      description: 'Hermoso departamento de 3 habitaciones con excelente ubicación, cerca del metro y supermercados.',
      type: PropertyType.APARTMENT,
      status: PropertyStatus.AVAILABLE,
      address: {
        street: 'Av. Providencia',
        number: '1234',
        apartment: '502',
        comuna: 'Providencia',
        city: 'Santiago',
        region: 'Metropolitana'
      },
      features: {
        totalRooms: 3,
        availableRooms: 2,
        bathrooms: 2,
        squareMeters: 85,
        floor: 5,
        hasElevator: true,
        hasParking: true,
        hasFurniture: true,
        hasWifi: true,
        hasAC: false,
        hasHeating: true,
        hasWasher: true
      },
      rules: {
        petsAllowed: true,
        smokingAllowed: false,
        guestsAllowed: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      },
      monthlyRent: 350000,
      commonExpenses: 50000,
      depositMonths: 1,
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ],
      isVerified: true,
      availableFrom: new Date('2024-01-15'),
      minimumStay: 6
    }
  });

  const property2 = await prisma.property.create({
    data: {
      ownerId: propietario1.id,
      title: 'Casa compartida en Ñuñoa',
      description: 'Acogedora casa con jardín, ambiente familiar y tranquilo.',
      type: PropertyType.HOUSE,
      status: PropertyStatus.AVAILABLE,
      address: {
        street: 'Calle Los Aromos',
        number: '567',
        comuna: 'Ñuñoa',
        city: 'Santiago',
        region: 'Metropolitana'
      },
      features: {
        totalRooms: 4,
        availableRooms: 2,
        bathrooms: 2,
        squareMeters: 120,
        hasGarden: true,
        hasParking: true,
        hasFurniture: false,
        hasWifi: true
      },
      rules: {
        petsAllowed: true,
        smokingAllowed: false,
        guestsAllowed: true
      },
      monthlyRent: 280000,
      commonExpenses: 30000,
      depositMonths: 1,
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
      ],
      isVerified: false,
      availableFrom: new Date('2024-02-01'),
      minimumStay: 12
    }
  });

  const property3 = await prisma.property.create({
    data: {
      ownerId: propietario2.id,
      title: 'Estudio moderno en Las Condes',
      description: 'Estudio completamente equipado en edificio con amenities.',
      type: PropertyType.STUDIO,
      status: PropertyStatus.AVAILABLE,
      address: {
        street: 'Av. Apoquindo',
        number: '4500',
        apartment: '1201',
        comuna: 'Las Condes',
        city: 'Santiago',
        region: 'Metropolitana'
      },
      features: {
        totalRooms: 1,
        availableRooms: 1,
        bathrooms: 1,
        squareMeters: 35,
        floor: 12,
        hasElevator: true,
        hasParking: false,
        hasFurniture: true,
        hasWifi: true,
        hasAC: true,
        hasGym: true,
        hasPool: true
      },
      rules: {
        petsAllowed: false,
        smokingAllowed: false,
        guestsAllowed: true,
        maxOccupants: 1
      },
      monthlyRent: 450000,
      commonExpenses: 80000,
      depositMonths: 2,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
      ],
      isVerified: true,
      availableFrom: new Date('2024-01-20'),
      minimumStay: 3
    }
  });
  console.log('🏠 Propiedades creadas');

  // Create rooms
  await prisma.room.create({
    data: {
      propertyId: property1.id,
      name: 'Habitación Principal',
      description: 'Habitación amplia con baño privado y closet grande',
      status: RoomStatus.AVAILABLE,
      squareMeters: 18,
      bedType: BedType.DOUBLE,
      hasPrivateBathroom: true,
      hasCloset: true,
      hasDesk: true,
      hasWindow: true,
      isFurnished: true,
      monthlyRent: 380000,
      images: [
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'
      ],
      availableFrom: new Date('2024-01-15')
    }
  });

  await prisma.room.create({
    data: {
      propertyId: property1.id,
      name: 'Habitación Secundaria',
      description: 'Habitación cómoda con vista a la calle',
      status: RoomStatus.AVAILABLE,
      squareMeters: 14,
      bedType: BedType.SINGLE,
      hasPrivateBathroom: false,
      hasCloset: true,
      hasDesk: true,
      hasWindow: true,
      isFurnished: true,
      monthlyRent: 320000,
      images: [
        'https://images.unsplash.com/photo-1598928506311-c55lez36a5150?w=800'
      ],
      availableFrom: new Date('2024-01-15')
    }
  });

  await prisma.room.create({
    data: {
      propertyId: property2.id,
      name: 'Habitación con jardín',
      description: 'Habitación con acceso directo al jardín',
      status: RoomStatus.AVAILABLE,
      squareMeters: 16,
      bedType: BedType.DOUBLE,
      hasPrivateBathroom: false,
      hasCloset: true,
      hasWindow: true,
      isFurnished: false,
      monthlyRent: 300000,
      availableFrom: new Date('2024-02-01')
    }
  });

  await prisma.room.create({
    data: {
      propertyId: property2.id,
      name: 'Habitación interior',
      description: 'Habitación tranquila en el segundo piso',
      status: RoomStatus.AVAILABLE,
      squareMeters: 12,
      bedType: BedType.SINGLE,
      hasPrivateBathroom: false,
      hasCloset: false,
      hasWindow: true,
      isFurnished: false,
      monthlyRent: 260000,
      availableFrom: new Date('2024-02-01')
    }
  });

  await prisma.room.create({
    data: {
      propertyId: property3.id,
      name: 'Estudio completo',
      description: 'Estudio amoblado con kitchenette',
      status: RoomStatus.AVAILABLE,
      squareMeters: 35,
      bedType: BedType.QUEEN,
      hasPrivateBathroom: true,
      hasCloset: true,
      hasDesk: true,
      hasWindow: true,
      hasAC: true,
      isFurnished: true,
      monthlyRent: 450000,
      availableFrom: new Date('2024-01-20')
    }
  });
  console.log('🛏️ Habitaciones creadas');

  console.log('\n✅ Seed completado exitosamente!');
  console.log('\n📋 Resumen de datos creados:');
  console.log('   NOTA: Con Firebase Auth, los usuarios se crean mediante el flujo de autenticación.');
  console.log('   Los usuarios del seed tienen firebaseUid falsos para pruebas de desarrollo.');
  console.log('\n   Datos de prueba:');
  console.log('   - 1 Admin: admin@roommatch.cl');
  console.log('   - 2 Propietarios: propietario1@test.cl, propietario2@test.cl');
  console.log('   - 3 Roomies: roomie1@test.cl, roomie2@test.cl, roomie3@test.cl');
  console.log('   - 3 Propiedades');
  console.log('   - 5 Habitaciones');
  console.log('\n   Para usar la app, registra usuarios reales con Firebase Auth.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
