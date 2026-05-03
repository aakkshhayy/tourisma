import { TouristPlace, Itinerary, ItineraryDay, CostBreakdown, ItineraryOptions, JourneyLeg } from '../types';
import { getOriginById } from '../data/origins';

const STATE_ORDER: Record<string, number> = {
  himachal_pradesh: 1,
  haryana: 2,
  sikkim: 3,
  assam: 4,
  meghalaya: 5,
  manipur: 6,
  mizoram: 7,
  west_bengal: 8,
  jharkhand: 9,
  bihar: 10,
  chhattisgarh: 11,
  gujarat: 12,
  maharashtra: 13,
  goa: 14,
  telangana: 15,
  andhra_pradesh: 16,
  karnataka: 17,
  tamil_nadu: 18,
  kerala: 19,
};

function clusterPlaces(
  places: TouristPlace[],
  origin?: { coordinates: { lat: number; lng: number } },
): TouristPlace[][] {
  const byState: Record<string, TouristPlace[]> = {};
  for (const p of places) {
    if (!byState[p.state]) byState[p.state] = [];
    byState[p.state].push(p);
  }

  // Origin-aware ordering: sort clusters by their nearest place to origin.
  // Within a cluster, use greedy nearest-neighbour from the closest entry point.
  if (origin) {
    const stateIds = Object.keys(byState);
    const minDistByState: Record<string, number> = {};
    for (const sid of stateIds) {
      minDistByState[sid] = Math.min(
        ...byState[sid].map(p => haversineKm(p.coordinates, origin.coordinates)),
      );
    }
    stateIds.sort((a, b) => minDistByState[a] - minDistByState[b]);

    let prevCoords = origin.coordinates;
    return stateIds.map(sid => {
      const cluster = [...byState[sid]];
      const ordered: TouristPlace[] = [];
      while (cluster.length) {
        let bestIdx = 0;
        let bestDist = haversineKm(cluster[0].coordinates, prevCoords);
        for (let i = 1; i < cluster.length; i++) {
          const d = haversineKm(cluster[i].coordinates, prevCoords);
          if (d < bestDist) { bestDist = d; bestIdx = i; }
        }
        const [picked] = cluster.splice(bestIdx, 1);
        ordered.push(picked);
        prevCoords = picked.coordinates;
      }
      return ordered;
    });
  }

  // Fallback: static geographic state order (no origin)
  const sortedStates = Object.keys(byState).sort(
    (a, b) => (STATE_ORDER[a] ?? 99) - (STATE_ORDER[b] ?? 99)
  );
  return sortedStates.map(s => byState[s]);
}

function distributeIntodays(clusters: TouristPlace[][], numDays: number): ItineraryDay[] {
  const schedule: Array<{ place: TouristPlace; placeDay: number }> = [];
  for (const cluster of clusters) {
    for (const place of cluster) {
      for (let d = 1; d <= Math.max(1, place.recommendedDays); d++) {
        schedule.push({ place, placeDay: d });
      }
    }
  }

  if (schedule.length === 0) return [];

  const days: ItineraryDay[] = [];

  for (let dayIndex = 1; dayIndex <= numDays; dayIndex++) {
    const scheduleIndex = Math.min(
      Math.floor(((dayIndex - 1) / numDays) * schedule.length),
      schedule.length - 1
    );
    const { place, placeDay } = schedule[scheduleIndex];
    const prevDay = days[days.length - 1];
    const prevPlace = prevDay?.places[0];

    let travelNote: string;
    let travelCost = 0;

    if (dayIndex === 1) {
      travelNote = `Arrive at ${place.name}. Check-in and evening at leisure to acclimatize.`;
    } else if (prevPlace && prevPlace.id !== place.id) {
      if (prevPlace.state !== place.state) {
        travelNote = `Travel from ${prevPlace.name} (${formatState(prevPlace.state)}) to ${place.name} (${formatState(place.state)}). Inter-state travel day.`;
      } else {
        travelNote = `Travel from ${prevPlace.name} to ${place.name}. Check-in and settle in.`;
      }
    } else {
      const activities = place.highlights.slice((placeDay - 1) * 2, (placeDay - 1) * 2 + 2);
      travelNote = activities.length > 0
        ? `Day ${placeDay} in ${place.name} — explore ${activities.join(' and ')}.`
        : `Day ${placeDay} in ${place.name}. Continue exploring nearby attractions.`;
    }

    days.push({ day: dayIndex, places: [place], travelNote, estimatedTravelCost: travelCost });
  }

  return days;
}

