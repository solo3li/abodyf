import React from 'react';
import { render } from '@testing-library/react-native';
import StudentLayout from '../student/_layout';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: Object.assign(({ children }: any) => <>{children}</>, {
    Screen: ({ name, options }: any) => null,
  }),
  Drawer: Object.assign(({ children }: any) => <>{children}</>, {
    Screen: ({ name, options }: any) => null,
  }),
}));

// Mock Drawer
jest.mock('expo-router/drawer', () => ({
  Drawer: Object.assign(({ children }: any) => <>{children}</>, {
    Screen: ({ name, options }: any) => null,
  }),
}));

describe('StudentLayout', () => {
  it('should render drawer navigator', () => {
    const { toJSON } = render(<StudentLayout />);
    expect(toJSON()).toBeDefined();
  });
});
