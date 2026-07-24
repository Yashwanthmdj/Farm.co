# 🌾 Farm.co – AI Powered Farmers Assistant

A production-oriented Smart Agriculture Platform with AI chat, soil OCR, weather, crop prices, marketplace, analytics, and more.

> **Quick start:** see [`HOW_TO_RUN.md`](./HOW_TO_RUN.md)

A comprehensive farming management application with AI-powered multilingual chat assistance, expense tracking, tractor logs, reminder system, and **AI-powered soil health analysis**.

## 🚀 Features

- **🤖 AI Chat Assistant** - Multilingual farming advice using local LLM (Ollama)
- **💰 Expense Tracking** - Categorize and track farming expenses
- **🧪 Soil Health Analysis** - AI-powered OCR analysis of soil test reports with fertilizer and crop recommendations
- **⏰ Reminder System** - Set and manage farming task reminders
- **🌍 Multilingual Support** - Support for English, Spanish, French, Hindi, and Chinese
- **📱 Responsive Design** - Works on desktop and mobile devices
- **🎤 Direct Speech-to-Text** - Use your microphone to ask questions in English, Hindi, or Telugu
- **🌐 Language Selector for Speech** - Choose your spoken language before recording
- **🌍 Live Crop Prices** - View a professional table of current crop prices in the "Crop Prices" tab
- **🛒 E-commerce Platform** - Buy farming supplies and products
- **🌦️ Weather Information** - Get localized weather forecasts
- **🔍 Robust Error Handling** - Clear error messages for audio, speech, and backend issues

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose ODM**
- **Google Cloud Vision API** for OCR analysis
- **Google Cloud Speech-to-Text** for voice transcription
- **Multer** for file uploads

### Frontend
- **React 18** with Hooks
- **Axios** for API communication
- **Modern CSS** with responsive design

### AI & Cloud Services
- **Ollama** - Local LLM for chat responses
- **Google Cloud Vision API** - OCR for soil test reports
- **Google Cloud Speech-to-Text** - Voice transcription

## 📋 Prerequisites

Before running this application, you need:

1. **Node.js** (v14 or higher)
2. **MongoDB Atlas** account
3. **Google Cloud account** with Vision API and Speech-to-Text enabled
4. **ffmpeg** installed and available in your system PATH (required for speech-to-text)
5. **Google Cloud service account JSON key** (place as `server/google-cloud.json`)
6. **Ollama** installed and running with your desired LLM model (e.g., llama3, llama2, or custom)

## 🔧 Setup Instructions

### 1. MongoDB Atlas Setup

#### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project

#### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create"

#### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

#### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

#### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` with your values

### 2. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/farmerApp
OPENAI_API_KEY=your_openai_api_key
```

#### Frontend Configuration
Update the API base URL in `client/src/App.js` if needed:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

### 3. API Keys Setup

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to "API Keys"
4. Create a new API key
5. Add it to your `.env` file

#### Translation Service
- **LibreTranslate** is used (completely free and open source)
- No setup required - works automatically
- Supports Spanish, French, Hindi, and Chinese
- Uses public LibreTranslate instance

### 4. Installation

#### Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd farmer-assistant-fullstack-final

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 5. Running the Application

#### Start the Backend Server
```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

#### Start the Frontend Application
```bash
cd client
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### 6. Start Ollama (for LLM)
```bash
ollama serve
ollama pull <your-model>
```

## 📱 Usage Guide

### 1. User Registration
- Enter your phone number, name, and preferred language
- Click "Start" to begin

### 2. AI Chat Assistant
- Ask farming-related questions in your preferred language
- Get intelligent responses with multilingual support
- View chat history

### 3. Expense Tracking
- Add expenses with categories (seeds, fertilizer, fuel, etc.)
- View expense history and totals
- Track spending patterns

### 4. Tractor Management
- Log tractor usage hours
- Record fuel consumption
- Add maintenance notes
- Monitor equipment efficiency

### 5. Reminder System
- Set reminders for farming tasks
- Schedule important dates
- Track reminder status

### 6. Live Crop Prices
- View a professional table of current crop prices in the "Crop Prices" tab

### 7. Soil Health Analysis
- **Upload** soil test reports (PDF or image format)
- **AI Processing** - Automatic OCR extraction of soil parameters
- **Smart Analysis** - Extract pH, NPK values, organic matter, and more
- **Personalized Recommendations** - Get fertilizer and crop suggestions
- **Analysis History** - View and manage all your soil test results
- **Professional UI** - Modern interface with real-time status updates

## 🧪 Soil Health Analysis Details

### Supported File Formats
- **Images**: JPEG, JPG, PNG
- **Documents**: PDF
- **File Size**: Up to 10MB

### Extracted Parameters
- **pH Level** - Soil acidity/alkalinity
- **Nitrogen (N)** - Essential for plant growth
- **Phosphorus (P)** - Root development and flowering
- **Potassium (K)** - Disease resistance and fruit quality
- **Organic Matter** - Soil structure and nutrient retention

### AI Recommendations
- **Fertilizer Suggestions** - Specific products and application rates
- **Crop Recommendations** - Best crops for your soil conditions
- **Soil Amendments** - pH correction and soil improvement
- **Application Timing** - When and how to apply treatments

### How It Works
1. **Upload** your soil test report
2. **OCR Processing** - Google Cloud Vision extracts text from images/PDFs
3. **Parameter Extraction** - AI identifies and extracts soil values
4. **Analysis** - Compare values against optimal ranges
5. **Recommendations** - Generate personalized farming advice
6. **Storage** - Save results for future reference

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement proper authentication in production
- Set up proper CORS policies for production

## 🚀 Deployment

### Backend Deployment (Heroku Example)
```bash
# Set environment variables in Heroku
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set OPENAI_API_KEY=your_openai_key

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify Example)
1. Build the React app: `npm run build`
2. Upload the `build` folder to Netlify
3. Update the API base URL to your deployed backend

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Verify network access settings
   - Ensure username/password are correct

2. **CORS Errors**
   - Check that the backend is running on port 5000
   - Verify CORS is properly configured

3. **API Key Errors**
   - Ensure OpenAI API key is properly set in environment variables
   - Check that OpenAI service is enabled

4. **Translation Not Working**
   - LibreTranslate is free and should work automatically
   - If translation fails, the app falls back to English
   - Check internet connection

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify all environment variables are set correctly

## 📄 License

This project is licensed under the MIT License.

---

**Happy Farming! 🌾** 