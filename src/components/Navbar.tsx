import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useItineraryStore } from '../store/itineraryStore';
import { Compass, Map, Sparkles, Bookmark, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const selectedCount = useItineraryStore(s => s.selectedPlaces.length);
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const links = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/explore', label: 'Explore', icon: Map },
    { to: '/itinerary', label: 'Itinerary', icon: Sparkles },
  ];

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

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

              {/* Auth */}
              {user ? (
                <div className="relative ml-1">
                  <button
                    onClick={() => setShowUserMenu(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-saffron to-amber-500 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
                      {user.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-ink-100 shadow-card z-20 overflow-hidden">
                        <Link
                          to="/saved-trips"
                          onClick={() => setShowUserMenu(false)}
                          className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-colors hover:bg-ink-50 ${
                            location.pathname === '/saved-trips' ? 'text-saffron' : 'text-ink-700'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" strokeWidth={2.2} />
                          Saved trips
                        </Link>
                        <div className="h-px bg-ink-50 mx-3" />
                        <button
                          onClick={() => { signOut(); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={2.2} />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="ml-1 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-ink-900 text-white hover:bg-ink-600 transition-all shadow-soft"
                >
                  <LogIn className="w-4 h-4" strokeWidth={2.2} />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
