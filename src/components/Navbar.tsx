import { Link, useLocation } from 'react-router-dom';
import { useItineraryStore } from '../store/itineraryStore';

export default function Navbar() {
  const location = useLocation();
  const selectedCount = useItineraryStore(s => s.selectedPlaces.length);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/itinerary', label: 'Itinerary Builder' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <span className="text-xl font-bold text-orange-600 tracking-tight">Tourisma</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-4">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                {link.label}
                {link.to === '/itinerary' && selectedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {selectedCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
