import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('should call onSearch when text changes', () => {
    const onSearch = jest.fn();
    const { getByPlaceholderText } = render(<SearchBar onSearch={onSearch} />);
    
    const input = getByPlaceholderText('ابحث عن خدمة...');
    fireEvent.changeText(input, 'test');
    
    expect(onSearch).toHaveBeenCalledWith('test');
  });
});
