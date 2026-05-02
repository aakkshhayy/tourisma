import { Link } from 'react-router-dom';
import { STATES, PLACES } from '../data/places';

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
};

const HOW_IT_WORKS = [
  { step: '01', icon: '🗺️', title: 'Browse Destinations', desc: `Explore tourist places across ${STATES.length} Indian states with detailed info on each location.` },
  { step: '02', icon: '📍', title: 'Select Places', desc: 'Pick the places you want to visit. Mix and match across states freely.' },
  { step: '03', icon: '🗓️', title: 'Build Itinerary', desc: 'We generate a smart, geographically optimized day-by-day travel plan for you.' },
  { step: '04', icon: '💰', title: 'Estimate Costs', desc: 'Get a realistic breakdown of travel, stay, food, and entry costs for your trip.' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🇮🇳 {STATES.length} States · {PLACES.length}+ Destinations · Infinite Memories
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
            Explore India,<br />
            <span className="text-yellow-200">Your Way</span>
          </h1>
          <p className="text-xl sm:text-2xl text-orange-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plan the perfect Indian trip with smart itineraries, realistic cost estimates, and curated recommendations across {STATES.length} states — from the Himalayas to Kerala's backwaters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/explore"
              className="inline-block bg-white text-orange-600 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors shadow-lg"
            >
              Start Exploring →
            </Link>
            <Link
              to="/itinerary"
              className="inline-block bg-white/20 backdrop-blur-sm text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors border border-white/30"
            >
              Build Itinerary
            </Link>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" fill="#FFF8F0" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { label: 'States Covered', value: `${STATES.length}` },
            { label: 'Destinations', value: `${PLACES.length}+` },
            { label: 'Categories', value: '7' },
            { label: 'Free to Use', value: '100%' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black text-orange-500">{s.value}</div>
              <div className="text-sm text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore States */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3">Discover by State</h2>
          <p className="text-gray-500 text-lg">{STATES.length} incredible states, each with its own unique flavour</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STATES.map(state => (
            <Link
              key={state.id}
              to={`/explore?state=${state.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className={`bg-gradient-to-br ${GRADIENT_CLASSES[state.coverGradient] ?? 'from-gray-500 to-gray-700'} p-8 text-white h-48 flex flex-col justify-between`}>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{state.emoji}</div>
                <div>
                  <h3 className="text-2xl font-black">{state.name}</h3>
                  <p className="text-white/80 text-sm">{PLACES.filter(p => p.state === state.id).length} destinations</p>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="bg-white p-4">
                <p className="text-gray-600 text-sm line-clamp-2">{state.description}</p>
                <span className="mt-3 inline-flex items-center text-orange-600 font-semibold text-sm">
                  Explore {state.name} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">How Tourisma Works</h2>
            <p className="text-gray-500 text-lg">Plan your dream India trip in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl text-3xl mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-orange-400 mb-1">STEP {item.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/explore"
              className="inline-block bg-orange-500 text-white font-bold text-lg px-10 py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg"
            >
              Start Planning Your Trip →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <div className="text-2xl mb-2">🗺️ <span className="text-white font-bold">Tourisma</span></div>
        <p className="text-sm">India Travel Planning · MVP · Made with ❤️ for explorers</p>
        <p className="text-xs mt-2">Cost estimates are approximate and for planning purposes only.</p>
      </footer>
    </div>
  );
}
