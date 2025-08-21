import type { Position, Direction, Food, FoodType, Bullet } from '../types/game'
import { DEFAULT_GRID_SIZE, FOOD_TYPES } from './constants'

export const generateRandomWalls = (count: number = 15, gridSize: number = DEFAULT_GRID_SIZE): Position[] => {
  const walls: Position[] = []
  const forbidden: Position[] = [
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }, // Starting position player 1
    { x: Math.floor(gridSize / 2) - 2, y: Math.floor(gridSize / 2) - 2 },   // Starting position player 2
    { x: Math.floor(gridSize * 0.75), y: Math.floor(gridSize * 0.75) }  // Initial food position
  ]
  
  while (walls.length < count) {
    const wall: Position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    }
    
    // Check if wall is not in forbidden positions or already exists
    const isForbidden = forbidden.some(f => f.x === wall.x && f.y === wall.y)
    const exists = walls.some(w => w.x === wall.x && w.y === wall.y)
    
    if (!isForbidden && !exists) {
      walls.push(wall)
      // Add adjacent wall sometimes for more interesting patterns
      if (Math.random() > 0.5 && walls.length < count) {
        const directions: Direction[] = [
          { x: 1, y: 0 }, { x: -1, y: 0 },
          { x: 0, y: 1 }, { x: 0, y: -1 }
        ]
        const dir = directions[Math.floor(Math.random() * directions.length)]
        const adjacent: Position = {
          x: wall.x + dir.x,
          y: wall.y + dir.y
        }
        if (adjacent.x >= 0 && adjacent.x < gridSize && 
            adjacent.y >= 0 && adjacent.y < gridSize &&
            !forbidden.some(f => f.x === adjacent.x && f.y === adjacent.y)) {
          walls.push(adjacent)
        }
      }
    }
  }
  
  return walls
}

export const generateMovingWalls = (count: number = 8, gridSize: number = DEFAULT_GRID_SIZE): Position[] => {
  const walls: Position[] = []
  const forbidden: Position[] = [
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }, // Starting position player 1
    { x: Math.floor(gridSize / 2) - 2, y: Math.floor(gridSize / 2) - 2 },   // Starting position player 2
    { x: Math.floor(gridSize * 0.75), y: Math.floor(gridSize * 0.75) }  // Initial food position
  ]
  
  // Create moving wall patterns - smaller groups that can move around
  const patterns = [
    // L-shaped patterns
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
  ]
  
  let attempts = 0
  while (walls.length < count && attempts < 50) {
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]
    const baseX = Math.floor(Math.random() * (gridSize - 3))
    const baseY = Math.floor(Math.random() * (gridSize - 3))
    
    const newWalls = pattern.map(offset => ({
      x: baseX + offset.x,
      y: baseY + offset.y
    }))
    
    // Check if any new wall conflicts with forbidden positions or existing walls
    const hasConflict = newWalls.some(wall =>
      forbidden.some(f => f.x === wall.x && f.y === wall.y) ||
      walls.some(w => w.x === wall.x && w.y === wall.y) ||
      wall.x < 0 || wall.x >= gridSize || wall.y < 0 || wall.y >= gridSize
    )
    
    if (!hasConflict) {
      walls.push(...newWalls)
    }
    attempts++
  }
  
  return walls
}

export const moveWalls = (currentWalls: Position[], snakePositions: Position[], snake2Positions: Position[] = []): Position[] => {
  if (currentWalls.length === 0) return currentWalls
  
  const occupiedPositions = [...snakePositions, ...snake2Positions]
  const newWalls: Position[] = []
  
  // Group walls into patterns (assuming they were placed in groups)
  const wallGroups = groupWalls(currentWalls)
  
  for (const group of wallGroups) {
    // Try to move the entire group in a random direction
    const directions: Direction[] = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 }
    ]
    
    const direction = directions[Math.floor(Math.random() * directions.length)]
    const movedGroup = group.map(wall => ({
      x: wall.x + direction.x,
      y: wall.y + direction.y
    }))
    
    // Check if the moved group is valid (within bounds and not colliding with snakes)
    const isValidMove = movedGroup.every(wall =>
      wall.x >= 0 && wall.x < DEFAULT_GRID_SIZE &&
      wall.y >= 0 && wall.y < DEFAULT_GRID_SIZE &&
      !occupiedPositions.some(pos => pos.x === wall.x && pos.y === wall.y)
    )
    
    if (isValidMove) {
      newWalls.push(...movedGroup)
    } else {
      // If can't move, keep in original position
      newWalls.push(...group)
    }
  }
  
  return newWalls
}

