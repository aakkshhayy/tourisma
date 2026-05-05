import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Calendar, Users, MapPin, Loader2, Sparkles, ArrowRight, Hotel } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, SavedTrip } from '../lib/supabase';
import AuthModal from '../components/AuthModal';

const BUDGET_LABELS: Record<string, string> = { budget: 'Budget', mid: 'Standard', luxury: 'Premium' };

export default function SavedTrips() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_trips')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTrips(data as SavedTrip[]);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from('saved_trips').delete().eq('id', id);
    setTrips(prev => prev.filter(t => t.id !== id));
    setDeleting(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-saffron animate-spin" strokeWidth={2.5} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center px-4">
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto bg-saffron/10 rounded-3xl flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-saffron" strokeWidth={2} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 mb-3">Your saved trips</h1>
          <p className="text-ink-400 text-base mb-6">Sign in to save itineraries and access them anytime.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-saffron to-orange-500 text-white font-extrabold px-8 py-4 rounded-2xl hover:shadow-glow transition-all"
          >
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <div className="bg-white border-b border-ink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-saffron mb-3">
            <Bookmark className="w-4 h-4" strokeWidth={2.5} />
            My account
          </div>
          <h1 className="font-display font-extrabold text-ink-900 text-4xl sm:text-5xl tracking-tight">
            Saved trips
          </h1>
          <p className="text-ink-600 text-lg mt-3">
            {trips.length > 0 ? `${trips.length} saved trip${trips.length > 1 ? 's' : ''}` : 'No saved trips yet.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-saffron animate-spin" strokeWidth={2.5} />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-ink-100">
            <div className="w-16 h-16 mx-auto bg-saffron/10 rounded-2xl flex items-center justify-center mb-4">
              <Bookmark className="w-7 h-7 text-saffron" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-extrabold text-ink-900 mb-2">No saved trips yet</h2>
            <p className="text-ink-400 text-sm mb-6">Generate a trip plan and save it to access it anytime.</p>
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-saffron to-orange-500 text-white font-extrabold px-6 py-3 rounded-2xl hover:shadow-glow transition-all"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              Build an itinerary
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => {
              const itinerary = trip.itinerary as {
                route?: string[];
                totalEstimatedCost?: { total: number };
              };
              return (
                <div key={trip.id} className="bg-white rounded-3xl border border-ink-100 shadow-soft p-6 hover:border-saffron/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl font-extrabold text-ink-900 leading-tight truncate">{trip.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ink-400">
                        {trip.duration && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} />
                            {trip.duration} days
                          </span>
                        )}
                        {trip.budget && (
                          <span className="inline-flex items-center gap-1">
                            <Hotel className="w-3.5 h-3.5" strokeWidth={2.2} />
                            {BUDGET_LABELS[trip.budget] ?? trip.budget}
                          </span>
                        )}
                        {itinerary?.totalEstimatedCost?.total && (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                            ≈ ₹{itinerary.totalEstimatedCost.total.toLocaleString()}
                          </span>
                        )}
                        <span className="text-ink-300">
                          {new Date(trip.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {itinerary?.route && itinerary.route.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {itinerary.route.map((stop: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-ink-50 text-ink-600 text-xs font-bold px-2.5 py-1 rounded-full border border-ink-100">
                              <MapPin className="w-2.5 h-2.5" strokeWidth={2.5} />
                              {stop}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(trip.id)}
                      disabled={deleting === trip.id}
                      className="flex-shrink-0 w-10 h-10 rounded-2xl bg-ink-50 hover:bg-rose-50 hover:text-rose-600 text-ink-400 flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Delete trip"
                    >
                      {deleting === trip.id
                        ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                        : <Trash2 className="w-4 h-4" strokeWidth={2.2} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/itinerary"
            className="inline-flex items-center gap-2 bg-white border-2 border-ink-100 text-ink-900 font-bold px-6 py-3 rounded-2xl hover:border-saffron/40 transition-all"
          >
            <Sparkles className="w-4 h-4 text-saffron" strokeWidth={2.5} />
            Plan another trip
          </Link>
        </div>
      </div>
    </div>
  );
}
