// gameLogic.test.ts - Comprehensive tests for game logic

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
} from './gameLogic';

describe('Snake Movement', () => {
  test('should move snake right', () => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
    const direction = { x: 1, y: 0 };
    const newSnake = moveSnake(snake, direction);
    
    expect(newSnake[0]).toEqual({ x: 11, y: 10 });
    expect(newSnake.length).toBe(2);
  });

  test('should move snake left', () => {
    const snake = [{ x: 10, y: 10 }, { x: 11, y: 10 }];
    const direction = { x: -1, y: 0 };
    const newSnake = moveSnake(snake, direction);
    
    expect(newSnake[0]).toEqual({ x: 9, y: 10 });
  });

  test('should move snake up', () => {
    const snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }];
    const direction = { x: 0, y: -1 };
    const newSnake = moveSnake(snake, direction);
    
    expect(newSnake[0]).toEqual({ x: 10, y: 9 });
  });

  test('should move snake down', () => {
    const snake = [{ x: 10, y: 10 }, { x: 10, y: 9 }];
    const direction = { x: 0, y: 1 };
    const newSnake = moveSnake(snake, direction);
    
    expect(newSnake[0]).toEqual({ x: 10, y: 11 });
  });

  test('should maintain snake length when moving', () => {
    const snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    const direction = { x: 1, y: 0 };
    const newSnake = moveSnake(snake, direction);
    
    expect(newSnake.length).toBe(snake.length);
  });
});

describe('Collision Detection', () => {
  describe('Wall Collision', () => {
    test('should detect collision with left wall', () => {
      const head = { x: -1, y: 10 };
      expect(checkWallCollision(head)).toBe(true);
    });

    test('should detect collision with right wall', () => {
      const head = { x: GRID_SIZE, y: 10 };
      expect(checkWallCollision(head)).toBe(true);
    });

    test('should detect collision with top wall', () => {
      const head = { x: 10, y: -1 };
      expect(checkWallCollision(head)).toBe(true);
    });

    test('should detect collision with bottom wall', () => {
      const head = { x: 10, y: GRID_SIZE };
      expect(checkWallCollision(head)).toBe(true);
    });

    test('should not detect collision when inside boundaries', () => {
      const head = { x: 10, y: 10 };
      expect(checkWallCollision(head)).toBe(false);
    });
  });

  describe('Self Collision', () => {
    test('should detect when snake hits itself', () => {
      const snake = [
        { x: 10, y: 10 }, // Head
        { x: 9, y: 10 },
        { x: 10, y: 10 }  // Same as head
      ];
      expect(checkSelfCollision(snake)).toBe(true);
    });

    test('should not detect collision for valid snake', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      expect(checkSelfCollision(snake)).toBe(false);
    });

    test('should not detect collision for single segment snake', () => {
      const snake = [{ x: 10, y: 10 }];
      expect(checkSelfCollision(snake)).toBe(false);
    });
  });

  describe('Obstacle Collision', () => {
    test('should detect collision with wall obstacle', () => {
      const head = { x: 5, y: 5 };
      const walls = [
        { x: 5, y: 5 },
        { x: 6, y: 5 }
      ];
      expect(checkObstacleCollision(head, walls)).toBe(true);
    });

    test('should not detect collision when no walls hit', () => {
      const head = { x: 5, y: 5 };
      const walls = [
        { x: 6, y: 5 },
        { x: 7, y: 5 }
      ];
      expect(checkObstacleCollision(head, walls)).toBe(false);
    });
  });

  describe('Food Collision', () => {
    test('should detect when snake eats food', () => {
      const head = { x: 5, y: 5 };
      const foods: Food[] = [
        { x: 5, y: 5, type: 'apple' },
        { x: 10, y: 10, type: 'berry' }
      ];
      expect(checkFoodCollision(head, foods)).toBe(0);
    });

    test('should return -1 when no food collision', () => {
      const head = { x: 5, y: 5 };
      const foods: Food[] = [
        { x: 6, y: 5, type: 'apple' },
        { x: 10, y: 10, type: 'berry' }
      ];
      expect(checkFoodCollision(head, foods)).toBe(-1);
    });

    test('should return correct index for eaten food', () => {
      const head = { x: 10, y: 10 };
      const foods: Food[] = [
        { x: 5, y: 5, type: 'apple' },
        { x: 10, y: 10, type: 'golden' },
        { x: 15, y: 15, type: 'berry' }
      ];
      expect(checkFoodCollision(head, foods)).toBe(1);
    });
  });
});

