export interface TravelOption {
  mode: 'train' | 'bus' | 'cab' | 'flight' | 'shared_jeep';
  from: string;
  to: string;
  duration: string;
  approxCost: number;
}

export interface TouristPlace {
  id: string;
  name: string;
  state: string;
  tagline: string;
  description: string;
  category: 'heritage' | 'nature' | 'religious' | 'beach' | 'hill_station' | 'wildlife' | 'cultural';
  bestTimeToVisit: string;
  recommendedDays: number;
  nearbyAttractions: string[];
  nearestRailway: { station: string; distanceKm: number };
  nearestAirport: { airport: string; distanceKm: number };
  travelOptions: TravelOption[];
  stayOptions: { type: string; costPerNight: number }[];
  foodCostPerDay: number;
  entryFee: number;
  coordinates: { lat: number; lng: number };
  emoji: string;
  highlights: string[];
}

export interface StateInfo {
  id: string;
  name: string;
  capital: string;
  description: string;
  emoji: string;
  coverGradient: string;
  placesCount: number;
}

export interface ItineraryDay {
  day: number;
  places: TouristPlace[];
  travelNote: string;
  estimatedTravelCost: number;
}

export interface Itinerary {
  days: ItineraryDay[];
  totalEstimatedCost: CostBreakdown;
  route: string[];
  tips: string[];
}

export interface CostBreakdown {
  travel: number;
  stay: number;
  food: number;
  entry: number;
  miscellaneous: number;
  total: number;
}

export interface ItineraryOptions {
  stayType: 'budget' | 'mid' | 'luxury';
  travelMode: 'train' | 'bus' | 'cab';
  groupSize: number;
  numDays: number;
}
