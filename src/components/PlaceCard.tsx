import { Link } from 'react-router-dom';
import { TouristPlace } from '../types';
import { useItineraryStore } from '../store/itineraryStore';

const CATEGORY_COLORS: Record<string, string> = {
  heritage: 'bg-amber-100 text-amber-800',
  nature: 'bg-green-100 text-green-800',
  religious: 'bg-purple-100 text-purple-800',
  beach: 'bg-blue-100 text-blue-800',
  hill_station: 'bg-cyan-100 text-cyan-800',
  wildlife: 'bg-emerald-100 text-emerald-800',
  cultural: 'bg-rose-100 text-rose-800',
};

const CATEGORY_LABELS: Record<string, string> = {
  heritage: 'Heritage',
  nature: 'Nature',
  religious: 'Pilgrimage',
  beach: 'Beach',
  hill_station: 'Hill Station',
  wildlife: 'Wildlife',
  cultural: 'Cultural',
};

interface Props {
  place: TouristPlace;
  showSelect?: boolean;
}

export default function PlaceCard({ place, showSelect = true }: Props) {
  const { togglePlace, isSelected } = useItineraryStore();
  const selected = isSelected(place.id);

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 overflow-hidden
        ${selected ? 'border-orange-400 shadow-orange-100 shadow-md' : 'border-transparent hover:border-orange-200 hover:shadow-md'}`}
    >
      {/* Emoji Banner */}
      <div className={`h-28 flex items-center justify-center text-5xl
        bg-gradient-to-br from-orange-50 to-amber-50`}>
        {place.emoji}
        {selected && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow">
            ✓
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Category badge */}
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${CATEGORY_COLORS[place.category]}`}>
          {CATEGORY_LABELS[place.category]}
        </span>

        <h3 className="font-bold text-gray-900 text-lg leading-tight">{place.name}</h3>
        <p className="text-orange-600 text-sm font-medium mt-0.5">{place.tagline}</p>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{place.description}</p>

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            🕐 {place.recommendedDays} day{place.recommendedDays > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            🌤️ {place.bestTimeToVisit.split(',')[0].split('–')[0].trim()}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/place/${place.id}`}
            className="flex-1 text-center text-sm py-2 px-3 rounded-lg bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 transition-colors"
          >
            Details
          </Link>
          {showSelect && (
            <button
              onClick={() => togglePlace(place)}
              className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition-colors
                ${selected
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {selected ? 'Remove' : '+ Select'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
