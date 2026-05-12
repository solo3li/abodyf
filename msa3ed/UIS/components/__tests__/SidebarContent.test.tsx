import React from 'react';
import { render } from '@testing-library/react-native';
import SidebarContent from '../SidebarContent';

// Mock useAuth
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { fullName: 'Test User', email: 'test@uis.com', isExecutor: true, rating: 4.8, completedOrdersCount: 15 },
    logout: jest.fn(),
  })),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

// Mock @react-navigation/drawer
jest.mock('@react-navigation/drawer', () => ({
  DrawerContentScrollView: ({ children }: any) => <>{children}</>,
  DrawerItemList: () => null,
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => <>{children}</>,
}));

describe('SidebarContent', () => {
  it('renders executor badge when user is executor', () => {
    const { getByText } = render(<SidebarContent />);
    expect(getByText('4.8')).toBeDefined();
    expect(getByText('15')).toBeDefined();
  });
});
