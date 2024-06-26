const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3001;


const AWS = require('aws-sdk');

AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();


const fs = require('fs');
const uploadsDir = '/tmp/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

require('dotenv').config();

const helmet = require('helmet');
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "img-src": ["'self'", "data:", "https://ck-chang-art.s3.amazonaws.com"],
      connectSrc: ["'self'", "https://api.emailjs.com"],  // Allow AJAX requests to EmailJS
    },
  })
);

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

const cors = require('cors');
app.use(cors());

const morgan = require('morgan');
app.use(morgan('combined'));

const compression = require('compression');
app.use(compression());


//connect to database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => {
    console.log(`Successfully connected`);
}).catch((e) => {
    console.log(`Not connected`, e);
});

const aboutSchema = new mongoose.Schema({
  title: String,
  content: String,
  images: [String]  // Array of image URLs
});

const About = mongoose.model('About', aboutSchema);


// Create a User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
  });
  
  const User = mongoose.model('User', userSchema);
  
  const bodyParser = require('body-parser');
  app.use(bodyParser.json());
  
// MongoDB schema and model for Images
const imageSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  description: String,
  galleryName: { type: String, required: true },
  tags: [String] // Add this line to include tags
});
  const Image = mongoose.model('Image', imageSchema);

// // Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/build')));


// Multer setup for image uploading
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });


// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).send("A token is required for authentication");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

// Routes
//User Registration
  // Register a new user
  app.post('/api/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).send("Authentication failed");
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Fetch Images
app.get('/api/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }``
});

//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.post('/api/upload', verifyToken, upload.array('images', 10), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded' });
//     }

//     // Assuming titles, descriptions, and tags are sent as arrays of strings
//     const titles = req.body.titles;
//     const descriptions = req.body.descriptions;
//     const tags = req.body.tags; // No longer assuming it's a JSON array

//     const uploadedImages = req.files.map((file, index) => ({
//       title: titles[index],
//       description: descriptions[index],
//       imageUrl: `/uploads/${file.filename}`,
//       galleryName: req.body.galleryName,
//       tags: tags[index] ? tags[index].split(',') : [] // Split the string into an array
//     }));

//     const savedImages = await Image.create(uploadedImages);
//     res.status(201).json(savedImages);
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// Assuming you've configured AWS as shown earlier
app.post('/api/upload', verifyToken, upload.array('images', 30), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Assuming titles, descriptions, and tags are sent as arrays of strings
    const titles = req.body.titles;
    const descriptions = req.body.descriptions;
    const tags = req.body.tags;

    const uploadedImages = await Promise.all(req.files.map(async (file, index) => {
      // Determine content type based on file extension
      let contentType = 'application/octet-stream'; // Default content type
      if (file.mimetype) contentType = file.mimetype;
    
      const fileContent = fs.readFileSync(path.join('/tmp/uploads/', file.filename));
      
      const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
        Body: fileContent,
        ContentType: contentType, // Set content type here
      };
    
      // Upload the file to S3
      const s3Upload = await s3.upload(s3Params).promise();
    
      return {
        title: titles[index],
        description: descriptions[index],
        imageUrl: s3Upload.Location,
        galleryName: req.body.galleryName,
        tags: tags[index] ? tags[index].split(',') : [],
      };
    }));
    

    const savedImages = await Image.create(uploadedImages);
    res.status(201).json(savedImages);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Gallery schema and model
const gallerySchema = new mongoose.Schema({
    name: String,
    description: String,
    position: Number  // This field represents the position in the list
  });
const Gallery = mongoose.model('Gallery', gallerySchema);


