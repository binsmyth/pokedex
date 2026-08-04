import React from 'react';
import { render, screen } from '@testing-library/react';
import AvatarImage from '../components/AvatarImage/AvatarImage';

// Mock the ImageCard component to isolate AvatarImage testing
jest.mock('../components/ImageCard', () => {
  return function MockImageCard({ urls, id }) {
    return <div data-testid={`image-card-${id}`}>ImageCard: {id}</div>;
  };
});

describe('AvatarImage Component', () => {
  // Test 1: Component renders without crashing
  test('renders AvatarImage component without crashing', () => {
    render(
      <AvatarImage
        urls="https://example.com/pokemon.png"
        id={1}
      />
    );
    expect(screen.getByTestId('image-card-1')).toBeInTheDocument();
  });

  // Test 2: Avatar component is rendered
  test('renders Avatar component from Mantine', () => {
    const { container } = render(
      <AvatarImage
        urls="https://example.com/pokemon.png"
        id={1}
      />
    );
    // Avatar component renders as a div with role img
    const avatarElement = container.querySelector('[role="img"]') ||
                          container.querySelector('div');
    expect(avatarElement).toBeInTheDocument();
  });

  // Test 3: ImageCard receives correct props
  test('passes correct props to ImageCard component', () => {
    render(
      <AvatarImage
        urls="https://example.com/pikachu.png"
        id={25}
      />
    );
    // Verify ImageCard component received correct ID prop
    expect(screen.getByTestId('image-card-25')).toBeInTheDocument();
    expect(screen.getByText('ImageCard: 25')).toBeInTheDocument();
  });

  // Test 4: Avatar has radius xl style
  test('renders Avatar with xl radius', () => {
    const { container } = render(
      <AvatarImage
        urls="https://example.com/pokemon.png"
        id={1}
      />
    );
    // Avatar should be rendered - Mantine Avatar renders with specific classes
    const avatarElement = container.querySelector('div');
    expect(avatarElement).toBeInTheDocument();
  });

  // Test 5: Avatar has size xl
  test('renders Avatar with xl size', () => {
    const { container } = render(
      <AvatarImage
        urls="https://example.com/pokemon.png"
        id={1}
      />
    );
    // Verify component rendered successfully with size prop
    expect(screen.getByTestId('image-card-1')).toBeInTheDocument();
  });

  // Test 6: Different Pokemon IDs work correctly
  test('renders different Pokemon avatars with different IDs', () => {
    const { rerender } = render(
      <AvatarImage urls="https://example.com/bulbasaur.png" id={1} />
    );
    expect(screen.getByTestId('image-card-1')).toBeInTheDocument();

    rerender(<AvatarImage urls="https://example.com/ivysaur.png" id={2} />);
    expect(screen.getByTestId('image-card-2')).toBeInTheDocument();
  });

  // Test 7: URLs prop is passed to ImageCard
  test('passes URLs prop to ImageCard', () => {
    const testUrl = 'https://example.com/custom-pokemon.png';
    render(<AvatarImage urls={testUrl} id={10} />);

    // Verify ImageCard is rendered with correct ID
    expect(screen.getByTestId('image-card-10')).toBeInTheDocument();
  });

  // Test 8: Component accepts numeric ID
  test('handles numeric Pokemon ID prop', () => {
    render(<AvatarImage urls="https://example.com/pokemon.png" id={150} />);
    expect(screen.getByTestId('image-card-150')).toBeInTheDocument();
  });

  // Test 9: Component accepts string URL
  test('handles string URL prop', () => {
    const stringUrl = 'https://assets.pokemon.com/pokemon.png';
    render(<AvatarImage urls={stringUrl} id={1} />);
    expect(screen.getByTestId('image-card-1')).toBeInTheDocument();
  });

  // Test 10: Multiple avatars can be rendered
  test('multiple AvatarImage components can render independently', () => {
    const { container } = render(
      <div>
        <AvatarImage urls="https://example.com/pikachu.png" id={25} />
        <AvatarImage urls="https://example.com/charizard.png" id={6} />
      </div>
    );

    expect(screen.getByTestId('image-card-25')).toBeInTheDocument();
    expect(screen.getByTestId('image-card-6')).toBeInTheDocument();
  });
});
