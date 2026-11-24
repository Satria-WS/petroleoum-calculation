import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding baseline petroleum engineering data...');

  // Upsert Demo Engineer
  const user = await db.user.upsert({
    where: { email: 'engineer@petrocalc.com' },
    update: {},
    create: {
      name: 'Dr. Marcus Vance (PE)',
      email: 'engineer@petrocalc.com',
      role: 'ADMIN',
      preferredUnitSystem: 'FIELD',
    },
  });

  // Create Baseline Project
  const project = await db.project.create({
    data: {
      userId: user.id,
      name: 'Gullfaks Main Brent Oil',
      fieldName: 'Gullfaks',
      wellName: 'A-12H',
      wellType: 'OIL',
      description: 'Offshore high-deliverability horizontal oil producer targeting Brent sandstone formation.',
      status: 'ACTIVE',
    },
  });

  // 1. Baseline Volumetric Reserve Case
  await db.calculationCase.create({
    data: {
      projectId: project.id,
      userId: user.id,
      domain: 'RESERVOIR',
      moduleType: 'VOLUMETRIC_MONTE_CARLO',
      caseName: 'Brent Sandstone STOIIP Base Case',
      unitSystem: 'FIELD',
      inputParams: {
        area: 640,         // acres
        thickness: 85,     // ft
        porosity: 0.24,    // fraction
        waterSaturation: 0.22, // fraction
        formationVolumeFactor: 1.28, // bbl/STB
        recoveryFactor: 0.35,
      },
      outputResults: {
        stoiip: 57422325,  // STB
        recoverableReserves: 20097814, // STB
      },
      chartSeries: {
        p10: 64500000,
        p50: 57200000,
        p90: 49800000,
      },
      notes: 'Initial petrophysical baseline from wireline log interpretation.',
      status: 'VERIFIED',
    },
  });

  // 2. Baseline Nodal Analysis Case
  await db.calculationCase.create({
    data: {
      projectId: project.id,
      userId: user.id,
      domain: 'PRODUCTION',
      moduleType: 'NODAL_ANALYSIS',
      caseName: 'Initial Inflow / VLP Natural Flow Analysis',
      unitSystem: 'FIELD',
      inputParams: {
        reservoirPressure: 4500, // psi
        bubblePointPressure: 3200, // psi
        productivityIndex: 3.5, // STB/d/psi
        wellheadPressure: 350, // psi
        tubingInnerDiameter: 3.5, // inches
        depthTVD: 8800, // ft
        gasLiquidRatio: 650, // scf/stb
        waterCut: 0.05, // fraction
      },
      outputResults: {
        operatingFlowRate: 3420, // STB/d
        operatingPwf: 3522, // psi
        aofp: 8100, // Absolute Open Flow Potential STB/d
      },
      chartSeries: {},
      notes: 'Vogel two-phase below bubble point; Darcy above bubble point.',
      status: 'VERIFIED',
    },
  });

  // 3. Baseline Well Control Kill Sheet Case
  await db.calculationCase.create({
    data: {
      projectId: project.id,
      userId: user.id,
      domain: 'DRILLING',
      moduleType: 'KILL_SHEET',
      caseName: '9-5/8" Casing Section Kick Mitigation',
      unitSystem: 'FIELD',
      inputParams: {
        trueVerticalDepth: 9500, // ft
        measuredDepth: 10400, // ft
        currentMudWeight: 10.8, // ppg
        sidpp: 480, // psi
        sicp: 690, // psi
        slowCirculatingPressure: 820, // psi
        slowCirculatingRate: 30, // SPM
        drillpipeCapacity: 0.01776, // bbl/ft
        pumpOutput: 0.119, // bbl/stroke
      },
      outputResults: {
        killMudWeight: 11.77, // ppg
        initialCirculatingPressure: 1300, // psi
        finalCirculatingPressure: 894, // psi
        strokesToBit: 1552, // strokes
      },
      chartSeries: {},
      notes: 'Wait & Weight method calculation for gas influx at 9500 ft TVD.',
      status: 'VERIFIED',
    },
  });

  console.log('Seed completed successfully for project:', project.name);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
  })
  .finally(async () => {
    await db.$disconnect();
  });
