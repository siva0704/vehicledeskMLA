import { Driver, Vehicle, VehicleClass, TripRequest, User } from './types';

/**
 * Resolves vehicle class automatically based on the VIP's protocol seniority.
 * - Tier 1 (Apex: Ministers, Special Secretary, Dignitaries) -> Class A (Executive Sedan)
 * - Tier 2 (Senior: Principal Secretary, Advisors) -> Class B (Premium SUV)
 * - Tier 3 (General: Joint Secretary, Liaison Officers) -> Class C (Executive MPV)
 */
export function getClassForSeniority(user?: User | null): VehicleClass {
  if (!user) return 'CLASS_A';
  if (user.seniorityTier === 'TIER_1') return 'CLASS_A';
  if (user.seniorityTier === 'TIER_2') return 'CLASS_B';
  if (user.seniorityTier === 'TIER_3') return 'CLASS_C';

  const des = (user.designation || '').toLowerCase();
  if (des.includes('special secretary') || des.includes('minister') || des.includes('chief')) {
    return 'CLASS_A';
  }
  if (des.includes('principal secretary') || des.includes('advisor') || des.includes('director')) {
    return 'CLASS_B';
  }
  if (des.includes('joint secretary') || des.includes('liaison') || des.includes('officer')) {
    return 'CLASS_C';
  }
  return 'CLASS_A';
}

export function getSeniorityDetails(user?: User | null): {
  tierName: string;
  className: string;
  vehicleClass: VehicleClass;
  carModels: string;
} {
  const vClass = getClassForSeniority(user);
  switch (vClass) {
    case 'CLASS_A':
      return {
        tierName: 'Apex Protocol Seniority (Tier 1)',
        className: 'Class A · Executive Sedan',
        vehicleClass: 'CLASS_A',
        carModels: 'Toyota Camry Hybrid / Mercedes-Benz E-Class',
      };
    case 'CLASS_B':
      return {
        tierName: 'Senior Protocol Seniority (Tier 2)',
        className: 'Class B · Premium SUV',
        vehicleClass: 'CLASS_B',
        carModels: 'Toyota Fortuner 4x4 / Innova HyCross ZX',
      };
    case 'CLASS_C':
      return {
        tierName: 'General Protocol Seniority (Tier 3)',
        className: 'Class C · Executive MPV',
        vehicleClass: 'CLASS_C',
        carModels: 'Maruti Suzuki Ertiga VXi / Kia Carens',
      };
  }
}


export interface AllocationCandidate {
  driver: Driver;
  vehicle: Vehicle;
}

export interface RuleEngineResult {
  success: boolean;
  assignedCandidate?: AllocationCandidate;
  allocationMethod: 'RULE_ENGINE_AUTO' | 'QUEUED';
  traceSteps: string[];
  traceReason: string;
}

/**
 * Hardcoded Rule Engine (Non-Negotiable Core)
 * Enforces:
 * 1. Eligibility gate: Driver MUST be Available AND Cleanliness MUST be Clean.
 * 2. Primary preference: Matches requested preferredClass (Class A / B / C).
 * 3. Fairness sorting: Among matches, picks driver with least trips completed today (tripsToday ASC).
 *    Tie-breaker: tripsThisWeek ASC.
 * 4. Fallback order cascade: If preferredClass is unavailable, attempts systematic fallback.
 * 5. Exhaustion: If no Available+Clean vehicle exists, marks as QUEUED for Admin Live Board.
 */
