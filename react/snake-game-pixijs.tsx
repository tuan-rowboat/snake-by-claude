import React, { useState, useEffect, useCallback, useRef } from 'react';

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 25;
const GAME_WIDTH = GRID_SIZE * CELL_SIZE;
const GAME_HEIGHT = GRID_SIZE * CELL_SIZE;

// Food types with their properties
const FOOD_TYPES = {
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

// Wall patterns
const WALL_PATTERNS = {
  none: [],
  simple: [
    { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
    { x: 12, y: 14 }, { x: 13, y: 14 }, { x: 14, y: 14 },
    { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 7, y: 14 },
    { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }
  ],
  cross: [
    // Horizontal line
    { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 },
    { x: 11, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 },
    // Vertical line
    { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 },
    { x: 10, y: 11 }, { x: 10, y: 12 }, { x: 10, y: 13 }, { x: 10, y: 14 }
  ],
  maze: [
    // Top left L
    { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
    // Top right L
    { x: 14, y: 3 }, { x: 15, y: 3 }, { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 16, y: 5 },
    // Bottom left L
    { x: 3, y: 14 }, { x: 3, y: 15 }, { x: 3, y: 16 }, { x: 4, y: 16 }, { x: 5, y: 16 },
    // Bottom right L
    { x: 16, y: 14 }, { x: 16, y: 15 }, { x: 16, y: 16 }, { x: 15, y: 16 }, { x: 14, y: 16 },
    // Center obstacles
    { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }
  ],
  random: [] // Will be generated randomly
};

// Snake head shapes
const HEAD_SHAPES = ['square', 'circle', 'triangle', 'diamond', 'star'];
const HEAD_COLORS = ['#00ff00', '#0080ff', '#ff00ff', '#ffff00', '#00ffff', '#ff8000'];
const BG_COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#3d5a80'];
const SPEEDS = { slow: 200, normal: 120, fast: 70 };

// Generate random walls
const generateRandomWalls = (count = 15) => {
  const walls = [];
  const forbidden = [
    { x: 10, y: 10 }, // Starting position
    { x: 15, y: 15 }  // Initial food position
  ];
  
  while (walls.length < count) {
    const wall = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Check if wall is not in forbidden positions or already exists
    const isForbidden = forbidden.some(f => f.x === wall.x && f.y === wall.y);
    const exists = walls.some(w => w.x === wall.x && w.y === wall.y);
    
    if (!isForbidden && !exists) {
      walls.push(wall);
      // Add adjacent wall sometimes for more interesting patterns
      if (Math.random() > 0.5 && walls.length < count) {
        const directions = [
          { x: 1, y: 0 }, { x: -1, y: 0 },
          { x: 0, y: 1 }, { x: 0, y: -1 }
        ];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const adjacent = {
          x: wall.x + dir.x,
          y: wall.y + dir.y
        };
        if (adjacent.x >= 0 && adjacent.x < GRID_SIZE && 
            adjacent.y >= 0 && adjacent.y < GRID_SIZE &&
            !forbidden.some(f => f.x === adjacent.x && f.y === adjacent.y)) {
          walls.push(adjacent);
        }
      }
    }
  }
  
  return walls;
};

// Canvas-based Snake Game Component
const SnakeGame = () => {
  const canvasRef = useRef(null);
  
  // Game state
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [foods, setFoods] = useState([{ x: 15, y: 15, type: 'apple' }]);
  const [walls, setWalls] = useState([]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([]);
  
  // Settings
  const [headShape, setHeadShape] = useState('square');
  const [headColor, setHeadColor] = useState('#00ff00');
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [speed, setSpeed] = useState('normal');
  const [wallPattern, setWallPattern] = useState('simple');
  const [maxFoods, setMaxFoods] = useState(3);
  
  // Refs
  const directionRef = useRef(direction);
  const gameLoopRef = useRef(null);
  const snakeRef = useRef(snake);
  const foodsRef = useRef(foods);
  const wallsRef = useRef(walls);

  // Update refs when state changes
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodsRef.current = foods;
  }, [foods]);

  useEffect(() => {
    wallsRef.current = walls;
  }, [walls]);

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Draw functions
  const drawShape = (ctx, shape, x, y, size, color) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(x + size/2, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x + size/2, y);
        ctx.lineTo(x + size, y + size/2);
        ctx.lineTo(x + size/2, y + size);
        ctx.lineTo(x, y + size/2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        const cx = x + size/2;
        const cy = y + size/2;
        const spikes = 5;
        const outerRadius = size/2;
        const innerRadius = size/4;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / spikes) * i - Math.PI/2;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.fill();
        break;
      case 'rectangle':
        ctx.fillRect(x + size/4, y, size/2, size);
        break;
      default: // square
        ctx.fillRect(x, y, size, size);
    }
  };

  // Draw game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GAME_HEIGHT);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GAME_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw walls
    ctx.fillStyle = '#666666';
    ctx.strokeStyle = '#999999';
    wallsRef.current.forEach(wall => {
      ctx.fillRect(wall.x * CELL_SIZE + 1, wall.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      ctx.strokeRect(wall.x * CELL_SIZE + 1, wall.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    
    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      if (index === 0) {
        // Draw head
        drawShape(ctx, headShape, segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, headColor);
        
        // Draw eyes for head
        if (headShape !== 'triangle') {
          ctx.fillStyle = 'white';
          const eyeSize = 3;
          const eyeOffset = 5;
          if (directionRef.current.x === 1) { // facing right
            ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
          } else if (directionRef.current.x === -1) { // facing left
            ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
          } else if (directionRef.current.y === -1) { // facing up
            ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize);
          } else { // facing down
            ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
          }
        }
      } else {
        // Draw body with gradient effect
        const opacity = 1 - (index / snakeRef.current.length) * 0.3;
        ctx.fillStyle = headColor + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
    });
    
    // Draw foods
    foodsRef.current.forEach(food => {
      const foodType = FOOD_TYPES[food.type];
      
      if (food.type === 'super') {
        // Rainbow effect for super fruit
        const gradient = ctx.createRadialGradient(
          food.x * CELL_SIZE + CELL_SIZE/2,
          food.y * CELL_SIZE + CELL_SIZE/2,
          0,
          food.x * CELL_SIZE + CELL_SIZE/2,
          food.y * CELL_SIZE + CELL_SIZE/2,
          CELL_SIZE/2
        );
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(1, '#0000ff');
        ctx.fillStyle = gradient;
        drawShape(ctx, 'diamond', food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, gradient);
      } else if (food.type === 'mushroom') {
        // Pulsing green effect for mushroom
        const time = Date.now() / 500;
        const pulse = Math.sin(time) * 0.3 + 0.7;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15 * pulse;
        ctx.fillStyle = foodType.color;
        drawShape(ctx, foodType.shape, food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, foodType.color);
        // Draw x2 symbol
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('x2', food.x * CELL_SIZE + CELL_SIZE/2, food.y * CELL_SIZE + CELL_SIZE/2);
      } else if (food.type === 'poison') {
        // Dark purple with skull effect
        ctx.shadowColor = '#8b008b';
        ctx.shadowBlur = 10;
        drawShape(ctx, foodType.shape, food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, foodType.color);
        // Draw skull symbol
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('☠', food.x * CELL_SIZE + CELL_SIZE/2, food.y * CELL_SIZE + CELL_SIZE/2 + 2);
      } else {
        // Add glow effect for high-value foods
        if (foodType.points >= 30) {
          ctx.shadowColor = foodType.color;
          ctx.shadowBlur = 10;
        }
        drawShape(ctx, foodType.shape, food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, foodType.color);
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw pause overlay
    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
  }, [bgColor, headShape, headColor, gameState]);

  // Generate random food
  const generateFood = useCallback(() => {
    const occupiedPositions = [
      ...snake,
      ...foods,
      ...walls
    ];
    
    let newFood;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        type: 'apple'
      };
      attempts++;
      if (attempts > 100) break; // Prevent infinite loop
    } while (occupiedPositions.some(pos => pos.x === newFood.x && pos.y === newFood.y));
    
    // Determine food type based on spawn rates
    const rand = Math.random();
    let cumulative = 0;
    for (const [type, props] of Object.entries(FOOD_TYPES)) {
      cumulative += props.spawnRate;
      if (rand < cumulative) {
        newFood.type = type;
        break;
      }
    }
    
    return newFood;
  }, [snake, foods, walls]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      // Move head
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;
      
      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState('gameOver');
        return prevSnake;
      }
      
      // Check wall obstacle collision
      if (wallsRef.current.some(wall => wall.x === head.x && wall.y === head.y)) {
        setGameState('gameOver');
        return prevSnake;
      }
      
      // Check self collision
      if (newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameState('gameOver');
        return prevSnake;
      }
      
      newSnake.unshift(head);
      
      // Check food collision
      const eatenFoodIndex = foodsRef.current.findIndex(food => food.x === head.x && food.y === head.y);
      if (eatenFoodIndex !== -1) {
        const eatenFood = foodsRef.current[eatenFoodIndex];
        const foodType = FOOD_TYPES[eatenFood.type];
        const points = foodType.points;
        
        // Handle special effects
        if (foodType.effect === 'double') {
          // Double the snake length (mushroom effect)
          const currentLength = newSnake.length;
          for (let i = 0; i < currentLength - 1; i++) {
            const lastSegment = newSnake[newSnake.length - 1];
            newSnake.push({ ...lastSegment });
          }
          setScore(prev => prev + points);
        } else if (foodType.effect === 'shrink') {
          // Reduce snake length by 2 (poison effect)
          if (newSnake.length > 3) { // Keep minimum length of 3
            newSnake.pop();
            newSnake.pop();
          }
          setScore(prev => Math.max(0, prev + points)); // Don't go below 0
        } else {
          // Normal food - just add points
          setScore(prev => prev + points);
        }
        
        // Remove eaten food and generate new one
        setFoods(prevFoods => {
          const newFoods = prevFoods.filter((_, index) => index !== eatenFoodIndex);
          // Add new food if below max
          if (newFoods.length < maxFoods) {
            newFoods.push(generateFood());
          }
          return newFoods;
        });
      } else {
        // Only pop if we didn't eat regular food (special foods handle their own length)
        if (eatenFoodIndex === -1 || (!FOOD_TYPES[foodsRef.current[eatenFoodIndex]?.type]?.effect)) {
          newSnake.pop();
        }
      }
      
      return newSnake;
    });
    
    // Spawn new foods periodically
    setFoods(prevFoods => {
      if (prevFoods.length < maxFoods && Math.random() < 0.1) {
        return [...prevFoods, generateFood()];
      }
      return prevFoods;
    });
  }, [gameState, maxFoods, generateFood]);

  // Animation loop
  useEffect(() => {
    let animationId;
    
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };
    
    if (gameState === 'playing' || gameState === 'paused') {
      animate();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [draw, gameState]);

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, SPEEDS[speed]);
    } else {
      clearInterval(gameLoopRef.current);
    }
    
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, gameLoop, speed]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState === 'playing') {
        const newDirection = { ...directionRef.current };
        
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            if (directionRef.current.y === 0) {
              newDirection.x = 0;
              newDirection.y = -1;
            }
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            if (directionRef.current.y === 0) {
              newDirection.x = 0;
              newDirection.y = 1;
            }
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            if (directionRef.current.x === 0) {
              newDirection.x = -1;
              newDirection.y = 0;
            }
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            if (directionRef.current.x === 0) {
              newDirection.x = 1;
              newDirection.y = 0;
            }
            break;
          case ' ':
            setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
            break;
        }
        
        directionRef.current = newDirection;
        setDirection(newDirection);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Start new game
  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setScore(0);
    
    // Set walls based on pattern
    let newWalls = [];
    if (wallPattern === 'random') {
      newWalls = generateRandomWalls();
    } else if (wallPattern !== 'none') {
      newWalls = WALL_PATTERNS[wallPattern];
    }
    setWalls(newWalls);
    
    // Generate initial foods
    const initialFoods = [];
    for (let i = 0; i < maxFoods; i++) {
      initialFoods.push(generateFood());
    }
    setFoods(initialFoods);
    
    setGameState('playing');
  };

  // Save high score
  const saveHighScore = () => {
    const newScores = [...highScores, score].sort((a, b) => b - a).slice(0, 5);
    setHighScores(newScores);
    localStorage.setItem('snakeHighScores', JSON.stringify(newScores));
  };

  // Handle game over
  useEffect(() => {
    if (gameState === 'gameOver') {
      saveHighScore();
    }
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        🐍 Snake Game Deluxe
      </h1>
      
      {gameState === 'menu' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Game Settings</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Snake Head Shape</label>
              <select 
                value={headShape} 
                onChange={(e) => setHeadShape(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-white"
              >
                {HEAD_SHAPES.map(shape => (
                  <option key={shape} value={shape}>{shape.charAt(0).toUpperCase() + shape.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Wall Pattern</label>
              <select 
                value={wallPattern} 
                onChange={(e) => setWallPattern(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-400 focus:outline-none text-white"
              >
                <option value="none">None</option>
                <option value="simple">Simple</option>
                <option value="cross">Cross</option>
                <option value="maze">Maze</option>
                <option value="random">Random</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Snake Color</label>
              <div className="grid grid-cols-3 gap-2">
                {HEAD_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setHeadColor(color)}
                    className={`h-8 rounded border-2 transition-all ${headColor === color ? 'border-white scale-110' : 'border-gray-600'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="grid grid-cols-3 gap-2">
                {BG_COLORS.slice(0, 3).map(color => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`h-8 rounded border-2 transition-all ${bgColor === color ? 'border-white scale-110' : 'border-gray-600'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Game Speed</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(SPEEDS).map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`p-2 rounded transition-all text-sm ${speed === s ? 'bg-green-600 scale-105' : 'bg-gray-700'} hover:bg-green-500`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Foods on Screen</label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setMaxFoods(num)}
                    className={`p-2 rounded transition-all ${maxFoods === num ? 'bg-blue-600 scale-105' : 'bg-gray-700'} hover:bg-blue-500`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-4 rounded hover:from-green-600 hover:to-blue-600 transition transform hover:scale-105"
          >
            Start Game
          </button>
          
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <h3 className="text-sm font-bold mb-2">Food Values & Effects:</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-3 text-yellow-300 font-bold">Regular Foods:</div>
              {Object.entries(FOOD_TYPES).filter(([_, props]) => !props.effect).map(([type, props]) => (
                <div key={type} className="flex items-center gap-1">
                  <span>{props.emoji}</span>
                  <span>{props.points}pts</span>
                </div>
              ))}
              <div className="col-span-3 text-green-300 font-bold mt-2">Special Foods:</div>
              <div className="flex items-center gap-1 col-span-3">
                <span>🍄</span>
                <span className="text-green-400">Mushroom: x2 Length! (+5 pts)</span>
              </div>
              <div className="flex items-center gap-1 col-span-3">
                <span>☠️</span>
                <span className="text-purple-400">Poison: -2 Length! (-10 pts)</span>
              </div>
            </div>
          </div>
          
          {highScores.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-bold mb-2">🏆 High Scores</h3>
              <ol className="flex gap-4 justify-center">
                {highScores.map((score, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span>{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                    <span className="font-mono text-yellow-400">{score}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
      
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="flex flex-col items-center">
          <div className="mb-4 flex gap-8 items-center">
            <div className="text-xl font-bold">Score: <span className="text-green-400 text-2xl">{score}</span></div>
            <div className="text-sm opacity-75 animate-pulse">Press SPACE to {gameState === 'playing' ? 'Pause' : 'Resume'}</div>
          </div>
          
          <div className="relative rounded-lg overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="border-2 border-gray-700"
            />
          </div>
          
          <div className="mt-4 text-sm opacity-75">
            <div className="text-center mb-2">🎮 Use Arrow Keys or WASD to move</div>
            <div className="grid grid-cols-4 gap-2 text-xs bg-gray-800 p-3 rounded">
              {Object.entries(FOOD_TYPES).map(([type, props]) => (
                <div key={type} className="flex items-center gap-1">
                  <span>{props.emoji}</span>
                  <span>{props.points}pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {gameState === 'gameOver' && (
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-500">Game Over!</h2>
          <div className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            {score}
          </div>
          <div className="text-lg mb-6 text-gray-400">Points</div>
          
          {highScores.indexOf(score) !== -1 && highScores.indexOf(score) === 0 && (
            <div className="text-yellow-400 text-xl mb-4 animate-pulse">
              🏆 New High Score! 🏆
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition transform hover:scale-105"
            >
              Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition transform hover:scale-105"
            >
              Main Menu
            </button>
          </div>
          
          {highScores.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-bold mb-2">🏆 High Scores</h3>
              <ol className="space-y-1">
                {highScores.map((s, i) => (
                  <li key={i} className={`flex justify-between ${s === score ? 'text-green-400 font-bold' : ''}`}>
                    <span>{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]} </span>
                    <span className="font-mono">{s} pts</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SnakeGame;