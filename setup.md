# Quick Setup Guide

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# MongoDB Atlas Connection String (REQUIRED)
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/farmerApp

# OpenAI API Key (REQUIRED for AI chat)
OPENAI_API_KEY=your_openai_api_key_here

# Server Port (optional, defaults to 5000)
PORT=5000
```

## Quick Start Commands

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Start backend server
cd ../server
npm start

# Start frontend (in new terminal)
cd ../client
npm start
```

## MongoDB Atlas Connection String Format

Your connection string should look like this:
```
mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/database-name
```

Replace:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster-name.xxxxx.mongodb.net` with your actual cluster URL
- `database-name` with your database name (e.g., "farmerApp")

## Translation Service

The app now uses **LibreTranslate** which is:
- ✅ **Completely FREE** and open source
- ✅ **No API key required** 
- ✅ **No setup required** - works immediately
- ✅ **Supports multiple languages** (Spanish, French, Hindi, Chinese)
- ✅ **Automatic fallback** to English if translation fails
- ✅ **Privacy-focused** - uses public LibreTranslate instance 