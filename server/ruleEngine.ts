import { Driver, Vehicle, VehicleClass, User } from './types';

export function getClassForSeniority(user?: User | null): VehicleClass {
  if (!user) return 'CLASS_A';
  if (user.seniorityTier === 'TIER_1') return 'CLASS_A';
  if (user.seniorityTier === 'TIER_2') return 'CLASS_B';
  if (user.seniorityTier === 'TIER_3') return 'CLASS_C';

  const des = (user.designation || '').toLowerCase();
  if (des.includes('special secretary') || des.includes('minister') || des.includes('chief') || des.includes('mla') || des.includes('hon')) {
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

  const vehicleMap = new Map<string, Vehicle>();
  vehicles.forEach((v) => vehicleMap.set(v.id, v));

  const allPairs: AllocationCandidate[] = [];
  for (const driver of drivers) {
    const vehicle = vehicleMap.get(driver.vehicleId);
    if (vehicle) {
      allPairs.push({ driver, vehicle });
    }
  }

  // 1. Eligibility Gate Filter
  const eligiblePairs = allPairs.filter((pair) => {
    const isAvail = pair.driver.status === 'AVAILABLE';
    const isClean = pair.driver.cleanliness === 'CLEAN';
    if (!isAvail) {
      traceSteps.push(
        `[Skip] Chauffeur ${pair.driver.name} is ${pair.driver.status} (Requires AVAILABLE)`
      );
    } else if (!isClean) {
      traceSteps.push(
        `[Skip] Chauffeur ${pair.driver.name} vehicle ${pair.vehicle.plate} is ${pair.driver.cleanliness} (Requires CLEAN)`
      );
    }
    return isAvail && isClean;
  });

  traceSteps.push(
    `Gate 1 passed: ${eligiblePairs.length} Chauffeurs meet [AVAILABLE + CLEAN] requirements.`
  );

  if (eligiblePairs.length === 0) {
    return {
      success: false,
      allocationMethod: 'QUEUED',
      traceSteps,
      traceReason:
        'All drivers or vehicles are currently BUSY, OFF-DUTY, or in MAINTENANCE. Request placed on High-Priority Admin Queue.',
    };
  }

  // Helper: Priority Queue & Fairness Sorter (Vehicle 1 -> Vehicle 2 -> Vehicle 3)
  const sortPriority = (candidates: AllocationCandidate[]) => {
    return candidates.sort((a, b) => {
      const pA = a.vehicle.priority || 99;
      const pB = b.vehicle.priority || 99;
      if (pA !== pB) {
        return pA - pB;
      }
      if (a.driver.tripsToday !== b.driver.tripsToday) {
        return a.driver.tripsToday - b.driver.tripsToday;
      }
      return a.driver.tripsThisWeek - b.driver.tripsThisWeek;
    });
  };

  // 2. Primary Match: Preferred Class
  const primaryMatches = eligiblePairs.filter((p) => p.vehicle.vehicleClass === preferredClass);

  if (primaryMatches.length > 0) {
    const sorted = sortPriority(primaryMatches);
    const chosen = sorted[0];
    traceSteps.push(
      `Primary Priority Match Found: ${primaryMatches.length} candidates in ${preferredClass}. Priority algorithm selected Priority ${chosen.vehicle.priority || 1} unit [${chosen.vehicle.model}] driven by ${chosen.driver.name}.`
    );
    return {
      success: true,
      assignedCandidate: chosen,
      allocationMethod: 'RULE_ENGINE_AUTO',
      traceSteps,
      traceReason: `Assigned Priority ${chosen.vehicle.priority || 1} ${preferredClass} unit [${chosen.vehicle.model} - ${chosen.vehicle.plate}] with Chauffeur ${chosen.driver.name} (Strict Priority Queue: Vehicle ${chosen.vehicle.priority}, Available + Clean).`,
    };
  }

  traceSteps.push(`Zero eligible vehicles in preferred class ${preferredClass}. Initiating Fallback Cascade.`);

  // 3. Fallback Hierarchy
  const fallbackOrder: VehicleClass[] = [];
  if (preferredClass === 'CLASS_A') {
    fallbackOrder.push('CLASS_B', 'CLASS_C');
  } else if (preferredClass === 'CLASS_B') {
    fallbackOrder.push('CLASS_A', 'CLASS_C');
  } else {
    fallbackOrder.push('CLASS_B', 'CLASS_A');
  }

  for (const fallbackClass of fallbackOrder) {
    const fallbackMatches = eligiblePairs.filter((p) => p.vehicle.vehicleClass === fallbackClass);
    if (fallbackMatches.length > 0) {
      const sorted = sortPriority(fallbackMatches);
      const chosen = sorted[0];
      traceSteps.push(
        `Fallback Success: Allocated alternate priority ${chosen.vehicle.priority || 1} unit in ${fallbackClass} (${chosen.vehicle.model}).`
      );
      return {
        success: true,
        assignedCandidate: chosen,
        allocationMethod: 'RULE_ENGINE_AUTO',
        traceSteps,
        traceReason: `Preferred class ${preferredClass} exhausted. Cascaded fallback to Priority ${chosen.vehicle.priority || 1} [${chosen.vehicle.model} - ${chosen.vehicle.plate}] driven by ${chosen.driver.name}.`,
      };
    }
  }

  return {
    success: false,
    allocationMethod: 'QUEUED',
    traceSteps,
    traceReason:
      'All protocol classes exhausted. Trip placed on Admin Override Board for manual dispatch.',
  };
}
