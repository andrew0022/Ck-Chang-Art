import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegister from './components/LoginRegister';
import Gallery from './components/Gallery';
import PublicGallery from './components/PublicGallery';
import About from './components/About';
import Home from './Home';
import Contact from './components/Contact';
import GalleryDisplay from './GalleryDisplay';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Home />} />
        <Route path="/publicgallery" element={<PublicGallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/loginregister" element={<LoginRegister />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/:galleryName" element={<GalleryDisplay />} />
        {/* Other routes here */}
      </Routes>
    </Router>
  );
}

export default App;

