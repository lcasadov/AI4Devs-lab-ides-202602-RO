import { getPrismaClient } from '../src/infrastructure/database/prisma-client';
import { hashPassword } from '../src/infrastructure/utils/passwordUtils';

const SECTORS_AND_JOBTYPES: { sector: string; jobs: string[] }[] = [
  {
    sector: 'Tecnología',
    jobs: [
      'Desarrollo de Software Backend',
      'Desarrollo de Software Frontend',
      'Desarrollo de Software Full Stack',
      'Desarrollo de Software Mobile',
      'DevOps / SRE',
      'Científico de Datos',
      'Analista de Datos',
      'Ciberseguridad',
      'Ingeniero Cloud',
      'QA / Tester',
      'Arquitecto de Software',
      'Soporte Técnico IT',
      'Ingeniero de Inteligencia Artificial',
    ],
  },
  {
    sector: 'Ingeniería',
    jobs: [
      'Ingeniero Industrial',
      'Ingeniero Mecánico',
      'Ingeniero Eléctrico',
      'Ingeniero Civil',
      'Ingeniero Químico',
      'Ingeniero de Automatización',
      'Ingeniero de Calidad',
      'Ingeniero Medioambiental',
      'Ingeniero de Robótica',
    ],
  },
  {
    sector: 'Derecho',
    jobs: [
      'Abogado',
      'Abogado Corporativo',
      'Abogado Laboral',
      'Asesor Legal',
      'Notario',
      'Compliance Officer',
    ],
  },
  {
    sector: 'Finanzas',
    jobs: [
      'Contable',
      'Analista Financiero',
      'Auditor',
      'Asesor Fiscal',
      'Controller Financiero',
      'Analista de Inversiones',
      'Banca y Servicios Financieros',
    ],
  },
  {
    sector: 'Salud',
    jobs: [
      'Médico',
      'Enfermero/a',
      'Farmacéutico',
      'Fisioterapeuta',
      'Psicólogo',
      'Dentista',
      'Veterinario',
      'Técnico Sanitario',
    ],
  },
  {
    sector: 'Educación',
    jobs: [
      'Maestro Educación Primaria',
      'Profesor Educación Secundaria',
      'Profesor Universitario',
      'Formador / Instructor',
      'Director de Centro Educativo',
    ],
  },
  {
    sector: 'Hostelería',
    jobs: [
      'Chef / Cocinero',
      'Camarero',
      'Recepcionista de Hotel',
      'Director de Hotel',
      'Guía Turístico',
      'Coordinador de Eventos',
      'Pastelero / Repostero',
    ],
  },
  {
    sector: 'Ventas y Marketing',
    jobs: [
      'Comercial / Representante de Ventas',
      'Account Manager',
      'Especialista en Marketing',
      'Marketing Digital',
      'Community Manager',
      'Especialista SEO/SEM',
      'Brand Manager',
    ],
  },
  {
    sector: 'Recursos Humanos',
    jobs: [
      'Generalista de RRHH',
      'Técnico de Selección',
      'Director de RRHH',
      'Especialista en Nóminas',
      'Gestor de Talento',
    ],
  },
  {
    sector: 'Diseño',
    jobs: [
      'Diseñador Gráfico',
      'Diseñador UX/UI',
      'Arquitecto',
      'Interiorista',
      'Redactor / Copywriter',
      'Fotógrafo',
      'Editor de Vídeo',
    ],
  },
  {
    sector: 'Logística',
    jobs: [
      'Responsable de Logística',
      'Supply Chain Manager',
      'Operario de Almacén',
      'Conductor / Transportista',
      'Responsable de Compras',
    ],
  },
  {
    sector: 'Administración',
    jobs: [
      'Administrativo',
      'Office Manager',
      'Asistente de Dirección',
      'Atención al Cliente',
      'Recepcionista',
    ],
  },
  {
    sector: 'Construcción y Oficios',
    jobs: [
      'Electricista',
      'Fontanero',
      'Carpintero',
      'Soldador',
      'Oficial de Construcción',
      'Jefe de Obra',
      'Pintor',
    ],
  },
];

async function main(): Promise<void> {
  const prisma = getPrismaClient();

  // ── Admin user ────────────────────────────────────────────
  const existingAdmin = await prisma.user.findUnique({ where: { login: 'admin' } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword('Admin@1234');
    await prisma.user.create({
      data: {
        login: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@lti.com',
        passwordHash,
        role: 'ADMIN',
        active: true,
      },
    });
    console.log('✓ Admin user created (login: admin / Admin@1234)');
  } else {
    console.log('· Admin user already exists, skipped.');
  }

  // ── Sectors & Job Types ───────────────────────────────────
  let sectorsCreated = 0;
  let jobsCreated = 0;

  for (const { sector, jobs } of SECTORS_AND_JOBTYPES) {
    const sectorRecord = await prisma.sector.upsert({
      where: { name: sector },
      update: {},
      create: { name: sector },
    });

    if (!sectorRecord.updatedAt || sectorRecord.createdAt === sectorRecord.updatedAt) {
      sectorsCreated++;
    }

    for (const jobName of jobs) {
      const existing = await prisma.jobType.findFirst({
        where: { name: jobName, sectorId: sectorRecord.id },
      });
      if (!existing) {
        await prisma.jobType.create({
          data: { name: jobName, sectorId: sectorRecord.id },
        });
        jobsCreated++;
      }
    }
  }

  console.log(`✓ Sectors processed: ${SECTORS_AND_JOBTYPES.length} (${sectorsCreated} new)`);
  console.log(`✓ Job types created: ${jobsCreated}`);

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
