const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const cors = require('cors');

// MongoDB URI
const MONGO_URI = 'mongodb+srv://tarunmuragodnavar123:mern123@cluster0.sjd1w.mongodb.net/cybersecurity?retryWrites=true&w=majority&appName=Cluster0';

// Express setup
const app = express();
const port = 3001;

// Use CORS middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// MongoDB model for encrypted files
const EncryptedFile = mongoose.model('EncryptedFile', new mongoose.Schema({
  filename: String,
  encryptedData: String,
  secretKey: String,
  iv: String,
}));

// Decryption function
const decryptData = (encryptedData, secretKeyHex, ivHex) => {
  try {
    const algorithm = 'aes-256-ctr';
    const secretKey = Buffer.from(secretKeyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Error during decryption:', err.message);
    return null;
  }
};

// Route for decrypting a file using GET
app.get('/decrypt/:filename', async (req, res) => {
  const filename = req.params.filename;

  if (!filename) {
    return res.status(400).send('Filename is required.');
  }

  try {
    const fileRecord = await EncryptedFile.findOne({ filename });
    if (!fileRecord) {
      return res.status(404).send(`File "${filename}" not found.`);
    }

    const { encryptedData, secretKey, iv } = fileRecord;

    if (!encryptedData || !secretKey || !iv) {
      return res.status(400).send('Incomplete encryption details.');
    }

    const decryptedData = decryptData(encryptedData, secretKey, iv);

    if (decryptedData) {
      res.status(200).json(decryptedData);
    } else {
      res.status(500).send('Decryption failed.');
    }
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err.message);
    res.status(500).send('Server error.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
