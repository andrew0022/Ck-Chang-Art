import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import backgroundImage from '../images/ckhomeimage.jpg';
import './About.css';
import { Link, useLocation } from 'react-router-dom';
import Contact from './Contact';

const About = () => {
  const textRef = useRef(null);
  const contactRef = useRef(null); // Ref for the contact section
  const [aboutContent, setAboutContent] = useState({ title: '', content: '', images: [] });
  const [displayedContent, setDisplayedContent] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchAboutContent = async () => {
      const response = await fetch('/api/about');
      const data = await response.json();
      setAboutContent(data);
      setDisplayedContent('');
    };

    fetchAboutContent();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch('/api/get-about-images');
      const data = await response.json();
      if (data && data.length > 0) {
        // Assuming the API returns an array of image URLs
        setAboutContent(prevState => ({
          ...prevState,
          images: data.map(img => img.url)  // Assuming each image object has a 'url' property
        }));
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (location.pathname === '/about') {
      // Determine the amount to scroll based on screen size
      const screenSize = window.innerHeight;
      let scrollAmount;
      
      if (screenSize <= 600) { // For mobile devices
        scrollAmount = 100; // Adjust this value based on your layout and needs
      } else if (screenSize <= 1024) { // For tablets
        scrollAmount = 600; // Adjust this value based on your layout and needs
      } else { // For desktops
        scrollAmount = 500; // Adjust this value based on your layout and needs
      }

      // Scroll to the calculated position after a brief delay
      setTimeout(() => {
        window.scrollTo({
          top: scrollAmount,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        let currentLength = 0;
        const intervalId = setInterval(() => {
          if (currentLength <= aboutContent.content.length) {
            setDisplayedContent(aboutContent.content.substring(0, currentLength));
            currentLength++;
          } else {
            clearInterval(intervalId);
          }
        }, 30);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [aboutContent.content]);

  // Scroll to contact section effect
  useEffect(() => {
    if (location.pathname === '/contact' && contactRef.current) {
      const timer = setTimeout(() => {
        contactRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
  
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="about" id="about-section">
      <Header />
      <div className="background-image-container">
        <p ref={textRef} className='aboutText'>{displayedContent}<span className="cursor"></span></p>
        <p className='aboutFeaturedTitle'>{aboutContent.title}</p>
      </div>
      <div className="image-grid">
        {aboutContent.images.map((url, index) => (
          <div key={index} className="image-item">
            <img src={url} alt={`Featured Work ${index + 1}`} />
          </div>
        ))}
      </div>

      <div ref={contactRef} className="contact-container">
        <div className='contact-box'>
          <Contact />
        </div>
        <div className="contact-message">
          <p>Your message here</p>
        </div>
      </div>

      <div className="footer-content">
        <p>© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        <Link to="/loginregister">Admin Login</Link>
      </div>
    </div>
  );
};

export default About;
