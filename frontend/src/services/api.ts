import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://api.givebutter.com/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getFundraisers: async () => {
    const response = await client.get('/fundraisers');
    return response.data;
  },

  getFundraiser: async (id: number) => {
    const response = await client.get(`/fundraisers/${id}`);
    return response.data;
  },

  getDonations: async (fundraiserId: number) => {
    const response = await client.get(`/fundraisers/${fundraiserId}/donations`);
    return response.data;
  },

  createDonation: async (fundraiserId: number, donation: {
    amount: number;
    donorName: string;
    message?: string;
  }) => {
    const response = await client.post(`/fundraisers/${fundraiserId}/donations`, donation);
    return response.data;
  },
};

