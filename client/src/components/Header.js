import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Make sure your CSS is linked correctly

const Header = () => {
  const [galleries, setGalleries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [galleryMenuOpen, setGalleryMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuIconRef = useRef(null);
  

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await fetch('/api/galleries');
        const data = await response.json();
        setGalleries(data);
      } catch (error) {
        console.error('Failed to fetch galleries:', error);
      }
    };
    fetchGalleries();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setGalleryMenuOpen(false); // Close sub-menu when main menu closes
    }
  };

  const toggleGalleryMenu = (e) => {
    e.preventDefault(); // Prevent link default action
    setGalleryMenuOpen(!galleryMenuOpen);
  };

  return (
    <header className="sticky-header">
      <div className="header-container">
        <h1 className="title"><a href="/">CK CHANG</a></h1>
        {!isOpen && <div className="menu-icon" ref={menuIconRef} onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>}
        <nav className={`navigation ${isOpen ? 'open' : ''}`} ref={navRef}>
          <button className="close-btn" onClick={toggleMenu}>×</button> {/* Close button added */}
          <Link to="/about" onClick={toggleMenu}>About</Link>
          <div className="dropdown">
            <Link to="#" className="dropbtn" onClick={toggleGalleryMenu}>Gallery</Link>
            <div className={`dropdown-content ${galleryMenuOpen ? 'show' : ''}`}>
              {galleries.map(gallery => (
                <Link key={gallery.name} to={`/gallery/${gallery.name}`} onClick={toggleMenu}>{gallery.name}</Link>
              ))}
            </div>
          </div>
          <Link to="/contact" onClick={toggleMenu}>Contact</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
