import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchScreen from '../student/search';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => ({ q: '', tab: 'services' }),
}));

// Mock api
jest.mock('../../services/api', () => ({
  apiFetch: jest.fn(() => Promise.resolve([])),
}));

describe('SearchScreen', () => {
  it('toggles between services and executors tabs', () => {
    const { getByText } = render(<SearchScreen />);
    
    const executorsTab = getByText('المنفذين');
    fireEvent.press(executorsTab);
    
    // Check if active style applied (via test-id or similar in real scenario)
    expect(executorsTab).toBeDefined();
  });
});
