// gameLogic.test.ts - Complete test suite for Snake Game
// Run with: npm test

import {
  moveSnake,
  checkWallCollision,
  checkSelfCollision,
  checkObstacleCollision,
  checkFoodCollision,
  eatRegularFood,
  eatMushroom,
  eatPoison,
  calculateScoreChange,
  generateFoodPosition,
  determineFoodType,
  generateFood,
  processGameTick,
  isValidDirectionChange,
  getDirectionFromKey,
  GRID_SIZE,
  FOOD_TYPES,
  Position,
  Food
} from '../utils/gameLogic';

// Mock Math.random for deterministic testing
const mockRandom = (value: number) => {
  const original = Math.random;
  Math.random = jest.fn(() => value);
  return () => { Math.random = original; };
};

describe('Snake Game - Core Logic Tests', () => {
  
  describe('1. Snake Movement Tests', () => {
    test('1.1 - Snake moves right correctly', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
      const direction = { x: 1, y: 0 };
      const newSnake = moveSnake(snake, direction);
      
      expect(newSnake[0]).toEqual({ x: 11, y: 10 });
      expect(newSnake.length).toBe(2);
      expect(newSnake[1]).toEqual({ x: 10, y: 10 });
    });

    test('1.2 - Snake moves left correctly', () => {
      const snake = [{ x: 10, y: 10 }, { x: 11, y: 10 }];
      const direction = { x: -1, y: 0 };
      const newSnake = moveSnake(snake, direction);
      
      expect(newSnake[0]).toEqual({ x: 9, y: 10 });
      expect(newSnake[1]).toEqual({ x: 10, y: 10 });
    });

    test('1.3 - Snake moves up correctly', () => {
      const snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }];
      const direction = { x: 0, y: -1 };
      const newSnake = moveSnake(snake, direction);
      
      expect(newSnake[0]).toEqual({ x: 10, y: 9 });
      expect(newSnake[1]).toEqual({ x: 10, y: 10 });
    });

    test('1.4 - Snake moves down correctly', () => {
      const snake = [{ x: 10, y: 10 }, { x: 10, y: 9 }];
      const direction = { x: 0, y: 1 };
      const newSnake = moveSnake(snake, direction);
      
      expect(newSnake[0]).toEqual({ x: 10, y: 11 });
      expect(newSnake[1]).toEqual({ x: 10, y: 10 });
    });

    test('1.5 - Long snake maintains proper segments', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
      ];
      const direction = { x: 1, y: 0 };
      const newSnake = moveSnake(snake, direction);
      
      expect(newSnake.length).toBe(4);
      expect(newSnake[0]).toEqual({ x: 11, y: 10 });
      expect(newSnake[3]).toEqual({ x: 8, y: 10 });
    });
  });

  describe('2. Wall Collision Detection', () => {
    test('2.1 - Detects left wall collision', () => {
      expect(checkWallCollision({ x: -1, y: 10 })).toBe(true);
      expect(checkWallCollision({ x: 0, y: 10 })).toBe(false);
    });

    test('2.2 - Detects right wall collision', () => {
      expect(checkWallCollision({ x: GRID_SIZE, y: 10 })).toBe(true);
      expect(checkWallCollision({ x: GRID_SIZE - 1, y: 10 })).toBe(false);
    });

    test('2.3 - Detects top wall collision', () => {
      expect(checkWallCollision({ x: 10, y: -1 })).toBe(true);
      expect(checkWallCollision({ x: 10, y: 0 })).toBe(false);
    });

    test('2.4 - Detects bottom wall collision', () => {
      expect(checkWallCollision({ x: 10, y: GRID_SIZE })).toBe(true);
      expect(checkWallCollision({ x: 10, y: GRID_SIZE - 1 })).toBe(false);
    });

    test('2.5 - No collision in center of grid', () => {
      expect(checkWallCollision({ x: 10, y: 10 })).toBe(false);
    });
  });

  describe('3. Self Collision Detection', () => {
    test('3.1 - Detects snake hitting its body', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 9, y: 11 },
        { x: 10, y: 11 },
        { x: 10, y: 10 } // Same as head
      ];
      expect(checkSelfCollision(snake)).toBe(true);
    });

    test('3.2 - No collision for valid snake', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      expect(checkSelfCollision(snake)).toBe(false);
    });

    test('3.3 - Single segment snake cannot collide with itself', () => {
      const snake = [{ x: 10, y: 10 }];
      expect(checkSelfCollision(snake)).toBe(false);
    });

    test('3.4 - Two segment snake cannot collide', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
      expect(checkSelfCollision(snake)).toBe(false);
    });
  });

  describe('4. Obstacle Wall Collision', () => {
    test('4.1 - Detects collision with wall obstacle', () => {
      const head = { x: 5, y: 5 };
      const walls = [
        { x: 5, y: 5 },
        { x: 6, y: 5 }
      ];
      expect(checkObstacleCollision(head, walls)).toBe(true);
    });

    test('4.2 - No collision when missing walls', () => {
      const head = { x: 5, y: 5 };
      const walls = [
        { x: 6, y: 5 },
        { x: 7, y: 5 }
      ];
      expect(checkObstacleCollision(head, walls)).toBe(false);
    });

    test('4.3 - No collision with empty walls array', () => {
      const head = { x: 5, y: 5 };
      const walls: Position[] = [];
      expect(checkObstacleCollision(head, walls)).toBe(false);
    });
  });

  describe('5. Food Collision Detection', () => {
    test('5.1 - Detects eating first food', () => {
      const head = { x: 5, y: 5 };
      const foods: Food[] = [
        { x: 5, y: 5, type: 'apple' },
        { x: 10, y: 10, type: 'berry' }
      ];
      expect(checkFoodCollision(head, foods)).toBe(0);
    });

    test('5.2 - Detects eating second food', () => {
      const head = { x: 10, y: 10 };
      const foods: Food[] = [
        { x: 5, y: 5, type: 'apple' },
        { x: 10, y: 10, type: 'golden' }
      ];
      expect(checkFoodCollision(head, foods)).toBe(1);
    });

    test('5.3 - Returns -1 when no food collision', () => {
      const head = { x: 5, y: 5 };
      const foods: Food[] = [
        { x: 6, y: 5, type: 'apple' },
        { x: 10, y: 10, type: 'berry' }
      ];
      expect(checkFoodCollision(head, foods)).toBe(-1);
    });

    test('5.4 - Handles empty food array', () => {
      const head = { x: 5, y: 5 };
      const foods: Food[] = [];
      expect(checkFoodCollision(head, foods)).toBe(-1);
    });
  });

  describe('6. Regular Food Consumption', () => {
    test('6.1 - Snake grows by 1 when eating', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
      const direction = { x: 1, y: 0 };
      const newSnake = eatRegularFood(snake, direction);
      
      expect(newSnake.length).toBe(3);
      expect(newSnake[0]).toEqual({ x: 11, y: 10 });
      expect(newSnake[1]).toEqual({ x: 10, y: 10 });
      expect(newSnake[2]).toEqual({ x: 9, y: 10 });
    });

    test('6.2 - Maintains snake continuity after eating', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      const direction = { x: 0, y: -1 };
      const newSnake = eatRegularFood(snake, direction);
      
      expect(newSnake.length).toBe(4);
      expect(newSnake[0]).toEqual({ x: 10, y: 9 });
    });
  });

  describe('7. Mushroom Effect (Double Length)', () => {
    test('7.1 - Doubles 3-segment snake to 5', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      const newSnake = eatMushroom(snake);
      
      expect(newSnake.length).toBe(5);
      expect(newSnake[0]).toEqual({ x: 10, y: 10 });
      expect(newSnake[4]).toEqual({ x: 8, y: 10 });
    });

    test('7.2 - Doubles 5-segment snake to 9', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
      ];
      const newSnake = eatMushroom(snake);
      
      expect(newSnake.length).toBe(9);
    });

    test('7.3 - Single segment stays single', () => {
      const snake = [{ x: 10, y: 10 }];
      const newSnake = eatMushroom(snake);
      
      expect(newSnake.length).toBe(1);
    });

    test('7.4 - Two segments become three', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
      const newSnake = eatMushroom(snake);
      
      expect(newSnake.length).toBe(3);
      expect(newSnake[2]).toEqual({ x: 9, y: 10 });
    });
  });

  describe('8. Poison Effect (Shrink)', () => {
    test('8.1 - Shrinks 5-segment snake by 2', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
      ];
      const newSnake = eatPoison(snake);
      
      expect(newSnake.length).toBe(3);
      expect(newSnake[0]).toEqual({ x: 10, y: 10 });
      expect(newSnake[2]).toEqual({ x: 8, y: 10 });
    });

    test('8.2 - 4-segment snake shrinks to minimum 3', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
      ];
      const newSnake = eatPoison(snake);
      
      expect(newSnake.length).toBe(3);
    });

    test('8.3 - Minimum length maintained at 3', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      const newSnake = eatPoison(snake);
      
      expect(newSnake.length).toBe(3);
    });

    test('8.4 - Very long snake shrinks correctly', () => {
      const snake = Array.from({ length: 10 }, (_, i) => ({ x: 10 - i, y: 10 }));
      const newSnake = eatPoison(snake);
      
      expect(newSnake.length).toBe(8);
    });
  });

  describe('9. Score Calculation', () => {
    test('9.1 - Apple adds 10 points', () => {
      expect(calculateScoreChange('apple', 100)).toBe(110);
    });

    test('9.2 - Golden apple adds 50 points', () => {
      expect(calculateScoreChange('golden', 100)).toBe(150);
    });

    test('9.3 - Berry adds 20 points', () => {
      expect(calculateScoreChange('berry', 50)).toBe(70);
    });

    test('9.4 - Super fruit adds 100 points', () => {
      expect(calculateScoreChange('super', 200)).toBe(300);
    });

    test('9.5 - Banana adds 15 points', () => {
      expect(calculateScoreChange('banana', 35)).toBe(50);
    });

    test('9.6 - Cherry adds 25 points', () => {
      expect(calculateScoreChange('cherry', 75)).toBe(100);
    });

    test('9.7 - Watermelon adds 30 points', () => {
      expect(calculateScoreChange('watermelon', 70)).toBe(100);
    });

    test('9.8 - Mushroom adds 5 points', () => {
      expect(calculateScoreChange('mushroom', 45)).toBe(50);
    });

    test('9.9 - Poison subtracts 10 points', () => {
      expect(calculateScoreChange('poison', 50)).toBe(40);
    });

    test('9.10 - Poison cannot make score negative', () => {
      expect(calculateScoreChange('poison', 5)).toBe(0);
      expect(calculateScoreChange('poison', 0)).toBe(0);
    });

    test('9.11 - Unknown food type maintains score', () => {
      expect(calculateScoreChange('unknown', 100)).toBe(100);
    });
  });

  describe('10. Food Generation', () => {
    test('10.1 - Generates food in valid position', () => {
      const occupied = [
        { x: 10, y: 10 },
        { x: 11, y: 10 }
      ];
      
      const restore = mockRandom(0.5);
      const position = generateFoodPosition(occupied);
      restore();
      
      expect(position).not.toBeNull();
      if (position) {
        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.x).toBeLessThan(GRID_SIZE);
        expect(position.y).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeLessThan(GRID_SIZE);
      }
    });

    test('10.2 - Does not place food on snake', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      
      for (let i = 0; i < 10; i++) {
        const position = generateFoodPosition(snake);
        if (position) {
          const onSnake = snake.some(s => s.x === position.x && s.y === position.y);
          expect(onSnake).toBe(false);
        }
      }
    });

    test('10.3 - Returns null when grid is full', () => {
      const occupied: Position[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          occupied.push({ x, y });
        }
      }
      
      const position = generateFoodPosition(occupied);
      expect(position).toBeNull();
    });

    test('10.4 - Generates different food types', () => {
      const types = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        types.add(determineFoodType());
      }
      
      expect(types.size).toBeGreaterThan(3);
      types.forEach(type => {
        expect(FOOD_TYPES[type]).toBeDefined();
      });
    });

    test('10.5 - Generates complete food object', () => {
      const snake = [{ x: 10, y: 10 }];
      const foods: Food[] = [];
      const walls: Position[] = [];
      
      const food = generateFood(snake, foods, walls);
      
      expect(food).not.toBeNull();
      if (food) {
        expect(food).toHaveProperty('x');
        expect(food).toHaveProperty('y');
        expect(food).toHaveProperty('type');
        expect(typeof food.x).toBe('number');
        expect(typeof food.y).toBe('number');
        expect(typeof food.type).toBe('string');
      }
    });
  });

  describe('11. Complete Game Tick', () => {
    test('11.1 - Normal movement without collision', () => {
      const result = processGameTick(
        [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        { x: 1, y: 0 },
        [{ x: 15, y: 15, type: 'apple' }],
        [],
        100
      );
      
      expect(result.gameOver).toBe(false);
      expect(result.snake[0]).toEqual({ x: 11, y: 10 });
      expect(result.snake.length).toBe(2);
      expect(result.score).toBe(100);
      expect(result.foodEaten).toBeNull();
    });

    test('11.2 - Eating regular food', () => {
      const result = processGameTick(
        [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        { x: 1, y: 0 },
        [{ x: 11, y: 10, type: 'apple' }],
        [],
        50
      );
      
      expect(result.gameOver).toBe(false);
      expect(result.snake.length).toBe(3);
      expect(result.score).toBe(60);
      expect(result.foodEaten).toBe('apple');
    });

    test('11.3 - Eating mushroom doubles length', () => {
      const result = processGameTick(
        [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
        { x: 1, y: 0 },
        [{ x: 11, y: 10, type: 'mushroom' }],
        [],
        100
      );
      
      expect(result.gameOver).toBe(false);
      expect(result.snake.length).toBe(7); // 3 -> grows to 4 -> doubles to 7
      expect(result.score).toBe(105);
      expect(result.foodEaten).toBe('mushroom');
    });

    test('11.4 - Eating poison shrinks snake', () => {
      const result = processGameTick(
        [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }],
        { x: 1, y: 0 },
        [{ x: 11, y: 10, type: 'poison' }],
        [],
        100
      );
      
      expect(result.gameOver).toBe(false);
      expect(result.snake.length).toBe(3);
      expect(result.score).toBe(90);
      expect(result.foodEaten).toBe('poison');
    });

    test('11.5 - Wall collision ends game', () => {
      const result = processGameTick(
        [{ x: 0, y: 10 }, { x: 1, y: 10 }],
        { x: -1, y: 0 },
        [],
        [],
        100
      );
      
      expect(result.gameOver).toBe(true);
      expect(result.score).toBe(100);
      expect(result.foodEaten).toBeNull();
    });

    test('11.6 - Obstacle collision ends game', () => {
      const result = processGameTick(
        [{ x: 10, y: 10 }, { x: 9, y: 10 }],
        { x: 1, y: 0 },
        [],
        [{ x: 11, y: 10 }],
        100
      );
      
      expect(result.gameOver).toBe(true);
    });

    test('11.7 - Self collision ends game', () => {
      const result = processGameTick(
        [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 9, y: 11 },
          { x: 10, y: 11 }
        ],
        { x: 0, y: 1 }, // Will hit own body
        [],
        [],
        100
      );
      
      expect(result.gameOver).toBe(true);
    });
  });

  describe('12. Direction Validation', () => {
    test('12.1 - Cannot reverse horizontally', () => {
      expect(isValidDirectionChange({ x: 1, y: 0 }, { x: -1, y: 0 })).toBe(false);
      expect(isValidDirectionChange({ x: -1, y: 0 }, { x: 1, y: 0 })).toBe(false);
    });

    test('12.2 - Cannot reverse vertically', () => {
      expect(isValidDirectionChange({ x: 0, y: 1 }, { x: 0, y: -1 })).toBe(false);
      expect(isValidDirectionChange({ x: 0, y: -1 }, { x: 0, y: 1 })).toBe(false);
    });

    test('12.3 - Can turn from horizontal to vertical', () => {
      expect(isValidDirectionChange({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(true);
      expect(isValidDirectionChange({ x: 1, y: 0 }, { x: 0, y: -1 })).toBe(true);
    });

    test('12.4 - Can turn from vertical to horizontal', () => {
      expect(isValidDirectionChange({ x: 0, y: 1 }, { x: 1, y: 0 })).toBe(true);
      expect(isValidDirectionChange({ x: 0, y: 1 }, { x: -1, y: 0 })).toBe(true);
    });
  });

  describe('13. Keyboard Input', () => {
    test('13.1 - Arrow keys work correctly', () => {
      expect(getDirectionFromKey('ArrowUp', { x: 1, y: 0 })).toEqual({ x: 0, y: -1 });
      expect(getDirectionFromKey('ArrowDown', { x: 1, y: 0 })).toEqual({ x: 0, y: 1 });
      expect(getDirectionFromKey('ArrowLeft', { x: 0, y: 1 })).toEqual({ x: -1, y: 0 });
      expect(getDirectionFromKey('ArrowRight', { x: 0, y: 1 })).toEqual({ x: 1, y: 0 });
    });

    test('13.2 - WASD keys work correctly', () => {
      expect(getDirectionFromKey('w', { x: 1, y: 0 })).toEqual({ x: 0, y: -1 });
      expect(getDirectionFromKey('s', { x: 1, y: 0 })).toEqual({ x: 0, y: 1 });
      expect(getDirectionFromKey('a', { x: 0, y: 1 })).toEqual({ x: -1, y: 0 });
      expect(getDirectionFromKey('d', { x: 0, y: 1 })).toEqual({ x: 1, y: 0 });
    });

    test('13.3 - Capital WASD keys work', () => {
      expect(getDirectionFromKey('W', { x: 1, y: 0 })).toEqual({ x: 0, y: -1 });
      expect(getDirectionFromKey('S', { x: 1, y: 0 })).toEqual({ x: 0, y: 1 });
      expect(getDirectionFromKey('A', { x: 0, y: 1 })).toEqual({ x: -1, y: 0 });
      expect(getDirectionFromKey('D', { x: 0, y: 1 })).toEqual({ x: 1, y: 0 });
    });

    test('13.4 - Prevents 180-degree turns', () => {
      expect(getDirectionFromKey('ArrowLeft', { x: 1, y: 0 })).toBeNull();
      expect(getDirectionFromKey('ArrowRight', { x: -1, y: 0 })).toBeNull();
      expect(getDirectionFromKey('ArrowUp', { x: 0, y: 1 })).toBeNull();
      expect(getDirectionFromKey('ArrowDown', { x: 0, y: -1 })).toBeNull();
    });

    test('13.5 - Invalid keys return null', () => {
      expect(getDirectionFromKey('x', { x: 1, y: 0 })).toBeNull();
      expect(getDirectionFromKey('Enter', { x: 1, y: 0 })).toBeNull();
      expect(getDirectionFromKey(' ', { x: 1, y: 0 })).toBeNull();
    });
  });
});

// Performance Tests
describe('Performance Tests', () => {
  test('Game tick processes quickly with long snake', () => {
    const longSnake = Array.from({ length: 100 }, (_, i) => ({ x: i % GRID_SIZE, y: Math.floor(i / GRID_SIZE) }));
    const foods: Food[] = [{ x: 15, y: 15, type: 'apple' }];
    
    const start = performance.now();
    processGameTick(longSnake, { x: 1, y: 0 }, foods, [], 1000);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(10); // Should process in under 10ms
  });

  test('Food generation performs well with many obstacles', () => {
    const occupied = Array.from({ length: 350 }, (_, i) => ({
      x: i % GRID_SIZE,
      y: Math.floor(i / GRID_SIZE)
    }));
    
    const start = performance.now();
    generateFoodPosition(occupied);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(5); // Should find position quickly
  });
});