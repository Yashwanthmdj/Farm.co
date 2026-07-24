import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

// Modern SVG icons for sidebar
const sidebarIcons = {
  chat: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  expenses: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8V4m0 0L8 8m4-4l4 4M4 20h16"/></svg>,
  soil: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C7 2 2 7 2 12c0 5 5 10 10 10s10-5 10-10c0-5-5-10-10-10z"/></svg>,
  reminders: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  weather: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 16a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-1z"/><path d="M16 13a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4v-1a4 4 0 0 1 4-4h1z"/></svg>,
  ecommerce: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  disease: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="5"/></svg>,
  marketplace: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  'my-store': <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>,
  'govt-prices': <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [expenses, setExpenses] = useState([]);
  const [tractorLogs, setTractorLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [userForm, setUserForm] = useState({ phone: '', name: '', language: 'en', email: '', role: 'farmer' });
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', note: '' });
  const [tractorForm, setTractorForm] = useState({ usageHours: '', fuelUsed: '', maintenanceNote: '' });
  const [reminderForm, setReminderForm] = useState({ message: '', date: '' });
  const [chatMessage, setChatMessage] = useState('');

  // Crop states
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropInfo, setCropInfo] = useState(null);
  const [plantingDate, setPlantingDate] = useState('');

  // Weather states
  const [weatherLocation, setWeatherLocation] = useState('');
  const [weatherLang, setWeatherLang] = useState('en');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Revenue states
  const [revenueForm, setRevenueForm] = useState({ amount: '', category: '', note: '', date: '' });
  const [revenues, setRevenues] = useState([]);

  // E-commerce states
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productLoading, setProductLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Soil analysis states
  const [soilAnalyses, setSoilAnalyses] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Crop Disease Detection states
  const [diseaseAnalysis, setDiseaseAnalysis] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);

  // Farmer's Store states
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(false);

  // Marketplace states
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);

  // Recording states
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null); // Ref for the chat input

  // Language states
  const [selectedSpeechLang, setSelectedSpeechLang] = useState(currentUser?.language || 'en');

  // Add state for live prices
  const [livePrices, setLivePrices] = useState([
    { name: 'Tomato', price: 24, unit: 'kg', type: 'Vegetable' },
    { name: 'Potato', price: 18, unit: 'kg', type: 'Vegetable' },
    { name: 'Onion', price: 22, unit: 'kg', type: 'Vegetable' },
    { name: 'Apple', price: 90, unit: 'kg', type: 'Fruit' },
    { name: 'Banana', price: 35, unit: 'dozen', type: 'Fruit' },
    { name: 'Mango', price: 60, unit: 'kg', type: 'Fruit' },
  ]);

  // Add useEffect to randomize prices on mount
  useEffect(() => {
    const randomize = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    setLivePrices([
      { name: 'Tomato', price: randomize(15, 40), unit: 'kg', type: 'Vegetable' },
      { name: 'Potato', price: randomize(10, 30), unit: 'kg', type: 'Vegetable' },
      { name: 'Onion', price: randomize(12, 35), unit: 'kg', type: 'Vegetable' },
      { name: 'Apple', price: randomize(70, 150), unit: 'kg', type: 'Fruit' },
      { name: 'Banana', price: randomize(20, 50), unit: 'dozen', type: 'Fruit' },
      { name: 'Mango', price: randomize(40, 120), unit: 'kg', type: 'Fruit' },
    ]);
  }, []);

  // Register/Login user
  const handleUserSubmit = async (e, setWrongPin) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Remove email from payload
      const payload = { ...userForm };
      delete payload.email;
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, payload);
      setCurrentUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Registration error:', error, error?.response?.data);
      if (error.response && error.response.data && error.response.data.error === 'Invalid PIN') {
        setWrongPin && setWrongPin(true);
      } else {
        // Show backend error details if present
        const backendError = error.response?.data;
        alert('Error registering user: ' + (backendError?.details || backendError?.error || error.message));
      }
    }
    setLoading(false);
  };

  // Add expense
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/expenses/add`, {
        ...expenseForm,
        userId: currentUser._id
      });
      setExpenses([...expenses, response.data]);
      setExpenseForm({ category: '', amount: '', note: '' });
    } catch (error) {
      alert('Error adding expense: ' + error.message);
    }
    setLoading(false);
  };

  // Add tractor log
  const handleTractorSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tractor/add`, {
        ...tractorForm,
        userId: currentUser._id
      });
      setTractorLogs([...tractorLogs, response.data]);
      setTractorForm({ usageHours: '', fuelUsed: '', maintenanceNote: '' });
    } catch (error) {
      alert('Error adding tractor log: ' + error.message);
    }
    setLoading(false);
  };

  // Add reminder
  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/reminders/add`, {
        ...reminderForm,
        userId: currentUser._id
      });
      setReminders([...reminders, response.data]);
      setReminderForm({ message: '', date: '' });
    } catch (error) {
      alert('Error adding reminder: ' + error.message);
    }
    setLoading(false);
  };

  // Send chat message
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !chatMessage.trim()) return;
    setLoading(true);
    try {
      // Prepare messages array for context (optional, here just user message)
      const messages = [
        { role: 'system', content: 'You are a helpful assistant for farmers. Provide practical advice about farming, crop management, weather, soil health, pest control, and agricultural best practices. Keep responses concise and actionable.' },
        { role: 'user', content: chatMessage }
      ];
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'steamdj/llama3.1-cpu-only',
          messages: messages,
          stream: false
        })
      });
      const data = await response.json();
      const reply = data.message?.content || data.error || 'No response from model.';
      const newChat = {
        question: chatMessage,
        answer: reply,
        timestamp: new Date()
      };
      setChatHistory([...chatHistory, newChat]);
      setChatMessage('');
    } catch (error) {
      alert('Error sending message: ' + error.message);
    }
    setLoading(false);
  };

  // Fetch available crops
  const fetchCrops = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reminders/crops`);
      setCrops(response.data);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  // Get crop information
  const getCropInfo = async (cropType) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reminders/crop/${cropType}`);
      setCropInfo(response.data);
    } catch (error) {
      console.error('Error fetching crop info:', error);
    }
  };

  // Create crop schedule with automatic reminders
  const createCropSchedule = async () => {
    if (!selectedCrop || !plantingDate) {
      alert('Please select a crop and planting date');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/reminders/crop-schedule`, {
        userId: currentUser._id,
        cropType: selectedCrop,
        plantingDate: plantingDate
      });
      alert(response.data.message);
      // Refresh reminders
      const remindersResponse = await axios.get(`${API_BASE_URL}/api/reminders/user/${currentUser._id}`);
      setReminders(remindersResponse.data);
      // Reset form
      setSelectedCrop(null);
      setPlantingDate('');
      setCropInfo(null);
    } catch (error) {
      alert('Error creating crop schedule: ' + error.message);
    }
    setLoading(false);
  };

  // Fetch weather forecast
  const fetchWeather = async () => {
    if (!weatherLocation) {
      alert('Please enter a location');
      return;
    }
    setWeatherLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/weather/forecast', {
        city: weatherLocation,
        lang: weatherLang
      });
      setWeatherData(response.data);
    } catch (error) {
      alert('Error fetching weather: ' + (error.response?.data?.error || error.message));
    }
    setWeatherLoading(false);
  };

  // Add revenue
  const handleRevenueSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/expenses/revenue/add`, {
        ...revenueForm,
        userId: currentUser._id
      });
      setRevenues([response.data, ...revenues]);
      setRevenueForm({ amount: '', category: '', note: '', date: '' });
    } catch (error) {
      alert('Error adding revenue: ' + error.message);
    }
    setLoading(false);
  };

  // E-commerce functions
  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setProductLoading(false);
  };

  const addToCart = async (productId) => {
    if (!currentUser) return;
    setCartLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cart/add`, {
        userId: currentUser._id,
        productId: productId,
        quantity: 1
      });
      setCart(response.data.items);
    } catch (error) {
      alert('Error adding to cart: ' + error.message);
    }
    setCartLoading(false);
  };

  const updateCartQuantity = async (productId, quantity) => {
    if (!currentUser) return;
    setCartLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/cart/update`, {
        userId: currentUser._id,
        productId: productId,
        quantity: quantity
      });
      setCart(response.data.items);
    } catch (error) {
      alert('Error updating cart: ' + error.message);
    }
    setCartLoading(false);
  };

  const removeFromCart = async (productId) => {
    if (!currentUser) return;
    setCartLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/cart/remove`, {
        data: {
          userId: currentUser._id,
          productId: productId
        }
      });
      setCart(response.data.items);
    } catch (error) {
      alert('Error removing from cart: ' + error.message);
    }
    setCartLoading(false);
  };

  const fetchCart = async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart/${currentUser._id}`);
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const placeOrder = async () => {
    if (!currentUser || cart.length === 0) return;
    setCartLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders/create`, {
        userId: currentUser._id
      });
      setOrders([response.data, ...orders]);
      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      alert('Error placing order: ' + error.message);
    }
    setCartLoading(false);
  };

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/user/${currentUser._id}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  // Soil analysis functions
  const uploadSoilReport = async (formData) => {
    if (!currentUser) return;
    setAnalysisLoading(true);
    try {
      formData.append('userId', currentUser._id);
      const response = await axios.post(`${API_BASE_URL}/api/soil-analysis/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Start polling for results
      pollAnalysisStatus(response.data.analysisId);
      
      return response.data;
    } catch (error) {
      console.error('Error uploading soil report:', error);
      throw error;
    }
  };

  const pollAnalysisStatus = async (analysisId) => {
    const maxAttempts = 60; // 60 seconds max
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/soil-analysis/${analysisId}`);
        const analysis = response.data;
        
        if (analysis.status === 'completed') {
          setCurrentAnalysis(analysis);
          setAnalysisLoading(false);
          fetchSoilAnalyses(); // Refresh the list
        } else if (analysis.status === 'failed') {
          setAnalysisLoading(false);
          alert('Analysis failed: ' + analysis.errorMessage);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000); // Poll every second
        } else {
          setAnalysisLoading(false);
          alert('Analysis timed out. Please try again.');
        }
      } catch (error) {
        console.error('Error polling analysis status:', error);
        setAnalysisLoading(false);
      }
    };
    
    poll();
  };

  const fetchSoilAnalyses = async () => {
    if (!currentUser) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/soil-analysis/user/${currentUser._id}`);
      setSoilAnalyses(response.data);
    } catch (error) {
      console.error('Error fetching soil analyses:', error);
    }
  };

  const deleteSoilAnalysis = async (analysisId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/soil-analysis/${analysisId}`);
      fetchSoilAnalyses();
      if (currentAnalysis && currentAnalysis._id === analysisId) {
        setCurrentAnalysis(null);
      }
    } catch (error) {
      console.error('Error deleting soil analysis:', error);
    }
  };

  // Farmer's Store functions
  const fetchFarmerProducts = async () => {
    if (!currentUser || currentUser.role !== 'farmer') return;
    setStoreLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/farmer-products/farmer/${currentUser._id}`);
      setFarmerProducts(response.data);
    } catch (error) {
      console.error('Error fetching farmer products:', error);
    } finally {
      setStoreLoading(false);
    }
  };

  const addFarmerProduct = async (productData) => {
    if (!currentUser) return;
    setStoreLoading(true);
    try {
      productData.append('farmerId', currentUser._id);
      await axios.post(`${API_BASE_URL}/api/farmer-products`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchFarmerProducts(); // Refresh the list
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + (error.response?.data?.error || 'Server error'));
    } finally {
      setStoreLoading(false);
    }
  };
  
  const updateFarmerProduct = async (productId, productData) => {
    setStoreLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/farmer-products/${productId}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchFarmerProducts(); // Refresh the list
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + (error.response?.data?.error || 'Server error'));
    } finally {
      setStoreLoading(false);
    }
  };

  const deleteFarmerProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setStoreLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/farmer-products/${productId}`);
      await fetchFarmerProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setStoreLoading(false);
    }
  };

  // Marketplace functions
  const fetchMarketplaceProducts = async () => {
    try {
      setMarketplaceLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/farmer-products`);
      setMarketplaceProducts(response.data);
    } catch (error) {
      console.error('Error fetching marketplace products:', error);
      alert('Error fetching products: ' + (error.response?.data?.error || error.message));
    } finally {
      setMarketplaceLoading(false);
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch data from backend when user logs in
  useEffect(() => {
    if (currentUser) {
      // Set the default tab based on user role
      if (currentUser.role === 'customer') {
        setActiveTab('marketplace');
      } else {
        setActiveTab('chat');
      }

      // Fetch expenses
      axios.get(`${API_BASE_URL}/api/expenses/user/${currentUser._id}`)
        .then(res => setExpenses(res.data))
        .catch(() => setExpenses([]));
      // Fetch tractor logs
      axios.get(`${API_BASE_URL}/api/tractor/user/${currentUser._id}`)
        .then(res => setTractorLogs(res.data))
        .catch(() => setTractorLogs([]));
      // Fetch reminders
      axios.get(`${API_BASE_URL}/api/reminders/user/${currentUser._id}`)
        .then(res => setReminders(res.data))
        .catch(() => setReminders([]));
      // Fetch crops
      fetchCrops();
      // Fetch revenues
      axios.get(`${API_BASE_URL}/api/expenses/revenue/user/${currentUser._id}`)
        .then(res => setRevenues(res.data))
        .catch(() => setRevenues([]));
      // Fetch e-commerce data
      fetchProducts();
      fetchCart();
      fetchOrders();
      // Fetch soil analyses
      fetchSoilAnalyses();
      // Fetch farmer products if user is a farmer
      if (currentUser.role === 'farmer') {
        fetchFarmerProducts();
      }
      // Fetch marketplace products for all users
      fetchMarketplaceProducts();
    }
  }, [currentUser]);

  const handleMicClick = async () => {
    if (recording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setRecording(false);
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording.');
        return;
      }
      if (!window.MediaRecorder || !MediaRecorder.isTypeSupported('audio/webm')) {
        alert('Your browser does not support audio/webm recording. Please use a modern browser like Chrome or Firefox.');
        return;
      }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setRecording(true);
        audioChunksRef.current = []; // Clear previous recording chunks

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
          };

        recorder.onstop = async () => {
          console.log('Recording stopped. Creating blob.');
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop()); // Release microphone

          if (audioBlob.size < 1024) {
            alert('Recording seems too short. Please try speaking for a bit longer.');
              return;
            }

            const formData = new FormData();
          formData.append('audio', audioBlob, 'voice-message.webm');
            formData.append('language', selectedSpeechLang);

          try {
            console.log('Sending audio to server for transcription...');
            const res = await axios.post(`${API_BASE_URL}/api/speech-to-text`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
              });
            console.log('Server response received:', res.data);
            const { transcript } = res.data;
            if (transcript) {
              console.log('Transcript received:', transcript);
              console.log('Setting chat message state and ref value.');
              setChatMessage(transcript);
              if (chatInputRef.current) {
                chatInputRef.current.value = transcript;
              }
              } else {
              console.log('No transcript in server response.');
              alert('Received a response, but it contained no text. Please try again.');
              }
            } catch (err) {
            console.error('Speech-to-text error:', err);
            alert('Error converting speech to text. ' + (err.response?.data?.error || 'Please try again.'));
            }
          };

        recorder.start();
        } catch (err) {
        setRecording(false);
        console.error('Microphone access error:', err);
        alert('Could not access microphone. Please check permissions and try again.');
      }
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) setAudioChunksRef.current.push(e.data);
      };
    }
  }, [mediaRecorderRef]);

  const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="App">
      {!currentUser ? (
        <UserForm
          userForm={userForm}
          setUserForm={setUserForm}
          handleUserSubmit={handleUserSubmit}
          loading={loading}
        />
      ) : (
        <MainApp
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          chatHistory={chatHistory}
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          handleChatSubmit={handleChatSubmit}
          loading={loading}
          expenses={expenses}
          expenseForm={expenseForm}
          setExpenseForm={setExpenseForm}
          handleExpenseSubmit={handleExpenseSubmit}
          tractorLogs={tractorLogs}
          tractorForm={tractorForm}
          setTractorForm={setTractorForm}
          handleTractorSubmit={handleTractorSubmit}
          reminders={reminders}
          reminderForm={reminderForm}
          setReminderForm={setReminderForm}
          handleReminderSubmit={handleReminderSubmit}
          crops={crops}
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          cropInfo={cropInfo}
          plantingDate={plantingDate}
          setPlantingDate={setPlantingDate}
          getCropInfo={getCropInfo}
          createCropSchedule={createCropSchedule}
          weatherLocation={weatherLocation}
          setWeatherLocation={setWeatherLocation}
          weatherLang={weatherLang}
          setWeatherLang={setWeatherLang}
          weatherData={weatherData}
          weatherLoading={weatherLoading}
          fetchWeather={fetchWeather}
          revenues={revenues}
          revenueForm={revenueForm}
          setRevenueForm={setRevenueForm}
          handleRevenueSubmit={handleRevenueSubmit}
          products={products}
          cart={cart}
          orders={orders}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          productLoading={productLoading}
          cartLoading={cartLoading}
          addToCart={addToCart}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          placeOrder={placeOrder}
          handleMicClick={handleMicClick}
          fileInputRef={fileInputRef}
          recording={recording}
          selectedSpeechLang={selectedSpeechLang}
          setSelectedSpeechLang={setSelectedSpeechLang}
          soilAnalyses={soilAnalyses}
          currentAnalysis={currentAnalysis}
          analysisLoading={analysisLoading}
          uploadSoilReport={uploadSoilReport}
          deleteSoilAnalysis={deleteSoilAnalysis}
          diseaseAnalysis={diseaseAnalysis}
          setDiseaseAnalysis={setDiseaseAnalysis}
          diseaseLoading={diseaseLoading}
          setDiseaseLoading={setDiseaseLoading}
          farmerProducts={farmerProducts}
          storeLoading={storeLoading}
          addFarmerProduct={addFarmerProduct}
          updateFarmerProduct={updateFarmerProduct}
          deleteFarmerProduct={deleteFarmerProduct}
          marketplaceProducts={marketplaceProducts}
          marketplaceLoading={marketplaceLoading}
          livePrices={livePrices}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
}

function UserForm({ userForm, setUserForm, handleUserSubmit, loading }) {
  const [step, setStep] = React.useState(1); // 1: phone+pin, 2: name+role (new user)
  const [showRole, setShowRole] = React.useState(false);
  const [pinError, setPinError] = React.useState('');
  const [wrongPin, setWrongPin] = React.useState(false);
  const [localPhone, setLocalPhone] = React.useState('');
  const [localPin, setLocalPin] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');

  // Step 1: Check user and pin
  const handleStep1 = async (e) => {
    e.preventDefault();
    setWrongPin(false);
    setPinError('');
    setPhoneError('');
    if (!/^\d{10}$/.test(localPhone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    if (localPin.length !== 6) {
      setPinError('PIN must be 6 digits');
      return;
    }
    try {
      // Check if user exists
      const res = await fetch(`http://localhost:5000/api/users/check?phone=${encodeURIComponent(localPhone)}`);
      const data = await res.json();
      if (data.exists) {
        // Try login
        try {
          const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: localPhone, pin: localPin })
          });
          if (response.status === 401) {
            setWrongPin(true);
            return;
          }
          if (!response.ok) {
            const err = await response.json();
            alert('Error: ' + (err.error || 'Login failed'));
            return;
          }
          const user = await response.json();
          localStorage.setItem('user', JSON.stringify(user));
          window.location.reload();
        } catch (err) {
          alert('Error logging in.');
        }
      } else {
        // New user, go to step 2
        setShowRole(true);
        setStep(2);
        setUserForm({ ...userForm, phone: localPhone, pin: localPin, language: userForm.language || 'en' });
      }
    } catch (err) {
      alert('Error checking user.');
    }
  };

  // Step 2: Register new user
  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.role) {
      alert('Please enter your name and select a role.');
      return;
    }
    try {
      await handleUserSubmit(e, setWrongPin);
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #f8fafc 0%, #e3e9f7 100%)' }}>
      <div style={{ display: 'flex', background: 'white', width: '100%' }}>
        {/* Left: Features/Benefits */}
        <div style={{ flex: 1.2, padding: '48px 36px', background: 'linear-gradient(135deg, #e3e9f7 0%, #f8fafc 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#2c5530', marginBottom: 12 }}>Farm.co</h1>
          <p style={{ fontSize: 18, color: '#444', marginBottom: 32 }}>Track, manage, and grow your farm with real-time insights, smart tools, and market intelligence.</p>
          <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, color: '#2c5530', fontWeight: 700, marginBottom: 6 }}>🌦️ Weather Alerts</div>
              <div style={{ color: '#555' }}>Get accurate weather forecasts and alerts for your farm location.</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, color: '#2c5530', fontWeight: 700, marginBottom: 6 }}>🧪 Soil Health</div>
              <div style={{ color: '#555' }}>Analyze soil reports and get crop & fertilizer recommendations.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, color: '#2c5530', fontWeight: 700, marginBottom: 6 }}>🛒 Market Prices</div>
              <div style={{ color: '#555' }}>Check live government prices and sell your produce in the marketplace.</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, color: '#2c5530', fontWeight: 700, marginBottom: 6 }}>💬 AI Chat</div>
              <div style={{ color: '#555' }}>Get instant answers and advice for all your farming questions.</div>
            </div>
          </div>
          <div style={{ background: '#f8f9fa', borderRadius: 12, padding: 18, marginTop: 12 }}>
            <div style={{ fontWeight: 700, color: '#2c5530', fontSize: 18, marginBottom: 6 }}>Why Choose Farm.co?</div>
            <ul style={{ color: '#444', fontSize: 15, margin: 0, paddingLeft: 20 }}>
              <li>All-in-one farm management dashboard</li>
              <li>Expense, revenue, and reminder tracking</li>
              <li>Soil, weather, and disease analysis</li>
              <li>Marketplace for buying & selling produce</li>
              <li>Multilingual support (English, Hindi, Telugu)</li>
            </ul>
          </div>
        </div>
        {/* Right: Login Form */}
        <div style={{ flex: 1, padding: '48px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'white' }}>
          <h2 style={{ fontWeight: 800, color: '#2c5530', marginBottom: 8 }}>Sign In</h2>
          <div style={{ color: '#666', marginBottom: 28 }}>Access your Farm.co dashboard</div>
          {step === 1 && (
            <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <input
          type="tel"
          placeholder="Enter your phone number"
          value={localPhone}
          onChange={e => {
            if (/^\d{0,10}$/.test(e.target.value)) setLocalPhone(e.target.value);
            setPhoneError('');
          }}
          required
          maxLength={10}
          minLength={10}
          style={{ padding: 14, borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16 }}
        />
        <input
                type="password"
                placeholder="6-digit PIN"
                value={localPin}
                onChange={e => {
                  if (/^\d{0,6}$/.test(e.target.value)) setLocalPin(e.target.value);
                  setWrongPin(false);
                }}
          required
                maxLength={6}
                minLength={6}
                style={{ padding: 14, borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16, letterSpacing: 4 }}
              />
              {pinError && <div style={{ color: 'red', fontSize: 14 }}>{pinError}</div>}
              {wrongPin && <div style={{ color: 'red', fontSize: 13, marginTop: -12 }}>Wrong PIN. Please try again.</div>}
              {phoneError && <div style={{ color: 'red', fontSize: 14 }}>{phoneError}</div>}
              <button
                type="submit"
                disabled={loading || (localPin.length !== 6)}
                style={{ background: 'linear-gradient(90deg, #28a745 0%, #2c5530 100%)', color: 'white', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '14px 0', marginTop: 8, cursor: 'pointer', boxShadow: '0 2px 8px rgba(44,85,48,0.08)' }}
              >
                {loading ? 'Checking...' : 'Next'}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <input
          type="text"
                placeholder="Enter your name"
                value={userForm.name || ''}
                onChange={e => setUserForm({ ...userForm, name: e.target.value })}
          required
                style={{ padding: 14, borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16 }}
        />
        <select
                value={userForm.role || 'farmer'}
                onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                style={{ padding: 14, borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16 }}
                required
              >
                <option value="farmer">Farmer</option>
                <option value="customer">Customer</option>
        </select>
              <button
                type="submit"
                disabled={loading || !userForm.name || !userForm.role}
                style={{ background: 'linear-gradient(90deg, #28a745 0%, #2c5530 100%)', color: 'white', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '14px 0', marginTop: 8, cursor: 'pointer', boxShadow: '0 2px 8px rgba(44,85,48,0.08)' }}
              >
                {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
          )}
        </div>
      </div>
    </div>
  );
}

function MainApp({
  currentUser,
  setCurrentUser,
  activeTab,
  setActiveTab,
  chatHistory,
  chatMessage,
  setChatMessage,
  handleChatSubmit,
  loading,
  expenses,
  expenseForm,
  setExpenseForm,
  handleExpenseSubmit,
  tractorLogs,
  tractorForm,
  setTractorForm,
  handleTractorSubmit,
  reminders,
  reminderForm,
  setReminderForm,
  handleReminderSubmit,
  crops,
  selectedCrop,
  setSelectedCrop,
  cropInfo,
  plantingDate,
  setPlantingDate,
  getCropInfo,
  createCropSchedule,
  weatherLocation,
  setWeatherLocation,
  weatherLang,
  setWeatherLang,
  weatherData,
  weatherLoading,
  fetchWeather,
  revenues,
  revenueForm,
  setRevenueForm,
  handleRevenueSubmit,
  products,
  cart,
  orders,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  productLoading,
  cartLoading,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  placeOrder,
  handleMicClick,
  fileInputRef,
  recording,
  selectedSpeechLang,
  setSelectedSpeechLang,
  soilAnalyses,
  currentAnalysis,
  analysisLoading,
  uploadSoilReport,
  deleteSoilAnalysis,
  diseaseAnalysis,
  setDiseaseAnalysis,
  diseaseLoading,
  setDiseaseLoading,
  farmerProducts,
  storeLoading,
  addFarmerProduct,
  updateFarmerProduct,
  deleteFarmerProduct,
  marketplaceProducts,
  marketplaceLoading,
  livePrices,
  theme,
  setTheme
}) {
  const isFarmer = currentUser.role === 'farmer';
  // Sidebar categories
  const sidebarLinks = [
    { key: 'chat', label: 'AI Chat', icon: '💬', show: isFarmer },
    { key: 'expenses', label: 'Expenses', icon: '💰', show: isFarmer },
    { key: 'soil', label: 'Soil Health', icon: '🧪', show: isFarmer },
    { key: 'reminders', label: 'Reminders', icon: '⏰', show: isFarmer },
    { key: 'weather', label: 'Weather', icon: '🌦️', show: isFarmer },
    { key: 'ecommerce', label: 'General Store', icon: '🛒', show: isFarmer },
    { key: 'disease', label: 'Disease Detection', icon: '🌿', show: isFarmer },
    { key: 'marketplace', label: "Farmer's Market", icon: '🧑‍🌾', show: true },
    { key: 'my-store', label: 'My Farm Store', icon: '🏪', show: isFarmer },
    { key: 'govt-prices', label: 'Live Govt Prices', icon: '📈', show: currentUser.role === 'customer' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e3e9f7 100%)' }}>
      {/* Fixed Sidebar */}
      <aside style={{
        width: 240,
        background: 'linear-gradient(135deg, #e3e9f7 0%, #f8fafc 100%)',
        boxShadow: '2px 0 12px #e3e9f7',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0',
        gap: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        height: '100vh',
      }}>
        <div style={{ fontWeight: 500, fontSize: 28, color: '#2c5530', textAlign: 'center', marginBottom: 36, letterSpacing: 1 }}>🌾<span style={{ color: '#2c5530' }}> Farms.Co</span></div>
        {sidebarLinks.filter(link => link.show).map(link => (
          <button
            key={link.key}
            onClick={() => setActiveTab(link.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              width: '100%',
              background: activeTab === link.key ? 'linear-gradient(90deg, #28a745 0%, #2c5530 100%)' : 'transparent',
              color: activeTab === link.key ? 'white' : '#2c5530',
              border: 'none',
              borderRadius: 0,
              fontWeight: 300,
              fontSize: 18,
              padding: '18px 32px',
              cursor: 'pointer',
              marginBottom: 2,
              transition: 'background 0.2s, color 0.2s',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 22 }}>{link.icon}</span> {link.label}
          </button>
        ))}
      </aside>
      {/* Main Content Area (fills screen, no box) */}
      <div style={{ flex: 1, marginLeft: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Fixed Top Bar */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 240,
          right: 0,
          height: 72,
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          boxShadow: '0 2px 8px rgba(44,85,48,0.04)',
          zIndex: 101,
        }}>
          <div style={{ fontSize: 28, fontWeight: 400, color: '#2c5530', letterSpacing: 1 }}>
            {sidebarLinks.find(l => l.key === activeTab)?.icon} {sidebarLinks.find(l => l.key === activeTab)?.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ color: '#2c5530', fontWeight: 700, fontSize: 18 }}>Welcome, {currentUser.name}</span>
            <button
              onClick={() => {
            setCurrentUser(null);
            localStorage.removeItem('user');
              }}
              style={{ background: 'linear-gradient(90deg, #28a745 0%, #2c5530 100%)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(44,85,48,0.08)' }}
            >
              Logout
            </button>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{ background: 'transparent', color: '#2c5530', border: 'none', cursor: 'pointer' }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </div>
      </header>
        {/* Main Page Content (fills screen, below top bar) */}
        <main className="main-content" style={{ flex: 1, marginTop: 72, padding: '32px 48px', background: 'white', minHeight: 'calc(100vh - 72px)', boxSizing: 'border-box' }}>
          {/* ...existing page content logic... */}
          {activeTab === 'chat' && currentUser?.role !== 'customer' && (
            <ChatInterface
              chatHistory={chatHistory}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              handleChatSubmit={handleChatSubmit}
              loading={loading}
              handleMicClick={handleMicClick}
              fileInputRef={fileInputRef}
              recording={recording}
              selectedSpeechLang={selectedSpeechLang}
              setSelectedSpeechLang={setSelectedSpeechLang}
            />
          )}
          {activeTab === 'expenses' && isFarmer && <ExpenseInterface expenses={expenses} expenseForm={expenseForm} setExpenseForm={setExpenseForm} handleExpenseSubmit={handleExpenseSubmit} loading={loading} revenues={revenues} revenueForm={revenueForm} setRevenueForm={setRevenueForm} handleRevenueSubmit={handleRevenueSubmit} />}
          {activeTab === 'soil' && isFarmer && (
            <SoilHealthAnalysis
              soilAnalyses={soilAnalyses}
              currentAnalysis={currentAnalysis}
              analysisLoading={analysisLoading}
              uploadSoilReport={uploadSoilReport}
              deleteSoilAnalysis={deleteSoilAnalysis}
            />
          )}
          {activeTab === 'reminders' && currentUser?.role !== 'customer' && <ReminderInterface reminders={reminders} reminderForm={reminderForm} setReminderForm={setReminderForm} handleReminderSubmit={handleReminderSubmit} loading={loading} crops={crops} selectedCrop={selectedCrop} setSelectedCrop={setSelectedCrop} cropInfo={cropInfo} plantingDate={plantingDate} setPlantingDate={setPlantingDate} getCropInfo={getCropInfo} createCropSchedule={createCropSchedule} />}
          {activeTab === 'weather' && currentUser?.role !== 'customer' && <WeatherInterface weatherLocation={weatherLocation} setWeatherLocation={setWeatherLocation} weatherLang={weatherLang} setWeatherLang={setWeatherLang} weatherData={weatherData} weatherLoading={weatherLoading} fetchWeather={fetchWeather} />}
          {activeTab === 'ecommerce' && currentUser?.role !== 'customer' && <EcommerceInterface products={products} cart={cart} orders={orders} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} productLoading={productLoading} cartLoading={cartLoading} addToCart={addToCart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} placeOrder={placeOrder} />}
          {activeTab === 'disease' && currentUser?.role !== 'customer' && (
            <CropDiseaseDetection 
              analysis={diseaseAnalysis}
              setAnalysis={setDiseaseAnalysis}
              loading={diseaseLoading}
              setLoading={setDiseaseLoading}
            />
          )}
          {activeTab === 'marketplace' && (
            <Marketplace 
              products={marketplaceProducts}
              loading={marketplaceLoading}
            />
          )}
          {activeTab === 'my-store' && isFarmer && (
            <MyFarmStore 
              products={farmerProducts}
              loading={storeLoading}
              onAddProduct={addFarmerProduct}
              onUpdateProduct={updateFarmerProduct}
              onDeleteProduct={deleteFarmerProduct}
            />
          )}
          {activeTab === 'govt-prices' && currentUser?.role === 'customer' && (
            <LiveGovtPrices prices={livePrices} />
          )}
      </main>
      </div>
    </div>
  );
}

