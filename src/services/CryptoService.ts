import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export interface Currency {
  id: string;
  name: string;
  min_size: string;
}

export interface ExchangeRates {
  currency: string;
  rates: Record<string, string>;
}

export interface PriceData {
  base: string;
  currency: string;
  amount: string;
}

export interface TickerData {
  type: string;
  product_id: string;
  price: string;
  time: string;
}

class CryptoService {
  async getCurrencies(): Promise<Currency[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/coinbase/currencies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw error;
    }
  }

  async getExchangeRates(): Promise<ExchangeRates> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/coinbase/exchange-rates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  }

  async getCurrentPrice(currencyPair: string): Promise<PriceData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/coinbase/prices`, {
        params: { currencyPair }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw error;
    }
  }

  connectToPriceUpdates(callback: (data: TickerData) => void) {
    // In a real implementation, we would connect to the WebSocket
    // For now, we'll simulate real-time updates with an interval
    
    // Simulate real-time updates with interval
    const interval = setInterval(() => {
      // Generate a random price update for demonstration
      const products = ['BTC-USD', 'ETH-USD', 'SOL-USD'];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomPrice = (Math.random() * 10000 + 55000).toFixed(2);
      
      const simulatedData: TickerData = {
        type: 'ticker',
        product_id: randomProduct,
        price: randomPrice,
        time: new Date().toISOString()
      };
      
      callback(simulatedData);
    }, 5000); // Every 5 seconds
    
    // Return a function to clear the interval
    return () => {
      clearInterval(interval);
    };
  }
}

export default new CryptoService();