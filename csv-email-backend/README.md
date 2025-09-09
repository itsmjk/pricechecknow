# CSV Email Collection Backend

Simple email collection system that stores emails in a CSV file.

## Features

- ✅ Stores emails in CSV format
- ✅ Email validation and duplicate prevention
- ✅ Easy to view and edit
- ✅ Direct CSV download
- ✅ No database needed
- ✅ Human-readable format

## Setup

1. **Install dependencies:**
   ```bash
   cd csv-email-backend
   npm install
   ```

2. **Start server:**
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

3. **Server runs on:** `http://localhost:3003`

## CSV File

- **Location:** `./subscribers.csv`
- **Format:**
  ```csv
  Email,Subscribed At,Source
  user@example.com,2024-01-15T10:30:00.000Z,website
  another@example.com,2024-01-15T11:45:00.000Z,website
  ```

## API Endpoints

### POST /api/subscribe
Subscribe an email address
```javascript
// Request
{
  "email": "user@example.com"
}

// Response (success)
{
  "success": true,
  "message": "Successfully subscribed!",
  "email": "user@example.com"
}
```

### GET /api/subscribers
Get all subscribers as JSON
```javascript
// Response
{
  "subscribers": [
    {
      "email": "user@example.com",
      "subscribedAt": "2024-01-15T10:30:00.000Z",
      "source": "website"
    }
  ],
  "count": 1,
  "csvFile": "/path/to/subscribers.csv"
}
```

### GET /api/download
Download the CSV file directly

### GET /api/view-csv
View CSV content in browser as plain text

### GET /health
Health check and server info

## Frontend Integration

Update your EmailCapture component:

```javascript
const API_BASE_URL = 'http://localhost:3003';

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email) return;

  setIsLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to subscribe');
    }
    
    toast({
      title: 'Success!',
      description: 'Thanks for subscribing!',
      status: 'success',
    });
    setEmail('');
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message,
      status: 'error',
    });
  } finally {
    setIsLoading(false);
  }
};
```

## Accessing Your Emails

### **Method 1: Direct File Access**
- Open `subscribers.csv` in Excel, Google Sheets, or any text editor

### **Method 2: Browser Endpoints**
- **View all:** `http://localhost:3003/api/subscribers`
- **Download CSV:** `http://localhost:3003/api/download`
- **View raw CSV:** `http://localhost:3003/api/view-csv`

### **Method 3: Command Line**
```bash
# View the CSV file
cat subscribers.csv

# Count subscribers
wc -l subscribers.csv
```

## Advantages of CSV Storage

- ✅ **Simple**: Easy to understand and edit
- ✅ **Portable**: Works with Excel, Google Sheets, etc.
- ✅ **No Database**: No setup required
- ✅ **Backup**: Just copy the CSV file
- ✅ **Import/Export**: Compatible with all email services
- ✅ **Human Readable**: Can edit manually if needed

## Import to Email Services

The CSV can be imported into:
- Mailchimp
- ConvertKit
- Gmail contacts
- Outlook
- Any email marketing platform

Just upload the `subscribers.csv` file!
