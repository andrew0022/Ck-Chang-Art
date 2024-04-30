import React, { useState, useEffect } from 'react';
import './UpdateAboutPage.css';

const UpdateAboutPage = () => {
    const [aboutTitle, setAboutTitle] = useState('');
    const [aboutContent, setAboutContent] = useState('');
    const [aboutImages, setAboutImages] = useState(new Array(9).fill().map(() => ({
        url: null,
        file: null
    })));  // Initialize with placeholders for 9 images

    useEffect(() => {
        const fetchAboutImages = async () => {
            try {
                const response = await fetch('/api/get-about-images');
                const data = await response.json();
                // Assume data is an array of URLs; convert to File or handle as URLs
                setAboutImages(aboutImages.map((item, index) => ({
                    ...item,
                    url: data[index] || null  // Use existing or new data
                })));
            } catch (error) {
                console.error('Failed to fetch about images:', error);
            }
        };

        fetchAboutImages();
    }, []);

    const handleImageChange = (event, index) => {
        const newFile = event.target.files[0];  // Get the new file
        const updatedImages = aboutImages.map((item, idx) => {
            if (idx === index) {
                return { ...item, file: newFile };  // Update the file at the specific index
            }
            return item;
        });
        setAboutImages(updatedImages);
    };

    const handleUpdateAbout = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();

        formData.append('title', aboutTitle);
        formData.append('content', aboutContent);

        aboutImages.forEach((image, index) => {
            if (image.file !== null) {  // Only append files that are not null
                formData.append('aboutImages', image.file);
            }
        });

        try {
            const response = await fetch('/api/upload-about-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('About section updated successfully!');
                // Optionally reload or update UI state here
            } else {
                alert('Failed to update the About section.');
            }
        } catch (error) {
            console.error('Error updating the About section:', error);
            alert('An error occurred while updating the About section.');
        }
    };

    return (
        <div className="about-update-section-ab">
            <form onSubmit={handleUpdateAbout}>
                <div className="form-group-about">
                    <label htmlFor="aboutTitle">Update About Page Title</label>
                    <input
                        type="text"
                        id="aboutTitle"
                        value={aboutTitle}
                        onChange={(e) => setAboutTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group-about">
                    <label htmlFor="aboutContent">Update About Page Content</label>
                    <textarea
                        id="aboutContent"
                        value={aboutContent}
                        onChange={(e) => setAboutContent(e.target.value)}
                        required
                    />
                </div>
                {aboutImages.map((item, index) => (
                    <div key={index} className="form-group-about">
                        <label htmlFor={`aboutImage${index}`}>About Image {index + 1}</label>
                        <input
                            type="file"
                            id={`aboutImage${index}`}
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                        />
                        {item.url && <img src={item.url} alt={`About Image ${index + 1}`} style={{ width: '100px', height: '100px' }} />}
                    </div>
                ))}
                <button type="submit">Update About</button>
            </form>
        </div>
    );
};

export default UpdateAboutPage;
