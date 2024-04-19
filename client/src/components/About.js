import React, { useState, useEffect } from 'react';
import Header from './Header';
import backgroundImage from '../images/ckhomeimage.jpg'; // Ensure the path is correct
import './About.css'; // Import the CSS styles

const About = () => {
  const [aboutContent, setAboutContent] = useState({ title: '', content: '' });
  const imageList = [ // Placeholder URLs for the images
    backgroundImage,
    backgroundImage,
    backgroundImage,
    backgroundImage,
    backgroundImage,
    backgroundImage,
    backgroundImage,
    backgroundImage,
    backgroundImage
  ];

  useEffect(() => {
    const fetchAboutContent = async () => {
      const response = await fetch('/api/about');
      const data = await response.json();
      setAboutContent(data);
    };

    fetchAboutContent();
  }, []);

  return (
    <div className="about" id="about-section">
      <Header />
      <div className="background-image-container">
        <img src={backgroundImage} alt="Nature background" className="background-image" />
        <p className='aboutText'>{aboutContent.content}</p>
        <p className='aboutFeaturedTitle'>{aboutContent.title}</p>
      </div>
      <div className="image-grid">
        {imageList.map((url, index) => (
          <div key={index} className="image-item">
            <img src={url} alt={`Featured Work ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
