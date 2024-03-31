import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Ensure your CSS accommodates for the dynamic links

const Header = () => {
  const [galleries, setGalleries] = useState([]);

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

  return (
    <header className="sticky-header">
      <div className="header-container">
        <h1 className="title"><a href="/">CK CHANG</a></h1>
        <nav className="navigation">
          <Link to="/about">About</Link>
          <div className="dropdown">
            <Link to="#" className="dropbtn">Gallery</Link> {/* Keeps Gallery as a link */}
            <div className="dropdown-content">
              {galleries.map(gallery => (
                <Link key={gallery.name} to={`/gallery/${gallery.name}`}>{gallery.name}</Link>
              ))}
            </div>
          </div>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