function ChatInterface({ chatHistory, chatMessage, setChatMessage, handleChatSubmit, loading, handleMicClick, fileInputRef, recording, selectedSpeechLang, setSelectedSpeechLang }) {
  return (
    <div className="chat-container">
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index} className="chat-message">
            <div className="user-message">
              <strong>You:</strong> {chat.question}
            </div>
            <div className="assistant-message">
              <strong>Assistant:</strong> {chat.answer}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className="chat-form">
        <input
          type="text"
          placeholder="Ask about farming..."
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          disabled={loading}
        />
        <select
          className="speech-lang-select"
          value={selectedSpeechLang}
          onChange={e => setSelectedSpeechLang(e.target.value)}
          style={{ marginRight: 8 }}
          disabled={loading || recording}
          title="Select language for speech"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
        </select>
        <button
          type="button"
          className="mic-btn"
          onClick={handleMicClick}
          disabled={loading}
          title={recording ? "Stop recording" : "Speak your question"}
          style={{ background: recording ? '#f59e42' : undefined }}
        >
          <span role="img" aria-label="mic">{recording ? '⏹️' : '🎤'}</span>
        </button>
        <button type="submit" disabled={loading || !chatMessage.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function ExpenseInterface({ expenses, expenseForm, setExpenseForm, handleExpenseSubmit, loading, revenues, revenueForm, setRevenueForm, handleRevenueSubmit }) {
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRevenues = revenues.reduce((acc, curr) => acc + curr.amount, 0);
  const profitLoss = totalRevenues - totalExpenses;

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all expenses and revenues? This cannot be undone.')) {
      try {
        // This should be an API call
        // await axios.delete(`/api/expenses/clear/user/${currentUser._id}`);
        alert('This should call an API to clear data. Feature in progress.');
      } catch (error) {
        alert('Error clearing data: ' + error.message);
      }
    }
  };

  return (
    <div className="expense-interface">
      <div className="expense-header">
        <h2>💰 Expense & Revenue Tracker</h2>
        <p>Monitor your farm's financial health by tracking expenses and revenues.</p>
      </div>

      <div className="expense-grid">
        {/* Column 1: Summary */}
        <div className="expense-column">
          <div className="summary-card">
            <h3>📊 Financial Summary</h3>
            <div className="summary-item">
              <span>Total Expenses</span>
              <span className="summary-value expense">₹{totalExpenses.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Total Revenue</span>
              <span className="summary-value revenue">₹{totalRevenues.toFixed(2)}</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-item total">
              <span>Profit / Loss</span>
              <span className={`summary-value ${profitLoss >= 0 ? 'profit' : 'loss'}`}>
                ₹{profitLoss.toFixed(2)}
              </span>
            </div>
            <p className={`profit-loss-status ${profitLoss >= 0 ? 'profit' : 'loss'}`}>
              {profitLoss >= 0 ? 'You are in Profit!' : 'You are in Loss!'}
            </p>
            <button onClick={clearAllData} className="clear-btn">
              Clear All Data
            </button>
          </div>
        </div>

        {/* Column 2: Forms */}
        <div className="expense-column">
          <div className="form-card">
            <h3>💸 Add New Expense</h3>
            <form onSubmit={handleExpenseSubmit} className="form">
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                <option value="Seeds">Seeds</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Pesticides">Pesticides</option>
                <option value="Labor">Labor</option>
                <option value="Machinery">Machinery</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={expenseForm.note}
                onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Expense'}
              </button>
            </form>
          </div>
          <div className="form-card">
            <h3>📈 Add New Revenue</h3>
            <form onSubmit={handleRevenueSubmit} className="form">
              <select
                value={revenueForm.category}
                onChange={(e) => setRevenueForm({ ...revenueForm, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                <option value="Crop Sale">Crop Sale</option>
                <option value="Produce Sale">Produce Sale</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={revenueForm.amount}
                onChange={(e) => setRevenueForm({ ...revenueForm, amount: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={revenueForm.note}
                onChange={(e) => setRevenueForm({ ...revenueForm, note: e.target.value })}
              />
              <input
                type="date"
                value={revenueForm.date}
                onChange={(e) => setRevenueForm({ ...revenueForm, date: e.target.value })}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Revenue'}
              </button>
            </form>
          </div>
        </div>

        {/* Column 3: Recent Transactions */}
        <div className="expense-column">
          <div className="list-card">
            <h3>🕒 Recent Expenses</h3>
            <div className="transaction-list">
              {expenses.length === 0 && <p className="empty-list">No expenses recorded yet.</p>}
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense._id} className="transaction-item expense">
                  <div className="transaction-details">
                    <span className="transaction-category">{expense.category}</span>
                    <span className="transaction-note">{expense.note}</span>
                  </div>
                  <div className="transaction-info">
                    <span className="transaction-amount">-₹{expense.amount.toFixed(2)}</span>
                    <span className="transaction-date">{new Date(expense.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="list-card">
            <h3>🕒 Recent Revenues</h3>
            <div className="transaction-list">
              {revenues.length === 0 && <p className="empty-list">No revenues recorded yet.</p>}
              {revenues.slice(0, 5).map((revenue) => (
                <div key={revenue._id} className="transaction-item revenue">
                  <div className="transaction-details">
                    <span className="transaction-category">{revenue.category}</span>
                    <span className="transaction-note">{revenue.note}</span>
                  </div>
                  <div className="transaction-info">
                    <span className="transaction-amount">+₹{revenue.amount.toFixed(2)}</span>
                    <span className="transaction-date">{new Date(revenue.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SoilHealthAnalysis({ soilAnalyses, currentAnalysis, analysisLoading, uploadSoilReport, deleteSoilAnalysis }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a valid file (JPEG, PNG, or PDF)');
        setFile(null);
        return;
      }
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('soilReport', file);
      
      await uploadSoilReport(formData);
      setFile(null);
      // Reset file input
      e.target.reset();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalysisSelect = (analysis) => {
    setSelectedAnalysis(analysis);
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (window.confirm('Are you sure you want to delete this soil analysis?')) {
      await deleteSoilAnalysis(analysisId);
      if (selectedAnalysis && selectedAnalysis._id === analysisId) {
        setSelectedAnalysis(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded': return '📤';
      case 'processing': return '⚙️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="soil-analysis-container">
      <div className="soil-header">
        <h2>🧪 Soil Health Analysis</h2>
        <p>Upload your soil test report (PDF or image) to get AI-powered fertilizer and crop recommendations</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h3>📁 Upload Soil Test Report</h3>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-container">
        <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="file-input"
              disabled={uploading || analysisLoading}
        />
            <div className="file-info">
              {file && (
                <div className="selected-file">
                  <span>📄 {file.name}</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={uploading || analysisLoading || !file}
            className="upload-btn"
          >
            {uploading ? '📤 Uploading...' : analysisLoading ? '⚙️ Processing...' : '🚀 Upload & Analyze'}
        </button>
      </form>
        
        {error && <div className="error-message">❌ {error}</div>}
            </div>

      {/* Current Analysis Display */}
      {currentAnalysis && currentAnalysis.status === 'completed' && (
        <div className="current-analysis">
          <h3>📊 Latest Analysis Results</h3>
          <div className="analysis-card">
            <div className="analysis-header">
              <h4>{currentAnalysis.fileName}</h4>
              <span className="analysis-date">{formatDate(currentAnalysis.createdAt)}</span>
            </div>
            
            {/* Soil Parameters */}
            {currentAnalysis.soilParameters && Object.keys(currentAnalysis.soilParameters).length > 0 && (
              <div className="soil-parameters">
                <h5>🌱 Soil Parameters</h5>
                <div className="parameters-grid">
                  {Object.entries(currentAnalysis.soilParameters).map(([key, value]) => (
                    <div key={key} className="parameter-item">
                      <span className="parameter-label">{key.toUpperCase()}</span>
                      <span className="parameter-value">{value}</span>
          </div>
        ))}
      </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="recommendations">
              {/* Fertilizers */}
              {currentAnalysis.recommendations && currentAnalysis.recommendations.fertilizers.length > 0 && (
                <div className="recommendation-section">
                  <h5>🌿 Fertilizer Recommendations</h5>
                  {currentAnalysis.recommendations.fertilizers.map((fertilizer, index) => (
                    <div key={index} className="recommendation-item">
                      <h6>{fertilizer.name}</h6>
                      <p>{fertilizer.description}</p>
                      <div className="recommendation-details">
                        <span><strong>Rate:</strong> {fertilizer.applicationRate}</span>
                        <span><strong>Timing:</strong> {fertilizer.timing}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Crops */}
              {currentAnalysis.recommendations && currentAnalysis.recommendations.crops.length > 0 && (
                <div className="recommendation-section">
                  <h5>🌾 Crop Recommendations</h5>
                  {currentAnalysis.recommendations.crops.map((crop, index) => (
                    <div key={index} className="recommendation-item">
                      <h6>{crop.name} - <span className={`suitability ${crop.suitability.toLowerCase()}`}>{crop.suitability}</span></h6>
                      <ul>
                        {crop.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Soil Amendments */}
              {currentAnalysis.recommendations && currentAnalysis.recommendations.soilAmendments.length > 0 && (
                <div className="recommendation-section">
                  <h5>🏗️ Soil Amendments</h5>
                  {currentAnalysis.recommendations.soilAmendments.map((amendment, index) => (
                    <div key={index} className="recommendation-item">
                      <h6>{amendment.name}</h6>
                      <p>{amendment.description}</p>
                      <div className="recommendation-details">
                        <span><strong>Rate:</strong> {amendment.applicationRate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analysis History */}
      {soilAnalyses.length > 0 && (
        <div className="analysis-history">
          <h3>📋 Analysis History</h3>
          <div className="history-list">
            {soilAnalyses.map((analysis) => (
              <div 
                key={analysis._id} 
                className={`history-item ${selectedAnalysis?._id === analysis._id ? 'selected' : ''}`}
                onClick={() => handleAnalysisSelect(analysis)}
              >
                <div className="history-header">
                  <span className="status-icon">{getStatusIcon(analysis.status)}</span>
                  <span className="file-name">{analysis.fileName}</span>
                  <span className="analysis-date">{formatDate(analysis.createdAt)}</span>
                </div>
                <div className="history-status">
                  <span className={`status ${analysis.status}`}>{analysis.status}</span>
                  {analysis.status === 'failed' && (
                    <span className="error-text">{analysis.errorMessage}</span>
                  )}
                </div>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAnalysis(analysis._id);
                  }}
                  title="Delete analysis"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Analysis Details */}
      {selectedAnalysis && selectedAnalysis.status === 'completed' && (
        <div className="selected-analysis-details">
          <h3>📊 Analysis Details</h3>
          <div className="analysis-card">
            <div className="analysis-header">
              <h4>{selectedAnalysis.fileName}</h4>
              <span className="analysis-date">{formatDate(selectedAnalysis.createdAt)}</span>
            </div>
            
            {/* Soil Parameters */}
            {selectedAnalysis.soilParameters && Object.keys(selectedAnalysis.soilParameters).length > 0 && (
              <div className="soil-parameters">
                <h5>🌱 Soil Parameters</h5>
                <div className="parameters-grid">
                  {Object.entries(selectedAnalysis.soilParameters).map(([key, value]) => (
                    <div key={key} className="parameter-item">
                      <span className="parameter-label">{key.toUpperCase()}</span>
                      <span className="parameter-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="recommendations">
              {/* Fertilizers */}
              {selectedAnalysis.recommendations && selectedAnalysis.recommendations.fertilizers.length > 0 && (
                <div className="recommendation-section">
                  <h5>🌿 Fertilizer Recommendations</h5>
                  {selectedAnalysis.recommendations.fertilizers.map((fertilizer, index) => (
                    <div key={index} className="recommendation-item">
                      <h6>{fertilizer.name}</h6>
                      <p>{fertilizer.description}</p>
                      <div className="recommendation-details">
                        <span><strong>Rate:</strong> {fertilizer.applicationRate}</span>
                        <span><strong>Timing:</strong> {fertilizer.timing}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Crops */}
              {selectedAnalysis.recommendations && selectedAnalysis.recommendations.crops.length > 0 && (
                <div className="recommendation-section">
                  <h5>🌾 Crop Recommendations</h5>
                  {selectedAnalysis.recommendations.crops.map((crop, index) => (
                    <div key={index} className="recommendation-item">
                      <h6>{crop.name} - <span className={`suitability ${crop.suitability.toLowerCase()}`}>{crop.suitability}</span></h6>
                      <ul>
                        {crop.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Soil Amendments */}
              {selectedAnalysis.recommendations && selectedAnalysis.recommendations.soilAmendments.length > 0 && (
                <div className="recommendation-section">
                  <h5>🏗️ Soil Amendments</h5>
                  {selectedAnalysis.recommendations.soilAmendments.map((amendment, index) => (
                    <div key={index} className="recommendation-item">
                      <h6>{amendment.name}</h6>
                      <p>{amendment.description}</p>
                      <div className="recommendation-details">
                        <span><strong>Rate:</strong> {amendment.applicationRate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {analysisLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>🔬 Analyzing your soil test report...</p>
            <p className="loading-note">This may take up to 30 seconds</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ReminderInterface({ reminders, reminderForm, setReminderForm, handleReminderSubmit, loading, crops, selectedCrop, setSelectedCrop, cropInfo, plantingDate, setPlantingDate, getCropInfo, createCropSchedule }) {
  return (
    <div className="reminder-container">
      <div className="reminder-header">
        <h2>📱 Reminders & Crop Management</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Create manual reminders and automatic crop schedules with SMS notifications
        </p>
      </div>

      <div className="reminder-content">
        {/* Left Column - Manual Reminders */}
        <div className="reminder-left-column">
          <div className="reminder-section">
            <h3>⏰ Quick Reminder</h3>
            <form onSubmit={handleReminderSubmit} className="reminder-form">
              <input
                type="text"
                placeholder="What do you want to be reminded about?"
                value={reminderForm.message}
                onChange={(e) => setReminderForm({...reminderForm, message: e.target.value})}
                required
              />
              <input
                type="datetime-local"
                value={reminderForm.date}
                onChange={(e) => setReminderForm({...reminderForm, date: e.target.value})}
                required
              />
              <button type="submit" disabled={loading} className="reminder-btn">
                {loading ? 'Adding...' : '📱 Add Reminder'}
              </button>
            </form>
          </div>

          <div className="reminder-section">
            <h3>🌱 Crop Schedule</h3>
            <div className="crop-form">
              <select
                value={selectedCrop || ''}
                onChange={(e) => {
                  setSelectedCrop(e.target.value);
                  if (e.target.value) {
                    getCropInfo(e.target.value);
                  } else {
                    setCropInfo(null);
                  }
                }}
                className="crop-select"
              >
                <option value="">Select a Crop</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                  </option>
                ))}
              </select>
              
              {selectedCrop && (
                <div className="crop-schedule-inputs">
                  <input
                    type="date"
                    placeholder="Planting Date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="crop-date-input"
                  />
                  <button 
                    onClick={createCropSchedule} 
                    disabled={loading || !plantingDate}
                    className="crop-schedule-btn"
                  >
                    {loading ? 'Creating...' : '🌱 Create Schedule'}
                  </button>
                </div>
              )}
            </div>

            {/* Crop Information Display */}
            {cropInfo && (
              <div className="crop-info-compact">
                <h4>📋 {cropInfo.name} Guide</h4>
                <div className="crop-details">
                  <div className="crop-detail-item">
                    <span className="crop-detail-label">🌱 Planting:</span>
                    <span className="crop-detail-value">{cropInfo.plantingTime.description}</span>
                  </div>
                  <div className="crop-detail-item">
                    <span className="crop-detail-label">🌿 Fertilizer:</span>
                    <span className="crop-detail-value">{cropInfo.fertilizerSchedule.length} applications</span>
                  </div>
                  <div className="crop-detail-item">
                    <span className="crop-detail-label">💧 Watering:</span>
                    <span className="crop-detail-value">{cropInfo.wateringSchedule.length} schedules</span>
                  </div>
                  <div className="crop-detail-item">
                    <span className="crop-detail-label">📅 Duration:</span>
                    <span className="crop-detail-value">{cropInfo.growthDuration}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Reminders List */}
        <div className="reminder-right-column">
          <div className="reminder-section">
            <h3>📋 Your Reminders ({reminders.length})</h3>
            <div className="reminders-list">
              {reminders.length === 0 ? (
                <div className="empty-reminders">
                  <p>No reminders yet. Create your first reminder above!</p>
                </div>
              ) : (
                reminders.map((reminder, index) => (
                  <div key={index} className={`reminder-item ${reminder.reminderType !== 'manual' ? 'crop-reminder' : ''}`}>
                    <div className="reminder-item-header">
                      <div className="reminder-icon">
                        {reminder.reminderType === 'planting' ? '🌱' : 
                         reminder.reminderType === 'fertilizer' ? '🌿' : 
                         reminder.reminderType === 'watering' ? '💧' : '⏰'}
                      </div>
                      <div className="reminder-content">
                        <div className="reminder-message">{reminder.message}</div>
                        <div className="reminder-meta">
                          <span className="reminder-date">
                            {new Date(reminder.date).toLocaleDateString()} at {new Date(reminder.date).toLocaleTimeString()}
                          </span>
                          <span className={`reminder-status ${reminder.isSent ? 'sent' : 'pending'}`}>
                            {reminder.isSent ? '📱 Sent' : '⏳ Pending'}
                          </span>
                        </div>
                        {reminder.cropType && (
                          <div className="reminder-crop">
                            🌾 {reminder.cropType}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherInterface({ weatherLocation, setWeatherLocation, weatherLang, setWeatherLang, weatherData, weatherLoading, fetchWeather }) {
  // Helper to get weather icon by main description
  const getWeatherIcon = (main) => {
    switch (main) {
      case 'Rain': return '🌧️';
      case 'Clouds': return '☁️';
      case 'Clear': return '☀️';
      case 'Thunderstorm': return '⛈️';
      case 'Drizzle': return '🌦️';
      case 'Snow': return '❄️';
      case 'Mist':
      case 'Fog': return '🌫️';
      default: return '🌡️';
    }
  };
  return (
    <div className="weather-container">
      <h2>🌦️ Weather Forecast</h2>
      <div className="weather-form">
        <input
          type="text"
          placeholder="Enter village or city name"
          value={weatherLocation}
          onChange={e => setWeatherLocation(e.target.value)}
        />
        <select value={weatherLang} onChange={e => setWeatherLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
          <option value="mr">Marathi</option>
        </select>
        <button onClick={fetchWeather} disabled={weatherLoading}>
          {weatherLoading ? 'Loading...' : 'Get Forecast'}
        </button>
      </div>
      {weatherData && (
        <div className="weather-results">
          <h3 style={{textAlign:'center',marginBottom:18}}>7-Day Forecast</h3>
          <div className="weather-forecast-list">
            {weatherData.forecast.map((day, idx) => (
              <div key={idx} className="weather-forecast-item weather-forecast-item-small">
                <div className="weather-icon" style={{fontSize:'1.7rem',marginBottom:2}}>{getWeatherIcon(day.weather[0].main)}</div>
                <strong style={{fontSize:'1rem',marginBottom:2}}>{new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                <div className="weather-temp" style={{fontSize:'1.3rem',fontWeight:600,color:'#3b82f6',marginBottom:2}}>{Math.round(day.temp.day)}°C</div>
                <div className="weather-desc" style={{fontSize:'0.95rem',color:'#6366f1',marginBottom:2}}>{day.weather[0].main}</div>
                <div className="weather-rain" style={{fontSize:'0.95rem',color:'#20c997',marginBottom:2}}>🌧️ {day.rain || 0} mm</div>
                <div className="weather-wind" style={{fontSize:'0.95rem',color:'#6366f1',marginBottom:2}}>💨 {day.wind_speed} m/s</div>
                <div style={{fontSize:'0.85rem',color:'#888'}}>Humidity: {day.humidity}%</div>
              </div>
            ))}
          </div>
          <h3 style={{textAlign:'center',marginBottom:8}}>Weather Alerts</h3>
          {weatherData.alerts.length === 0 && <div style={{textAlign:'center',color:'#888'}}>No alerts.</div>}
          {weatherData.alerts.map((alert, idx) => (
            <div key={idx} className="weather-alert" style={{margin:'12px auto',maxWidth:600,background:'#fffbe7',borderRadius:10,padding:14,boxShadow:'0 2px 8px #ffe08255'}}>
              <div style={{color:'#e67e22',fontWeight:600}}>{alert.message}</div>
              {alert.ttsUrl && (
                <audio controls src={`http://localhost:5000${alert.ttsUrl}`}></audio>
              )}
            </div>
          ))}
          <h3 style={{textAlign:'center',marginBottom:8}}>Optimal Sowing Days</h3>
          {weatherData.optimalSowingDays.length === 0 && <div style={{textAlign:'center',color:'#888'}}>No optimal days found.</div>}
          <ul style={{display:'flex',justifyContent:'center',gap:12,flexWrap:'wrap',padding:0,listStyle:'none'}}>
            {weatherData.optimalSowingDays.map((date, idx) => (
              <li key={idx} style={{background:'#e3e9f7',color:'#6366f1',padding:'8px 16px',borderRadius:8,fontWeight:600}}>{date}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EcommerceInterface({ products, cart, orders, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, productLoading, cartLoading, addToCart, updateCartQuantity, removeFromCart, placeOrder }) {
  const [activeSection, setActiveSection] = useState('products');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Fake payment handler
  const handleFakePayment = async (orderId, success) => {
    setPaymentLoading(true);
    if (success) {
      // Simulate payment success: update order status
      try {
        await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: 'processing' });
        window.alert('Payment successful! Order status updated.');
        setShowPaymentModal(false);
        setPayingOrderId(null);
        // Optionally, refresh orders
        // (You may want to pass fetchOrders as a prop for best practice)
        window.location.reload();
      } catch (err) {
        window.alert('Failed to update order status.');
      }
    } else {
      window.alert('Payment failed. Please try again.');
      setShowPaymentModal(false);
      setPayingOrderId(null);
    }
    setPaymentLoading(false);
  };

  return (
    <div className="ecommerce-container">
      {/* Header with navigation */}
      <div className="ecommerce-header">
        <h2>🌾 Farmer's Market</h2>
        <div className="ecommerce-nav">
          <button 
            className={activeSection === 'products' ? 'active' : ''} 
            onClick={() => setActiveSection('products')}
          >
            🛍️ Products
          </button>
          <button 
            className={activeSection === 'cart' ? 'active' : ''} 
            onClick={() => setActiveSection('cart')}
          >
            🛒 Cart ({cart.length})
          </button>
          <button 
            className={activeSection === 'orders' ? 'active' : ''} 
            onClick={() => setActiveSection('orders')}
          >
            📦 Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Products Section */}
      {activeSection === 'products' && (
        <div className="products-section">
          {/* Filters */}
          <div className="filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {productLoading ? (
              <div className="loading">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products">No products found</div>
            ) : (
              filteredProducts.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-details">
                      <span className="product-category">{product.category}</span>
                      <span className="product-price">₹{product.price}</span>
                    </div>
                    <div className="product-actions">
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCart(product._id)}
                        disabled={cartLoading}
                      >
                        {cartLoading ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cart Section */}
      {activeSection === 'cart' && (
        <div className="cart-section">
          <h3>Shopping Cart</h3>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <button onClick={() => setActiveSection('products')}>Browse Products</button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.product._id} className="cart-item">
                    <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h4>{item.product.name}</h4>
                      <p>₹{item.product.price}</p>
                    </div>
                    <div className="cart-item-quantity">
                      <button 
                        onClick={() => updateCartQuantity(item.product._id, Math.max(0, item.quantity - 1))}
                        disabled={cartLoading}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                        disabled={cartLoading}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-total">
                      ₹{item.product.price * item.quantity}
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.product._id)}
                      disabled={cartLoading}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <div className="cart-total">
                  <strong>Total: ₹{cartTotal}</strong>
                </div>
                <button 
                  className="checkout-btn"
                  onClick={placeOrder}
                  disabled={cartLoading}
                >
                  {cartLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Orders Section */}
      {activeSection === 'orders' && (
        <div className="orders-section">
          <h3>Order History</h3>
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>No orders yet</p>
              <button onClick={() => setActiveSection('products')}>Start Shopping</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <h4>Order #{order._id.slice(-6)}</h4>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-items">
                    {order.items.map(item => (
                      <div key={item.product._id} className="order-item">
                        <img src={item.product.image} alt={item.product.name} />
                        <div>
                          <h5>{item.product.name}</h5>
                          <p>Qty: {item.quantity} × ₹{item.product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>Total: ₹{order.total}</strong>
                    <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                  {/* Show Pay Now button for pending orders */}
                  {order.status === 'pending' && (
                    <button
                      className="checkout-btn"
                      style={{ marginTop: 10, background: '#ffb300' }}
                      onClick={() => {
                        setShowPaymentModal(true);
                        setPayingOrderId(order._id);
                      }}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fake Payment Modal */}
      {showPaymentModal && (
        <div className="fake-payment-modal">
          <div className="fake-payment-content">
            <h3>Demo Payment Gateway</h3>
            <p>This is a fake payment for demo purposes only.</p>
            <button
              className="checkout-btn"
              style={{ background: '#43a047', marginRight: 10 }}
              disabled={paymentLoading}
              onClick={() => handleFakePayment(payingOrderId, true)}
            >
              {paymentLoading ? 'Processing...' : 'Simulate Success'}
            </button>
            <button
              className="checkout-btn"
              style={{ background: '#e53935' }}
              disabled={paymentLoading}
              onClick={() => handleFakePayment(payingOrderId, false)}
            >
              Simulate Failure
            </button>
            <button
              style={{ marginLeft: 20, background: '#888', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
              disabled={paymentLoading}
              onClick={() => { setShowPaymentModal(false); setPayingOrderId(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CropDiseaseDetection({ analysis, setAnalysis, loading, setLoading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a JPEG or PNG image.');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        setError('File is too large. Maximum size is 5MB.');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      setAnalysis(null);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('plantImage', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/disease-detection/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysis(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An unknown error occurred.';
      setError(`Analysis Failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="disease-detection-container">
      <div className="disease-header">
        <h2>🌿 Crop Disease Detection</h2>
        <p>Upload an image of a plant leaf to detect diseases and get treatment advice.</p>
      </div>

      <div className="disease-upload-section">
        {!preview && (
          <div className="file-drop-area">
            <input 
              type="file" 
              accept="image/png, image/jpeg"
              onChange={handleFileChange} 
              ref={fileInputRef}
              className="file-input"
            />
            <div className="file-drop-text">
              <span className="file-drop-icon">🖼️</span>
              <p>Drag & drop an image here, or click to select a file</p>
              <p className="file-drop-hint">PNG or JPG, up to 5MB</p>
            </div>
          </div>
        )}
        
        {preview && (
          <div className="image-preview-container">
            <img src={preview} alt="Selected plant leaf" className="image-preview" />
            <div className="image-actions">
              <button onClick={handleAnalyzeClick} disabled={loading} className="analyze-button">
                {loading ? 'Analyzing...' : '🔍 Analyze Plant'}
              </button>
              <button onClick={handleRemoveImage} className="remove-button" title="Remove image">✖</button>
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {loading && (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Analyzing image, this may take a moment...</p>
        </div>
      )}

      {analysis && (
        <div className="disease-results-container">
          <h3>Analysis Results</h3>
          <div className="result-card">
            <div className="result-header">
              <h4>{analysis.plantName}</h4>
              <span className={`health-status ${analysis.isHealthy ? 'healthy' : 'unhealthy'}`}>
                {analysis.isHealthy ? '✔️ Healthy' : '⚠️ Unhealthy'}
              </span>
            </div>
            
            {!analysis.isHealthy && analysis.diseases.length > 0 ? (
              <div className="diseases-list">
                {analysis.diseases.map((disease, index) => (
                  <div key={index} className="disease-item">
                    <h5>{disease.name} <span className="disease-probability">({(disease.probability * 100).toFixed(0)}% confidence)</span></h5>
                    {disease.description && <p className="disease-description">{disease.description}</p>}
                    
                    {disease.treatment && (
                      <div className="treatment-section">
                        <h6>🧪 Treatment Suggestions</h6>
                        {disease.treatment.biological && (
                           <div className="treatment-card">
                             <strong>Biological:</strong>
                             <ul>
                               {disease.treatment.biological.map((item, i) => <li key={i}>{item}</li>)}
                             </ul>
                           </div>
                        )}
                        {disease.treatment.chemical && (
                          <div className="treatment-card">
                            <strong>Chemical:</strong>
                            <ul>
                              {disease.treatment.chemical.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {disease.url && <a href={disease.url} target="_blank" rel="noopener noreferrer" className="more-info-link">More Information</a>}
                  </div>
                ))}
              </div>
            ) : (
              <p>The plant appears to be healthy. No diseases detected.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Marketplace({ products, loading }) {
  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h2>Farmer's Market</h2>
        <p>Discover fresh, organic products directly from local farmers.</p>
      </div>

      {loading && products.length === 0 && <p>Loading products from the market...</p>}
      {!loading && products.length === 0 && (
        <div className="no-products-view">
          <h3>The marketplace is currently empty.</h3>
          <p>Check back soon as farmers add their products!</p>
        </div>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img src={`${API_BASE_URL}${product.imageUrl}`} alt={product.name} />
              </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <span className="product-category">
                  Sold by: {product.farmerId ? (product.farmerId.farmName || product.farmerId.name) : 'Unknown Farmer'}
                </span>
                <span className="product-price">₹{product.price} / {product.unit}</span>
            </div>
              <div className="product-actions">
                <button className="add-to-cart-btn">Buy Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyFarmStore({ products, loading, onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (productData) => {
    if (editingProduct) {
      await onUpdateProduct(editingProduct._id, productData);
    } else {
      await onAddProduct(productData);
    }
    handleCloseModal();
  };

  return (
    <div className="my-farm-store-container">
      <div className="store-header">
        <h2>My Farm Store</h2>
        <button onClick={() => handleOpenModal()} className="add-product-btn">
          + Add New Product
        </button>
      </div>
      
      {loading && products.length === 0 && <p>Loading your products...</p>}
      {!loading && products.length === 0 && (
        <div className="no-products-view">
          <h3>You haven't added any products yet.</h3>
          <p>Click "Add New Product" to start selling.</p>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img src={`${API_BASE_URL}${product.imageUrl}`} alt={product.name} />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <span className="product-price">₹{product.price} / {product.unit}</span>
                <span className="product-stock">Stock: {product.stock} {product.unit}</span>
            </div>
              <div className="product-actions farm-store-actions">
                <button onClick={() => handleOpenModal(product)} className="edit-btn">Edit</button>
                <button onClick={() => onDeleteProduct(product._id)} className="delete-btn">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      )}
    </div>
  );
}

function ProductFormModal({ product, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    unit: product?.unit || 'kg',
    category: product?.category || 'Vegetables',
    stock: product?.stock || 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = new FormData();
    Object.keys(formData).forEach(key => {
      productData.append(key, formData[key]);
    });
    if (imageFile) {
      productData.append('image', imageFile);
    }
    onSubmit(productData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input type="text" name="unit" value={formData.unit} onChange={handleChange} required placeholder="e.g., kg, piece, liter" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Dairy</option>
                <option>Grains</option>
                <option>Handicrafts</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" />
            </div>
          </div>
          <div className="form-group">
            <label>Product Image</label>
            <input type="file" name="image" onChange={handleImageChange} accept="image/*" />
            {preview && <img src={preview} alt="preview" className="image-form-preview" />}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add the LiveGovtPrices component at the end of the file
function LiveGovtPrices({ prices }) {
  const [filter, setFilter] = useState('all');
  const filteredPrices = prices.filter(p => filter === 'all' || p.type.toLowerCase() === filter);

  return (
    <div className="live-prices-container">
      <div className="live-prices-header">
        <h2>Live Government Market Prices</h2>
        <p>Stay updated with the latest APMC market rates for key commodities.</p>
        <div className="price-filters">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
          <button onClick={() => setFilter('vegetable')} className={filter === 'vegetable' ? 'active' : ''}>Vegetables</button>
          <button onClick={() => setFilter('fruit')} className={filter === 'fruit' ? 'active' : ''}>Fruits</button>
      </div>
      </div>
      <div className="price-list">
        {filteredPrices.map((item, index) => (
          <div key={index} className="price-card">
            <div className="price-card-header">
              <span className="price-item-name">{item.name}</span>
              <span className={`price-item-type ${item.type.toLowerCase()}`}>{item.type}</span>
            </div>
            <div className="price-card-body">
              <span className="price-item-value">₹{item.price}</span>
              <span className="price-item-unit">/ {item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;