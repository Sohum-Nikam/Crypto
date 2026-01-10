import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export interface WalletState {
  balance: number | null;
  loading: boolean;
  error: string | null;
}

export interface Transaction {
  id: string;
  asset: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  timestamp: string;
  walletBalanceAfter: number;
}

export interface TransactionRequest {
  asset: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
}

class WalletServiceClass {
  async getWalletBalance(userId: string): Promise<number> {
    try {
      // This would normally come from the user profile endpoint
      // Since we already have this in the auth context, we'll use that approach
      return Promise.resolve(0); // Placeholder
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  async performTransaction(transaction: TransactionRequest, token: string): Promise<Transaction> {
    try {
      // For now, we'll simulate the transaction
      // In a real implementation, this would call the backend API
      const response = await axios.post(
        `${API_BASE_URL}/api/wallet/transaction`,
        {
          asset: transaction.asset,
          type: transaction.type,
          amount: transaction.amount,
          price: transaction.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.transaction;
    } catch (error) {
      console.error('Error performing transaction:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId: string, token: string): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/transactions/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }
}

// Simple function to update wallet balance (this would be called after successful registration)
export const updateWalletBalance = async (userId: string, amount: number, token: string) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/wallet/update-balance`,
      {
        userId,
        amount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw error;
  }
};

export default new WalletServiceClass();