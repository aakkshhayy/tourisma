import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STATES, getPlacesByState, PLACES } from '../data/places';
import PlaceCard from '../components/PlaceCard';
import { useItineraryStore } from '../store/itineraryStore';
import { Link } from 'react-router-dom';
import { Search, Sparkles, X, MapPin } from 'lucide-react';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'nature', label: 'Nature' },
  { id: 'religious', label: 'Pilgrimage' },
  { id: 'beach', label: 'Beach' },
  { id: 'hill_station', label: 'Hill Station' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'cultural', label: 'Cultural' },
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
    const q = search.toLowerCase().trim();
    const stateName = STATES.find(s => s.id === p.state)?.name?.toLowerCase() ?? '';
    const matchSearch = !q
      || p.name.toLowerCase().includes(q)
      || p.tagline.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || stateName.includes(q)
      || p.state.replace(/_/g, ' ').includes(q);
    return matchCat && matchSearch;
  });

  const activeStateInfo = STATES.find(s => s.id === activeState);

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-white border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
            <MapPin className="w-4 h-4" strokeWidth={2.5} />
            {activeStateInfo ? activeStateInfo.name : `${PLACES.length}+ destinations`}
          </div>
          <h1 className="font-display font-extrabold text-ink-900 text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            {activeStateInfo ? `${activeStateInfo.emoji} ${activeStateInfo.name}` : 'Explore India'}
          </h1>
          <p className="text-ink-600 text-lg mt-3 max-w-2xl">
            {activeStateInfo
              ? activeStateInfo.description
              : `Browse ${PLACES.length}+ destinations across ${STATES.length} incredible Indian states.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* State tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button
            onClick={() => handleStateChange('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all
              ${activeState === 'all'
                ? 'bg-ink-900 text-white shadow-soft'
                : 'bg-white text-ink-600 border border-ink-100 hover:border-ink-200'}`}
          >
            All States
          </button>
          {STATES.map(s => (
            <button
              key={s.id}
              onClick={() => handleStateChange(s.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all
                ${activeState === s.id
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'bg-white text-ink-600 border border-ink-100 hover:border-ink-200'}`}
            >
              <span>{s.emoji}</span>
              {s.name}
            </button>
          ))}
        </div>

        {/* Search + categories */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Search places…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-ink-100 bg-white text-sm font-medium focus:outline-none focus:border-saffron focus:ring-4 focus:ring-saffron/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all
                  ${categoryFilter === f.id
                    ? 'bg-saffron text-white shadow-glow'
                    : 'bg-white text-ink-600 border border-ink-100 hover:border-saffron/30'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count + itinerary CTA */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-ink-600 text-sm">
            <span className="font-extrabold text-ink-900 text-base">{filtered.length}</span>{' '}
            <span className="text-ink-400">destinations found</span>
          </p>
          {selectedCount > 0 && (
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-2 bg-ink-900 text-white px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-ink-600 transition-all shadow-soft"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              <span>Build Itinerary</span>
              <span className="bg-saffron text-white rounded-full min-w-[22px] h-5 px-1.5 flex items-center justify-center text-[10px] font-extrabold">
                {selectedCount}
              </span>
            </Link>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-ink-100">
            <div className="w-16 h-16 mx-auto bg-ink-50 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-ink-400" />
            </div>
            <p className="text-lg font-extrabold text-ink-900">No places match your filters</p>
            <p className="text-ink-400 text-sm mt-1">Try clearing search or category filter.</p>
            <button
              onClick={() => { setSearch(''); setCategoryFilter('all'); }}
              className="mt-5 inline-flex items-center gap-1.5 bg-saffron text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
