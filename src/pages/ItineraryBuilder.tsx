import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItineraryStore } from '../store/itineraryStore';
import { generateItinerary } from '../utils/itineraryGenerator';
import { Itinerary } from '../types';
import { PLACES } from '../data/places';

const TRAVEL_ICONS: Record<string, string> = {
  train: '🚂',
  bus: '🚌',
  cab: '🚕',
  flight: '✈️',
  shared_jeep: '🚐',
};

const STAY_OPTIONS = [
  { id: 'budget', label: 'Budget', desc: 'Guesthouses & hostels', icon: '🏠' },
  { id: 'mid', label: 'Mid-range', desc: '3-star hotels', icon: '🏨' },
  { id: 'luxury', label: 'Luxury', desc: '4-5 star hotels', icon: '🏩' },
] as const;

const TRAVEL_OPTIONS = [
  { id: 'train', label: 'Train', icon: '🚂' },
  { id: 'bus', label: 'Bus', icon: '🚌' },
  { id: 'cab', label: 'Cab', icon: '🚕' },
] as const;

export default function ItineraryBuilder() {
  const { selectedPlaces, options, setOptions, togglePlace, isSelected, clearSelection } = useItineraryStore();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    if (selectedPlaces.length === 0) return;
    const result = generateItinerary(selectedPlaces, options);
    setItinerary(result);
    setGenerated(true);
    setTimeout(() => {
      document.getElementById('itinerary-result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setItinerary(null);
    setGenerated(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-black mb-2">🗓️ Itinerary Builder</h1>
          <p className="text-orange-100 text-lg">Select places, configure your preferences, and get a smart travel plan</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Step 1: Select Places */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Step 1 — Choose Your Destinations</h2>
              <p className="text-gray-500 text-sm mt-1">Select places you want to visit ({selectedPlaces.length} selected)</p>
            </div>
            {selectedPlaces.length > 0 && (
              <button onClick={clearSelection} className="text-sm text-red-400 hover:text-red-600 transition-colors">
                Clear all
              </button>
            )}
          </div>

          {/* Selected places */}
          {selectedPlaces.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
              {selectedPlaces.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-white border border-orange-200 px-3 py-1.5 rounded-full text-sm">
                  <span>{p.emoji}</span>
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <button onClick={() => togglePlace(p)} className="text-gray-400 hover:text-red-500 transition-colors text-xs">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Quick-add from all places */}
          <div>
            <p className="text-sm text-gray-500 mb-3 font-medium">Quick add:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {PLACES.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlace(p)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-sm transition-all border
                    ${isSelected(p.id)
                      ? 'border-orange-400 bg-orange-50 text-orange-800'
                      : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-orange-200 hover:bg-orange-50'}`}
                >
                  <span className="text-lg flex-shrink-0">{p.emoji}</span>
                  <span className="font-medium truncate">{p.name}</span>
                  {isSelected(p.id) && <span className="ml-auto text-orange-500 flex-shrink-0">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Step 2: Configure */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Step 2 — Configure Your Trip</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Days */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Days</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOptions({ numDays: Math.max(1, options.numDays - 1) })}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="text-2xl font-black text-orange-600 w-8 text-center">{options.numDays}</span>
                <button
                  onClick={() => setOptions({ numDays: Math.min(30, options.numDays + 1) })}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Group size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Group Size</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOptions({ groupSize: Math.max(1, options.groupSize - 1) })}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="text-2xl font-black text-orange-600 w-8 text-center">{options.groupSize}</span>
                <button
                  onClick={() => setOptions({ groupSize: Math.min(20, options.groupSize + 1) })}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stay type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stay Type</label>
              <div className="flex flex-col gap-1">
                {STAY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOptions({ stayType: opt.id })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors
                      ${options.stayType === opt.id ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span>{opt.icon}</span>
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Travel mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Travel</label>
              <div className="flex flex-col gap-1">
                {TRAVEL_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOptions({ travelMode: opt.id })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors
                      ${options.travelMode === opt.id ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span>{opt.icon}</span>
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={handleGenerate}
              disabled={selectedPlaces.length === 0}
              className={`flex-1 sm:flex-none px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg
                ${selectedPlaces.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'}`}
            >
              ✨ Generate My Itinerary
            </button>
            {selectedPlaces.length === 0 && (
              <p className="text-gray-400 text-sm">Select at least 1 destination above to generate</p>
            )}
          </div>
        </section>

        {/* Generated itinerary */}
        {generated && itinerary && (
          <div id="itinerary-result" className="space-y-6">
            {/* Route overview */}
            <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-black mb-2">Your {options.numDays}-Day India Adventure</h2>
              <p className="text-orange-100 mb-4">
                {options.groupSize} traveller{options.groupSize > 1 ? 's' : ''} · {options.stayType} stay · {options.travelMode} preferred
              </p>
              <div className="flex flex-wrap gap-2">
                {itinerary.route.map((place, i) => (
                  <span key={i} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {i > 0 && <span className="mr-1 opacity-60">→</span>}
                    {place}
                  </span>
                ))}
              </div>
            </section>

            {/* Cost summary */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-5">💰 Cost Estimate</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                {[
                  { label: 'Travel', value: itinerary.totalEstimatedCost.travel, icon: '🚂' },
                  { label: 'Stay', value: itinerary.totalEstimatedCost.stay, icon: '🏨' },
                  { label: 'Food', value: itinerary.totalEstimatedCost.food, icon: '🍽️' },
                  { label: 'Entry Fees', value: itinerary.totalEstimatedCost.entry, icon: '🎟️' },
                  { label: 'Misc.', value: itinerary.totalEstimatedCost.miscellaneous, icon: '📦' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="font-bold text-gray-900 text-lg">₹{item.value.toLocaleString()}</div>
                    <div className="text-gray-500 text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Estimated Cost</p>
                  <p className="text-3xl font-black text-orange-600">₹{itinerary.totalEstimatedCost.total.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs mt-1">for {options.groupSize} person{options.groupSize > 1 ? 's' : ''} · {options.numDays} days</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Per person</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{Math.round(itinerary.totalEstimatedCost.total / options.groupSize).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-3">* Estimates are approximate and exclude shopping, tips, and unexpected expenses. Actual costs may vary.</p>
            </section>

            {/* Day-by-day itinerary */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">📅 Day-by-Day Plan</h2>
              <div className="space-y-6">
                {itinerary.days.map(day => (
                  <div key={day.day} className="flex gap-4">
                    {/* Day marker */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                        {day.day}
                      </div>
                      {day.day < itinerary.days.length && (
                        <div className="w-0.5 bg-orange-100 flex-1 mt-2" />
                      )}
                    </div>

                    {/* Day content */}
                    <div className="flex-1 pb-6">
                      <h3 className="font-bold text-gray-900 mb-1">
                        Day {day.day} — {day.places.map(p => p.name).join(' & ')}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">{day.travelNote}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {day.places.map(p => (
                          <Link
                            key={p.id}
                            to={`/place/${p.id}`}
                            className="flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
                          >
                            <span className="text-2xl">{p.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm group-hover:text-orange-700">{p.name}</p>
                              <p className="text-gray-500 text-xs truncate">{p.tagline}</p>
                            </div>
                            <div className="text-xs text-orange-600 flex-shrink-0">→</div>
                          </Link>
                        ))}
                      </div>

                      {day.places.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                          {day.places[0].travelOptions.slice(0, 2).map((opt, i) => (
                            <span key={i} className="flex items-center gap-1">
                              {TRAVEL_ICONS[opt.mode]} {opt.from} → {opt.to} ({opt.duration})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Travel tips */}
            {itinerary.tips.length > 0 && (
              <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Smart Travel Tips</h2>
                <ul className="space-y-3">
                  {itinerary.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span>
                      <span className="text-gray-700 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                ← Modify Plan
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
              >
                🖨️ Save / Print Itinerary
              </button>
            </div>
          </div>
        )}

        {selectedPlaces.length === 0 && !generated && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No destinations selected yet</h3>
            <p className="text-gray-500 mb-6">Go to Explore to browse and select places, or use the quick-add above.</p>
            <Link
              to="/explore"
              className="inline-block bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Browse Destinations →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
