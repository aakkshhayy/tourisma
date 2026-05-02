import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STATES, getPlacesByState, PLACES } from '../data/places';
import PlaceCard from '../components/PlaceCard';
import { useItineraryStore } from '../store/itineraryStore';
import { Link } from 'react-router-dom';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'heritage', label: '🏛️ Heritage' },
  { id: 'nature', label: '🌿 Nature' },
  { id: 'religious', label: '🙏 Pilgrimage' },
  { id: 'beach', label: '🏖️ Beach' },
  { id: 'hill_station', label: '🏔️ Hill Station' },
  { id: 'wildlife', label: '🐯 Wildlife' },
  { id: 'cultural', label: '🎭 Cultural' },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeState, setActiveState] = useState<string>(searchParams.get('state') ?? 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const selectedCount = useItineraryStore(s => s.selectedPlaces.length);

  useEffect(() => {
    const s = searchParams.get('state');
    if (s) setActiveState(s);
  }, [searchParams]);

  const handleStateChange = (id: string) => {
    setActiveState(id);
    if (id === 'all') {
      searchParams.delete('state');
    } else {
      searchParams.set('state', id);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const basePlaces = activeState === 'all' ? PLACES : getPlacesByState(activeState);
  const filtered = basePlaces.filter(p => {
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeStateInfo = STATES.find(s => s.id === activeState);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black mb-2">
            {activeStateInfo ? `${activeStateInfo.emoji} ${activeStateInfo.name}` : '🗺️ Explore India'}
          </h1>
          <p className="text-orange-100 text-lg">
            {activeStateInfo ? activeStateInfo.description : 'Browse destinations across 5 incredible Indian states'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* State tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button
            onClick={() => handleStateChange('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeState === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
          >
            🇮🇳 All States
          </button>
          {STATES.map(s => (
            <button
              key={s.id}
              onClick={() => handleStateChange(s.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${activeState === s.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>

        {/* Search + category filter row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search places..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORY_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors
                  ${categoryFilter === f.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count + itinerary CTA */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            <span className="font-semibold text-gray-900">{filtered.length}</span> destinations found
          </p>
          {selectedCount > 0 && (
            <Link
              to="/itinerary"
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
            >
              <span>Build Itinerary</span>
              <span className="bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                {selectedCount}
              </span>
            </Link>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium">No places match your filters</p>
            <button onClick={() => { setSearch(''); setCategoryFilter('all'); }} className="mt-4 text-orange-500 underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
