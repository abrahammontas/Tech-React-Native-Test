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

/** Donation item from API. */
export interface DonationApi {
  id: number;
  fundraiserId: number;
  amount: number;
  donorName: string;
  message?: string;
  createdAt: string;
  anonymous: boolean;
}

/** Donations list API response. */
export interface DonationsApiResponse {
  success: boolean;
  data: DonationApi[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  summary?: { totalAmount: number; totalCount: number; averageAmount: string };
}

export const api = {
  getFundraisers: async () => {
    const response = await client.get('/fundraisers');
    return response.data;
  },

  getFundraiser: async (id: number) => {
    const response = await client.get(`/fundraisers/${id}`);
    return response.data;
  },

  getDonations: async (fundraiserId: number): Promise<DonationsApiResponse> => {
    const response = await client.get<DonationsApiResponse>(
      `/fundraisers/${fundraiserId}/donations`
    );
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