// Helper function to group walls that are adjacent to each other
const groupWalls = (walls: Position[]): Position[][] => {
  const groups: Position[][] = []
  const visited = new Set<string>()
  
  for (const wall of walls) {
    const key = `${wall.x},${wall.y}`
    if (visited.has(key)) continue
    
    const group: Position[] = []
    const queue: Position[] = [wall]
    
    while (queue.length > 0) {
      const current = queue.shift()!
      const currentKey = `${current.x},${current.y}`
      
      if (visited.has(currentKey)) continue
      visited.add(currentKey)
      group.push(current)
      
      // Find adjacent walls
      const adjacent = walls.filter(w => {
        const distance = Math.abs(w.x - current.x) + Math.abs(w.y - current.y)
        return distance === 1 && !visited.has(`${w.x},${w.y}`)
      })
      
      queue.push(...adjacent)
    }
    
    if (group.length > 0) {
      groups.push(group)
    }
  }
  
  return groups
}

export const generateFood = (
  snakePositions: Position[], 
  foodPositions: Position[], 
  wallPositions: Position[],
  snake2Positions: Position[] = [],
  gridSize: number = DEFAULT_GRID_SIZE
): Food => {
  const occupiedPositions: Position[] = [
    ...snakePositions,
    ...foodPositions,
    ...wallPositions,
    ...snake2Positions
  ]
  
  let newFood: Food
  let attempts = 0
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
      type: 'apple'
    }
    attempts++
    if (attempts > 100) break // Prevent infinite loop
  } while (occupiedPositions.some(pos => pos.x === newFood.x && pos.y === newFood.y))
  
  // Determine food type based on spawn rates
  const rand = Math.random()
  let cumulative = 0
  for (const [type, props] of Object.entries(FOOD_TYPES) as [FoodType, any][]) {
    cumulative += props.spawnRate
    if (rand < cumulative) {
      newFood.type = type
      break
    }
  }
  
  return newFood
}

export const checkCollisions = (
  head: Position, 
  snake: Position[], 
  walls: Position[], 
  otherSnake: Position[] = [],
  gridSize: number = DEFAULT_GRID_SIZE
): boolean => {
  // Check boundary collision
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    return true
  }
  
  // Check wall collision
  if (walls.some(wall => wall.x === head.x && wall.y === head.y)) {
    return true
  }
  
  // Check self collision
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    return true
  }
  
  // Check collision with other snake (multiplayer)
  if (otherSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
    return true
  }
  
  return false
}

export const updateSnakeWithFood = (
  snake: Position[], 
  foodType: FoodType, 
  points: number
): { newSnake: Position[], scoreChange: number, bulletCount: number, magnetCount: number } => {
  const newSnake = [...snake]
  const foodProps = FOOD_TYPES[foodType]
  
  if (foodProps.effect === 'double') {
    // Double the snake length (mushroom effect)
    const currentLength = newSnake.length
    for (let i = 0; i < currentLength - 1; i++) {
      const lastSegment = newSnake[newSnake.length - 1]
      newSnake.push({ ...lastSegment })
    }
    return { newSnake, scoreChange: points, bulletCount: 0, magnetCount: 0 }
  } else if (foodProps.effect === 'shrink') {
    // Reduce snake length by 2 (poison effect)
    if (newSnake.length > 3) { // Keep minimum length of 3
      newSnake.pop()
      newSnake.pop()
    }
    return { newSnake, scoreChange: points, bulletCount: 0, magnetCount: 0 }
  } else if (foodProps.effect === 'bullet') {
    // Bullet food - grants 5 bullets
    const lastSegment = newSnake[newSnake.length - 1]
    newSnake.push({ ...lastSegment })
    return { newSnake, scoreChange: points, bulletCount: 5, magnetCount: 0 }
  } else if (foodProps.effect === 'magnet') {
    // Magnet food - grants 1-5 magnet charges
    const magnetCharges = Math.floor(Math.random() * 5) + 1 // 1-5
    const lastSegment = newSnake[newSnake.length - 1]
    newSnake.push({ ...lastSegment })
    return { newSnake, scoreChange: points, bulletCount: 0, magnetCount: magnetCharges }
  } else if (foodProps.effect === 'randomGrow') {
    // Growth Potion - randomly add 1-3 segments
    const randomGrowth = Math.floor(Math.random() * 3) + 1 // 1-3
    const lastSegment = newSnake[newSnake.length - 1]
    for (let i = 0; i < randomGrowth; i++) {
      newSnake.push({ ...lastSegment })
    }
    return { newSnake, scoreChange: points + randomGrowth * 5, bulletCount: 0, magnetCount: 0 } // Bonus points for growth
  } else if (foodProps.effect === 'randomShrink') {
    // Shrink Pill - randomly remove 1-3 segments
    const randomShrink = Math.floor(Math.random() * 3) + 1 // 1-3
    const minLength = 3 // Keep minimum length
    for (let i = 0; i < randomShrink && newSnake.length > minLength; i++) {
      newSnake.pop()
    }
    return { newSnake, scoreChange: points, bulletCount: 0, magnetCount: 0 }
  } else {
    // Normal food - grow snake by adding a segment
    const lastSegment = newSnake[newSnake.length - 1]
    newSnake.push({ ...lastSegment })
    
    // Golden apple grows by 2 segments
    if (foodType === 'golden') {
      newSnake.push({ ...lastSegment })
      return { newSnake, scoreChange: points * 2, bulletCount: 0, magnetCount: 0 } // Double points for golden apple
    }
    
    return { newSnake, scoreChange: points, bulletCount: 0, magnetCount: 0 }
  }
}

