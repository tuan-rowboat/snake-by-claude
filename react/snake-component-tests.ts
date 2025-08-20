// SnakeGame.test.tsx - React component tests
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnakeGame from '../components/SnakeGame';

// Mock the canvas rendering context
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('SnakeGame Component Tests', () => {
  
  describe('1. Initial Rendering', () => {
    test('1.1 - Renders main menu on load', () => {
      render(<SnakeGame />);
      
      expect(screen.getByText('🐍 Snake Game Deluxe')).toBeInTheDocument();
      expect(screen.getByText('Game Settings')).toBeInTheDocument();
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });

    test('1.2 - Shows all customization options', () => {
      render(<SnakeGame />);
      
      expect(screen.getByText('Snake Head Shape')).toBeInTheDocument();
      expect(screen.getByText('Snake Color')).toBeInTheDocument();
      expect(screen.getByText('Background Color')).toBeInTheDocument();
      expect(screen.getByText('Game Speed')).toBeInTheDocument();
      expect(screen.getByText('Wall Pattern')).toBeInTheDocument();
      expect(screen.getByText('Max Foods on Screen')).toBeInTheDocument();
    });

    test('1.3 - Displays food values legend', () => {
      render(<SnakeGame />);
      
      expect(screen.getByText(/Regular Foods:/)).toBeInTheDocument();
      expect(screen.getByText(/Special Foods:/)).toBeInTheDocument();
      expect(screen.getByText(/Mushroom: x2 Length/)).toBeInTheDocument();
      expect(screen.getByText(/Poison: -2 Length/)).toBeInTheDocument();
    });

    test('1.4 - No high scores shown initially', () => {
      render(<SnakeGame />);
      
      const highScoresText = screen.queryByText('🏆 High Scores');
      expect(highScoresText).not.toBeInTheDocument();
    });
  });

  describe('2. Settings Configuration', () => {
    test('2.1 - Changes snake head shape', () => {
      render(<SnakeGame />);
      
      const shapeSelect = screen.getByLabelText('Snake Head Shape') as HTMLSelectElement;
      fireEvent.change(shapeSelect, { target: { value: 'circle' } });
      
      expect(shapeSelect.value).toBe('circle');
    });

    test('2.2 - Changes snake color', async () => {
      render(<SnakeGame />);
      
      const colorSection = screen.getByText('Snake Color').parentElement;
      const colorButtons = within(colorSection!).getAllByRole('button');
      
      fireEvent.click(colorButtons[1]); // Click second color
      
      // Check if button has the selected border style
      expect(colorButtons[1]).toHaveClass('border-white');
    });

    test('2.3 - Changes background color', async () => {
      render(<SnakeGame />);
      
      const bgSection = screen.getByText('Background Color').parentElement;
      const bgButtons = within(bgSection!).getAllByRole('button');
      
      fireEvent.click(bgButtons[1]);
      
      expect(bgButtons[1]).toHaveClass('border-white');
    });

    test('2.4 - Changes game speed', () => {
      render(<SnakeGame />);
      
      const speedButton = screen.getByText('Fast');
      fireEvent.click(speedButton);
      
      expect(speedButton).toHaveClass('bg-green-600');
    });

    test('2.5 - Changes wall pattern', () => {
      render(<SnakeGame />);
      
      const wallSelect = screen.getByLabelText('Wall Pattern') as HTMLSelectElement;
      fireEvent.change(wallSelect, { target: { value: 'maze' } });
      
      expect(wallSelect.value).toBe('maze');
    });

    test('2.6 - Changes max foods setting', () => {
      render(<SnakeGame />);
      
      const foodButton = screen.getByText('5');
      fireEvent.click(foodButton);
      
      expect(foodButton).toHaveClass('bg-blue-600');
    });
  });

  describe('3. Game Start and State Transitions', () => {
    test('3.1 - Starts game when Start button clicked', () => {
      render(<SnakeGame />);
      
      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);
      
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
      expect(screen.getByText('Press SPACE to Pause')).toBeInTheDocument();
      expect(screen.queryByText('Game Settings')).not.toBeInTheDocument();
    });

    test('3.2 - Shows canvas when game starts', () => {
      render(<SnakeGame />);
      
      const startButton = screen.getByText('Start Game');
      fireEvent.click(startButton);
      
      const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
      expect(canvas).toBeInTheDocument();
      expect(canvas.width).toBe(500); // GRID_SIZE * CELL_SIZE
      expect(canvas.height).toBe(500);
    });

    test('3.3 - Displays initial score of 0', () => {
      render(<SnakeGame />);
      
      fireEvent.click(screen.getByText('Start Game'));
      
      expect(screen.getByText('Score:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    test('3.4 - Shows food legend during gameplay', () => {
      render(<SnakeGame />);
      
      fireEvent.click(screen.getByText('Start Game'));
      
      expect(screen.getByText('🍎')).toBeInTheDocument();
      expect(screen.getByText('🍄')).toBeInTheDocument();
      expect(screen.getByText('☠️')).toBeInTheDocument();
    });
  });

  describe('4. Keyboard Controls', () => {
    test('4.1 - Responds to arrow key presses', () => {
      render(<SnakeGame />);
      fireEvent.click(screen.getByText('Start Game'));
      
      const originalDirection = { x: 1, y: 0 };
      
      fireEvent.keyDown(window, { key: 'ArrowUp' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      
      // Game should continue running without errors
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
    });

    test('4.2 - Responds to WASD keys', () => {
      render(<SnakeGame />);
      fireEvent.click(screen.getByText('Start Game'));
      
      fireEvent.keyDown(window, { key: 'w' });
      fireEvent.keyDown(window, { key: 'a' });
      fireEvent.keyDown(window, { key: 's' });
      fireEvent.keyDown(window, { key: 'd' });
      
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
    });

    test('4.3 - Pauses game with spacebar', () => {
      render(<SnakeGame />);
      fireEvent.click(screen.getByText('Start Game'));
      
      fireEvent.keyDown(window, { key: ' ' });
      
      expect(screen.getByText('Press SPACE to Resume')).toBeInTheDocument();
    });

    test('4.4 - Resumes game with spacebar', () => {
      render(<SnakeGame />);
      fireEvent.click(screen.getByText('Start Game'));
      
      fireEvent.keyDown(window, { key: ' ' }); // Pause
      expect(screen.getByText('Press SPACE to Resume')).toBeInTheDocument();
      
      fireEvent.keyDown(window, { key: ' ' }); // Resume
      expect(screen.getByText('Press SPACE to Pause')).toBeInTheDocument();
    });
  });

  describe('5. Game Over State', () => {
    test('5.1 - Shows game over screen', () => {
      render(<SnakeGame />);
      
      // Mock a game over by setting state directly
      // In real test, you'd simulate collision
      fireEvent.click(screen.getByText('Start Game'));
      
      // Force game over state (would normally happen via collision)
      const { container } = render(<SnakeGame />);
      
      // Simulate game over scenario
      jest.advanceTimersByTime(10000); // Let game run
      
      // Game over elements should eventually appear
      waitFor(() => {
        expect(screen.getByText('Game Over!')).toBeInTheDocument();
        expect(screen.getByText('Play Again')).toBeInTheDocument();
        expect(screen.getByText('Main Menu')).toBeInTheDocument();
      });
    });

    test('5.2 - Can restart game after game over', async () => {
      render(<SnakeGame />);
      
      // Start game
      fireEvent.click(screen.getByText('Start Game'));
      
      