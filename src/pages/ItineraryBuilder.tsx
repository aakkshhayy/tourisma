import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItineraryStore } from '../store/itineraryStore';
import { generateItinerary } from '../utils/itineraryGenerator';
import { Itinerary } from '../types';
import { PLACES, getStateById } from '../data/places';
import {
  Sparkles, Calendar, Users, Hotel, Train, Bus, Car,
  Wallet, MapPin, Plus, Check, X, ArrowRight, Lightbulb,
  Printer, ChevronLeft, Plane, Utensils, Ticket, Package,
  TrendingUp, Map as MapIcon, Compass,
} from 'lucide-react';

const TRAVEL_ICONS_LR: Record<string, typeof Train> = {
  train: Train,
  bus: Bus,
  cab: Car,
  flight: Plane,
  shared_jeep: Car,
};

const STAY_OPTIONS = [
  { id: 'budget', label: 'Budget', desc: 'Hostels & guesthouses' },
  { id: 'mid', label: 'Mid-range', desc: '3-star hotels' },
  { id: 'luxury', label: 'Luxury', desc: '4-5 star hotels' },
] as const;

const TRAVEL_OPTIONS = [
  { id: 'train', label: 'Train', icon: Train },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'cab', label: 'Cab', icon: Car },
] as const;

