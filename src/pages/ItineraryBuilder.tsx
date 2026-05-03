import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useItineraryStore } from '../store/itineraryStore';
import { generateItinerary } from '../utils/itineraryGenerator';
import { Itinerary } from '../types';
import { PLACES, getStateById, getPlaceById } from '../data/places';
import { ORIGIN_CITIES, getOriginById } from '../data/origins';
import Stepper from '../components/Stepper';
import {
  Sparkles, Calendar, Users, Hotel, Train, Bus, Car,
  Wallet, MapPin, Plus, Check, X, ArrowRight, Lightbulb,
  Printer, ChevronLeft, Plane, Utensils, Ticket, Package,
  TrendingUp, Map as MapIcon, Compass, Home as HomeIcon, Route, Clock,
  Loader2, Download, Share2, Info, Wand2,
} from 'lucide-react';

const TRAVEL_ICONS_LR: Record<string, typeof Train> = {
  train: Train, bus: Bus, cab: Car, flight: Plane, shared_jeep: Car,
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
  { key: 'travel', label: 'Travel', icon: Train, color: 'bg-sky-50 text-sky-700', help: 'Train/bus/flight tickets · scaled per group' },
  { key: 'stay', label: 'Stay', icon: Hotel, color: 'bg-violet-50 text-violet-700', help: 'Hotels per night · 2 pax/room' },
  { key: 'food', label: 'Food', icon: Utensils, color: 'bg-amber-50 text-amber-700', help: 'Per person, per day' },
  { key: 'entry', label: 'Entry', icon: Ticket, color: 'bg-rose-50 text-rose-700', help: 'Monument & temple fees' },
  { key: 'miscellaneous', label: 'Misc.', icon: Package, color: 'bg-emerald-50 text-emerald-700', help: '~8% buffer for tips, water, shopping' },
] as const;

const STEPS = [
  { id: 'origin', label: 'Select City', short: 'City' },
  { id: 'places', label: 'Choose Places', short: 'Places' },
  { id: 'configure', label: 'Configure', short: 'Config' },
  { id: 'plan', label: 'View Plan', short: 'Plan' },
];

// Sample trip — clicked from empty state
const SAMPLE_TRIP = {
  originCityId: 'patna',
  placeIds: ['sk_gangtok', 'sk_lachung'],
  numDays: 5,
};

