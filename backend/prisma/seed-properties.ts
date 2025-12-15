import { PrismaClient, PropertyType, PropertyStatus, RoomStatus, BedType, UserRole, UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Generate fake Firebase UIDs for seed data
const generateFakeFirebaseUid = () => `seed_${uuidv4().replace(/-/g, '').slice(0, 22)}`;

// Random property images from Unsplash
const propertyImages = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
  'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800',
  'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800',
  'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=800',
  'https://images.unsplash.com/photo-1600607687644-c7f83b3a5d3e?w=800',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
  'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
  'https://images.unsplash.com/photo-1600573472531-4ccebafd50df?w=800'
];

const roomImages = [
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
  'https://images.unsplash.com/photo-1598928506311-c55lez36a5150?w=800',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800',
  'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
  'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800',
  'https://images.unsplash.com/photo-1622126807280-9b5b32b28e77?w=800'
];

const comunas = [
  'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Vitacura',
  'La Florida', 'Maipú', 'Puente Alto', 'La Reina', 'Macul',
  'Peñalolén', 'San Miguel', 'Estación Central', 'Recoleta', 'Independencia',
  'San Joaquín', 'Lo Barnechea', 'Huechuraba', 'Quilicura', 'Cerrillos'
];

const streets = [
  'Av. Providencia', 'Av. Apoquindo', 'Av. Las Condes', 'Av. Libertador Bernardo O\'Higgins',
  'Av. Irarrázaval', 'Av. Pedro de Valdivia', 'Av. Ricardo Lyon', 'Av. Los Leones',
  'Calle Santa Isabel', 'Calle Merced', 'Calle Mosqueto', 'Calle Catedral',
  'Calle Agustinas', 'Calle Huérfanos', 'Calle Monjitas', 'Calle Compañía',
  'Av. Vicuña Mackenna', 'Av. Matta', 'Av. Santa Rosa', 'Av. Grecia',
  'Calle Los Aromos', 'Calle Los Pinos', 'Calle Los Alamos', 'Calle Los Cedros'
];

const propertyTypes = [PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.STUDIO, PropertyType.LOFT, PropertyType.SHARED_APARTMENT];
const bedTypes = [BedType.SINGLE, BedType.DOUBLE, BedType.QUEEN, BedType.KING];

