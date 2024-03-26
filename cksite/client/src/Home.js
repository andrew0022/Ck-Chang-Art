import React, { useState, useEffect, useRef  } from 'react';
import Header from './components/Header';
import './Home.css';
import image1 from './images/ckhomeimage.jpg';
import image2 from './images/ckhomeimage2.jpg';
import image3 from './images/ckhomeimage3.jpg';
import image4 from './images/ckhomeimage4.jpg';
import image5 from './images/ckhomeimage5.jpg';
import About from './components/About';
import { useLocation } from 'react-router-dom';


const images = [image1, image2, image3, image4, image5, image1];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const location = useLocation();
  const hasScrolledToAbout = useRef(false);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (currentSlide >= images.length - 1) {
        setIsTransitionEnabled(false); // Disable transition for the reset
        setCurrentSlide(0);
        // Re-enable the transition after a brief timeout to ensure it applies to subsequent slides
        setTimeout(() => setIsTransitionEnabled(true), 50); // Adjust timeout as needed
      } else {
        setCurrentSlide(currentSlide + 1);
      }
    }, 3000); // Change image every 3000 milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(slideInterval);

  }, [currentSlide, location]);

  useEffect(() => {
  if (location.pathname === '/about' && !hasScrolledToAbout.current) {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      hasScrolledToAbout.current = true; // Mark that we've scrolled to the About section
    }
  }

  // Reset the flag when the pathname changes, allowing re-scroll if returning to /about
  return () => {
    if (location.pathname !== '/about') {
      hasScrolledToAbout.current = false;
    }
  };
}, [location, location.pathname]);

  
  return (
    <div>
      <Header />
      <main className="content">
        <div className={`slides-wrapper ${isTransitionEnabled ? '' : 'no-transition'}`} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Slide ${index + 1}`} className="slide"/>
          ))}
        </div>
      </main>
      <About />
    </div>
  );
};

export default Home;