//fetch names of all galleries 
app.get('/api/galleries', async (req, res) => {
    try {
      const galleries = await Gallery.find().sort({ position: 1 });
      res.json(galleries);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
 
  // Add Gallery Endpoint
  app.post('/api/add-gallery', async (req, res) => {
    try {
      const maxPositionGallery = await Gallery.findOne().sort({ position: -1 });
      const newPosition = maxPositionGallery ? maxPositionGallery.position + 1 : 1;

      const { name } = req.body;
      const newGallery = new Gallery({ name, position: newPosition });
      await newGallery.save();
      res.status(201).json(newGallery);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Add a new route for deleting an image
app.delete('/api/delete-image/:galleryName/:imageId', verifyToken, async (req, res) => {
    const { galleryName, imageId } = req.params;
  
    try {
      // Find the image by ID and gallery name and delete it
      const deletedImage = await Image.findOneAndDelete({ _id: imageId, galleryName });
  
      if (!deletedImage) {
        return res.status(404).json({ message: 'Image not found' });
      }
  
      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while deleting the image' });
    }
  });
  
//delete entire gallery
  app.delete('/api/delete-gallery/:galleryName', verifyToken, async (req, res) => {
    const { galleryName } = req.params;
  
    try {
      // Delete all images associated with the gallery
      await Image.deleteMany({ galleryName });
  
      // Delete the gallery
      const deletedGallery = await Gallery.findOneAndDelete({ name: galleryName });
  
      if (!deletedGallery) {
        return res.status(404).json({ message: 'Gallery not found' });
      }
  
      res.status(200).json({ message: 'Gallery and associated images deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while deleting the gallery' });
    }
  });


  app.get('/api/images/tags', async (req, res) => {
    const { tag, galleryName } = req.query; // Get the tag and galleryName from query parameters
    
    try {
      // Adjust the query to filter by both tag and galleryName
      const images = await Image.find({
        tags: tag,
        galleryName: galleryName // Ensure this matches the field name in your Image schema
      });
      res.json(images);
    } catch (err) {
      console.error('Error fetching images by tag:', err);
      res.status(500).json({ message: err.message });
    }
  });
  
  // Fetch Images by Gallery Name
app.get('/api/gallery/:galleryName/images', async (req, res) => {
  const { galleryName } = req.params;
  try {
      // Decode URI component to handle spaces and special characters
      const decodedGalleryName = decodeURIComponent(galleryName);
      const images = await Image.find({ galleryName: decodedGalleryName });
      if (images.length >= 0) {
          res.json(images);
      } else {
          res.status(404).json({ message: 'No images found for this gallery' });
      }
  } catch (err) {
      console.error('Error fetching images by gallery name:', err);
      res.status(500).json({ message: err.message });
  }
});


// // Update Image Endpoint
// app.patch('/api/update-image/:galleryName/:imageId', verifyToken, upload.single('image'), async (req, res) => {
//   const { galleryName, imageId } = req.params;

//   try {
//     // Find the image by ID and gallery name
//     const imageToUpdate = await Image.findOne({ _id: imageId, galleryName });

//     if (!imageToUpdate) {
//       return res.status(404).json({ message: 'Image not found' });
//     }

//     // Update the image properties
//     imageToUpdate.title = req.body.title;
//     imageToUpdate.description = req.body.description;
//     imageToUpdate.tags = req.body.tags.split(',').map(tag => tag.trim());

//     // If a new image file is uploaded, update the image URL
//     if (req.file) {
//       imageToUpdate.imageUrl = `/uploads/${req.file.filename}`;
//     }

//     // Save the updated image
//     const updatedImage = await imageToUpdate.save();

//     res.status(200).json(updatedImage);
//   } catch (error) {
//     console.error('Error updating image:', error);
//     res.status(500).json({ message: 'An error occurred while updating the image' });
//   }
// });

// Update Image Endpoint
app.patch('/api/update-image/:galleryName/:imageId', verifyToken, upload.single('image'), async (req, res) => {
  const { galleryName, imageId } = req.params;

  try {
    // Find the image by ID and gallery name
    const imageToUpdate = await Image.findOne({ _id: imageId, galleryName });

    if (!imageToUpdate) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Update the image properties
    imageToUpdate.title = req.body.title;
    imageToUpdate.description = req.body.description;
    imageToUpdate.tags = req.body.tags.split(',').map(tag => tag.trim());

    // If a new image file is uploaded, upload to S3 and update the image URL
    if (req.file) {
      const fileContent = fs.readFileSync(req.file.path);
      const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `images-${Date.now()}${path.extname(req.file.originalname)}`,
        Body: fileContent,
        ContentType: req.file.mimetype,
      };

      // Upload the file to S3
      const s3Upload = await s3.upload(s3Params).promise();

      // Update imageUrl with the new S3 URL
      imageToUpdate.imageUrl = s3Upload.Location;

      // Optionally, delete the temporary file saved by multer
      fs.unlinkSync(req.file.path);
    }

    // Save the updated image
    const updatedImage = await imageToUpdate.save();

    res.status(200).json(updatedImage);
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'An error occurred while updating the image' });
  }
});


// Backend - app.js

// Delete all selected images
app.delete('/api/delete-selected-images', verifyToken, async (req, res) => {
  const { selectedImages } = req.body;

  try {
    // Verify if selectedImages is an array and not empty
    if (!Array.isArray(selectedImages) || selectedImages.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty selectedImages array' });
    }

    // Delete all selected images
    const deletionResult = await Image.deleteMany({ _id: { $in: selectedImages } });
    const deletedCount = deletionResult.deletedCount;

    res.status(200).json({ message: `Deleted ${deletedCount} selected images successfully` });
  } catch (error) {
    console.error('Error deleting selected images:', error);
    res.status(500).json({ message: 'An error occurred while deleting selected images' });
  }
});

app.get('/api/about', async (req, res) => {
  try {
    // Assuming there's only one About section document in the collection
    const aboutContent = await About.findOne().sort({ _id: -1 }).limit(1);
    if (aboutContent) {
      res.json(aboutContent);
    } else {
      // Optional: Return a default message or an empty object if no About content is found
      res.json({ title: "Default Title", content: "Default content." });
    }
  } catch (err) {
    console.error("Failed to fetch About content:", err);
    res.status(500).json({ message: "An error occurred while fetching the About content." });
  }
});


app.post('/api/about', verifyToken, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    // Option 1: Overwrite the last About content (if you want only one About content at all times)
    const aboutContent = await About.findOne().sort({ _id: -1 });
    if (aboutContent) {
      aboutContent.title = title;
      aboutContent.content = content;
      await aboutContent.save();
      res.status(200).json(aboutContent);
    } else {
      // If no About content exists, create a new one
      const newAboutContent = new About({ title, content });
      await newAboutContent.save();
      res.status(201).json(newAboutContent);
    }

    // Option 2: Always create a new document for each update (comment out Option 1 and uncomment below)
    // const newAboutContent = new About({ title, content });
    // await newAboutContent.save();
    // res.status(201).json(newAboutContent);

  } catch (err) {
    console.error("Failed to update About content:", err);
    res.status(500).json({ message: "An error occurred while updating the About content." });
  }
});


// Endpoint to move or duplicate selected images to another gallery
app.post('/api/move-images', verifyToken, async (req, res) => {
  const { selectedImageIds, targetGalleryName, duplicate } = req.body;

  if (!Array.isArray(selectedImageIds) || selectedImageIds.length === 0) {
    return res.status(400).json({ message: 'Invalid or empty selectedImageIds array' });
  }
  if (!targetGalleryName) {
    return res.status(400).json({ message: 'Target gallery name is required' });
  }

  try {
    const imagesToMove = await Image.find({ _id: { $in: selectedImageIds } });

    if (duplicate) {
      // Duplicate the images to the new gallery
      const duplicatedImages = imagesToMove.map(image => {
        const newImage = new Image({
          ...image.toObject(),
          _id: new mongoose.Types.ObjectId(), // Corrected line
          galleryName: targetGalleryName,
        });
        return newImage.save(); // save new image
      });
      await Promise.all(duplicatedImages);
      res.status(201).json({ message: `${duplicatedImages.length} images duplicated successfully to ${targetGalleryName}` });
    } else {
      // Move the images to the new gallery
      const movePromises = imagesToMove.map(image => {
        image.galleryName = targetGalleryName;
        return image.save();
      });
      await Promise.all(movePromises);
      res.status(200).json({ message: `${movePromises.length} images moved successfully to ${targetGalleryName}` });
    }
  } catch (error) {
    console.error('Error processing image move/duplicate:', error);
    res.status(500).json({ message: 'An error occurred while processing images' });
  }
});


app.post('/api/swap-galleries', verifyToken, async (req, res) => {
  const { galleryId1, galleryId2 } = req.body;

  if (!galleryId1 || !galleryId2) {
      return res.status(400).json({ message: 'Both gallery IDs must be provided.' });
  }

  try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const gallery1 = await Gallery.findById(galleryId1).session(session);
      const gallery2 = await Gallery.findById(galleryId2).session(session);

      if (!gallery1 || !gallery2) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ message: 'One or both galleries not found.' });
      }

      // Swap their positions
      [gallery1.position, gallery2.position] = [gallery2.position, gallery1.position];

      await gallery1.save({ session });
      await gallery2.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: 'Galleries swapped successfully.' });
  } catch (error) {
      console.error('Error swapping galleries:', error);
      res.status(500).json({ message: 'An error occurred while swapping galleries.' });
  }
});




