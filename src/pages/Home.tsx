import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { STATES, PLACES, getPlaceById } from '../data/places';
import { ORIGIN_CITIES } from '../data/origins';
import { useItineraryStore } from '../store/itineraryStore';
import {
  ArrowRight, Map, MapPin, Sparkles, Wallet, Compass, Star,
  Home as HomeIcon, Calendar, Wand2, Train, Hotel, Utensils,
  ChevronDown, Check,
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

const SAMPLE = {
  originId: 'patna',
  originName: 'Patna',
  originEmoji: '🛕',
  destName: 'Sikkim',
  destEmoji: '🏔️',
  cost: 12000,
  days: 5,
  placeIds: ['sk_gangtok', 'sk_lachung'],
};

export default function Home() {
  const navigate = useNavigate();
  const { setOptions, addPlace, clearSelection, options } = useItineraryStore();
  const [originId, setOriginId] = useState(options.originCityId || 'delhi');
  const [days, setDays] = useState(options.numDays || 5);
  const [originOpen, setOriginOpen] = useState(false);

  const selectedOrigin = ORIGIN_CITIES.find(o => o.id === originId);

  const goPlan = () => {
    setOptions({ originCityId: originId, numDays: days });
    navigate('/explore');
  };

  const loadSample = () => {
    clearSelection();
    setOptions({ originCityId: SAMPLE.originId, numDays: SAMPLE.days });
    SAMPLE.placeIds.forEach(id => {
      const p = getPlaceById(id);
      if (p) addPlace(p);
    });
    navigate('/itinerary#auto');
  };

  return (
    <div className="min-h-screen">
      {/* HERO — Plan from my city */}
      <section className="relative overflow-hidden bg-sand pt-10 sm:pt-14 pb-20">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-saffron/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white border border-ink-100 px-3 py-1.5 rounded-full text-xs font-semibold text-ink-600 mb-5 shadow-soft">
              <Sparkles className="w-3.5 h-3.5 text-saffron" strokeWidth={2.5} />
              <span>Smart itineraries · {STATES.length} states · {PLACES.length}+ places</span>
            </div>

            <h1 className="font-display font-extrabold text-ink-900 text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight max-w-4xl mx-auto">
              Plan your trip from your city
              <br />
              <span className="bg-gradient-to-r from-saffron via-orange-500 to-amber-500 bg-clip-text text-transparent">
                in seconds.
              </span>
            </h1>

            <p className="mt-5 text-ink-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Pick your home city, choose destinations, and we build the route, day-by-day plan, and a real cost estimate.
            </p>
          </div>

          {/* Plan card */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-ink-100 shadow-card p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_auto] gap-2 sm:gap-3 items-stretch">
              {/* From city */}
              <div className="relative">
                <button
                  onClick={() => setOriginOpen(o => !o)}
                  className="w-full flex items-center gap-3 bg-ink-50/60 hover:bg-ink-50 rounded-2xl px-4 py-3.5 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-saffron/15 flex items-center justify-center flex-shrink-0">
                    <HomeIcon className="w-5 h-5 text-saffron" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">From</div>
                    <div className="font-extrabold text-ink-900 text-base leading-tight truncate">
                      {selectedOrigin?.emoji} {selectedOrigin?.name ?? 'Select'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-ink-400 flex-shrink-0 transition-transform ${originOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                </button>

                {originOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-2xl border border-ink-100 shadow-card p-2 max-h-72 overflow-y-auto">
                    {ORIGIN_CITIES.map(o => {
                      const sel = originId === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() => { setOriginId(o.id); setOriginOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors text-left
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

              {/* Days */}
              <div className="bg-ink-50/60 rounded-2xl px-4 py-3.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Days</div>
                <div className="flex items-center justify-between mt-0.5">
                  <button onClick={() => setDays(d => Math.max(1, d - 1))} className="w-8 h-8 -m-1.5 rounded-lg hover:bg-white text-ink-600 font-bold text-lg">−</button>
                  <span className="font-extrabold text-ink-900 text-xl">{days}</span>
                  <button onClick={() => setDays(d => Math.min(30, d + 1))} className="w-8 h-8 -m-1.5 rounded-lg hover:bg-white text-ink-600 font-bold text-lg">+</button>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={goPlan}
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-saffron to-orange-500 text-white font-extrabold px-6 py-4 rounded-2xl hover:shadow-glow active:scale-[0.99] transition-all whitespace-nowrap"
              >
                <Wand2 className="w-4 h-4" strokeWidth={2.5} />
                Generate Trip Plan
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
            </div>

            {/* Sample example pill */}
            <button
              onClick={loadSample}
              className="mt-3 w-full flex items-center justify-between gap-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-2xl px-4 py-3 transition-colors group"
            >
              <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-200/60 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-800" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800">Try this example</div>
                  <div className="font-bold text-ink-900 text-sm truncate">
                    {SAMPLE.originEmoji} {SAMPLE.originName} → {SAMPLE.destEmoji} {SAMPLE.destName} · {SAMPLE.days} days · ≈ ₹{SAMPLE.cost.toLocaleString()}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-800 group-hover:translate-x-1 transition-transform flex-shrink-0" strokeWidth={2.5} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
            {[
              { value: STATES.length, label: 'States' },
              { value: `${PLACES.length}+`, label: 'Destinations' },
              { value: '7', label: 'Categories' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl px-4 py-3 border border-ink-100 text-center">
                <div className="text-2xl font-extrabold text-ink-900">{s.value}</div>
                <div className="text-xs text-ink-400 font-semibold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Compass, title: 'Route mapped', desc: 'City → places → return, with distance & time per leg' },
              { icon: Train, title: 'Smart transport', desc: 'Auto-picks train, bus or flight per leg distance' },
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
