const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const WebSocket = require('websocket').w3cwebsocket;
const nodemailer = require('nodemailer');
const { createTransport } = require('nodemailer');
const http = require('http');
require('dotenv').config();

// Validate required environment variables
if (!process.env.COINBASE_API_KEY || !process.env.COINBASE_SECRET_KEY) {
  console.warn('Warning: Coinbase API credentials not found in environment variables');
}

// Create transporter for sending emails
const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptoexchange', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  asset: { type: String, required: true },
  type: { type: String, required: true, enum: ['buy', 'sell'] },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  walletBalanceAfter: { type: Number, required: true },
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 }, // Virtual balance for trial
  transactions: [transactionSchema],
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Pre-save middleware to normalize email to lowercase
userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, lastname, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: "USER_EXISTS",
        message: "User already signed in"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with initial trial balance
    const user = new User({
      name,
      lastname,
      email,
      phone,
      password: hashedPassword,
      walletBalance: 1000, // $1000 virtual trial balance
    });

    await user.save();

    res.status(201).json({
      success: true,
      code: "SIGNUP_SUCCESS",
      message: "Account created"
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Create account first"
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: "INVALID_PASSWORD",
        message: "Invalid credentials"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      code: "LOGIN_SUCCESS",
      message: "Welcome",
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return res.json({ message: 'Password reset email sent if user exists' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    // Send email with reset link
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Crypto Exchange - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Crypto Exchange account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      message: 'Password reset email sent if user exists'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error in password reset request' });
  }
});

// Simple Password Reset (without email verification)
app.post('/api/auth/simple-password-reset', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    user.password = hashedPassword;
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Simple password reset error:', error);
    res.status(500).json({ message: 'Server error in password reset' });
  }
});

// Reset Password (Simple - No Token Required)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    user.password = hashedPassword;
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Simple password reset error:', error);
    res.status(500).json({ message: 'Server error in password reset' });
  }
});

// Get user profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user data without password and with wallet balance
    const userResponse = {
      id: user._id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      walletBalance: user.walletBalance,
      createdAt: user.createdAt,
    };
    res.json(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error getting user' });
  }
});

// Coinbase API Integration
const axios = require('axios');

// Get all supported currencies from Coinbase
app.get('/api/coinbase/currencies', async (req, res) => {
  try {
    // Call actual Coinbase API
    const response = await axios.get('https://api.exchange.coinbase.com/products');
    const products = response.data;
    
    // Extract unique currencies from products
    const currencies = {};
    products.forEach(product => {
      const [baseCurrency] = product.id.split('-');
      if (!currencies[baseCurrency]) {
        currencies[baseCurrency] = {
          id: baseCurrency,
          name: product.base_currency_name || baseCurrency,
          min_size: product.base_min_size
        };
      }
    });
    
    res.json(Object.values(currencies));
  } catch (error) {
    console.error('Error fetching currencies:', error);
    // Return fallback currencies if API fails
    const fallbackCurrencies = [
      { id: 'BTC', name: 'Bitcoin', min_size: '0.00000001' },
      { id: 'ETH', name: 'Ethereum', min_size: '0.00000001' },
      { id: 'USDT', name: 'Tether', min_size: '0.01' },
      { id: 'USDC', name: 'USD Coin', min_size: '0.01' },
      { id: 'BNB', name: 'BNB', min_size: '0.00000001' },
      { id: 'XRP', name: 'XRP', min_size: '0.01' },
      { id: 'ADA', name: 'Cardano', min_size: '0.01' },
      { id: 'SOL', name: 'Solana', min_size: '0.00000001' },
      { id: 'DOT', name: 'Polkadot', min_size: '0.01' },
      { id: 'DOGE', name: 'Dogecoin', min_size: '0.01' },
    ];
    res.json(fallbackCurrencies);
  }
});

// Get exchange rates
app.get('/api/coinbase/exchange-rates', async (req, res) => {
  try {
    // Get exchange rates from Coinbase API
    const response = await axios.get('https://api.exchange.coinbase.com/exchange-rates/rates?currency=USD');
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return fallback data if API fails
    const fallbackRates = {
      currency: 'USD',
      rates: {
        BTC: '60000.00',
        ETH: '3000.00',
        USDT: '1.00',
        USDC: '1.00',
        BNB: '500.00',
        XRP: '0.50',
        ADA: '0.50',
        SOL: '100.00',
        DOT: '10.00',
        DOGE: '0.10',
      }
    };
    res.json(fallbackRates);
  }
});

