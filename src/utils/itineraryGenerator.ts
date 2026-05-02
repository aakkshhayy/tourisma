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
  const days: ItineraryDay[] = [];
  let dayIndex = 1;

  for (const cluster of clusters) {
    let i = 0;
    while (i < cluster.length && dayIndex <= numDays) {
      const dayPlaces: TouristPlace[] = [];
      let daysUsed = 0;

      // Fit places into days based on their recommendedDays
      while (i < cluster.length && daysUsed < 1) {
        dayPlaces.push(cluster[i]);
        daysUsed += Math.min(cluster[i].recommendedDays, 1);
        i++;
      }

      const travelNote = buildTravelNote(dayPlaces, dayIndex, days);
      const travelCost = dayPlaces.reduce((sum, p) => {
        const cheapestOption = p.travelOptions[0];
        return sum + (cheapestOption?.approxCost ?? 0);
      }, 0);

      days.push({ day: dayIndex, places: dayPlaces, travelNote, estimatedTravelCost: travelCost });
      dayIndex++;
    }
  }

  return days;
}

function buildTravelNote(places: TouristPlace[], dayIndex: number, previousDays: ItineraryDay[]): string {
  if (dayIndex === 1) return 'Arrival and check-in. Evening at leisure to acclimatize.';

  const prevDay = previousDays[previousDays.length - 1];
  if (!prevDay || prevDay.places.length === 0) return 'Travel to next destination.';

  const prevPlace = prevDay.places[prevDay.places.length - 1];
  const currPlace = places[0];

  if (!prevPlace || !currPlace) return 'Travel to next destination.';
  if (prevPlace.state !== currPlace.state) {
    return `Travel from ${prevPlace.name} (${formatState(prevPlace.state)}) to ${currPlace.name} (${formatState(currPlace.state)}). Inter-state travel day.`;
  }
  return `Day trip to ${places.map(p => p.name).join(' & ')}. Return to base by evening.`;
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