export const moveSnake = (snake: Position[], direction: Direction): Position[] => {
  const newSnake = [...snake]
  const head: Position = { ...newSnake[0] }
  
  // Move head
  head.x += direction.x
  head.y += direction.y
  
  newSnake.unshift(head)
  return newSnake
}

export const isValidDirection = (currentDirection: Direction, newDirection: Direction): boolean => {
  // Prevent immediate reversal
  if (currentDirection.x !== 0 && newDirection.x === -currentDirection.x) return false
  if (currentDirection.y !== 0 && newDirection.y === -currentDirection.y) return false
  return true
}

export const findValidTeleportPositions = (
  snake: Position[], 
  walls: Position[], 
  otherSnake: Position[] = [],
  minDistance: number = 5,
  gridSize: number = DEFAULT_GRID_SIZE
): Position[] => {
  const head = snake[0]
  const validPositions: Position[] = []
  const occupiedPositions = [...snake, ...walls, ...otherSnake]
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const position = { x, y }
      
      // Check if position is not occupied
      const isOccupied = occupiedPositions.some(pos => pos.x === x && pos.y === y)
      
      // Check minimum distance from current head
      const distance = Math.abs(head.x - x) + Math.abs(head.y - y)
      
      if (!isOccupied && distance >= minDistance) {
        validPositions.push(position)
      }
    }
  }
  
  return validPositions
}

export const executeRandomTeleport = (
  snake: Position[], 
  walls: Position[], 
  otherSnake: Position[] = [],
  gridSize: number = DEFAULT_GRID_SIZE
): Position[] => {
  const validPositions = findValidTeleportPositions(snake, walls, otherSnake, 5, gridSize)
  
  if (validPositions.length === 0) {
    // No valid teleport positions, return original snake
    return snake
  }
  
  // Choose random valid position
  const randomPosition = validPositions[Math.floor(Math.random() * validPositions.length)]
  
  // Create new snake with teleported head
  const newSnake = [...snake]
  newSnake[0] = randomPosition
  
  return newSnake
}

export const executeDirectionalTeleport = (
  snake: Position[], 
  direction: Direction, 
  walls: Position[], 
  otherSnake: Position[] = [],
  gridSize: number = DEFAULT_GRID_SIZE
): Position => {
  const head = snake[0]
  let teleportPosition = { ...head }
  
  // Move in the direction until hitting a wall, boundary, or finding valid position
  while (true) {
    teleportPosition.x += direction.x
    teleportPosition.y += direction.y
    
    // Wrap around boundaries (teleport through map edges)
    if (teleportPosition.x < 0) teleportPosition.x = gridSize - 1
    if (teleportPosition.x >= gridSize) teleportPosition.x = 0
    if (teleportPosition.y < 0) teleportPosition.y = gridSize - 1
    if (teleportPosition.y >= gridSize) teleportPosition.y = 0
    
    // Check if we hit a wall or other obstacle
    const isBlocked = walls.some(wall => wall.x === teleportPosition.x && wall.y === teleportPosition.y) ||
                     otherSnake.some(segment => segment.x === teleportPosition.x && segment.y === teleportPosition.y) ||
                     snake.slice(1).some(segment => segment.x === teleportPosition.x && segment.y === teleportPosition.y)
    
    // If we hit an obstacle, try to find nearby free space
    if (isBlocked) {
      const nearbyPositions = [
        { x: teleportPosition.x + 1, y: teleportPosition.y },
        { x: teleportPosition.x - 1, y: teleportPosition.y },
        { x: teleportPosition.x, y: teleportPosition.y + 1 },
        { x: teleportPosition.x, y: teleportPosition.y - 1 },
        { x: teleportPosition.x + 1, y: teleportPosition.y + 1 },
        { x: teleportPosition.x - 1, y: teleportPosition.y - 1 },
        { x: teleportPosition.x + 1, y: teleportPosition.y - 1 },
        { x: teleportPosition.x - 1, y: teleportPosition.y + 1 }
      ].filter(pos => 
        pos.x >= 0 && pos.x < gridSize && 
        pos.y >= 0 && pos.y < gridSize &&
        !walls.some(wall => wall.x === pos.x && wall.y === pos.y) &&
        !otherSnake.some(segment => segment.x === pos.x && segment.y === pos.y) &&
        !snake.slice(1).some(segment => segment.x === pos.x && segment.y === pos.y)
      )
      
      if (nearbyPositions.length > 0) {
        return nearbyPositions[0]
      }
    } else {
      return teleportPosition
    }
    
    // Safety check to prevent infinite loop
    if (Math.abs(teleportPosition.x - head.x) + Math.abs(teleportPosition.y - head.y) > gridSize * 2) {
      break
    }
  }
  
  // Fallback to original position if no valid teleport found
  return head
}

