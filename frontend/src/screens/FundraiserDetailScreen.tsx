import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { RouteProp, useRoute } from '@react-navigation/native';
import { api } from '../services/api';

type RootStackParamList = {
  FundraiserDetail: { fundraiserId: number };
};

type FundraiserDetailRouteProp = RouteProp<RootStackParamList, 'FundraiserDetail'>;

interface Fundraiser {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  imageUrl: string;
  createdAt: string;
  status: string;
}

export default function FundraiserDetailScreen() {
  const route = useRoute<FundraiserDetailRouteProp>();
  const { fundraiserId } = route.params;

  const { data, isLoading, error } = useQuery({
    queryKey: ['fundraiser', fundraiserId],
    queryFn: () => api.getFundraiser(fundraiserId),
  });

  const fundraiser = data?.data;

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !fundraiser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading fundraiser</Text>
      </View>
    );
  }

  const progress = (fundraiser.raised / fundraiser.goal) * 100;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: fundraiser.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{fundraiser.title}</Text>
        <Text style={styles.description}>{fundraiser.description}</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.raised}>${fundraiser.raised.toLocaleString()}</Text>
            <Text style={styles.goal}>of ${fundraiser.goal.toLocaleString()} goal</Text>
          </View>
          <Text style={styles.percentage}>{Math.round(progress)}% funded</Text>
        </View>

        {/* TODO: Task 1 - Add donation form here */}
        
        {/* TODO: Task 2 - Add donations list here */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  raised: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  goal: {
    fontSize: 16,
    color: '#666',
  },
  percentage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
});

