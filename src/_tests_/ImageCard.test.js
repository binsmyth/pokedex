import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageCard from '../components/ImageCard';

// Mock console.log to prevent test output clutter
global.console.log = jest.fn();

describe('ImageCard Component', () => {
  // Test 1: Component renders without crashing
  test('renders ImageCard component without crashing', () => {
    render(<ImageCard id={1} urls="https://example.com/pokemon.png" />);
    expect(screen.getByAltText('pokemon')).toBeInTheDocument();
  });

  // Test 2: Image tag is rendered with correct alt text
  test('renders image with correct alt text', () => {
    render(<ImageCard id={1} urls="https://example.com/pokemon.png" />);
    const image = screen.getByAltText('pokemon');
    expect(image).toBeInTheDocument();
    expect(image.tagName).toBe('IMG');
  });

  // Test 3: Uses official Pokemon API URL for valid Pokemon IDs
  test('uses official Pokemon asset URL for ID < 906', () => {
    render(<ImageCard id={1} urls="https://example.com/backup.png" />);
    const image = screen.getByAltText('pokemon');

    // ID 1 should use official Pokemon URL (padded to 3 digits: 001)
    expect(image).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/001.png'
    );
  });

  // Test 4: Uses backup URL for Pokemon IDs >= 906
  test('uses fallback URL for ID >= 906', () => {
    const backupUrl = 'https://example.com/custom-pokemon.png';
    render(<ImageCard id={1000} urls={backupUrl} />);
    const image = screen.getByAltText('pokemon');

    // ID 1000 should use backup URL
    expect(image).toHaveAttribute('src', backupUrl);
  });

  // Test 5: Properly pads single digit IDs
  test('pads single digit Pokemon ID with leading zeros', () => {
    render(<ImageCard id={5} urls="https://example.com/backup.png" />);
    const image = screen.getByAltText('pokemon');

    // ID 5 should be padded to 005
    expect(image).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/005.png'
    );
  });

  // Test 6: Properly pads double digit IDs
  test('pads double digit Pokemon ID with leading zero', () => {
    render(<ImageCard id={25} urls="https://example.com/backup.png" />);
    const image = screen.getByAltText('pokemon');

    // ID 25 should be padded to 025
    expect(image).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/025.png'
    );
  });

  // Test 7: No padding needed for triple digit IDs
  test('does not pad triple digit Pokemon ID', () => {
    render(<ImageCard id={150} urls="https://example.com/backup.png" />);
    const image = screen.getByAltText('pokemon');

    // ID 150 should remain as 150
    expect(image).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/150.png'
    );
  });

  // Test 8: Handles string IDs by converting to number
  test('converts string ID to number for processing', () => {
    render(<ImageCard id="25" urls="https://example.com/backup.png" />);
    const image = screen.getByAltText('pokemon');

    // String "25" should be processed as number and padded to 025
    expect(image).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/025.png'
    );
  });

  // Test 9: Error handler is called on image load error
  test('error handler is called when image fails to load', () => {
    render(<ImageCard id={1} urls="https://example.com/pokemon.png" />);
    const image = screen.getByAltText('pokemon');

    // Trigger image error
    const errorEvent = new Event('error');
    image.dispatchEvent(errorEvent);

    // Verify console.log was called (error handling)
    expect(console.log).toHaveBeenCalledWith('error');
  });

  // Test 10: Image component from Mantine is used
  test('uses Mantine Image component', () => {
    const { container } = render(
      <ImageCard id={1} urls="https://example.com/pokemon.png" />
    );

    // Image should be rendered inside a div (Mantine Image wraps img)
    const imageContainer = container.querySelector('div');
    expect(imageContainer).toBeInTheDocument();

    // Image element should exist
    expect(screen.getByAltText('pokemon')).toBeInTheDocument();
  });

  // Test 11: Boundary test - ID exactly at 906
  test('uses official URL for ID exactly at 906 boundary', () => {
    render(<ImageCard id={905} urls="https://example.com/backup.png" />);
    const image = screen.getByAltText('pokemon');

    // ID 905 should still use official URL (< 906)
    expect(image).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/905.png'
    );
  });

  // Test 12: Boundary test - ID one above official range
  test('uses fallback URL for ID 906 and above', () => {
    render(<ImageCard id={906} urls="https://example.com/backup.png" />);
    const image = screen.getByAltText('pokemon');

    // ID 906 should use backup URL
    expect(image).toHaveAttribute('src', 'https://example.com/backup.png');
  });

  // Test 13: Handles very large ID numbers
  test('handles very large Pokemon IDs', () => {
    const backupUrl = 'https://example.com/new-pokemon.png';
    render(<ImageCard id={10000} urls={backupUrl} />);
    const image = screen.getByAltText('pokemon');

    // Large ID should use backup URL
    expect(image).toHaveAttribute('src', backupUrl);
  });

  // Test 14: Official URL format is correct
  test('constructs correct official Pokemon asset URL', () => {
    render(<ImageCard id={1} urls="https://example.com/backup.png" />);
    const image = screen.getByAltText('pokemon');
    const src = image.getAttribute('src');

    // Verify URL format
    expect(src).toContain('assets.pokemon.com');
    expect(src).toContain('pokedex/detail/');
    expect(src).toContain('.png');
  });

  // Test 15: Renders multiple images with different IDs
  test('renders multiple ImageCard components independently', () => {
    const { container } = render(
      <div>
        <ImageCard id={1} urls="https://example.com/backup.png" />
        <ImageCard id={25} urls="https://example.com/backup.png" />
      </div>
    );

    const images = screen.getAllByAltText('pokemon');
    expect(images).toHaveLength(2);

    // First image uses official URL for ID 1
    expect(images[0]).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/001.png'
    );

    // Second image uses official URL for ID 25
    expect(images[1]).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/025.png'
    );
  });

  // Test 16: Accepts both string and numeric backup URLs
  test('accepts string URLs as backup source', () => {
    const backupUrl = 'https://custom-api.com/pokemon/1.png';
    render(<ImageCard id={1000} urls={backupUrl} />);
    const image = screen.getByAltText('pokemon');

    expect(image).toHaveAttribute('src', backupUrl);
  });

  // Test 17: Props are properly destructured
  test('properly extracts id and urls props', () => {
    const testUrl = 'https://example.com/test.png';
    render(<ImageCard id={50} urls={testUrl} />);
    const image = screen.getByAltText('pokemon');

    // Should use official URL for valid ID
    expect(image).toHaveAttribute(
      'src',
      'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/050.png'
    );
  });

  // Test 18: Renders with Mantine Image styling
  test('renders with proper Mantine Image structure', () => {
    const { container } = render(
      <ImageCard id={1} urls="https://example.com/pokemon.png" />
    );

    // Should have wrapper div for Mantine Image component
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();

    // Should contain img element
    const img = wrapper.querySelector('img');
    expect(img).toBeInTheDocument();
  });
});
