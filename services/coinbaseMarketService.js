const axios = require('axios');

class CoinbaseMarketService {
  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY;
    this.apiSecret = process.env.COINBASE_SECRET_KEY; // Using the same name as in .env file
    this.baseUrl = 'https://api.exchange.coinbase.com';
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds
    
    // Validate environment variables
    if (!this.apiKey || !this.apiSecret) {
      console.error('❌ COINBASE_API_KEY and COINBASE_SECRET_KEY must be set in environment variables');
      console.error('Please add them to your .env file');
      process.exit(1);
    }
  }

  async fetchPrice(symbol) {
    try {
      // Check cache first
      const cacheKey = `price_${symbol}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const response = await axios.get(`${this.baseUrl}/products/${symbol}/ticker`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'CryptoExchangeApp/1.0'
        }
      });

      const data = {
        symbol,
        price: parseFloat(response.data.price),
        timestamp: Date.now()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error.message);
      // Return cached data if available, otherwise null
      const cached = this.cache.get(`price_${symbol}`);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout * 2) {
        return cached.data;
      }
      return null;
    }
  }

  async fetchMultiplePrices(symbols) {
    const promises = symbols.map(symbol => this.fetchPrice(symbol));
    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  }

  async getAllSupportedPairs() {
    try {
      const response = await axios.get(`${this.baseUrl}/products`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'CryptoExchangeApp/1.0'
        }
      });

      // Filter for USD pairs
      const usdPairs = response.data
        .filter(product => product.quote_currency === 'USD')
        .map(product => product.id);

      return usdPairs.slice(0, 20); // Limit to top 20 pairs
    } catch (error) {
      console.error('Error fetching supported pairs:', error.message);
      // Return fallback pairs
      return ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD', 'DOT-USD'];
    }
  }

  async healthCheck() {
    try {
      const result = await this.fetchPrice('BTC-USD');
      return result !== null;
    } catch {
      return false;
    }
  }
}

module.exports = CoinbaseMarketService;