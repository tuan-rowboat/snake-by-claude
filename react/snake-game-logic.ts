// gameLogic.ts - Pure functions for game logic

export interface Position {
  x: number;
  y: number;
}

export interface Food extends Position {
  type: string;
}

export interface FoodType {
  color: string;
  points: number;
  spawnRate: number;
  shape: string;
  emoji: string;
  effect?: 'double' | 'shrink';
}

export const GRID_SIZE = 20;

export const FOOD_TYPES: Record<string, FoodType> = {
  apple: { color: '#ff0000', points: 10, spawnRate: 0.25, shape: 'circle', emoji: '🍎' },
  golden: { color: '#ffd700', points: 50, spawnRate: 0.08, shape: 'star', emoji: '⭐' },
  berry: { color: '#9932cc', points: 20, spawnRate: 0.15, shape: 'circle', emoji: '🫐' },
  super: { color: '#ff69b4', points: 100, spawnRate: 0.04, shape: 'diamond', emoji: '💎' },
  banana: { color: '#ffe135', points: 15, spawnRate: 0.13, shape: 'rectangle', emoji: '🍌' },
  cherry: { color: '#dc143c', points: 25, spawnRate: 0.1, shape: 'circle', emoji: '🍒' },
  watermelon: { color: '#fc6c85', points: 30, spawnRate: 0.07, shape: 'triangle', emoji: '🍉' },
  mushroom: { color: '#00ff00', points: 5, spawnRate: 0.08, shape: 'circle', emoji: '🍄', effect: 'double' },
  poison: { color: '#8b008b', points: -10, spawnRate: 0.1, shape: 'triangle', emoji: '☠️', effect: 'shrink' }
};

// Move snake in the given direction
export function moveSnake(
  snake: Position[],
  direction: Position
): Position[] {
  const newSnake = [...snake];
  const head = { ...newSnake[0] };
  
  head.x += direction.x;
  head.y += direction.y;
  
  newSnake.unshift(head);
  newSnake.pop(); // Remove tail (will be handled differently if food is eaten)
  
  return newSnake;
}

// Check if snake hits the wall
export function checkWallCollision(head: Position): boolean {
  return head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
}

// Check if snake hits itself
export function checkSelfCollision(snake: Position[]): boolean {
  const head = snake[0];
  return snake.slice(1).some(segment => 
    segment.x === head.x && segment.y === head.y
  );
}

// Check if snake hits an obstacle wall
export function checkObstacleCollision(head: Position, walls: Position[]): boolean {
  return walls.some(wall => wall.x === head.x && wall.y === head.y);
}

// Check if snake eats food
export function checkFoodCollision(head: Position, foods: Food[]): number {
  return foods.findIndex(food => food.x === head.x && food.y === head.y);
}

// Handle regular food consumption (grow by 1)
export function eatRegularFood(snake: Position[], direction: Position): Position[] {
  const newSnake = [...snake];
  const head = { ...newSnake[0] };
  
  head.x += direction.x;
  head.y += direction.y;
  
  newSnake.unshift(head);
  // Don't pop tail - snake grows by 1
  
  return newSnake;
}

// Handle mushroom effect (double length)
export function eatMushroom(snake: Position[]): Position[] {
  const newSnake = [...snake];
  const currentLength = newSnake.length;
  
  // Double the snake by duplicating segments from the tail
  for (let i = 0; i < currentLength - 1; i++) {
    const lastSegment = newSnake[newSnake.length - 1];
    newSnake.push({ ...lastSegment });
  }
  
  return newSnake;
}

// Handle poison effect (shrink by 2)
export function eatPoison(snake: Position[]): Position[] {
  const newSnake = [...snake];
  const MIN_LENGTH = 3;
  
  if (newSnake.length > MIN_LENGTH) {
    newSnake.pop();
    if (newSnake.length > MIN_LENGTH) {
      newSnake.pop();
    }
  }
  
  return newSnake;
}

// Calculate score change based on food type
export function calculateScoreChange(foodType: string, currentScore: number): number {
  const food = FOOD_TYPES[foodType];
  if (!food) return currentScore;
  
  const newScore = currentScore + food.points;
  return Math.max(0, newScore); // Don't go below 0
}

