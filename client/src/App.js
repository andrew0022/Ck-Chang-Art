import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegister from './components/LoginRegister';
import Gallery from './components/Gallery';
import PublicGallery from './components/PublicGallery';
import About from './components/About';
import Home from './Home';
import Contact from './components/Contact';
import GalleryDisplay from './GalleryDisplay';
import UpdateAboutPage from './components/UpdateAboutPage';
import UpdateImage from './components/UpdateImage';
import SelectGallery from './components/SelectGallery';
import AddImage from './components/AddImage';
import DeleteImage from './components/DeleteImage';
import CreateNewGallery from './components/CreateNewGallery';
import Header from './components/Header';



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
        <Route path="/header" element={<Header />} />

        {/*Make these protected so they can only be viewed when logged in*/}
        <Route path="/updateaboutpage" element={<UpdateAboutPage />} />
        <Route path="/updateimage" element={<UpdateImage />} />
        <Route path="/selectgallery" element={<SelectGallery />} />
        <Route path="/addimage" element={<AddImage />} />
        <Route path="/deleteimage" element={<DeleteImage />} />
        <Route path="/createnewgallery" element={<CreateNewGallery />} />
        


        <Route path="/gallery/:galleryName" element={<GalleryDisplay />} />
        {/* Other routes here */}
      </Routes>
    </Router>
  );
}

export default App;

