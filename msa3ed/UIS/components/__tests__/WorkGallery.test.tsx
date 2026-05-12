import React from 'react';
import { render } from '@testing-library/react-native';
import WorkGallery from '../WorkGallery';

describe('WorkGallery', () => {
  it('renders gallery items', () => {
    const items = [
      { id: '1', title: 'Work 1', mediaUrl: 'url1', mediaType: 'Image' },
      { id: '2', title: 'Work 2', mediaUrl: 'url2', mediaType: 'Image' },
    ];
    const { getByText } = render(<WorkGallery items={items} />);
    expect(getByText('Work 1')).toBeDefined();
    expect(getByText('Work 2')).toBeDefined();
  });

  it('renders empty message when no items', () => {
    const { getByText } = render(<WorkGallery items={[]} />);
    expect(getByText('لا يوجد أعمال سابقة لعرضها')).toBeDefined();
  });
});
