import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { STATES, PLACES, getPlaceById } from '../data/places';
import { ORIGIN_CITIES } from '../data/origins';
import { useItineraryStore } from '../store/itineraryStore';
import {
  ArrowRight, MapPin, Sparkles, Wallet, Compass, Star,
  Home as HomeIcon, Wand2, Train, Hotel, Utensils,
  ChevronDown, Check, Plane, ChevronRight,
} from 'lucide-react';

const GRADIENT_CLASSES: Record<string, string> = {
  'from-orange-500 to-red-600': 'from-orange-500 to-red-600',
  'from-blue-500 to-cyan-600': 'from-blue-500 to-cyan-600',
  'from-yellow-500 to-orange-500': 'from-yellow-500 to-orange-500',
  'from-green-600 to-teal-600': 'from-green-600 to-teal-600',
  'from-purple-600 to-indigo-600': 'from-purple-600 to-indigo-600',
  'from-rose-500 to-pink-600': 'from-rose-500 to-pink-600',
  'from-red-600 to-yellow-500': 'from-red-600 to-yellow-500',
  'from-amber-500 to-red-500': 'from-amber-500 to-red-500',
  'from-green-500 to-emerald-600': 'from-green-500 to-emerald-600',
  'from-sky-500 to-blue-700': 'from-sky-500 to-blue-700',
  'from-yellow-400 to-orange-500': 'from-yellow-400 to-orange-500',
  'from-lime-500 to-green-600': 'from-lime-500 to-green-600',
  'from-cyan-400 to-blue-500': 'from-cyan-400 to-blue-500',
  'from-green-700 to-teal-700': 'from-green-700 to-teal-700',
  'from-emerald-500 to-green-700': 'from-emerald-500 to-green-700',
  'from-orange-600 to-red-700': 'from-orange-600 to-red-700',
  'from-violet-500 to-purple-700': 'from-violet-500 to-purple-700',
  'from-slate-500 to-blue-600': 'from-slate-500 to-blue-600',
  'from-blue-600 to-indigo-700': 'from-blue-600 to-indigo-700',
};

const HOW_IT_WORKS = [
  { step: '01', icon: HomeIcon, title: 'Pick Your City', desc: 'Choose your starting city — we route the trip from your home base.' },
  { step: '02', icon: MapPin, title: 'Select Places', desc: 'Pick destinations from 19 states. Mix and match freely.' },
  { step: '03', icon: Sparkles, title: 'Build Itinerary', desc: 'We generate a smart, geographically optimised day-by-day plan in seconds.' },
  { step: '04', icon: Wallet, title: 'See Costs', desc: 'Realistic breakdown — travel, stay, food, entry — all transparent.' },
];

// Quick-pick example trips — appear as chips below the search form
const QUICK_TRIPS = [
  { fromId: 'patna',  fromEmoji: '🛕', toState: 'sikkim',     toEmoji: '🏔️', days: 5 },
  { fromId: 'mumbai', fromEmoji: '🌆', toState: 'kerala',     toEmoji: '🌴', days: 7 },
  { fromId: 'delhi',  fromEmoji: '🏛️', toState: 'goa',        toEmoji: '🏖️', days: 5 },
  { fromId: 'kolkata',fromEmoji: '🎨', toState: 'tamil_nadu', toEmoji: '🛕', days: 6 },
];

// Pick the top 2-3 most "marquee" places of a state (highest recommendedDays)
function topPlacesOfState(stateId: string, n: number = 2): string[] {
  return PLACES
    .filter(p => p.state === stateId)
    .sort((a, b) => b.recommendedDays - a.recommendedDays)
    .slice(0, n)
    .map(p => p.id);
}

