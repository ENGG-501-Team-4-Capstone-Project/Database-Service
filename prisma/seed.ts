import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

async function main() {
  await prisma.$transaction(async (tx) => {
    const equipmentType = await tx.equipmentTypes.upsert({
      where: { name: 'Sling' },
      update: {},
      create: {
        name: 'Sling',
        description: 'Lifting sling used to secure and lift loads.'
      }
    });

    await tx.equipment.create({
      data: {
        equipment_type_id: equipmentType.id,
        manufacturer: 'Example Manufacturer',
        model_number: 'SL-100',
        serial_number: 'SL-001'
      }
    });

    const manual = await tx.manuals.create({
      data: {
        equipment_type_id: equipmentType.id,
        title: 'Example Synthetic Web Sling Inspection Manual',
        manufacturer: 'Example Manufacturer',
        version: '1.0',
        file_path: '/manuals/synthetic-web-sling.pdf'
      }
    });

    await tx.manualChunks.create({
      data: {
        manual_id: manual.id,
        chunk_index: 0,
        chunk_text: 'Inspect the synthetic web sling for visible cuts and tears.',
        page_number: 1,
        section_title: 'Webbing Inspection'
      }
    });

    const supervisor = await tx.users.create({
      data: { role: 'SUPERVISOR' }
    });

    const requirement = await tx.inspectionRequirements.create({
      data: {
        creator_id: supervisor.id,
        equipment_type_id: equipmentType.id,
        title: 'Inspect sling webbing for cuts and tears'
      }
    });

    await tx.inspectionCriteria.create({
      data: {
        verifier_id: supervisor.id,
        inspection_requirement_id: requirement.id,
        pass_condition: 'No visible cuts or tears in the webbing.',
        fail_condition: 'One or more visible cuts or tears in the webbing.'
      }
    });
  });

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