const firstNames = ['Carlos', 'María', 'Juan', 'Ana', 'Pedro', 'Sofía', 'Diego', 'Valentina', 'Matías', 'Camila', 'Sebastián', 'Isidora', 'Nicolás', 'Martina', 'Felipe', 'Catalina', 'Tomás', 'Francisca', 'Benjamín', 'Javiera'];
const lastNames = ['González', 'Silva', 'Pérez', 'Martínez', 'López', 'García', 'Rodríguez', 'Muñoz', 'Díaz', 'Hernández', 'Soto', 'Contreras', 'Rojas', 'Reyes', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela', 'Tapia'];

const titleAdjectives = ['Hermoso', 'Moderno', 'Acogedor', 'Amplio', 'Luminoso', 'Céntrico', 'Tranquilo', 'Renovado', 'Espacioso', 'Cómodo'];
const titleNouns = ['departamento', 'depto', 'piso', 'hogar', 'espacio', 'lugar'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomImages(images: string[], count: number): string[] {
  const shuffled = [...images].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generatePropertyTitle(type: PropertyType, comuna: string): string {
  const adj = randomElement(titleAdjectives);
  const typeNames: Record<PropertyType, string> = {
    [PropertyType.APARTMENT]: 'departamento',
    [PropertyType.HOUSE]: 'casa',
    [PropertyType.STUDIO]: 'estudio',
    [PropertyType.LOFT]: 'loft',
    [PropertyType.SHARED_APARTMENT]: 'depto compartido'
  };
  return `${adj} ${typeNames[type]} en ${comuna}`;
}

function generateDescription(type: PropertyType, features: any): string {
  const descriptions = [
    `Excelente ${type === PropertyType.APARTMENT ? 'departamento' : 'propiedad'} con ${features.totalRooms} habitaciones y ${features.bathrooms} baños. Ubicación privilegiada cerca de transporte público y comercio.`,
    `Propiedad ideal para compartir, cuenta con espacios amplios y luminosos. ${features.squareMeters}m² bien distribuidos.`,
    `${type === PropertyType.APARTMENT ? 'Departamento' : 'Propiedad'} en excelente estado, ${features.hasFurniture ? 'amoblado' : 'sin amoblar'}, ${features.hasWifi ? 'con WiFi incluido' : ''}.`,
    `Gran oportunidad para vivir en una excelente ubicación. Cerca de todo lo necesario para tu día a día.`,
    `Espacio cómodo y funcional. Perfecto para estudiantes o profesionales jóvenes.`
  ];
  return randomElement(descriptions);
}

async function main() {
  console.log('🌱 Iniciando seed de 100 propiedades...');

  // Check if we have propietarios, if not create some
  let propietarios = await prisma.user.findMany({
    where: { role: UserRole.PROPIETARIO }
  });

  if (propietarios.length < 10) {
    console.log('📝 Creando propietarios adicionales...');
    for (let i = 0; i < 10; i++) {
      const prop = await prisma.user.create({
        data: {
          firebaseUid: generateFakeFirebaseUid(),
          email: `propietario_seed_${i}@test.cl`,
          firstName: randomElement(firstNames),
          lastName: randomElement(lastNames),
          phone: `+569${randomInt(10000000, 99999999)}`,
          role: UserRole.PROPIETARIO,
          status: UserStatus.ACTIVE,
          emailVerified: true
        }
      });
      propietarios.push(prop);
    }
    console.log(`✅ ${10} propietarios creados`);
  }

  console.log('🏠 Creando 100 propiedades con imágenes...');

  for (let i = 0; i < 100; i++) {
    const type = randomElement(propertyTypes);
    const comuna = randomElement(comunas);
    const owner = randomElement(propietarios);

    const totalRooms = type === PropertyType.STUDIO ? 1 : randomInt(1, 5);
    const bathrooms = type === PropertyType.STUDIO ? 1 : randomInt(1, Math.min(3, totalRooms));
    const squareMeters = type === PropertyType.STUDIO ? randomInt(25, 45) : randomInt(40, 150);

    const features = {
      totalRooms,
      availableRooms: randomInt(1, totalRooms),
      bathrooms,
      squareMeters,
      floor: type === PropertyType.HOUSE ? null : randomInt(1, 20),
      hasElevator: type !== PropertyType.HOUSE && Math.random() > 0.3,
      hasParking: Math.random() > 0.4,
      hasFurniture: Math.random() > 0.5,
      hasWifi: Math.random() > 0.2,
      hasAC: Math.random() > 0.6,
      hasHeating: Math.random() > 0.4,
      hasWasher: Math.random() > 0.5,
      hasGarden: type === PropertyType.HOUSE && Math.random() > 0.5,
      hasGym: Math.random() > 0.7,
      hasPool: Math.random() > 0.8,
      hasTerrace: Math.random() > 0.6
    };

    const baseRent = type === PropertyType.STUDIO ? randomInt(200000, 400000) :
                     type === PropertyType.LOFT ? randomInt(350000, 600000) :
                     randomInt(250000, 600000);

    const property = await prisma.property.create({
      data: {
        ownerId: owner.id,
        title: generatePropertyTitle(type, comuna),
        description: generateDescription(type, features),
        type,
        status: Math.random() > 0.1 ? PropertyStatus.AVAILABLE : PropertyStatus.OCCUPIED,
        address: {
          street: randomElement(streets),
          number: String(randomInt(100, 9999)),
          apartment: type !== PropertyType.HOUSE ? String(randomInt(100, 2000)) : undefined,
          comuna,
          city: 'Santiago',
          region: 'Metropolitana'
        },
        features,
        rules: {
          petsAllowed: Math.random() > 0.4,
          smokingAllowed: Math.random() > 0.8,
          guestsAllowed: Math.random() > 0.2,
          childrenAllowed: Math.random() > 0.3,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          maxOccupants: randomInt(1, 4)
        },
        monthlyRent: baseRent,
        commonExpenses: randomInt(20000, 100000),
        depositMonths: randomInt(1, 2),
        images: randomImages(propertyImages, randomInt(2, 5)),
        isVerified: Math.random() > 0.3,
        availableFrom: new Date(Date.now() + randomInt(0, 60) * 24 * 60 * 60 * 1000),
        minimumStay: randomInt(1, 12),
        views: randomInt(0, 500)
      }
    });

    // Create rooms for each property
    const roomCount = type === PropertyType.STUDIO ? 1 : features.availableRooms;
    for (let r = 0; r < roomCount; r++) {
      const roomSquareMeters = Math.floor(squareMeters / totalRooms * (0.8 + Math.random() * 0.4));
      await prisma.room.create({
        data: {
          propertyId: property.id,
          name: roomCount === 1 ? 'Habitación principal' : `Habitación ${r + 1}`,
          description: `Habitación ${r === 0 ? 'principal' : 'secundaria'} con buena iluminación natural`,
          status: Math.random() > 0.2 ? RoomStatus.AVAILABLE : RoomStatus.OCCUPIED,
          squareMeters: roomSquareMeters,
          bedType: randomElement(bedTypes),
          hasPrivateBathroom: r === 0 && Math.random() > 0.5,
          hasCloset: Math.random() > 0.3,
          hasDesk: Math.random() > 0.4,
          hasWindow: Math.random() > 0.1,
          hasAC: features.hasAC && Math.random() > 0.5,
          isFurnished: features.hasFurniture,
          monthlyRent: baseRent + randomInt(-50000, 100000),
          images: randomImages(roomImages, randomInt(1, 3)),
          availableFrom: new Date(Date.now() + randomInt(0, 30) * 24 * 60 * 60 * 1000)
        }
      });
    }

    if ((i + 1) % 10 === 0) {
      console.log(`   ${i + 1} propiedades creadas...`);
    }
  }

  console.log('\n✅ Seed completado exitosamente!');
  console.log('\n📋 Resumen:');
  console.log('   - 100 propiedades creadas');
  console.log('   - Cada propiedad tiene entre 1 y 5 habitaciones');
  console.log('   - Imágenes aleatorias de Unsplash');
  console.log('   - Distribuidas en 20 comunas de Santiago');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