export const createBullet = (snakeHead: Position, direction: Direction, playerId: 1 | 2): Bullet => {
  return {
    x: snakeHead.x + direction.x,
    y: snakeHead.y + direction.y,
    direction,
    playerId
  }
}

export const moveBullets = (bullets: Bullet[], gridSize: number = DEFAULT_GRID_SIZE): Bullet[] => {
  return bullets
    .map(bullet => ({
      ...bullet,
      x: bullet.x + bullet.direction.x,
      y: bullet.y + bullet.direction.y
    }))
    .filter(bullet => 
      bullet.x >= 0 && bullet.x < gridSize && 
      bullet.y >= 0 && bullet.y < gridSize
    )
}

export const checkBulletWallCollisions = (bullets: Bullet[], walls: Position[]): { 
  remainingBullets: Bullet[], 
  destroyedWalls: Position[] 
} => {
  const remainingBullets: Bullet[] = []
  const destroyedWalls: Position[] = []
  const remainingWalls = [...walls]

  for (const bullet of bullets) {
    const wallIndex = remainingWalls.findIndex(wall => wall.x === bullet.x && wall.y === bullet.y)
    
    if (wallIndex !== -1) {
      // Bullet hits wall - destroy the wall and the bullet
      destroyedWalls.push(remainingWalls[wallIndex])
      remainingWalls.splice(wallIndex, 1)
    } else {
      // Bullet doesn't hit wall - keep it
      remainingBullets.push(bullet)
    }
  }

  return { remainingBullets, destroyedWalls }
}

export const checkBulletSnakeCollisions = (bullets: Bullet[], snake: Position[], otherSnake: Position[] = []): {
  remainingBullets: Bullet[],
  snakeHit: boolean,
  otherSnakeHit: boolean
} => {
  const remainingBullets: Bullet[] = []
  let snakeHit = false
  let otherSnakeHit = false

  for (const bullet of bullets) {
    let hitSomething = false
    
    // Check collision with main snake
    if (snake.some(segment => segment.x === bullet.x && segment.y === bullet.y)) {
      snakeHit = true
      hitSomething = true
    }
    
    // Check collision with other snake
    if (otherSnake.some(segment => segment.x === bullet.x && segment.y === bullet.y)) {
      otherSnakeHit = true
      hitSomething = true
    }
    
    // Only keep bullet if it didn't hit anything
    if (!hitSomething) {
      remainingBullets.push(bullet)
    }
  }

  return { remainingBullets, snakeHit, otherSnakeHit }
}

export const findNearbyFoods = (snakeHead: Position, foods: Food[], range: number = 3): Food[] => {
  return foods.filter(food => {
    const distance = Math.abs(food.x - snakeHead.x) + Math.abs(food.y - snakeHead.y)
    return distance <= range
  })
}

export const collectNearbyFoods = (
  snakeHead: Position, 
  foods: Food[], 
  range: number = 3
): { collectedFoods: Food[], remainingFoods: Food[] } => {
  const collectedFoods: Food[] = []
  const remainingFoods: Food[] = []
  
  for (const food of foods) {
    const distance = Math.abs(food.x - snakeHead.x) + Math.abs(food.y - snakeHead.y)
    if (distance <= range) {
      collectedFoods.push(food)
    } else {
      remainingFoods.push(food)
    }
  }
  
  return { collectedFoods, remainingFoods }
}