describe('Food Effects', () => {
  describe('Regular Food', () => {
    test('should grow snake by 1 when eating regular food', () => {
      const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
      const direction = { x: 1, y: 0 };
      const newSnake = eatRegularFood(snake, direction);
      
      expect(newSnake.length).toBe(snake.length + 1);
      expect(newSnake[0]).toEqual({ x: 11, y: 10 });
    });
  });

  describe('Mushroom Effect', () => {
    test('should double snake length', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      const newSnake = eatMushroom(snake);
      
      expect(newSnake.length).toBe(5); // 3 + (3-1) = 5
    });

    test('should double single segment snake correctly', () => {
      const snake = [{ x: 10, y: 10 }];
      const newSnake = eatMushroom(snake);
      
      expect(newSnake.length).toBe(1); // Can't double a single segment
    });

    test('should maintain snake continuity when doubling', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 }
      ];
      const newSnake = eatMushroom(snake);
      
      expect(newSnake.length).toBe(3);
      expect(newSnake[2]).toEqual({ x: 9, y: 10 }); // Duplicated tail
    });
  });

  describe('Poison Effect', () => {
    test('should shrink snake by 2 segments', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
      ];
      const newSnake = eatPoison(snake);
      
      expect(newSnake.length).toBe(3);
    });

    test('should not shrink below minimum length of 3', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
      ];
      const newSnake = eatPoison(snake);
      
      expect(newSnake.length).toBe(3);
    });

    test('should maintain minimum length when already at 3', () => {
      const snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      const newSnake = eatPoison(snake);
      
      expect(newSnake.length).toBe(3);
    });
  });
});

describe('Score Calculation', () => {
  test('should add points for regular food', () => {
    const score = calculateScoreChange('apple', 100);
    expect(score).toBe(110); // 100 + 10
  });

  test('should add high points for golden food', () => {
    const score = calculateScoreChange('golden', 50);
    expect(score).toBe(100); // 50 + 50
  });

  test('should add points for mushroom', () => {
    const score = calculateScoreChange('mushroom', 20);
    expect(score).toBe(25); // 20 + 5
  });

  test('should subtract points for poison', () => {
    const score = calculateScoreChange('poison', 50);
    expect(score).toBe(40); // 50 - 10
  });

  test('should not go below 0 for poison', () => {
    const score = calculateScoreChange('poison', 5);
    expect(score).toBe(0); // Max(0, 5 - 10)
  });

  test('should handle unknown food type', () => {
    const score = calculateScoreChange('unknown', 100);
    expect(score).toBe(100);
  });
});

describe('Food Generation', () => {
  test('should generate food in empty position', () => {
    const occupied = [
      { x: 10, y: 10 },
      { x: 11, y: 10 }
    ];
    const position = generateFoodPosition(occupied);
    
    expect(position).not.toBeNull();
    if (position) {
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThan(GRID_SIZE);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThan(GRID_SIZE);
      
      // Should not be in occupied positions
      const isOccupied = occupied.some(
        pos => pos.x === position.x && pos.y === position.y
      );
      expect(isOccupied).toBe(false);
    }
  });

  test('should return null when no space available', () => {
    // Fill entire grid
    const occupied: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        occupied.push({ x, y });
      }
    }
    
    const position = generateFoodPosition(occupied);
    expect(position).toBeNull();
  });

  test('should determine food type based on spawn rates', () => {
    const types = new Set<string>();
    
    // Run multiple times to get different types
    for (let i = 0; i < 100; i++) {
      types.add(determineFoodType());
    }
    
    // Should generate multiple food types
    expect(types.size).toBeGreaterThan(1);
    
    // All types should be valid
    types.forEach(type => {
      expect(FOOD_TYPES[type]).toBeDefined();
    });
  });

  test('should generate complete food object', () => {
    const snake = [{ x: 10, y: 10 }];
    const existingFoods: Food[] = [];
    const walls: Position[] = [];
    
    const food = generateFood(snake, existingFoods, walls);
    
    expect(food).not.toBeNull();
    if (food) {
      expect(food.x).toBeDefined();
      expect(food.y).toBeDefined();
      expect(food.type).toBeDefined();
      expect(FOOD_TYPES[food.type]).toBeDefined();
    }
  });
});

