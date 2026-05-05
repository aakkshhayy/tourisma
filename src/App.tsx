import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import PlaceDetail from './pages/PlaceDetail';
import ItineraryBuilder from './pages/ItineraryBuilder';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/place/:id" element={<PlaceDetail />} />
        <Route path="/itinerary" element={<ItineraryBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}