const COST_ITEMS = [
  { key: 'travel', label: 'Travel', icon: Train, color: 'bg-sky-50 text-sky-700' },
  { key: 'stay', label: 'Stay', icon: Hotel, color: 'bg-violet-50 text-violet-700' },
  { key: 'food', label: 'Food', icon: Utensils, color: 'bg-amber-50 text-amber-700' },
  { key: 'entry', label: 'Entry Fees', icon: Ticket, color: 'bg-rose-50 text-rose-700' },
  { key: 'miscellaneous', label: 'Misc.', icon: Package, color: 'bg-emerald-50 text-emerald-700' },
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
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-white border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            Itinerary Builder
          </div>
          <h1 className="font-display font-extrabold text-ink-900 text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            Build your perfect trip
          </h1>
          <p className="text-ink-600 text-lg mt-3 max-w-2xl">
            Select destinations, configure your preferences, and we'll generate a smart day-by-day plan with realistic cost estimates.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Step 1: Select Places */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
          <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
                <span className="text-saffron font-extrabold text-lg">1</span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Choose your destinations</h2>
                <p className="text-ink-400 text-sm mt-1">
                  <span className="font-bold text-ink-900">{selectedPlaces.length}</span> selected · tap any place to toggle
                </p>
              </div>
            </div>
            {selectedPlaces.length > 0 && (
              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-1 text-sm font-semibold text-ink-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear all
              </button>
            )}
          </div>

          {/* Selected chips */}
          {selectedPlaces.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-saffron/5 rounded-2xl border border-saffron/15">
              {selectedPlaces.map(p => (
                <div key={p.id} className="inline-flex items-center gap-2 bg-white border border-saffron/30 px-3 py-1.5 rounded-full text-sm shadow-soft">
                  <span>{p.emoji}</span>
                  <span className="font-bold text-ink-900">{p.name}</span>
                  <button
                    onClick={() => togglePlace(p)}
                    className="text-ink-400 hover:text-rose-500 transition-colors"
                    aria-label={`Remove ${p.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick-add grid */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Quick add</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {PLACES.map(p => {
                const sel = isSelected(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlace(p)}
                    className={`group relative flex items-center gap-2.5 p-3 rounded-2xl text-left text-sm transition-all border-2
                      ${sel
                        ? 'border-saffron bg-saffron/5'
                        : 'border-ink-100 bg-white hover:border-saffron/40 hover:bg-saffron/5'}`}
                  >
                    <span className="text-xl flex-shrink-0">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink-900 truncate text-sm leading-tight">{p.name}</div>
                      <div className="text-[11px] text-ink-400 capitalize truncate">{getStateById(p.state)?.name}</div>
                    </div>
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all
                      ${sel ? 'bg-saffron text-white' : 'bg-ink-50 text-ink-400 group-hover:bg-saffron/20 group-hover:text-saffron'}`}>
                      {sel ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Step 2: Configure */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
              <span className="text-saffron font-extrabold text-lg">2</span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Configure your trip</h2>
              <p className="text-ink-400 text-sm mt-1">Set duration, group size, and preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Days */}
            <div className="bg-ink-50/40 rounded-2xl p-5 border border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-saffron" strokeWidth={2.5} />
                <label className="text-sm font-bold text-ink-900">Number of Days</label>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-1 border border-ink-100">
                <button
                  onClick={() => setOptions({ numDays: Math.max(1, options.numDays - 1) })}
                  className="w-10 h-10 rounded-lg hover:bg-ink-50 transition-colors font-bold text-xl text-ink-600"
                >
                  −
                </button>
                <span className="text-2xl font-extrabold text-ink-900">{options.numDays}</span>
                <button
                  onClick={() => setOptions({ numDays: Math.min(30, options.numDays + 1) })}
                  className="w-10 h-10 rounded-lg hover:bg-ink-50 transition-colors font-bold text-xl text-ink-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Group size */}
            <div className="bg-ink-50/40 rounded-2xl p-5 border border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-saffron" strokeWidth={2.5} />
                <label className="text-sm font-bold text-ink-900">Group Size</label>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-1 border border-ink-100">
                <button
                  onClick={() => setOptions({ groupSize: Math.max(1, options.groupSize - 1) })}
                  className="w-10 h-10 rounded-lg hover:bg-ink-50 transition-colors font-bold text-xl text-ink-600"
                >
                  −
                </button>
                <span className="text-2xl font-extrabold text-ink-900">{options.groupSize}</span>
                <button
                  onClick={() => setOptions({ groupSize: Math.min(20, options.groupSize + 1) })}
                  className="w-10 h-10 rounded-lg hover:bg-ink-50 transition-colors font-bold text-xl text-ink-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stay type */}
            <div className="bg-ink-50/40 rounded-2xl p-5 border border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Hotel className="w-4 h-4 text-saffron" strokeWidth={2.5} />
                <label className="text-sm font-bold text-ink-900">Stay Type</label>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {STAY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setOptions({ stayType: opt.id })}
                    className={`px-2 py-2.5 rounded-xl text-xs transition-all font-bold
                      ${options.stayType === opt.id
                        ? 'bg-ink-900 text-white shadow-soft'
                        : 'bg-white text-ink-600 border border-ink-100 hover:border-ink-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel mode */}
            <div className="bg-ink-50/40 rounded-2xl p-5 border border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-saffron" strokeWidth={2.5} />
                <label className="text-sm font-bold text-ink-900">Preferred Travel</label>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {TRAVEL_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const sel = options.travelMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setOptions({ travelMode: opt.id })}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs transition-all font-bold
                        ${sel
                          ? 'bg-ink-900 text-white shadow-soft'
                          : 'bg-white text-ink-600 border border-ink-100 hover:border-ink-200'}`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.2} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate CTA */}
          <button
            onClick={handleGenerate}
            disabled={selectedPlaces.length === 0}
            className={`mt-6 w-full group inline-flex items-center justify-center gap-3 py-5 rounded-2xl font-extrabold text-lg transition-all
              ${selectedPlaces.length === 0
                ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-saffron to-orange-500 text-white hover:shadow-glow active:scale-[0.99]'}`}
          >
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            Generate my itinerary
            {selectedPlaces.length > 0 && (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            )}
          </button>
          {selectedPlaces.length === 0 && (
            <p className="text-center text-ink-400 text-sm mt-3">Select at least 1 destination above to generate</p>
          )}
        </section>

        {/* Generated itinerary */}
        {generated && itinerary && (
          <div id="itinerary-result" className="space-y-6 animate-fade-in-up">
            {/* Trip overview / Route */}
            <section className="relative bg-gradient-to-br from-ink-900 via-ink-900 to-ink-600 rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-saffron/30 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
                  <MapIcon className="w-4 h-4" strokeWidth={2.5} />
                  Your route
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                  Your {options.numDays}-day Indian adventure
                </h2>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-100">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4" strokeWidth={2.2} />
                    {options.groupSize} traveller{options.groupSize > 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Hotel className="w-4 h-4" strokeWidth={2.2} />
                    {options.stayType} stay
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Compass className="w-4 h-4" strokeWidth={2.2} />
                    {options.travelMode}
                  </span>
                </div>

                {/* Route timeline */}
                <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {itinerary.route.map((place, i) => (
                    <div key={i} className="flex items-center gap-2 flex-shrink-0">
                      {i > 0 && <ArrowRight className="w-4 h-4 text-ink-200/50 flex-shrink-0" strokeWidth={2.5} />}
                      <span className="bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap">
                        <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" strokeWidth={2.5} />
                        {place}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Cost breakdown */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-saffron" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Cost estimate</h2>
                    <p className="text-ink-400 text-sm">Total for your group · all-inclusive</p>
                  </div>
                </div>

                {/* Total badge */}
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Total</p>
                  <p className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
                    ₹{itinerary.totalEstimatedCost.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    ≈ ₹{Math.round(itinerary.totalEstimatedCost.total / options.groupSize).toLocaleString()} / person
                  </p>
                </div>
              </div>

              {/* Bars */}
              <div className="space-y-3">
                {COST_ITEMS.map(item => {
                  const value = itinerary.totalEstimatedCost[item.key as keyof typeof itinerary.totalEstimatedCost];
                  const total = itinerary.totalEstimatedCost.total || 1;
                  const pct = Math.round((value / total) * 100);
                  const Icon = item.icon;
                  return (
                    <div key={item.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color}`}>
                            <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </div>
                          <span className="text-sm font-bold text-ink-900">{item.label}</span>
                          <span className="text-xs text-ink-400">{pct}%</span>
                        </div>
                        <span className="text-sm font-extrabold text-ink-900 tabular-nums">₹{value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-ink-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-saffron to-orange-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-ink-400 text-xs mt-5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.2} />
                Estimates exclude shopping, tips & unexpected expenses. Actual costs may vary.
              </p>
            </section>

            {/* Day-by-day */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-saffron" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Day-by-day plan</h2>
                  <p className="text-ink-400 text-sm">{itinerary.days.length} days · {itinerary.route.length} destinations</p>
                </div>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-saffron via-saffron/30 to-transparent" />

                <div className="space-y-6">
                  {itinerary.days.map(day => {
                    const TravelIcon = day.places[0]?.travelOptions?.[0]
                      ? TRAVEL_ICONS_LR[day.places[0].travelOptions[0].mode] ?? Train
                      : Train;
                    return (
                      <div key={day.day} className="relative flex gap-5">
                        {/* Day badge */}
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-saffron to-orange-500 text-white flex flex-col items-center justify-center font-extrabold text-xs leading-none shadow-glow">
                            <span className="text-[9px] uppercase tracking-wider opacity-80">Day</span>
                            <span className="text-base">{day.day}</span>
                          </div>
                        </div>

                        {/* Day card */}
                        <div className="flex-1 bg-ink-50/40 rounded-2xl p-5 border border-ink-100">
                          <h3 className="font-extrabold text-ink-900 text-lg leading-tight">
                            {day.places.map(p => p.name).join(' & ')}
                          </h3>
                          <p className="text-ink-600 text-sm mt-1.5 leading-relaxed">{day.travelNote}</p>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {day.places.map(p => {
                              const stateInfo = getStateById(p.state);
                              return (
                                <Link
                                  key={p.id}
                                  to={`/place/${p.id}`}
                                  className="group flex items-center gap-3 p-3 bg-white border border-ink-100 hover:border-saffron/30 rounded-xl transition-all"
                                >
                                  <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-ink-900 text-sm group-hover:text-saffron transition-colors leading-tight truncate">
                                      {p.name}
                                    </p>
                                    <p className="text-ink-400 text-xs truncate flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3" strokeWidth={2.2} />
                                      {stateInfo?.name}
                                    </p>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-ink-400 group-hover:text-saffron group-hover:translate-x-0.5 transition-all flex-shrink-0" strokeWidth={2.5} />
                                </Link>
                              );
                            })}
                          </div>

                          {day.estimatedTravelCost > 0 && (
                            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 bg-white border border-ink-100 px-2.5 py-1 rounded-lg">
                              <TravelIcon className="w-3.5 h-3.5 text-saffron" strokeWidth={2.5} />
                              Travel ₹{day.estimatedTravelCost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Tips */}
            {itinerary.tips.length > 0 && (
              <section className="bg-amber-50 rounded-3xl p-6 sm:p-8 border border-amber-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-amber-700" strokeWidth={2.2} />
                  </div>
                  <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Smart travel tips</h2>
                </div>
                <ul className="space-y-3">
                  {itinerary.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-amber-100">
                      <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 text-xs font-extrabold">
                        {i + 1}
                      </div>
                      <span className="text-ink-900 text-sm leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-ink-100 bg-white text-ink-900 font-bold hover:border-ink-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                Modify plan
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-ink-900 text-white font-bold hover:bg-ink-600 transition-colors shadow-soft"
              >
                <Printer className="w-4 h-4" strokeWidth={2.5} />
                Save / print itinerary
              </button>
            </div>
          </div>
        )}

        {selectedPlaces.length === 0 && !generated && (
          <div className="text-center py-12 bg-white rounded-3xl border border-ink-100">
            <div className="w-16 h-16 mx-auto bg-saffron/10 rounded-2xl flex items-center justify-center mb-4">
              <MapIcon className="w-7 h-7 text-saffron" strokeWidth={2.2} />
            </div>
            <h3 className="font-display text-xl font-extrabold text-ink-900 mb-1.5">No destinations selected yet</h3>
            <p className="text-ink-400 mb-6 text-sm">Browse 125+ places, or use quick-add above.</p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 bg-saffron text-white font-bold px-7 py-3 rounded-2xl hover:bg-orange-600 transition-colors shadow-glow"
            >
              Browse Destinations
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
