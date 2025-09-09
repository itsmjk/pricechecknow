const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// CSV file path
const csvFilePath = path.join(__dirname, 'subscribers.csv');

// Initialize CSV file if it doesn't exist (no headers, just emails)
function initializeCsvFile() {
  if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, '', 'utf8');
    console.log('Created new subscribers.csv file');
  }
}

// Read emails from CSV
function readEmailsFromCsv() {
  try {
    if (!fs.existsSync(csvFilePath)) {
      return [];
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    
    // Each line is just an email address
    const emails = [];
    for (let i = 0; i < lines.length; i++) {
      const email = lines[i].trim();
      if (email) {
        emails.push(email);
      }
    }
    
    return emails;
  } catch (error) {
    console.error('Error reading CSV:', error);
    return [];
  }
}

// Write email to CSV
function writeEmailToCsv(email) {
  try {
    const newLine = `${email}\n`;
    
    fs.appendFileSync(csvFilePath, newLine, 'utf8');
    console.log(`Added email to CSV: ${email}`);
    return true;
  } catch (error) {
    console.error('Error writing to CSV:', error);
    return false;
  }
}

// Check if email already exists
function emailExists(email) {
  const emails = readEmailsFromCsv();
  return emails.some(existingEmail => existingEmail.toLowerCase() === email.toLowerCase());
}

// Initialize CSV file on startup
initializeCsvFile();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CSV Email collection server running',
    csvFile: csvFilePath
  });
});

// Subscribe email
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Check if email already exists
  if (emailExists(email)) {
    return res.status(409).json({ error: 'Email already subscribed' });
  }

  // Write email to CSV
  const success = writeEmailToCsv(email);
  
  if (success) {
    res.json({ 
      success: true, 
      message: 'Successfully subscribed!',
      email: email
    });
  } else {
    res.status(500).json({ error: 'Failed to save email' });
  }
});

// Get all subscribers
app.get('/api/subscribers', (req, res) => {
  const emails = readEmailsFromCsv();
  res.json({ 
    subscribers: emails, 
    count: emails.length,
    csvFile: csvFilePath
  });
});

// Download CSV file
app.get('/api/download', (req, res) => {
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'CSV file not found' });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
  
  const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  res.send(csvContent);
});

// View CSV content in browser
app.get('/api/view-csv', (req, res) => {
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'CSV file not found' });
  }

  const csvContent = fs.readFileSync(csvFilePath, 'utf8');
  res.setHeader('Content-Type', 'text/plain');
  res.send(csvContent);
});

app.listen(PORT, () => {
  console.log(`CSV Email collection server running on port ${PORT}`);
  console.log(`CSV file location: ${csvFilePath}`);
  console.log(`View subscribers: http://localhost:${PORT}/api/subscribers`);
  console.log(`Download CSV: http://localhost:${PORT}/api/download`);
  console.log(`View CSV: http://localhost:${PORT}/api/view-csv`);
});
