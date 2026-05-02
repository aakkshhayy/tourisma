import { Link } from 'react-router-dom';
import { TouristPlace } from '../types';
import { useItineraryStore } from '../store/itineraryStore';
import { getStateById } from '../data/places';
import { Clock, MapPin, Check, Plus, ArrowUpRight, Calendar } from 'lucide-react';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  heritage: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Heritage' },
  nature: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Nature' },
  religious: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Pilgrimage' },
  beach: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Beach' },
  hill_station: { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'Hill Station' },
  wildlife: { bg: 'bg-green-50', text: 'text-green-700', label: 'Wildlife' },
  cultural: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Cultural' },
};

const GRADIENTS_BY_CATEGORY: Record<string, string> = {
  heritage: 'from-amber-100 via-orange-50 to-rose-50',
  nature: 'from-emerald-100 via-teal-50 to-sky-50',
  religious: 'from-violet-100 via-purple-50 to-pink-50',
  beach: 'from-sky-100 via-cyan-50 to-blue-50',
  hill_station: 'from-cyan-100 via-blue-50 to-indigo-50',
  wildlife: 'from-green-100 via-emerald-50 to-lime-50',
  cultural: 'from-rose-100 via-pink-50 to-amber-50',
};

interface Props {
  place: TouristPlace;
  showSelect?: boolean;
}

export default function PlaceCard({ place, showSelect = true }: Props) {
  const { togglePlace, isSelected } = useItineraryStore();
  const selected = isSelected(place.id);
  const cat = CATEGORY_STYLES[place.category];
  const stateInfo = getStateById(place.state);
  const gradient = GRADIENTS_BY_CATEGORY[place.category] ?? 'from-ink-100 to-ink-50';

  return (
    <div
      className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-300
        ${selected
          ? 'ring-2 ring-saffron shadow-glow'
          : 'shadow-soft hover:shadow-card hover:-translate-y-1'}`}
    >
      {/* Hero */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <span className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-500">
          {place.emoji}
        </span>

        {/* Top-left state pill */}
        {stateInfo && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/85 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink-900 shadow-soft">
            <MapPin className="w-3 h-3" strokeWidth={2.5} />
            {stateInfo.name}
          </div>
        )}

        {/* Top-right select toggle */}
        {showSelect && (
          <button
            onClick={(e) => { e.preventDefault(); togglePlace(place); }}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all
              ${selected
                ? 'bg-saffron text-white shadow-glow scale-105'
                : 'bg-white/85 backdrop-blur-sm text-ink-900 hover:bg-saffron hover:text-white shadow-soft'}`}
            aria-label={selected ? 'Remove from itinerary' : 'Add to itinerary'}
          >
            {selected ? <Check className="w-5 h-5" strokeWidth={3} /> : <Plus className="w-5 h-5" strokeWidth={2.5} />}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
            {cat.label}
          </span>
        </div>

        <h3 className="font-extrabold text-ink-900 text-lg leading-tight tracking-tight">
          {place.name}
        </h3>
        <p className="text-saffron text-xs font-semibold mt-1 uppercase tracking-wide">{place.tagline}</p>
        <p className="text-ink-400 text-sm mt-2.5 line-clamp-2 leading-relaxed">{place.description}</p>

        {/* Meta row */}
        <div className="mt-4 flex items-center gap-4 text-xs text-ink-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-ink-400" strokeWidth={2.2} />
            {place.recommendedDays} day{place.recommendedDays > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-ink-400" strokeWidth={2.2} />
            {place.bestTimeToVisit.split(',')[0].split('–')[0].trim()}
          </span>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-between">
          <Link
            to={`/place/${place.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 hover:text-saffron transition-colors"
          >
            View details
            <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          {place.entryFee > 0 ? (
            <span className="text-xs font-semibold text-ink-400">
              ₹{place.entryFee} entry
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-600">Free entry</span>
          )}
        </div>
      </div>
    </div>
  );
}
