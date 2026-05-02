import { useParams, Link } from 'react-router-dom';
import { getPlaceById, getPlacesByState, getStateById } from '../data/places';
import { useItineraryStore } from '../store/itineraryStore';
import PlaceCard from '../components/PlaceCard';

const TRAVEL_ICONS: Record<string, string> = {
  train: '🚂',
  bus: '🚌',
  cab: '🚕',
  flight: '✈️',
  shared_jeep: '🚐',
};

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();
  const place = getPlaceById(id ?? '');
  const { togglePlace, isSelected } = useItineraryStore();

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Place not found</h2>
          <Link to="/explore" className="text-orange-500 hover:underline">Back to Explore</Link>
        </div>
      </div>
    );
  }

  const selected = isSelected(place.id);
  const stateInfo = getStateById(place.state);
  const related = getPlacesByState(place.state)
    .filter(p => p.id !== place.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-400 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 text-orange-200 text-sm mb-4">
            <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
            <span>›</span>
            <Link to={`/explore?state=${place.state}`} className="hover:text-white transition-colors">
              {stateInfo?.name ?? place.state}
            </Link>
            <span>›</span>
            <span className="text-white">{place.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-7xl">{place.emoji}</div>
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-black mb-2">{place.name}</h1>
              <p className="text-xl text-orange-100 font-medium">{place.tagline}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  🕐 {place.recommendedDays} day{place.recommendedDays > 1 ? 's' : ''} recommended
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  🌤️ Best: {place.bestTimeToVisit}
                </span>
                {place.entryFee > 0 && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    🎟️ Entry: ₹{place.entryFee}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => togglePlace(place)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg
                ${selected
                  ? 'bg-white text-orange-600 hover:bg-orange-50'
                  : 'bg-orange-700 text-white hover:bg-orange-800'}`}
            >
              {selected ? '✓ Added to Itinerary' : '+ Add to Itinerary'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{place.description}</p>
          </section>

          {/* Highlights */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Highlights</h2>
            <ul className="space-y-2">
              {place.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{h}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Nearby Attractions */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Attractions</h2>
            <div className="flex flex-wrap gap-2">
              {place.nearbyAttractions.map((attr, i) => (
                <span key={i} className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  📍 {attr}
                </span>
              ))}
            </div>
          </section>

          {/* Travel Options */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Get There</h2>
            <div className="space-y-3">
              {place.travelOptions.map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{TRAVEL_ICONS[opt.mode]}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm capitalize">{opt.mode.replace('_', ' ')}</p>
                      <p className="text-gray-500 text-xs">{opt.from} → {opt.to} · {opt.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{opt.approxCost.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">per person</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">State</span>
                <span className="font-medium text-gray-900">{stateInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Best time</span>
                <span className="font-medium text-gray-900 text-right max-w-32">{place.bestTimeToVisit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-900">{place.recommendedDays} day{place.recommendedDays > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Entry fee</span>
                <span className="font-medium text-gray-900">{place.entryFee > 0 ? `₹${place.entryFee}` : 'Free'}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between">
                <span className="text-gray-500">Nearest railway</span>
                <span className="font-medium text-gray-900 text-right max-w-32 text-xs">{place.nearestRailway.station} ({place.nearestRailway.distanceKm} km)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nearest airport</span>
                <span className="font-medium text-gray-900 text-right max-w-32 text-xs">{place.nearestAirport.airport} ({place.nearestAirport.distanceKm} km)</span>
              </div>
            </div>
          </div>

          {/* Cost estimate */}
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <h3 className="font-bold text-gray-900 mb-4">Est. Daily Cost (per person)</h3>
            <div className="space-y-3 text-sm">
              {place.stayOptions.map(opt => (
                <div key={opt.type} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize flex items-center gap-1">
                    {opt.type === 'budget' ? '🏠' : opt.type === 'mid' ? '🏨' : '🏩'} {opt.type} stay
                  </span>
                  <span className="font-bold text-gray-900">₹{opt.costPerNight.toLocaleString()}/night</span>
                </div>
              ))}
              <hr className="border-orange-200" />
              <div className="flex justify-between">
                <span className="text-gray-600">🍽️ Food (avg)</span>
                <span className="font-bold text-gray-900">₹{place.foodCostPerDay}/day</span>
              </div>
            </div>
          </div>

          {/* Add to itinerary CTA */}
          <button
            onClick={() => togglePlace(place)}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow
              ${selected
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-orange-500 text-white hover:bg-orange-600'}`}
          >
            {selected ? '✓ In Your Itinerary' : '+ Add to Itinerary'}
          </button>

          {selected && (
            <Link
              to="/itinerary"
              className="block w-full text-center py-3 rounded-2xl border-2 border-orange-300 text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
            >
              View Itinerary Builder →
            </Link>
          )}
        </div>
      </div>

      {/* Related places */}
      {related.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            More in {stateInfo?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map(p => (
              <PlaceCard key={p.id} place={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
