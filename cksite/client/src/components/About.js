import React, { useState, useEffect } from 'react';
import Header from './Header';
import backgroundImage from '../images/ckhomeimage.jpg'; // Ensure the path is correct
import './About.css'; // Import the CSS styles

const About = () => {
  const [aboutContent, setAboutContent] = useState({ title: '', content: '' });

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
        <div className="text-box">
          <h1 className="title">{aboutContent.title}</h1>
          <p>{aboutContent.content}</p>
        </div>
      </div>
    </div>
  );
};

export default About;
