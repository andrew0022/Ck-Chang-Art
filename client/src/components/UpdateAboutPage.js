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
        const fetchAboutContent = async () => {
            try {
                const response = await fetch('/api/get-about-page');
                const data = await response.json();
                setAboutTitle(data.title);
                setAboutContent(data.content);
                setAboutImages(aboutImages.map((item, index) => ({
                    ...item,
                    url: data.images[index] || null  // Use existing or new data
                })));
            } catch (error) {
                console.error('Failed to fetch about content:', error);
            }
        };

        fetchAboutContent();
    }, []);

    // const handleImageChange = (event, index) => {
    //     const newFile = event.target.files[0];  // Get the new file
    //     const updatedImages = aboutImages.map((item, idx) => {
    //         if (idx === index) {
    //             return { ...item, file: newFile };  // Update the file at the specific index
    //         }
    //         return item;
    //     });
    //     setAboutImages(updatedImages);
    // };



  const handleImageChange = (event, index) => {
    const newFile = event.target.files[0];  // Get the new file
    if (newFile) { // Only update state if a file is selected
        setAboutImages(prevImages => {
            const updatedImages = [...prevImages]; // Create a copy of the previous images array
            updatedImages[index] = { ...updatedImages[index], file: newFile }; // Update only the specified image slot
            return updatedImages;
        });
    }
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
                    />
                </div>
                <div className="form-group-about">
                    <label htmlFor="aboutContent">Update About Page Content</label>
                    <textarea
                        id="aboutContent"
                        value={aboutContent}
                        onChange={(e) => setAboutContent(e.target.value)}
                    />
                </div>
                {aboutImages.map((item, index) => (
                    <div key={index} className="form-group-about">
                        <label htmlFor={`aboutImage${index}`}>Edit Image {index + 1}</label>
                        <input
                            type="file"
                            id={`aboutImage${index}`}
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                        />
                        {item.url && (
                            <img src={item.url} alt={`About Image ${index + 1}`} style={{ width: '100px', height: '100px' }} />
                        )}
                    </div>
                ))}
                <button type="submit">Update About</button>
            </form>
        </div>
    );
};

export default UpdateAboutPage;