function formatState(stateId: string): string {
  return stateId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ─── JOURNEY ROUTING ─────────────────────────────────────────────────────────
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(h)));
}

interface ModeProfile {
  mode: 'train' | 'bus' | 'cab' | 'flight';
  speedKmph: number;
  perKm: number;
  base: number;
  bufferHours: number;
}

const MODE_PROFILES: Record<string, ModeProfile> = {
  train:  { mode: 'train',  speedKmph: 55, perKm: 2.2, base: 60,   bufferHours: 0.5 },
  bus:    { mode: 'bus',    speedKmph: 42, perKm: 2.5, base: 50,   bufferHours: 0.3 },
  cab:    { mode: 'cab',    speedKmph: 50, perKm: 14,  base: 0,    bufferHours: 0.2 },
  flight: { mode: 'flight', speedKmph: 700, perKm: 4.5, base: 2200, bufferHours: 2.5 },
};

// Road-distance approximation: India's road network has ~25-30% detour vs straight line
const ROAD_FACTOR = 1.28;

function pickMode(distanceKm: number, preferred: ItineraryOptions['travelMode']): ModeProfile {
  // Auto-upgrade to flight for very long legs
  if (distanceKm > 1100) return MODE_PROFILES.flight;
  // Cab is impractical above ~600km — fallback to train
  if (preferred === 'cab' && distanceKm > 600) return MODE_PROFILES.train;
  return MODE_PROFILES[preferred];
}

function computeLeg(
  fromName: string,
  fromCoords: { lat: number; lng: number },
  toName: string,
  toCoords: { lat: number; lng: number },
  preferred: ItineraryOptions['travelMode'],
  isReturn: boolean = false,
): JourneyLeg {
  const straightKm = haversineKm(fromCoords, toCoords);
  const profile = pickMode(straightKm, preferred);
  // Flights use straight-line; ground modes use road-adjusted distance
  const distanceKm = profile.mode === 'flight' ? straightKm : Math.round(straightKm * ROAD_FACTOR);
  const durationHours = +(distanceKm / profile.speedKmph + profile.bufferHours).toFixed(1);
  const cost = Math.round(profile.base + distanceKm * profile.perKm);

  return {
    from: fromName,
    to: toName,
    fromCoords,
    toCoords,
    distanceKm,
    durationHours,
    cost,
    mode: profile.mode,
    isReturn,
  };
}

function buildJourney(
  origin: { name: string; coordinates: { lat: number; lng: number } } | undefined,
  routePlaces: TouristPlace[],
  preferred: ItineraryOptions['travelMode'],
): JourneyLeg[] {
  if (routePlaces.length === 0) return [];
  const legs: JourneyLeg[] = [];

  if (origin) {
    legs.push(computeLeg(origin.name, origin.coordinates, routePlaces[0].name, routePlaces[0].coordinates, preferred));
  }

  for (let i = 0; i < routePlaces.length - 1; i++) {
    const a = routePlaces[i];
    const b = routePlaces[i + 1];
    legs.push(computeLeg(a.name, a.coordinates, b.name, b.coordinates, preferred));
  }

  if (origin && routePlaces.length > 0) {
    const last = routePlaces[routePlaces.length - 1];
    legs.push(computeLeg(last.name, last.coordinates, origin.name, origin.coordinates, preferred, true));
  }

  return legs;
}

