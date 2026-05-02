import { TouristPlace, Itinerary, ItineraryDay, CostBreakdown, ItineraryOptions } from '../types';

const STATE_ORDER: Record<string, number> = {
  maharashtra: 1,
  andhra_pradesh: 2,
  west_bengal: 3,
  bihar: 4,
  sikkim: 5,
};

// Group nearby places (same state, physically close) together
function clusterPlaces(places: TouristPlace[]): TouristPlace[][] {
  const byState: Record<string, TouristPlace[]> = {};
  for (const p of places) {
    if (!byState[p.state]) byState[p.state] = [];
    byState[p.state].push(p);
  }

  // Sort states in logical travel order (roughly geographic)
  const sortedStates = Object.keys(byState).sort(
    (a, b) => (STATE_ORDER[a] ?? 99) - (STATE_ORDER[b] ?? 99)
  );

  return sortedStates.map(s => byState[s]);
}

function distributeIntodays(clusters: TouristPlace[][], numDays: number): ItineraryDay[] {
  // Expand each place into individual day slots based on recommendedDays
  // e.g. Gangtok (3 days) → [Gangtok, Gangtok, Gangtok], Lachung (2 days) → [Lachung, Lachung]
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
    // Map each requested day proportionally onto the schedule
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
      travelCost = place.travelOptions[0]?.approxCost ?? 0;
    } else if (prevPlace && prevPlace.id !== place.id) {
      // Transitioning to a new place
      if (prevPlace.state !== place.state) {
        travelNote = `Travel from ${prevPlace.name} (${formatState(prevPlace.state)}) to ${place.name} (${formatState(place.state)}). Inter-state travel day.`;
      } else {
        travelNote = `Travel from ${prevPlace.name} to ${place.name}. Check-in and settle in.`;
      }
      travelCost = place.travelOptions[0]?.approxCost ?? 0;
    } else {
      // Continuing at the same place
      const activities = place.highlights.slice((placeDay - 1) * 2, (placeDay - 1) * 2 + 2);
      travelNote = activities.length > 0
        ? `Day ${placeDay} in ${place.name} — explore ${activities.join(' and ')}.`
        : `Day ${placeDay} in ${place.name}. Continue exploring nearby attractions.`;
    }

    days.push({
      day: dayIndex,
      places: [place],
      travelNote,
      estimatedTravelCost: travelCost,
    });
  }

  return days;
}

function formatState(stateId: string): string {
  return stateId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function computeCosts(days: ItineraryDay[], options: ItineraryOptions): CostBreakdown {
  const { stayType, groupSize, numDays } = options;

  const stayMultiplier = stayType === 'budget' ? 0 : stayType === 'mid' ? 1 : 2;

  let travel = 0;
  let stay = 0;
  let food = 0;
  let entry = 0;

  for (const day of days) {
    for (const place of day.places) {
      // Stay cost
      const stayOpt = place.stayOptions[stayMultiplier] ?? place.stayOptions[0];
      stay += stayOpt.costPerNight;

      // Food
      food += place.foodCostPerDay;

      // Entry
      entry += place.entryFee;

      // Travel — find best option matching preferred mode
      const preferred = place.travelOptions.find(o => o.mode === options.travelMode);
      const cheapest = place.travelOptions[0];
      const travelOpt = preferred ?? cheapest;
      if (travelOpt) travel += travelOpt.approxCost;
    }
  }

  // Scale by group size (stay is per room ~2 pax, food & travel per person)
  const rooms = Math.ceil(groupSize / 2);
  const scaledStay = stay * rooms;
  const scaledFood = food * groupSize;
  const scaledTravel = travel * Math.ceil(groupSize / 4); // cab shared by 4
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
  const clusters = clusterPlaces(places);
  const days = distributeIntodays(clusters, options.numDays);
  const costs = computeCosts(days, options);
  const route = [...new Set(days.flatMap(d => d.places.map(p => p.name)))];
  const tips = buildTips(places);

  return { days, totalEstimatedCost: costs, route, tips };
}
