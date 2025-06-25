# FinPal Development Setup

## 🚀 Running the Application

### Backend API Server

```bash
cd server
npm install
npm start
```

- Backend runs on: http://localhost:3002
- Health check: http://localhost:3002/api/health

### Frontend Application

```bash
npm run dev
```

- Frontend runs on: http://localhost:8080
- Connects to backend API automatically

## 📁 File Upload Testing

### Supported File Types

- ✅ CSV files (GPay, PhonePe, Paytm, Bank statements)
- ✅ PDF files (Bank statements)
- ✅ Excel files (.xls, .xlsx)

### Test Files

Use the sample file in `server/test-data/sample-gpay.csv` to test the upload functionality.

### API Endpoints

#### Upload File

```
POST /api/upload
Content-Type: multipart/form-data
Body: file (File)
```

#### Health Check

```
GET /api/health
```

## 🔧 Development Features

### Backend Processing

- ✅ Automatic file type detection
- ✅ CSV parsing with multiple formats
- ✅ PDF text extraction
- ✅ Excel file processing
- ✅ Rule-based transaction categorization
- ✅ AI fallback categorization (simulated)
- ✅ File validation and error handling

### Frontend Integration

- ✅ Real-time upload progress
- ✅ API error handling
- ✅ Transaction display with categories
- ✅ Source detection (GPay, PhonePe, etc.)
- ✅ Confidence levels and categorization source

## 🐛 Troubleshooting

### Port Conflicts

- Backend: Change PORT in `server/server.js`
- Frontend: Runs on Vite's default port

### CORS Issues

- Backend includes CORS middleware
- Frontend API calls configured for localhost

### File Upload Issues

- Check file size limit (10MB)
- Verify file format is supported
- Check backend logs for processing errors