// Generate random food position
export function generateFoodPosition(
  occupiedPositions: Position[]
): Position | null {
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const position: Position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    const isOccupied = occupiedPositions.some(
      pos => pos.x === position.x && pos.y === position.y
    );
    
    if (!isOccupied) {
      return position;
    }
    
    attempts++;
  }
  
  return null; // No free space found
}

// Determine food type based on spawn rates
export function determineFoodType(): string {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [type, props] of Object.entries(FOOD_TYPES)) {
    cumulative += props.spawnRate;
    if (rand < cumulative) {
      return type;
    }
  }
  
  return 'apple'; // Default fallback
}

// Generate new food with type
export function generateFood(
  snake: Position[],
  existingFoods: Food[],
  walls: Position[]
): Food | null {
  const occupiedPositions = [...snake, ...existingFoods, ...walls];
  const position = generateFoodPosition(occupiedPositions);
  
  if (!position) return null;
  
  return {
    ...position,
    type: determineFoodType()
  };
}

// Process a complete game tick
export function processGameTick(
  snake: Position[],
  direction: Position,
  foods: Food[],
  walls: Position[],
  score: number
): {
  snake: Position[];
  foods: Food[];
  score: number;
  gameOver: boolean;
  foodEaten: string | null;
} {
  // Calculate new head position
  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };
  
  // Check collisions
  if (checkWallCollision(newHead)) {
    return { snake, foods, score, gameOver: true, foodEaten: null };
  }
  
  if (checkObstacleCollision(newHead, walls)) {
    return { snake, foods, score, gameOver: true, foodEaten: null };
  }
  
  // Move snake head
  let newSnake = [newHead, ...snake];
  
  // Check self collision (after moving head)
  if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    return { snake, foods, score, gameOver: true, foodEaten: null };
  }
  
  // Check food collision
  const foodIndex = checkFoodCollision(newHead, foods);
  let newFoods = [...foods];
  let newScore = score;
  let foodEaten: string | null = null;
  
  if (foodIndex !== -1) {
    const eatenFood = foods[foodIndex];
    foodEaten = eatenFood.type;
    const foodType = FOOD_TYPES[eatenFood.type];
    
    // Handle special effects
    if (foodType.effect === 'double') {
      // Don't pop tail (grew by 1 from movement), then double the length
      newSnake = eatMushroom(newSnake);
    } else if (foodType.effect === 'shrink') {
      // Pop tail from movement, then shrink by 2 more
      newSnake.pop();
      newSnake = eatPoison(newSnake);
    }
    // For regular food, don't pop tail (snake grows by 1)
    
    // Update score
    newScore = calculateScoreChange(eatenFood.type, score);
    
    // Remove eaten food
    newFoods = foods.filter((_, index) => index !== foodIndex);
    
    // Generate new food
    const newFood = generateFood(newSnake, newFoods, walls);
    if (newFood) {
      newFoods.push(newFood);
    }
  } else {
    // No food eaten, pop tail (normal movement)
    newSnake.pop();
  }
  
  return {
    snake: newSnake,
    foods: newFoods,
    score: newScore,
    gameOver: false,
    foodEaten
  };
}

// Validate direction change (prevent 180-degree turns)
export function isValidDirectionChange(
  currentDirection: Position,
  newDirection: Position
): boolean {
  // Can't reverse directly into yourself
  if (currentDirection.x !== 0 && newDirection.x !== 0) {
    return currentDirection.x + newDirection.x !== 0;
  }
  if (currentDirection.y !== 0 && newDirection.y !== 0) {
    return currentDirection.y + newDirection.y !== 0;
  }
  return true;
}

// Get direction from keyboard input
export function getDirectionFromKey(
  key: string,
  currentDirection: Position
): Position | null {
  const directionMap: Record<string, Position> = {
    'ArrowUp': { x: 0, y: -1 },
    'ArrowDown': { x: 0, y: 1 },
    'ArrowLeft': { x: -1, y: 0 },
    'ArrowRight': { x: 1, y: 0 },
    'w': { x: 0, y: -1 },
    'W': { x: 0, y: -1 },
    's': { x: 0, y: 1 },
    'S': { x: 0, y: 1 },
    'a': { x: -1, y: 0 },
    'A': { x: -1, y: 0 },
    'd': { x: 1, y: 0 },
    'D': { x: 1, y: 0 }
  };
  
  const newDirection = directionMap[key];
  if (!newDirection) return null;
  
  if (isValidDirectionChange(currentDirection, newDirection)) {
    return newDirection;
  }
  
  return null;
}