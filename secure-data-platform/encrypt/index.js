const express = require('express');
const mongodb = require('mongodb');
const crypto = require('crypto');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;
const uri = 'mongodb+srv://tarunmuragodnavar123:mern123@cluster0.sjd1w.mongodb.net/cybersecurity?retryWrites=true&w=majority&appName=Cluster0';
let db;

mongodb.MongoClient.connect(uri)
  .then(client => {
    db = client.db('cybersecurity');
    console.log('Connected to MongoDB');
    startServer();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware setup
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

const storage = multer.memoryStorage(); // Use memory storage for multer
const upload = multer({ storage: storage });

const encryptData = (data, epsilon) => {
  const algorithm = 'aes-256-ctr';
  const secretKey = crypto.randomBytes(32); // Randomly generated secret key
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Add differential privacy noise using Laplace mechanism
  const sensitivity = 1; // For simplicity, assuming sensitivity is 1 for each character
  encrypted = addLaplaceNoise(encrypted, sensitivity, epsilon);

  return { encrypted, secretKey: secretKey.toString('hex'), iv: iv.toString('hex') };
};

const addLaplaceNoise = (encryptedData, sensitivity, epsilon) => {
  const noise = (Math.random() - 0.5) * 2 * (sensitivity / epsilon);
  return encryptedData.split('').map(char => {
    return String.fromCharCode(char.charCodeAt(0) + noise);
  }).join('');
};

const startServer = () => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  let dataToEncrypt;
  const fileBuffer = req.file.buffer;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  if (fileExtension === '.json') {
    try {
      dataToEncrypt = JSON.parse(fileBuffer.toString());
      dataToEncrypt = JSON.stringify(dataToEncrypt); // Convert JSON object back to a string for encryption
    } catch (jsonError) {
      console.error('Error parsing JSON file:', jsonError);
      return res.status(400).send('Invalid JSON file.');
    }
  } else {
    dataToEncrypt = fileBuffer.toString('utf8'); // Treat non-JSON files as text
  }

  const { encrypted, secretKey, iv } = encryptData(dataToEncrypt, 1.0); // Setting ε=1.0 for differential privacy

  const noisyEncryptedData = addLaplaceNoise(encrypted, 1, 1.0); // Additional Laplace noise with ε=1.0

  db.collection('encrypted_files').insertOne({
    filename: req.file.originalname,
    fileType: fileExtension,
    encryptedData: noisyEncryptedData,
    secretKey: secretKey,
    iv: iv,
    uploadDate: new Date()
  })
  .then(() => {
    res.status(200).send('File uploaded and stored successfully.');
  })
  .catch(err => {
    console.error('Error storing data in MongoDB:', err);
    res.status(500).send('Error storing file in database.');
  });
});
