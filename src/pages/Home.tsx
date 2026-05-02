import { Link } from 'react-router-dom';
import { STATES, PLACES } from '../data/places';
import { ArrowRight, Map, MapPin, Sparkles, Wallet, Compass, Star } from 'lucide-react';

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
  { step: '01', icon: Map, title: 'Browse Destinations', desc: `Explore ${PLACES.length}+ tourist places across ${STATES.length} Indian states with rich detail on each.` },
  { step: '02', icon: MapPin, title: 'Select Places', desc: 'Pick everywhere you want to visit. Mix and match across states freely.' },
  { step: '03', icon: Sparkles, title: 'Build Itinerary', desc: 'We generate a smart, geographically optimised day-by-day plan in seconds.' },
  { step: '04', icon: Wallet, title: 'Estimate Costs', desc: 'Realistic breakdown of travel, stay, food, and entry costs for your trip.' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-sand pt-12 sm:pt-16 lg:pt-20 pb-24">
        {/* Decorative blurs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-saffron/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white border border-ink-100 px-3 py-1.5 rounded-full text-xs font-semibold text-ink-600 mb-6 shadow-soft">
                <Sparkles className="w-3.5 h-3.5 text-saffron" strokeWidth={2.5} />
                <span>Smart itineraries · {STATES.length} states · {PLACES.length}+ places</span>
              </div>

              <h1 className="font-display font-extrabold text-ink-900 text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                Plan your perfect
                <br />
                <span className="bg-gradient-to-r from-saffron via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Indian journey.
                </span>
              </h1>

              <p className="mt-6 text-ink-600 text-lg sm:text-xl max-w-xl leading-relaxed">
                Mix destinations across states. Get a smart day-by-day route, realistic cost breakdown, and curated recommendations — built for the modern traveller.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/explore"
                  className="group inline-flex items-center justify-center gap-2 bg-ink-900 text-white font-bold px-7 py-4 rounded-2xl hover:bg-ink-600 transition-all shadow-soft"
                >
                  Start exploring
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </Link>
                <Link
                  to="/itinerary"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-ink-200 text-ink-900 font-bold px-7 py-4 rounded-2xl hover:border-saffron hover:text-saffron transition-all"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                  Build itinerary
                </Link>
              </div>

              {/* Stat strip */}
              <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
                {[
                  { value: STATES.length, label: 'States' },
                  { value: `${PLACES.length}+`, label: 'Destinations' },
                  { value: '7', label: 'Categories' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl px-4 py-3 border border-ink-100">
                    <div className="text-2xl font-extrabold text-ink-900">{s.value}</div>
                    <div className="text-xs text-ink-400 font-semibold uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero collage */}
            <div className="lg:col-span-5 relative">
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {STATES.slice(0, 4).map((s, i) => (
                  <Link
                    key={s.id}
                    to={`/explore?state=${s.id}`}
                    className={`relative rounded-3xl bg-gradient-to-br ${GRADIENT_CLASSES[s.coverGradient] ?? 'from-gray-500 to-gray-700'} aspect-[4/5] p-5 text-white overflow-hidden group hover:scale-[1.02] transition-transform shadow-card
                      ${i % 2 === 0 ? 'translate-y-4' : ''}`}
                  >
                    <div className="text-4xl mb-2">{s.emoji}</div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">India</div>
                      <div className="text-lg font-extrabold leading-tight">{s.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-2 hidden sm:flex">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-ink-900">100% Free</div>
                  <div className="text-[10px] text-ink-400 uppercase font-semibold tracking-wider">No signup</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover by state */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
                <Compass className="w-4 h-4" strokeWidth={2.5} />
                Browse by state
              </div>
              <h2 className="font-display font-extrabold text-ink-900 text-4xl sm:text-5xl">
                Discover {STATES.length} incredible regions
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
      <section className="bg-sand py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              How it works
            </div>
            <h2 className="font-display font-extrabold text-ink-900 text-4xl sm:text-5xl">
              Your trip, planned in 4 steps
            </h2>
            <p className="mt-4 text-ink-600 text-lg">
              From browsing to a complete cost-broken-down day-by-day plan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-white rounded-3xl p-6 border border-ink-100 hover:border-saffron/30 hover:shadow-soft transition-all">
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
              to="/explore"
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
            <p className="text-sm text-ink-200">Made with ❤️ for explorers · Cost estimates are approximate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
