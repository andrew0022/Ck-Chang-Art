import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/Header';
import './GalleryDisplay.css'; // Import CSS here

const GalleryDisplay = () => {
  const { galleryName } = useParams();
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term

  useEffect(() => {
    fetchImages();
  }, [galleryName]); // Removed searchTerm from dependencies

  const fetchImages = async () => {
    let url = `/api/gallery/${encodeURIComponent(galleryName)}/images`;
    if (searchTerm) {
      // Modify the URL to use the search endpoint and include the searchTerm
      url = `/api/images/tags?tag=${encodeURIComponent(searchTerm)}&galleryName=${encodeURIComponent(galleryName)}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  return (
    <div>
      <Header />
      <h1>{galleryName}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={fetchImages} className="search-button">Search</button> {/* Search button */}
      </div>
      </h1>

      <div className="gallery-container">
        {images.map((image, index) => (
          <div key={index} className="image-container">
            <img src={image.imageUrl} alt={image.title} />
            <h3>{image.title}</h3>
            <p>{image.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryDisplay;
