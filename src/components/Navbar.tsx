import { Link, useLocation } from 'react-router-dom';
import { useItineraryStore } from '../store/itineraryStore';
import { Compass, Map, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const selectedCount = useItineraryStore(s => s.selectedPlaces.length);

  const links = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/explore', label: 'Explore', icon: Map },
    { to: '/itinerary', label: 'Itinerary', icon: Sparkles },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron to-amber-500 flex items-center justify-center shadow-glow">
              <Compass className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold text-ink-900 tracking-tight">Tourisma</span>
              <span className="text-[10px] uppercase tracking-widest text-ink-400 font-semibold">Plan India</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {links.map(link => {
              const Icon = link.icon;
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-ink-900 text-white shadow-soft'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.2} />
                  <span className="hidden sm:inline">{link.label}</span>
                  {link.to === '/itinerary' && selectedCount > 0 && (
                    <span className="ml-0.5 bg-saffron text-white text-[10px] rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold">
                      {selectedCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