// ─── COST ────────────────────────────────────────────────────────────────────
function computeCosts(days: ItineraryDay[], journey: JourneyLeg[], options: ItineraryOptions): CostBreakdown {
  const { stayType, groupSize } = options;
  const stayMultiplier = stayType === 'budget' ? 0 : stayType === 'mid' ? 1 : 2;

  let stay = 0;
  let food = 0;
  let entry = 0;

  for (const day of days) {
    for (const place of day.places) {
      const stayOpt = place.stayOptions[stayMultiplier] ?? place.stayOptions[0];
      stay += stayOpt.costPerNight;
      food += place.foodCostPerDay;
      entry += place.entryFee;
    }
  }

  const journeyTravel = journey.reduce((sum, l) => sum + l.cost, 0);

  const rooms = Math.ceil(groupSize / 2);
  const scaledStay = stay * rooms;
  const scaledFood = food * groupSize;
  // Flights are per-person; ground modes are typically shared by ~4
  const scaledTravel = journey.reduce((sum, l) => {
    if (l.mode === 'flight') return sum + l.cost * groupSize;
    return sum + l.cost * Math.ceil(groupSize / 4);
  }, 0) || journeyTravel;

  const misc = Math.round((scaledStay + scaledFood + scaledTravel) * 0.08);

  return {
    travel: scaledTravel,
    stay: scaledStay,
    food: scaledFood,
    entry: entry * groupSize,
    miscellaneous: misc,
    total: scaledStay + scaledFood + scaledTravel + entry * groupSize + misc,
  };
}

function buildTips(places: TouristPlace[]): string[] {
  const tips: string[] = [];
  const states = [...new Set(places.map(p => p.state))];

  if (states.includes('sikkim')) {
    tips.push('Obtain Inner Line Permit (ILP) for restricted areas in Sikkim in advance from Gangtok or online.');
  }
  if (states.includes('andhra_pradesh') && places.some(p => p.id === 'ap_tirupati')) {
    tips.push('Book Tirupati Darshan tickets (Special Entry Darshan) at least 2–3 weeks in advance on the TTD website.');
  }
  if (states.includes('west_bengal') && places.some(p => p.id === 'wb_sundarbans')) {
    tips.push('Book a 2-night Sundarbans package tour that includes boat, permit, and accommodation — self-navigation is not allowed.');
  }
  if (places.length > 3) {
    tips.push('Book inter-city trains at least 3 weeks in advance, especially Rajdhani and Shatabdi routes.');
  }
  tips.push('Carry lightweight warm layers if visiting hill stations (Sikkim/Darjeeling) even in summer.');
  tips.push('Travel insurance with medical coverage is strongly recommended for Himalayan travel.');

  return tips;
}

export function generateItinerary(places: TouristPlace[], options: ItineraryOptions): Itinerary {
  const origin = getOriginById(options.originCityId);
  const clusters = clusterPlaces(places, origin);
  const days = distributeIntodays(clusters, options.numDays);
  const routePlaces: TouristPlace[] = [];
  const seen = new Set<string>();
  for (const d of days) {
    for (const p of d.places) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        routePlaces.push(p);
      }
    }
  }

  const journey = buildJourney(origin, routePlaces, options.travelMode);

  // Annotate each day with the cost of travelling INTO that place
  // journey legs sequence: [origin→p1, p1→p2, ..., p(n-1)→pn, pn→origin?]
  // Day 1 = origin → p1 (leg 0); day with first new place uses next leg
  let legCursor = 0;
  let prevPlaceId: string | null = null;
  for (let i = 0; i < days.length; i++) {
    const dayPlaceId = days[i].places[0].id;
    if (i === 0) {
      days[i].estimatedTravelCost = journey[legCursor]?.cost ?? 0;
      if (origin) legCursor++;
    } else if (prevPlaceId && prevPlaceId !== dayPlaceId) {
      days[i].estimatedTravelCost = journey[legCursor]?.cost ?? 0;
      legCursor++;
    } else {
      days[i].estimatedTravelCost = 0;
    }
    prevPlaceId = dayPlaceId;
  }

  const costs = computeCosts(days, journey, options);
  const route = routePlaces.map(p => p.name);
  const tips = buildTips(places);

  const totalDistanceKm = journey.reduce((s, l) => s + l.distanceKm, 0);
  const totalTravelHours = +(journey.reduce((s, l) => s + l.durationHours, 0).toFixed(1));

  return { days, totalEstimatedCost: costs, route, tips, journey, totalDistanceKm, totalTravelHours };
}
