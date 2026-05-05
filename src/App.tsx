import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import PlaceDetail from './pages/PlaceDetail';
import ItineraryBuilder from './pages/ItineraryBuilder';
import SavedTrips from './pages/SavedTrips';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/itinerary" element={<ItineraryBuilder />} />
          <Route path="/saved-trips" element={<SavedTrips />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