// Get current prices for multiple currencies
app.get('/api/coinbase/prices', async (req, res) => {
  try {
    const { currencyPair } = req.query;
    
    // If no currency pair specified, default to BTC-USD
    const pair = currencyPair || 'BTC-USD';
    
    // Get current price from Coinbase API
    const response = await axios.get(`https://api.exchange.coinbase.com/products/${pair}/ticker`);
    
    res.json({
      data: {
        base: pair.split('-')[0],
        currency: pair.split('-')[1],
        amount: response.data.price,
      }
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Return fallback data if API fails
    const pair = req.query.currencyPair || 'BTC-USD';
    res.json({
      data: {
        base: pair.split('-')[0],
        currency: pair.split('-')[1],
        amount: pair === 'ETH-USD' ? '3000.00' : pair === 'ADA-USD' ? '0.50' : '60000.00',
      }
    });
  }
});

// WebSocket for real-time price updates
app.get('/api/coinbase/subscribe-price-updates', (req, res) => {
  // Upgrade to WebSocket connection
  const client = new WebSocket(
    `wss://ws-feed.pro.coinbase.com`
  );
  
  client.onopen = () => {
    // Subscribe to ticker channel for major pairs
    const subscriptionMsg = {
      type: 'subscribe',
      product_ids: ['BTC-USD', 'ETH-USD', 'SOL-USD'],
      channels: ['ticker']
    };
    client.send(JSON.stringify(subscriptionMsg));
  };
  
  client.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'ticker') {
      // Broadcast the price update to connected clients
      // In a real implementation, you'd have a way to broadcast to connected frontend clients
      console.log('Price update:', data);
    }
  };
  
  client.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  client.onclose = () => {
    console.log('WebSocket connection closed');
  };
  
  // Set up a simple interval to simulate real-time updates
  const interval = setInterval(() => {
    // Simulate price update
    const simulatedUpdate = {
      type: 'ticker',
      product_id: 'BTC-USD',
      price: (Math.random() * 10000 + 55000).toFixed(2),
      time: new Date().toISOString()
    };
    
    // In a real implementation, you would send this to connected clients
    console.log('Simulated price update:', simulatedUpdate);
  }, 5000); // Every 5 seconds
  
  // Clean up interval when request ends
  req.on('close', () => {
    clearInterval(interval);
    client.close();
  });
});

// Real-time price updates for charts
let priceUpdateInterval;

// Function to fetch and broadcast price updates
const broadcastPriceUpdates = async () => {
  try {
    // Get current BTC-USD price from Coinbase API
    const response = await axios.get('https://api.exchange.coinbase.com/products/BTC-USD/ticker');
    const { price } = response.data;
    
    // Get timestamp
    const timestamp = Date.now();
    
    // Format data similar to candlestick format
    const priceData = {
      symbol: 'BTC-USD',
      price: parseFloat(price),
      timestamp: timestamp
    };
    
    // Broadcast to all connected clients
    io.emit('priceUpdate', priceData);
    
  } catch (error) {
    console.error('Error fetching price update:', error.message);
    
    // If API fails, send last known price or fallback
    const fallbackData = {
      symbol: 'BTC-USD',
      price: 0, // This will be handled by frontend as an error state
      timestamp: Date.now(),
      error: 'Failed to fetch price'
    };
    io.emit('priceUpdate', fallbackData);
  }
};

// Start price updates every 5 seconds
priceUpdateInterval = setInterval(broadcastPriceUpdates, 5000);

// Stop interval on server shutdown
process.on('SIGINT', () => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
  }
  process.exit(0);
});

// Real-time chat functionality
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected to chat:', socket.userId);
  
  // Join user room
  socket.join(socket.userId);
  
  // Listen for new messages
  socket.on('sendMessage', async (data) => {
    try {
      // Get user info to include in message
      const user = await User.findById(socket.userId).select('name lastname email');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const message = {
        id: Date.now().toString(),
        senderId: socket.userId,
        senderName: `${user.name} ${user.lastname}`,
        text: data.text,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast message to all clients
      io.emit('receiveMessage', message);
      
      // Optionally save to database if persistence is needed
      console.log('Message sent:', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('errorMessage', { error: 'Failed to send message' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected from chat:', socket.userId);
  });
});

// Transaction endpoints

// Get user transactions
app.get('/api/wallet/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('transactions');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ transactions: user.transactions || [] });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Perform a transaction
app.post('/api/wallet/transaction', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const userId = decoded.userId;
    
    const { asset, type, amount, price } = req.body;
    
    // Validate inputs
    if (!asset || !type || !amount || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (type !== 'buy' && type !== 'sell') {
      return res.status(400).json({ message: 'Type must be buy or sell' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const total = amount * price;
    
    // Check if user has sufficient balance for buy transaction
    if (type === 'buy' && user.walletBalance < total) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Calculate new balance
    let newBalance;
    if (type === 'buy') {
      newBalance = user.walletBalance - total;
    } else { // sell
      newBalance = user.walletBalance + total;
    }
    
    // Create transaction record
    const transaction = {
      asset,
      type,
      amount,
      price,
      total,
      walletBalanceAfter: newBalance,
    };
    
    // Update user with new balance and transaction
    user.walletBalance = newBalance;
    user.transactions = user.transactions || [];
    user.transactions.push(transaction);
    
    await user.save();
    
    res.json({ transaction: { ...transaction, id: Date.now().toString() } });
  } catch (error) {
    console.error('Error performing transaction:', error);
    res.status(500).json({ message: 'Error performing transaction' });
  }
});

// Update wallet balance (for initial deposit)
app.patch('/api/wallet/update-balance', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ message: 'Missing userId or amount' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { walletBalance: amount } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    res.status(500).json({ message: 'Error updating wallet balance' });
  }
});

const PORT = process.env.PORT || 4567; // Using random high port to avoid conflicts
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});