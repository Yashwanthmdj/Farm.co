# MongoDB Atlas Setup Guide

This guide will walk you through setting up MongoDB Atlas for the Farmer Assistant application.

## Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas**
   - Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free" or "Sign Up"

2. **Create Account**
   - Fill in your details
   - Choose "Create a free cluster" option
   - Verify your email address

## Step 2: Create Your First Cluster

1. **Choose Plan**
   - Select "FREE" tier (M0)
   - This gives you 512MB storage and shared RAM

2. **Select Cloud Provider & Region**
   - Choose your preferred cloud provider (AWS, Google Cloud, or Azure)
   - Select a region close to your location for better performance
   - Click "Create"

3. **Wait for Cluster Creation**
   - This process takes 2-3 minutes
   - You'll see a green checkmark when ready

## Step 3: Set Up Database Access

1. **Navigate to Database Access**
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"

2. **Create Database User**
   - **Authentication Method**: Password
   - **Username**: Create a username (e.g., `farmerapp`)
   - **Password**: Create a strong password (save this!)
   - **Database User Privileges**: Select "Read and write to any database"
   - Click "Add User"

## Step 4: Set Up Network Access

1. **Navigate to Network Access**
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"

2. **Configure Access**
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
   - Click "Confirm"

## Step 5: Get Your Connection String

1. **Connect to Your Cluster**
   - Go back to "Database" in the left sidebar
   - Click "Connect" on your cluster

2. **Choose Connection Method**
   - Select "Connect your application"
   - Choose "Node.js" as your driver
   - Copy the connection string

3. **Modify Connection String**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `farmerApp`

## Example Connection String

Your connection string should look like this:
```
mongodb+srv://farmerapp:YourPassword123@cluster0.xxxxx.mongodb.net/farmerApp
```

## Step 6: Test Your Connection

1. **Create Environment File**
   - In the `server` directory, create a `.env` file
   - Add your connection string:
   ```env
   MONGODB_URI=mongodb+srv://farmerapp:YourPassword123@cluster0.xxxxx.mongodb.net/farmerApp
   ```

2. **Test Connection**
   - Start your server: `npm start`
   - You should see "Connected to MongoDB" in the console

## Troubleshooting

### Common Issues

1. **"Authentication Failed"**
   - Check your username and password
   - Ensure you're using the correct database user

2. **"Network Access Denied"**
   - Verify your IP address is whitelisted
   - Use "Allow Access from Anywhere" for development

3. **"Connection Timeout"**
   - Check your internet connection
   - Verify the connection string format
   - Ensure the cluster is running

### Security Best Practices

1. **Use Strong Passwords**
   - Include uppercase, lowercase, numbers, and symbols
   - Avoid common words or patterns

2. **Limit Network Access**
   - For production, only allow specific IP addresses
   - Remove "Allow Access from Anywhere" in production

3. **Regular Password Updates**
   - Change database passwords periodically
   - Use environment variables for sensitive data

## Next Steps

After setting up MongoDB Atlas:

1. **Set up other API keys** (OpenAI, Google Cloud)
2. **Start the backend server**
3. **Start the frontend application**
4. **Test all features**

## Support

If you encounter issues:
- Check the MongoDB Atlas documentation
- Review the connection string format
- Ensure all credentials are correct
- Check the server console for error messages

---

**Your MongoDB Atlas is now ready for the Farmer Assistant application! 🌾** 