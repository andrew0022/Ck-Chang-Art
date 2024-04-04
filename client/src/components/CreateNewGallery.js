import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './CreateNewGallery.css'


function CreateNewGallery() {
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState('');
  const [newGalleryName, setNewGalleryName] = useState('');
  const [imageEntries, setImageEntries] = useState([{ title: '', description: '', image: null, display: true, tags: [] }]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [galleryImages, setGalleryImages] = useState({});
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredImages, setFilteredImages] = useState(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(null);


  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutContent, setAboutContent] = useState('');

  const handleUpdateAbout = async (event) => {
    event.preventDefault();
  
    const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
    const aboutData = {
      title: aboutTitle,
      content: aboutContent,
    };
  
    try {
      const response = await fetch('/api/about', {
        method: 'POST', // Or PATCH if your endpoint is designed to partially update
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure your API requires authorization
        },
        body: JSON.stringify(aboutData),
      });
  
      if (response.ok) {
        alert('About section updated successfully.');
        // Optionally, clear form fields or fetch the latest About content here
      } else {
        alert('Failed to update the About section. Please try again.');
      }
    } catch (error) {
      console.error('Error updating the About section:', error);
      alert('An error occurred while updating the About section.');
    }
  };
  

  // Function to handle checkbox change
  const handleCheckboxChange = (imageId) => {
    if (selectedImages.includes(imageId)) {
      // Remove imageId from selectedImages if already selected
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      // Add imageId to selectedImages if not selected
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  const handleDeleteSelected = async () => {
    // Find the titles of the selected images
    const selectedTitles = images.filter(image => selectedImages.includes(image._id)).map(image => image.title);

    // Check if there are selected images to delete
    if (selectedTitles.length === 0) {
        console.error('No images selected for deletion');
        return;
    }

    // Display confirmation with the titles of the images
    const confirmDelete = window.confirm(`Are you sure you want to delete the images: ${selectedTitles.join(', ')}?`);

    if (!confirmDelete) {
        // User canceled the deletion
        return;
    }

    try {
        const token = localStorage.getItem('token'); // Get JWT token from localStorage
        if (!token) {
            console.error('JWT token not found');
            return;
        }

        const response = await fetch('/api/delete-selected-images', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include JWT token in the Authorization header
            },
            body: JSON.stringify({ selectedImages })
        });

        if (response.ok) {
            // If deletion is successful, remove selected images from the UI
            setImages(images.filter(image => !selectedImages.includes(image._id)));
            setSelectedImages([]); // Clear selectedImages array
            window.location.reload()
            console.log('Selected images deleted successfully');
            
            // Optionally, refresh the page or fetch updated image list here
        } else {
            console.error('Error deleting selected images');
        }
    } catch (error) {
        console.error('Error deleting selected images:', error);
    }
};


  // Fetch images from backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images');
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };
    fetchImages();
  }, []);

  const handleUpdateButtonClick = (image) => {
    setUpdatingImage(image); // Prepare the image to be updated
    setShowUpdateModal(true); // Show the modal for updating
  };
  
  // This function handles the form submission within the modal
  const handleUpdateImage = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const token = localStorage.getItem('token');
    
    // Construct the FormData object from the form
    const formData = new FormData();
    formData.append('title', event.target.title.value);
    formData.append('description', event.target.description.value);
    formData.append('tags', event.target.tags.value);
    formData.append('image', event.target.image.files[0]); // Assuming 'image' is the name of your file input
  
    try {
      const response = await fetch(`/api/update-image/${updatingImage.galleryName}/${updatingImage._id}`, {
        method: 'PATCH',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is not needed here as it's automatically set by browsers when you use FormData
        },
      });
  
      if (response.ok) {
        // If the update is successful
        window.location.reload(); // Reload the page or fetch updated data
        setShowUpdateModal(false); // Close the modal
      } else {
        console.error('Image update failed');
      }
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };
  

  

  // Refs for scrolling
  const gallerySelectionRef = useRef(null);
  const addImageEntryRef = useRef(null);
  const deleteGalleryImagesRef = useRef(null);

  useEffect(() => {
    async function fetchGalleries() {
      const response = await fetch('/api/galleries');
      const data = await response.json();
      setGalleries(data);

      if (!selectedGallery && data.length > 0) {
        setSelectedGallery(data[0].name);
      }
    }
    fetchGalleries();

    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, [selectedGallery]);

  useEffect(() => {
    async function fetchImages() {
      const response = await fetch('/api/images');
      const images = await response.json();

      const organizedImages = {};
      images.forEach(image => {
        const galleryName = image.galleryName;
        if (!organizedImages[galleryName]) {
          organizedImages[galleryName] = [];
        }
        organizedImages[galleryName].push(image);
      });
      setGalleryImages(organizedImages);
    }
    fetchImages();
  }, []);

  const handleGalleryChange = (event) => {
    setSelectedGallery(event.target.value);
  };

  const handleImageEntryChange = (index, field, value) => {
    const updatedEntries = [...imageEntries];
    updatedEntries[index][field] = value;
    setImageEntries(updatedEntries);
  };

  const handleTagChange = (index, value) => {
    const updatedEntries = [...imageEntries];
    updatedEntries[index].tags = value.split(',').map(tag => tag.trim());
    setImageEntries(updatedEntries);
  };

  const handleAddImageEntry = () => {
    setImageEntries([...imageEntries, { id: uuidv4(), title: '', description: '', image: null, display: true, tags: [] }]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    imageEntries.forEach((entry, index) => {
      if (entry.display && entry.image) {
        formData.append(`images`, entry.image);
        formData.append(`titles[${index}]`, entry.title);
        formData.append(`descriptions[${index}]`, entry.description);
        formData.append(`tags[${index}]`, entry.tags.join(','));
      }
    });
    formData.append('galleryName', selectedGallery);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        window.location.reload();
        console.log('Image uploaded successfully');
        setImageEntries([{ title: '', description: '', image: null, display: true, tags: [] }]);
      } else {
        console.error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleNewGallerySubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/add-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGalleryName })
      });

      if (response.ok) {
        const newGallery = await response.json();
        setGalleries([...galleries, newGallery]);
        setSelectedGallery(newGallery.name);
        setNewGalleryName('');
        alert(`${newGallery.name} gallery has been added successfully! You may now add images to this gallery!`);
      } else {
        console.error('Adding new gallery failed');
      }
    } catch (error) {
      console.error('Error adding new gallery:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const handleDeleteImage = async (imageId, imageName) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the image '${imageName}'?`);
    if (!isConfirmed) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/delete-image/${selectedGallery}/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Image deletion failed');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleRemoveImageEntry = (index) => {
    let updatedEntries = [...imageEntries];
    updatedEntries.splice(index, 1);
    setImageEntries(updatedEntries);
  };

  const fetchImagesByTag = async () => {
    if (!searchQuery) {
      setFilteredImages(null); // Reset or clear the search results if the query is empty
      setLastSearchQuery('');
      return;
    }
    try {
      // Include the selectedGallery in the query
      const response = await fetch(`/api/images/tags?tag=${encodeURIComponent(searchQuery)}&galleryName=${encodeURIComponent(selectedGallery)}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const images = await response.json();
      setFilteredImages(images);
      setLastSearchQuery(searchQuery);
    } catch (error) {
      console.error('Error fetching images by tag:', error);
      setFilteredImages([]); // Consider setting to empty array to indicate no results or error
    }
  };

  const handleDeleteGallery = async (galleryName) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the gallery '${galleryName}' and all its images?`);
    if (!isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/delete-gallery/${galleryName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGalleries(galleries.filter(gallery => gallery.name !== galleryName));
        if (selectedGallery === galleryName) {
          setSelectedGallery('');
        }
      } else {
        console.error('Gallery deletion failed');
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
    }
  };

  // Add the scrollToRef function
  const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);

// Assuming you have a ref for your sticky header
// const headerRef = useRef(null);

const handleNavClick = (section) => {
  const headerHeight = document.querySelector('.gallery-nav').offsetHeight; // Get the header's height
  const yOffset = -headerHeight; // You want to scroll up by the height of the header

  let elementPosition = 0;
  switch (section) {
    case 'gallerySelection':
      elementPosition = gallerySelectionRef.current.offsetTop + yOffset;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
      break;
    case 'addImageEntry':
      elementPosition = addImageEntryRef.current.offsetTop + yOffset;
      window.scrollTo({
        top: 240,
        behavior: 'smooth' // Optional: adds smooth scrolling effect
      });
      break;
    case 'deleteGalleryImages':
      elementPosition = deleteGalleryImagesRef.current.offsetTop + yOffset;
      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
      break;
    default:
      break;
    case 'updateAboutPage':
      elementPosition = addImageEntryRef.current.offsetTop + yOffset;
      window.scrollTo({
        top: 2000,
        behavior: 'smooth' // Optional: adds smooth scrolling effect
      });
      break;
    
  }
};

    return (
        <div>
            <div className="gallery-container-cn">
        {isAuthenticated ? (
          <div>
            <div className="gallery-and-new-form-cn">
              <div className="gallery-title-cn">
                <label htmlFor="gallerySelect">Add a new gallery</label>
              </div>
              <div className="form-container-cn">
                <form className="add-new-gallery-form-cn" onSubmit={handleNewGallerySubmit}>
                  <input
                    type="text"
                    placeholder="New Gallery Name"
                    value={newGalleryName}
                    onChange={(e) => setNewGalleryName(e.target.value)}
                  />
                  <button type="submit">Add New Gallery</button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <p className="login-message">Please log in to view the gallery content.</p>
        )}
      </div>
        </div>
    );
};

export default CreateNewGallery;