describe('Game Tick Processing', () => {
  test('should process normal movement', () => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
    const direction = { x: 1, y: 0 };
    const foods: Food[] = [{ x: 15, y: 15, type: 'apple' }];
    const walls: Position[] = [];
    const score = 0;
    
    const result = processGameTick(snake, direction, foods, walls, score);
    
    expect(result.gameOver).toBe(false);
    expect(result.snake[0]).toEqual({ x: 11, y: 10 });
    expect(result.snake.length).toBe(2);
    expect(result.score).toBe(0);
    expect(result.foodEaten).toBeNull();
  });

  test('should handle eating regular food', () => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
    const direction = { x: 1, y: 0 };
    const foods: Food[] = [{ x: 11, y: 10, type: 'apple' }];
    const walls: Position[] = [];
    const score = 0;
    
    const result = processGameTick(snake, direction, foods, walls, score);
    
    expect(result.gameOver).toBe(false);
    expect(result.snake.length).toBe(3); // Grew by 1
    expect(result.score).toBe(10); // Apple points
    expect(result.foodEaten).toBe('apple');
    expect(result.foods.length).toBeGreaterThanOrEqual(0); // Food replaced
  });

  test('should handle eating mushroom', () => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    const direction = { x: 1, y: 0 };
    const foods: Food[] = [{ x: 11, y: 10, type: 'mushroom' }];
    const walls: Position[] = [];
    const score = 20;
    
    const result = processGameTick(snake, direction, foods, walls, score);
    
    expect(result.gameOver).toBe(false);
    expect(result.snake.length).toBe(6); // Doubled from 3
    expect(result.score).toBe(25); // 20 + 5
    expect(result.foodEaten).toBe('mushroom');
  });

  test('should handle eating poison', () => {
    const snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    const direction = { x: 1, y: 0 };
    const foods: Food[] = [{ x: 11, y: 10, type: 'poison' }];
    const walls: Position[] = [];
    const score = 50;
    
    const result = processGameTick(snake, direction, foods, walls, score);
    
    expect(result.gameOver).toBe(false);
    expect(result.snake.length).toBe(3); // Shrunk to minimum
    expect(result.score).toBe(40); // 50 - 10
    expect(result.foodEaten).toBe('poison');
  });

  test('should detect wall collision', () => {
    const snake = [{ x: 0, y: 10 }, { x: 1, y: 10 }];
    const direction = { x: -1, y: 0 }; // Moving into left wall
    const foods: Food[] = [];
    const walls: Position[] = [];
    const score = 100;
    
    const result = processGameTick(snake, direction, foods, walls, score);
    
    expect(result.gameOver).toBe(true);
    expect(result.snake).toEqual(snake); // Snake unchanged
    expect(result.score).toBe(100); // Score unchanged
  });

  test('should detect obstacle collision', () => {
    const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
    const direction = { x: 1, y: 0 };
    const foods: Food[] = [];
    const walls: Position[] = [{ x: 11, y: 10 }]; // Wall in path
    const score = 50;
    
    const result = processGameTick(snake, direction, foods, walls, score);
    
    expect(result.gameOver).toBe(true);
  });

  test('should detect self collision', () => {
    const snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 9, y: 11 },
      { x: 10, y: 11 } // Will hit this segment
    ];
    const direction = { x: 0, y: 1 }; // Moving down into