export function evaluateRuleEngine(
  preferredClass: VehicleClass,
  drivers: Driver[],
  vehicles: Vehicle[]
): RuleEngineResult {
  const traceSteps: string[] = [];
  traceSteps.push(`Evaluating request for preferred vehicle class: ${preferredClass}`);

  // Pair up drivers with their assigned vehicles
  const vehicleMap = new Map<string, Vehicle>();
  vehicles.forEach((v) => vehicleMap.set(v.id, v));

  const allPairs: AllocationCandidate[] = [];
  for (const driver of drivers) {
    const vehicle = vehicleMap.get(driver.vehicleId);
    if (vehicle) {
      allPairs.push({ driver, vehicle });
    }
  }

  // Step 1: Rule Engine Strict Gate - Vehicle only visible & eligible if Available + Clean
  const eligiblePairs = allPairs.filter(({ driver }) => {
    const isAvailable = driver.status === 'AVAILABLE';
    const isClean = driver.cleanliness === 'CLEAN';
    return isAvailable && isClean;
  });

  traceSteps.push(
    `Gate 1 (Available + Clean): ${eligiblePairs.length} of ${allPairs.length} fleet units are eligible.`
  );

  if (eligiblePairs.length === 0) {
    const reason = 'Zero vehicles meet Available + Clean criteria. Request queued for Admin Board.';
    traceSteps.push(`Outcome: ${reason}`);
    return {
      success: false,
      allocationMethod: 'QUEUED',
      traceSteps,
      traceReason: reason,
    };
  }

  // Step 2: Try exact class match
  const exactClassMatches = eligiblePairs.filter(
    ({ vehicle }) => vehicle.vehicleClass === preferredClass
  );

  if (exactClassMatches.length > 0) {
    traceSteps.push(
      `Gate 2 (Exact Class Match): Found ${exactClassMatches.length} candidate(s) for ${preferredClass}.`
    );

    // Fairness Sorting: Driver with least trips completed today
    exactClassMatches.sort((a, b) => {
      if (a.driver.tripsToday !== b.driver.tripsToday) {
        return a.driver.tripsToday - b.driver.tripsToday;
      }
      return a.driver.tripsThisWeek - b.driver.tripsThisWeek;
    });

    const chosen = exactClassMatches[0];
    const reason = `Matched preferred ${preferredClass} unit [${chosen.vehicle.model} - ${chosen.vehicle.plate}] with Chauffeur ${chosen.driver.name} (Fairness rank: ${chosen.driver.tripsToday} trips today).`;
    traceSteps.push(`Outcome: ${reason}`);

    return {
      success: true,
      assignedCandidate: chosen,
      allocationMethod: 'RULE_ENGINE_AUTO',
      traceSteps,
      traceReason: reason,
    };
  }

  traceSteps.push(
    `Gate 2: No exact match available in ${preferredClass}. Proceeding to fallback cascade.`
  );

  // Step 3: Fallback hierarchy cascade
  const fallbackOrder: Record<VehicleClass, VehicleClass[]> = {
    CLASS_A: ['CLASS_B', 'CLASS_C'],
    CLASS_B: ['CLASS_A', 'CLASS_C'],
    CLASS_C: ['CLASS_B', 'CLASS_A'],
  };

  const fallbacks = fallbackOrder[preferredClass];

  for (const fallbackClass of fallbacks) {
    const fallbackMatches = eligiblePairs.filter(
      ({ vehicle }) => vehicle.vehicleClass === fallbackClass
    );

    if (fallbackMatches.length > 0) {
      fallbackMatches.sort((a, b) => {
        if (a.driver.tripsToday !== b.driver.tripsToday) {
          return a.driver.tripsToday - b.driver.tripsToday;
        }
        return a.driver.tripsThisWeek - b.driver.tripsThisWeek;
      });

      const chosen = fallbackMatches[0];
      const reason = `Preferred class ${preferredClass} was unavailable. Fallback rule selected ${fallbackClass} unit [${chosen.vehicle.model} - ${chosen.vehicle.plate}] with Chauffeur ${chosen.driver.name} (${chosen.driver.tripsToday} trips today).`;
      traceSteps.push(`Outcome: ${reason}`);

      return {
        success: true,
        assignedCandidate: chosen,
        allocationMethod: 'RULE_ENGINE_AUTO',
        traceSteps,
        traceReason: reason,
      };
    }
  }

  // Step 4: Exhaustion
  const reason = `No eligible vehicles available in preferred or fallback classes. Queued for Admin intervention.`;
  traceSteps.push(`Outcome: ${reason}`);

  return {
    success: false,
    allocationMethod: 'QUEUED',
    traceSteps,
    traceReason: reason,
  };
}

/**
 * Helper to check if a specific driver/vehicle pair is currently eligible under Rule 1
 */
export function isDriverEligible(driver: Driver): boolean {
  return driver.status === 'AVAILABLE' && driver.cleanliness === 'CLEAN';
}
