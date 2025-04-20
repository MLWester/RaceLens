const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parse');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Store sessions in memory (replace with database in production)
let sessions = [];

// Upload telemetry file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process CSV file and extract telemetry data
    const telemetryData = await processTelemetryFile(req.file.path);
    
    // Create session
    const session = {
      id: Date.now().toString(),
      metadata: {
        filename: req.file.originalname,
        uploadDate: new Date(),
        trackName: 'Unknown Track', // Extract from data if available
        carName: 'Unknown Car',     // Extract from data if available
      },
      telemetry: telemetryData
    };

    sessions.push(session);
    res.json(session);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process telemetry data' });
  }
});

// Get session by ID
app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.find(s => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// List all sessions
app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

// Helper function to process CSV file
async function processTelemetryFile(filePath) {
  // Implement CSV parsing logic here
  return [];
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 