// Get About Page Content
app.get('/api/get-about-page', async (req, res) => {
  try {
    // Fetch the latest About content from the database
    const aboutContent = await About.findOne().sort({ _id: -1 });
    if (aboutContent) {
      res.status(200).json(aboutContent);
    } else {
      // If no About content exists, return a default response
      res.status(404).json({ message: 'No About content found' });
    }
  } catch (err) {
    console.error("Error fetching About page content:", err);
    res.status(500).json({ message: "An error occurred while fetching the About page content." });
  }
});

// Update About Page Content and Images with AWS S3 Upload
app.post('/api/upload-about-image', verifyToken, upload.array('aboutImages', 9), async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    const uploadedImages = await Promise.all(req.files.map(async (file) => {
      const fileContent = fs.readFileSync(file.path);
      const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `aboutImages/${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
        Body: fileContent,
        ContentType: file.mimetype, // Set the appropriate content type based on the file type
       
      };

      // Upload the file to S3
      const s3Upload = await s3.upload(s3Params).promise();

      // Optionally, delete the temporary file saved by multer
      fs.unlinkSync(file.path);

      // Return the S3 URL to store in the database
      return s3Upload.Location;
    }));

    // You can either update the existing About content or create a new one if it does not exist
    const aboutContent = await About.findOne().sort({ _id: -1 });
    if (aboutContent) {
      aboutContent.title = title;
      aboutContent.content = content;
      
      
      // Update the images array with new URLs for the selected images
      uploadedImages.forEach((uploadedImage, index) => {
        if (uploadedImage) {
          aboutContent.images[index] = uploadedImage;
        }
      });
      await aboutContent.save();
    } else {
      const newAboutContent = new About({ title, content, images: uploadedImages });
      await newAboutContent.save();
    }

    res.status(200).json({ message: 'About page updated successfully', aboutContent });
  } catch (err) {
    console.error("Failed to update About page:", err);
    res.status(500).json({ message: "An error occurred while updating the About page." });
  }
});



    // Serve React Frontend
    app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
    
    // Start the server
    app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    });