export default function Home() {
  const navigate = useNavigate();
  const { setOptions, addPlace, clearSelection, options } = useItineraryStore();
  const [originId, setOriginId] = useState(options.originCityId || 'delhi');
  const [destStateId, setDestStateId] = useState<string>('sikkim');
  const [days, setDays] = useState(options.numDays || 5);
  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  const selectedOrigin = ORIGIN_CITIES.find(o => o.id === originId);
  const selectedDest = STATES.find(s => s.id === destStateId);

  // Generate handler — pre-fill 2 marquee places of destination state, navigate with auto-trigger
  const generate = (oId = originId, dId = destStateId, d = days) => {
    clearSelection();
    setOptions({ originCityId: oId, numDays: d });
    topPlacesOfState(dId, 2).forEach(pid => {
      const p = getPlaceById(pid);
      if (p) addPlace(p);
    });
    navigate('/itinerary#auto');
  };

  const loadQuick = (q: typeof QUICK_TRIPS[number]) => {
    setOriginId(q.fromId);
    setDestStateId(q.toState);
    setDays(q.days);
    generate(q.fromId, q.toState, q.days);
  };

  return (
    <div className="min-h-screen">
      {/* HERO — full-screen, dominant */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sand via-orange-50/40 to-amber-50 min-h-[calc(100vh-4rem)] flex items-center py-12 sm:py-20">
        {/* Decorative blurs */}
        <div className="absolute -top-32 -right-20 w-[600px] h-[600px] bg-saffron/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-rose-200/15 rounded-full blur-3xl pointer-events-none" />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1A1815 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Headline — single focal point */}
          <h1 className="font-display font-extrabold text-ink-900 text-5xl sm:text-7xl lg:text-[7.5rem] leading-[0.92] tracking-tight">
            Plan your trip
            <br />
            from <span className="bg-gradient-to-r from-saffron via-orange-500 to-amber-500 bg-clip-text text-transparent">your city.</span>
          </h1>

          {/* SEARCH FORM — large, centered, single action */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-ink-100 shadow-card p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-stretch">
                {/* FROM */}
                <div className="relative">
                  <button
                    onClick={() => { setOriginOpen(o => !o); setDestOpen(false); }}
                    className="w-full h-full flex items-center gap-4 bg-ink-50/60 hover:bg-ink-50 rounded-2xl px-5 py-5 sm:py-6 text-left transition-colors"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-saffron/15 flex items-center justify-center flex-shrink-0">
                      <HomeIcon className="w-6 h-6 text-saffron" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">From</div>
                      <div className="font-extrabold text-ink-900 text-xl sm:text-2xl leading-tight truncate">
                        {selectedOrigin?.emoji} {selectedOrigin?.name ?? 'Select city'}
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-ink-400 flex-shrink-0 transition-transform ${originOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                  </button>
                  {originOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl border border-ink-100 shadow-card p-2 max-h-80 overflow-y-auto text-left">
                      {ORIGIN_CITIES.map(o => {
                        const sel = originId === o.id;
                        return (
                          <button
                            key={o.id}
                            onClick={() => { setOriginId(o.id); setOriginOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors text-left
                              ${sel ? 'bg-saffron/10 text-saffron' : 'text-ink-900 hover:bg-ink-50'}`}
                          >
                            <span>{o.emoji}</span>
                            <span className="flex-1">{o.name}</span>
                            {sel && <Check className="w-4 h-4" strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* arrow connector */}
                <div className="hidden sm:flex items-center justify-center text-ink-200">
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </div>

                {/* TO */}
                <div className="relative">
                  <button
                    onClick={() => { setDestOpen(o => !o); setOriginOpen(false); }}
                    className="w-full h-full flex items-center gap-4 bg-ink-50/60 hover:bg-ink-50 rounded-2xl px-5 py-5 sm:py-6 text-left transition-colors"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-emerald-700" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">To</div>
                      <div className="font-extrabold text-ink-900 text-xl sm:text-2xl leading-tight truncate">
                        {selectedDest?.emoji} {selectedDest?.name ?? 'Anywhere'}
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-ink-400 flex-shrink-0 transition-transform ${destOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                  </button>
                  {destOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl border border-ink-100 shadow-card p-2 max-h-80 overflow-y-auto text-left">
                      {STATES.map(s => {
                        const sel = destStateId === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => { setDestStateId(s.id); setDestOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors text-left
                              ${sel ? 'bg-saffron/10 text-saffron' : 'text-ink-900 hover:bg-ink-50'}`}
                          >
                            <span>{s.emoji}</span>
                            <span className="flex-1">{s.name}</span>
                            {sel && <Check className="w-4 h-4" strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* DAYS — small inline */}
                <div className="bg-ink-50/60 rounded-2xl px-3 sm:px-4 py-3 sm:py-0 sm:flex sm:items-center sm:gap-3">
                  <div className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">Days</div>
                  <div className="flex items-center justify-between sm:gap-2">
                    <button onClick={() => setDays(d => Math.max(1, d - 1))} className="w-9 h-9 rounded-xl hover:bg-white text-ink-600 font-bold text-xl transition-colors">−</button>
                    <span className="font-extrabold text-ink-900 text-2xl tabular-nums w-7 text-center">{days}</span>
                    <button onClick={() => setDays(d => Math.min(30, d + 1))} className="w-9 h-9 rounded-xl hover:bg-white text-ink-600 font-bold text-xl transition-colors">+</button>
                  </div>
                </div>
              </div>

              {/* CTA — full-width below the inputs */}
              <button
                onClick={() => generate()}
                className="group mt-3 w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-saffron via-orange-500 to-amber-500 text-white font-extrabold px-8 py-5 sm:py-6 rounded-2xl hover:shadow-glow active:scale-[0.99] transition-all text-lg sm:text-xl"
              >
                <Wand2 className="w-5 h-5" strokeWidth={2.5} />
                Generate Trip Plan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
            </div>

            {/* Quick examples — subtle, single line */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-ink-400 uppercase tracking-widest">Try:</span>
              {QUICK_TRIPS.map(q => {
                const fromCity = ORIGIN_CITIES.find(o => o.id === q.fromId);
                const toState = STATES.find(s => s.id === q.toState);
                return (
                  <button
                    key={`${q.fromId}-${q.toState}`}
                    onClick={() => loadQuick(q)}
                    className="group inline-flex items-center gap-1.5 bg-white/70 hover:bg-white border border-ink-100 hover:border-saffron/40 px-3 py-1.5 rounded-full transition-all text-sm font-bold text-ink-700"
                  >
                    {q.fromEmoji} {fromCity?.name}
                    <ChevronRight className="w-3 h-3 text-saffron" strokeWidth={2.5} />
                    {q.toEmoji} {toState?.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Compass, title: 'Route mapped', desc: 'City → places → return, with distance & time per leg' },
              { icon: Plane, title: 'Smart transport', desc: 'Auto-picks train, bus or flight per leg distance' },
              { icon: Hotel, title: 'Stay & food costs', desc: 'Budget, mid-range, or luxury — all priced realistically' },
              { icon: Utensils, title: 'Day-by-day', desc: 'Each day has activities, travel notes, and entry tips' },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-sand rounded-2xl p-5 border border-ink-100">
                  <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-saffron" strokeWidth={2.2} />
                  </div>
                  <h3 className="font-extrabold text-ink-900 text-sm leading-tight">{f.title}</h3>
                  <p className="text-ink-400 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Discover by state */}
      <section className="bg-sand py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
                <Compass className="w-4 h-4" strokeWidth={2.5} />
                Browse by state
              </div>
              <h2 className="font-display font-extrabold text-ink-900 text-4xl sm:text-5xl">
                {STATES.length} incredible regions
              </h2>
            </div>
            <Link to="/explore" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-ink-900 hover:text-saffron transition-colors">
              See all destinations
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STATES.map(state => {
              const placeCount = PLACES.filter(p => p.state === state.id).length;
              return (
                <Link
                  key={state.id}
                  to={`/explore?state=${state.id}`}
                  className="group relative overflow-hidden rounded-3xl bg-white border border-ink-100 hover:border-transparent hover:shadow-card transition-all duration-300"
                >
                  <div className={`relative bg-gradient-to-br ${GRADIENT_CLASSES[state.coverGradient] ?? 'from-gray-500 to-gray-700'} h-44 p-6 text-white flex flex-col justify-between overflow-hidden`}>
                    <div className="absolute -bottom-10 -right-6 text-[120px] opacity-20 leading-none">{state.emoji}</div>
                    <div className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform duration-500 z-10">{state.emoji}</div>
                    <div className="z-10">
                      <h3 className="text-2xl font-extrabold leading-tight">{state.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-white/85">
                        <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {placeCount} destinations
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-ink-600 text-sm line-clamp-2 leading-relaxed">{state.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-saffron font-bold text-sm">
                      Explore {state.name}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              How it works
            </div>
            <h2 className="font-display font-extrabold text-ink-900 text-4xl sm:text-5xl">
              From your city to your trip in 4 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-sand rounded-3xl p-6 border border-ink-100 hover:border-saffron/30 hover:shadow-soft transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-saffron/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-saffron" strokeWidth={2.2} />
                    </div>
                    <span className="text-3xl font-extrabold text-ink-100">{item.step}</span>
                  </div>
                  <h3 className="font-extrabold text-ink-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-ink-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/itinerary"
              className="group inline-flex items-center gap-2 bg-ink-900 text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-ink-600 transition-all shadow-soft"
            >
              Start planning your trip
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-900 text-ink-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron to-amber-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white">Tourisma</div>
                <div className="text-[10px] uppercase tracking-widest text-ink-200 font-semibold">India travel planning</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-ink-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Made with care for explorers · Cost estimates are approximate.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