export default function ItineraryBuilder() {
  const {
    selectedPlaces, options, setOptions, togglePlace, isSelected, clearSelection,
    addPlace,
  } = useItineraryStore();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStep = useMemo(() => {
    if (generated) return 3;
    if (selectedPlaces.length === 0) return 1;
    return 2;
  }, [generated, selectedPlaces.length]);

  const stepCompleted = useMemo(() => [
    !!options.originCityId,
    selectedPlaces.length > 0,
    selectedPlaces.length > 0,
    generated,
  ], [options.originCityId, selectedPlaces.length, generated]);

  const handleGenerate = () => {
    if (selectedPlaces.length === 0) return;
    setIsGenerating(true);
    // Brief delay so the loader is visible & the action feels deliberate
    setTimeout(() => {
      const result = generateItinerary(selectedPlaces, options);
      setItinerary(result);
      setGenerated(true);
      setIsGenerating(false);
      setTimeout(() => {
        document.getElementById('itinerary-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }, 700);
  };

  const handleReset = () => {
    setItinerary(null);
    setGenerated(false);
  };

  const loadSample = () => {
    clearSelection();
    setOptions({ originCityId: SAMPLE_TRIP.originCityId, numDays: SAMPLE_TRIP.numDays });
    SAMPLE_TRIP.placeIds.forEach(id => {
      const p = getPlaceById(id);
      if (p) addPlace(p);
    });
    setTimeout(() => {
      document.getElementById('step-configure')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleDownload = () => {
    if (!itinerary) return;
    const origin = getOriginById(options.originCityId);
    const lines: string[] = [];
    lines.push('TOURISMA — TRIP ITINERARY');
    lines.push('='.repeat(40));
    lines.push(`From: ${origin?.name ?? '—'}`);
    lines.push(`Duration: ${options.numDays} days`);
    lines.push(`Group size: ${options.groupSize}`);
    lines.push(`Stay: ${options.stayType} · Travel: ${options.travelMode}`);
    lines.push('');
    lines.push(`Route: ${itinerary.route.join(' → ')}`);
    lines.push(`Distance: ${itinerary.totalDistanceKm.toLocaleString()} km · Travel time: ${Math.floor(itinerary.totalTravelHours)}h ${Math.round((itinerary.totalTravelHours % 1) * 60)}m`);
    lines.push('');
    lines.push('TRAVEL ROUTE');
    lines.push('-'.repeat(40));
    itinerary.journey.forEach((l, i) => {
      lines.push(`${i + 1}. ${l.from} → ${l.to}${l.isReturn ? ' (return)' : ''}`);
      lines.push(`   ${l.mode.toUpperCase()} · ${l.distanceKm.toLocaleString()} km · ${Math.floor(l.durationHours)}h ${Math.round((l.durationHours % 1) * 60)}m · ₹${l.cost.toLocaleString()}`);
    });
    lines.push('');
    lines.push('DAY-BY-DAY');
    lines.push('-'.repeat(40));
    itinerary.days.forEach(d => {
      lines.push(`Day ${d.day}: ${d.places.map(p => p.name).join(' & ')}`);
      lines.push(`  ${d.travelNote}`);
    });
    lines.push('');
    lines.push('COST ESTIMATE (₹)');
    lines.push('-'.repeat(40));
    const c = itinerary.totalEstimatedCost;
    lines.push(`Travel : ${c.travel.toLocaleString()}`);
    lines.push(`Stay   : ${c.stay.toLocaleString()}`);
    lines.push(`Food   : ${c.food.toLocaleString()}`);
    lines.push(`Entry  : ${c.entry.toLocaleString()}`);
    lines.push(`Misc.  : ${c.miscellaneous.toLocaleString()}`);
    lines.push(`TOTAL  : ${c.total.toLocaleString()}`);
    lines.push(`Per person: ${Math.round(c.total / options.groupSize).toLocaleString()}`);
    lines.push('');
    lines.push('TIPS');
    lines.push('-'.repeat(40));
    itinerary.tips.forEach(t => lines.push(`• ${t}`));

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tourisma-${options.numDays}day-trip.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const handleShare = async () => {
    if (!itinerary) return;
    const origin = getOriginById(options.originCityId);
    const text = `${options.numDays}-day India trip from ${origin?.name ?? 'home'}: ${itinerary.route.join(' → ')}. Total ≈ ₹${itinerary.totalEstimatedCost.total.toLocaleString()} for ${options.groupSize}. Planned with Tourisma.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My India Trip', text, url: location.href });
      } else {
        await navigator.clipboard.writeText(text + '\n' + location.href);
        setShareMsg('Copied trip summary to clipboard');
        setTimeout(() => setShareMsg(null), 2500);
      }
    } catch { /* user cancelled */ }
  };

  // Auto-generate when navigating in via Home with a pre-filled selection — opt-in via hash
  useEffect(() => {
    if (location.hash === '#auto' && selectedPlaces.length > 0 && !generated) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const origin = getOriginById(options.originCityId);

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
            Plan your trip from your city
          </h1>
          <p className="text-ink-600 text-lg mt-3 max-w-2xl">
            Pick your origin, choose destinations, set preferences. We generate the route, day-by-day plan, and a real cost estimate in seconds.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Step indicator */}
        <Stepper
          steps={STEPS}
          current={currentStep}
          completed={stepCompleted}
        />

        {/* Step 1 — Origin city */}
        <section id="step-origin" className="bg-gradient-to-br from-saffron/5 via-amber-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-saffron/20">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-saffron text-white flex items-center justify-center flex-shrink-0 shadow-glow">
              <HomeIcon className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-widest text-saffron mb-1">Step 1</div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-900 leading-tight">
                Where are you starting from?
              </h2>
              <p className="text-ink-600 text-sm mt-1">
                We route the entire trip — outbound, in-between, and return — from your home city.
              </p>
            </div>
            {origin && (
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-saffron/30 px-3 py-1.5 rounded-full text-sm font-bold text-ink-900 shadow-soft flex-shrink-0">
                <span>{origin.emoji}</span>
                {origin.name}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {ORIGIN_CITIES.map(o => {
              const sel = options.originCityId === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setOptions({ originCityId: o.id })}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all
                    ${sel
                      ? 'bg-ink-900 text-white shadow-soft'
                      : 'bg-white text-ink-600 border border-ink-100 hover:border-saffron/50'}`}
                >
                  <span>{o.emoji}</span>
                  {o.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — Choose Places */}
        <section id="step-places" className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
          <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
                <span className="text-saffron font-extrabold text-lg">2</span>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-saffron mb-1">Step 2</div>
                <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Choose your destinations</h2>
                <p className="text-ink-400 text-sm mt-1">
                  <span className="font-bold text-ink-900">{selectedPlaces.length}</span> selected · tap any place to toggle
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-900 bg-ink-50 hover:bg-ink-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <MapIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                Browse all
              </Link>
              {selectedPlaces.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-ink-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {selectedPlaces.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 p-4 bg-saffron/5 rounded-2xl border border-saffron/15">
              {selectedPlaces.map(p => (
                <div key={p.id} className="inline-flex items-center gap-2 bg-white border border-saffron/30 px-3 py-1.5 rounded-full text-sm shadow-soft">
                  <span>{p.emoji}</span>
                  <span className="font-bold text-ink-900">{p.name}</span>
                  <button onClick={() => togglePlace(p)} className="text-ink-400 hover:text-rose-500 transition-colors" aria-label={`Remove ${p.name}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Quick add</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[480px] overflow-y-auto pr-1">
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

        {/* Step 3 — Configure */}
        <section id="step-configure" className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
              <span className="text-saffron font-extrabold text-lg">3</span>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-saffron mb-1">Step 3</div>
              <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Configure your trip</h2>
              <p className="text-ink-400 text-sm mt-1">Set duration, group size, and preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-ink-50/40 rounded-2xl p-5 border border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-saffron" strokeWidth={2.5} />
                <label className="text-sm font-bold text-ink-900">Number of Days</label>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-1 border border-ink-100">
                <button onClick={() => setOptions({ numDays: Math.max(1, options.numDays - 1) })} className="w-10 h-10 rounded-lg hover:bg-ink-50 transition-colors font-bold text-xl text-ink-600">−</button>
                <span className="text-2xl font-extrabold text-ink-900">{options.numDays}</span>
                <button onClick={() => setOptions({ numDays: Math.min(30, options.numDays + 1) })} className="w-10 h-10 rounded-lg hover:bg-ink-50 transition-colors font-bold text-xl text-ink-600">+</button>
              </div>
            </div>

            <div className="bg-ink-50/40 rounded-2xl p-5 border border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-saffron" strokeWidth={2.5} />
                <label className="text-sm font-bold text-ink-900">Group Size</label>
              </div>
              <div className="flex items-center justify-between bg-white rounded-xl p-1 border border-ink-100">
                <button onClick={() => setOptions({ groupSize: Math.max(1, options.groupSize - 1) })} className="w-10 h-10 rounded-lg hover:bg-ink-50 transition-colors font-bold text-xl text-ink-600">−</button>
                <span className="text-2xl font-extrabold text-ink-900">{options.groupSize}</span>
                <button onClick={() => setOptions({ groupSize: Math.min(20, options.groupSize + 1) })} className="w-10 h-10 rounded-lg hover:bg-ink-50 transition-colors font-bold text-xl text-ink-600">+</button>
              </div>
            </div>

            <div className="bg-ink-50/40 rounded-2xl p-5 border border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Hotel className="w-4 h-4 text-saffron" strokeWidth={2.5} />
                <label className="text-sm font-bold text-ink-900">Stay Type</label>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {STAY_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => setOptions({ stayType: opt.id })}
                    className={`px-2 py-2.5 rounded-xl text-xs transition-all font-bold
                      ${options.stayType === opt.id ? 'bg-ink-900 text-white shadow-soft' : 'bg-white text-ink-600 border border-ink-100 hover:border-ink-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

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
                    <button key={opt.id} onClick={() => setOptions({ travelMode: opt.id })}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs transition-all font-bold
                        ${sel ? 'bg-ink-900 text-white shadow-soft' : 'bg-white text-ink-600 border border-ink-100 hover:border-ink-200'}`}>
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
            disabled={selectedPlaces.length === 0 || isGenerating}
            className={`mt-6 w-full group inline-flex items-center justify-center gap-3 py-5 rounded-2xl font-extrabold text-lg transition-all
              ${selectedPlaces.length === 0 || isGenerating
                ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-saffron to-orange-500 text-white hover:shadow-glow active:scale-[0.99]'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                Generating your trip plan…
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" strokeWidth={2.5} />
                Generate Trip Plan
                {selectedPlaces.length > 0 && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                )}
              </>
            )}
          </button>

          {selectedPlaces.length === 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
              <span className="text-ink-400">Need inspiration?</span>
              <button
                onClick={loadSample}
                className="inline-flex items-center gap-1.5 bg-ink-900 text-white font-bold px-4 py-2 rounded-xl hover:bg-ink-600 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
                Try sample trip · Patna → Sikkim
              </button>
            </div>
          )}
        </section>

        {/* Loading overlay (also visible inline) */}
        {isGenerating && (
          <div className="bg-white rounded-3xl p-10 border border-ink-100 shadow-soft text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-saffron/10 mb-4">
              <Loader2 className="w-7 h-7 text-saffron animate-spin" strokeWidth={2.2} />
            </div>
            <h3 className="font-display text-xl font-extrabold text-ink-900">Generating your trip plan…</h3>
            <p className="text-ink-400 text-sm mt-1">Routing from {origin?.name ?? 'your city'}, calculating distances and costs.</p>
          </div>
        )}

        {/* Generated itinerary */}
        {generated && itinerary && !isGenerating && (
          <div id="itinerary-result" className="space-y-6 animate-fade-in-up">
            {/* Summary hero */}
            <section className="relative bg-gradient-to-br from-ink-900 via-ink-900 to-ink-600 rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-saffron/30 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
                  <Check className="w-4 h-4" strokeWidth={3} />
                  Trip ready
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                  Your {options.numDays}-day Indian adventure
                </h2>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-100">
                  <span className="inline-flex items-center gap-1.5">
                    <HomeIcon className="w-4 h-4" strokeWidth={2.2} />
                    From {origin?.name ?? '—'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-4 h-4" strokeWidth={2.2} />
                    {options.groupSize} traveller{options.groupSize > 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Hotel className="w-4 h-4" strokeWidth={2.2} />
                    {options.stayType} stay
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {origin && (
                    <>
                      <span className="bg-saffron/20 backdrop-blur-sm border border-saffron/30 px-3.5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap">
                        <HomeIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" strokeWidth={2.5} />
                        {origin.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-ink-200/50 flex-shrink-0" strokeWidth={2.5} />
                    </>
                  )}
                  {itinerary.route.map((place, i) => (
                    <div key={i} className="flex items-center gap-2 flex-shrink-0">
                      {i > 0 && <ArrowRight className="w-4 h-4 text-ink-200/50 flex-shrink-0" strokeWidth={2.5} />}
                      <span className="bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap">
                        <MapPin className="w-3.5 h-3.5 inline mr-1 -mt-0.5" strokeWidth={2.5} />
                        {place}
                      </span>
                    </div>
                  ))}
                  {origin && (
                    <>
                      <ArrowRight className="w-4 h-4 text-ink-200/50 flex-shrink-0" strokeWidth={2.5} />
                      <span className="bg-saffron/20 backdrop-blur-sm border border-saffron/30 px-3.5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap">
                        <HomeIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" strokeWidth={2.5} />
                        {origin.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* 🗺 Route */}
            {itinerary.journey.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center">
                      <Route className="w-5 h-5 text-saffron" strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-saffron">🗺 Route</div>
                      <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Travel route</h2>
                      <p className="text-ink-400 text-sm">From {origin?.emoji} {origin?.name} · round trip</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="bg-ink-50/50 rounded-2xl px-4 py-2.5 border border-ink-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-400">
                        <Route className="w-3 h-3" strokeWidth={2.5} /> Distance
                      </div>
                      <div className="font-extrabold text-ink-900 text-lg leading-tight">
                        {itinerary.totalDistanceKm.toLocaleString()} <span className="text-xs text-ink-400 font-bold">km</span>
                      </div>
                    </div>
                    <div className="bg-ink-50/50 rounded-2xl px-4 py-2.5 border border-ink-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-400">
                        <Clock className="w-3 h-3" strokeWidth={2.5} /> Travel time
                      </div>
                      <div className="font-extrabold text-ink-900 text-lg leading-tight">
                        {Math.floor(itinerary.totalTravelHours)}<span className="text-xs text-ink-400 font-bold">h </span>
                        {Math.round((itinerary.totalTravelHours % 1) * 60)}<span className="text-xs text-ink-400 font-bold">m</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {itinerary.journey.map((leg, i) => {
                    const Icon = leg.mode === 'flight' ? Plane : leg.mode === 'bus' ? Bus : leg.mode === 'cab' ? Car : Train;
                    const modeColor = leg.mode === 'flight'
                      ? 'bg-sky-50 text-sky-700 border-sky-100'
                      : leg.mode === 'bus'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : leg.mode === 'cab'
                          ? 'bg-violet-50 text-violet-700 border-violet-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 ${leg.isReturn ? 'bg-ink-50/50 border-dashed border-ink-200' : 'bg-white border-ink-100'}`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-ink-900 text-white flex items-center justify-center text-xs font-extrabold">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-ink-900 truncate">
                            <span className="truncate">{leg.from}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-saffron flex-shrink-0" strokeWidth={2.5} />
                            <span className="truncate">{leg.to}</span>
                            {leg.isReturn && (
                              <span className="ml-1 text-[10px] uppercase font-bold tracking-widest text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">return</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-ink-400 mt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Route className="w-3 h-3" strokeWidth={2.2} />
                              {leg.distanceKm.toLocaleString()} km
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" strokeWidth={2.2} />
                              {Math.floor(leg.durationHours)}h {Math.round((leg.durationHours % 1) * 60)}m
                            </span>
                          </div>
                        </div>
                        <div className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${modeColor}`}>
                          <Icon className="w-3 h-3" strokeWidth={2.5} />
                          {leg.mode}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-extrabold text-ink-900 text-sm tabular-nums">₹{leg.cost.toLocaleString()}</div>
                          <div className="text-[10px] text-ink-400 font-semibold uppercase tracking-wider">per ticket</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 💰 Cost breakdown */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-saffron" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-saffron">💰 Cost</div>
                    <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Cost breakdown</h2>
                    <p className="text-ink-400 text-sm">All-inclusive · for your group</p>
                  </div>
                </div>
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

              <div className="space-y-3">
                {COST_ITEMS.map(item => {
                  const value = itinerary.totalEstimatedCost[item.key as keyof typeof itinerary.totalEstimatedCost];
                  const total = itinerary.totalEstimatedCost.total || 1;
                  const pct = Math.round((value / total) * 100);
                  const Icon = item.icon;
                  return (
                    <div key={item.key} title={item.help}>
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
                        <div className="h-full bg-gradient-to-r from-saffron to-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <p className="text-xs text-ink-600 leading-relaxed">
                  Estimates are based on <span className="font-bold capitalize">{options.stayType}</span> travel averages
                  (₹{COST_ITEMS[1].label.toLowerCase()} per night × {Math.ceil(options.groupSize / 2)} room
                  {Math.ceil(options.groupSize / 2) > 1 ? 's' : ''}, food per person, train/bus shared by 4, flights per person).
                  Actual costs vary by season, booking timing, and shopping. Use as a planning baseline.
                </p>
              </div>
            </section>

            {/* 📅 Day-by-day */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-saffron" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-saffron">📅 Plan</div>
                  <h2 className="font-display text-2xl font-extrabold text-ink-900 leading-tight">Day-by-day plan</h2>
                  <p className="text-ink-400 text-sm">{itinerary.days.length} days · {itinerary.route.length} destinations</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-saffron via-saffron/30 to-transparent" />
                <div className="space-y-6">
                  {itinerary.days.map(day => {
                    const TravelIcon = day.places[0]?.travelOptions?.[0]
                      ? TRAVEL_ICONS_LR[day.places[0].travelOptions[0].mode] ?? Train
                      : Train;
                    return (
                      <div key={day.day} className="relative flex gap-5">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-saffron to-orange-500 text-white flex flex-col items-center justify-center font-extrabold text-xs leading-none shadow-glow">
                            <span className="text-[9px] uppercase tracking-wider opacity-80">Day</span>
                            <span className="text-base">{day.day}</span>
                          </div>
                        </div>
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
                                    <p className="font-bold text-ink-900 text-sm group-hover:text-saffron transition-colors leading-tight truncate">{p.name}</p>
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
                      <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 text-xs font-extrabold">{i + 1}</div>
                      <span className="text-ink-900 text-sm leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
              <button onClick={handleReset} className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-ink-100 bg-white text-ink-900 font-bold hover:border-ink-200 transition-colors">
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                Modify
              </button>
              <button onClick={handleDownload} className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-ink-100 bg-white text-ink-900 font-bold hover:border-saffron/40 transition-colors">
                <Download className="w-4 h-4" strokeWidth={2.5} />
                Download
              </button>
              <button onClick={handleShare} className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-ink-100 bg-white text-ink-900 font-bold hover:border-saffron/40 transition-colors">
                <Share2 className="w-4 h-4" strokeWidth={2.5} />
                Share
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-ink-900 text-white font-bold hover:bg-ink-600 transition-colors shadow-soft">
                <Printer className="w-4 h-4" strokeWidth={2.5} />
                Print
              </button>
              {shareMsg && (
                <div className="absolute -top-12 left-0 right-0 mx-auto bg-ink-900 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-soft text-center max-w-xs">
                  {shareMsg}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty / no-selection state */}
        {selectedPlaces.length === 0 && !generated && !isGenerating && (
          <div className="text-center py-12 bg-white rounded-3xl border border-ink-100 shadow-soft">
            <div className="w-16 h-16 mx-auto bg-saffron/10 rounded-2xl flex items-center justify-center mb-4">
              <MapIcon className="w-7 h-7 text-saffron" strokeWidth={2.2} />
            </div>
            <h3 className="font-display text-xl font-extrabold text-ink-900 mb-1.5">Select your city and destinations to generate a trip</h3>
            <p className="text-ink-400 mb-6 text-sm">Browse {PLACES.length}+ places, or load a sample trip to see what's possible.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link to="/explore" className="inline-flex items-center gap-1.5 bg-saffron text-white font-bold px-7 py-3 rounded-2xl hover:bg-orange-600 transition-colors shadow-glow">
                Browse destinations
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <button onClick={loadSample} className="inline-flex items-center gap-1.5 bg-white border-2 border-ink-100 text-ink-900 font-bold px-7 py-3 rounded-2xl hover:border-saffron/40 transition-colors">
                <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                Try sample trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
