import type { Bot, BotType } from '../types/bot'
import type { Position, Direction } from '../types/game'

// Bot colors for different types
const BOT_COLORS = {
  wanderer: '#ff6b6b',    // Red
  chaser: '#ffa500',      // Orange
  guard: '#8b4513',       // Brown
  patrol: '#4b0082',      // Indigo
  random: '#ff1493'       // Deep Pink
}

// Direction vectors
const DIRECTIONS: Direction[] = [
  { x: 0, y: -1 }, // Up
  { x: 1, y: 0 },  // Right
  { x: 0, y: 1 },  // Down
  { x: -1, y: 0 }  // Left
]

// Generate random bot count between 1 and 5
export function generateRandomBotCount(): number {
  return Math.floor(Math.random() * 5) + 1
}

// Create a new bot
export function createBot(id: string, gridSize: number, existingPositions: Position[] = []): Bot {
  const types: BotType[] = ['wanderer', 'chaser', 'guard', 'patrol', 'random']
  const type = types[Math.floor(Math.random() * types.length)]
  
  // Find a valid spawn position
  let position: Position
  let attempts = 0
  const maxAttempts = 50
  
  do {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    }
    attempts++
  } while (
    attempts < maxAttempts && 
    existingPositions.some(pos => pos.x === position.x && pos.y === position.y)
  )
  
  const bot: Bot = {
    id,
    type,
    x: position.x,
    y: position.y,
    direction: DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)],
    speed: getSpeedForType(type),
    color: BOT_COLORS[type],
    size: 0.8, // Slightly smaller than snake segments
    lastMoveTime: Date.now(),
    moveInterval: getMoveIntervalForType(type),
    isActive: true
  }
  
  // Initialize type-specific properties
  if (type === 'patrol') {
    bot.patrolPoints = generatePatrolPoints(gridSize)
    bot.currentPatrolIndex = 0
  } else if (type === 'guard') {
    bot.aggroRange = 4
    bot.targetPosition = position // Guards stay near their spawn point
  } else if (type === 'chaser') {
    bot.aggroRange = 6
  }
  
  return bot
}

// Get movement speed based on bot type and difficulty
function getSpeedForType(type: BotType): number {
  const baseSpeed = {
    wanderer: 0.7,
    chaser: 1.2,
    guard: 0.5,
    patrol: 0.8,
    random: 1.0
  }
  return baseSpeed[type]
}

// Get move interval based on bot type (in milliseconds)
function getMoveIntervalForType(type: BotType): number {
  const baseInterval = {
    wanderer: 800,
    chaser: 600,
    guard: 1000,
    patrol: 700,
    random: 500
  }
  return baseInterval[type]
}

// Generate patrol points for patrol bots
function generatePatrolPoints(gridSize: number): Position[] {
  const points: Position[] = []
  const numPoints = Math.floor(Math.random() * 3) + 3 // 3-5 points
  
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    })
  }
  
  return points
}

// Calculate distance between two positions
function getDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2))
}

// Get direction towards target position
function getDirectionTowards(from: Position, to: Position): Direction {
  const dx = to.x - from.x
  const dy = to.y - from.y
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: dx > 0 ? 1 : -1, y: 0 }
  } else {
    return { x: 0, y: dy > 0 ? 1 : -1 }
  }
}

// Check if position is valid (within bounds and not colliding)
function isValidPosition(position: Position, gridSize: number, obstacles: Position[]): boolean {
  if (position.x < 0 || position.x >= gridSize || position.y < 0 || position.y >= gridSize) {
    return false
  }
  
  return !obstacles.some(obstacle => obstacle.x === position.x && obstacle.y === position.y)
}

// Get valid adjacent positions
function getValidMoves(bot: Bot, gridSize: number, obstacles: Position[]): Direction[] {
  const validMoves: Direction[] = []
  
  for (const direction of DIRECTIONS) {
    const newPosition = {
      x: bot.x + direction.x,
      y: bot.y + direction.y
    }
    
    if (isValidPosition(newPosition, gridSize, obstacles)) {
      validMoves.push(direction)
    }
  }
  
  return validMoves
}

// Update bot AI and movement
export function updateBot(
  bot: Bot, 
  currentTime: number, 
  gridSize: number, 
  playerPositions: Position[], 
  obstacles: Position[]
): Bot {
  if (!bot.isActive || currentTime - bot.lastMoveTime < bot.moveInterval) {
    return bot
  }
  
  const updatedBot = { ...bot }
  const validMoves = getValidMoves(bot, gridSize, obstacles)
  
  if (validMoves.length === 0) {
    // Bot is trapped, try to escape
    updatedBot.direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
    return updatedBot
  }
  
  let newDirection: Direction
  
  switch (bot.type) {
    case 'wanderer':
      // Moves randomly but avoids walls
      newDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
      break
      
    case 'chaser':
      // Chases the nearest player if within aggro range
      if (bot.aggroRange && playerPositions.length > 0) {
        const nearestPlayer = playerPositions.reduce((nearest, player) => {
          const distanceToNearest = getDistance(bot, nearest)
          const distanceToPlayer = getDistance(bot, player)
          return distanceToPlayer < distanceToNearest ? player : nearest
        })
        
        const distanceToNearest = getDistance(bot, nearestPlayer)
        if (distanceToNearest <= bot.aggroRange) {
          const idealDirection = getDirectionTowards(bot, nearestPlayer)
          newDirection = validMoves.find(move => 
            move.x === idealDirection.x && move.y === idealDirection.y
          ) || validMoves[Math.floor(Math.random() * validMoves.length)]
        } else {
          newDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
        }
      } else {
        newDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
      }
      break
      
    case 'guard':
      // Guards move around their spawn area
      if (bot.targetPosition) {
        const distanceFromSpawn = getDistance(bot, bot.targetPosition)
        if (distanceFromSpawn > 3) {
          // Return to spawn area
          const idealDirection = getDirectionTowards(bot, bot.targetPosition)
          newDirection = validMoves.find(move => 
            move.x === idealDirection.x && move.y === idealDirection.y
          ) || validMoves[Math.floor(Math.random() * validMoves.length)]
        } else {
          // Random movement within spawn area
          newDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
        }
      } else {
        newDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
      }
      break
      
    case 'patrol':
      // Moves between patrol points
      if (bot.patrolPoints && bot.currentPatrolIndex !== undefined) {
        const currentTarget = bot.patrolPoints[bot.currentPatrolIndex]
        const distanceToTarget = getDistance(bot, currentTarget)
        
        if (distanceToTarget <= 1) {
          // Reached current patrol point, move to next
          updatedBot.currentPatrolIndex = (bot.currentPatrolIndex + 1) % bot.patrolPoints.length
          newDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
        } else {
          // Move towards current patrol point
          const idealDirection = getDirectionTowards(bot, currentTarget)
          newDirection = validMoves.find(move => 
            move.x === idealDirection.x && move.y === idealDirection.y
          ) || validMoves[Math.floor(Math.random() * validMoves.length)]
        }
      } else {
        newDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
      }
      break
      
    case 'random':
    default:
      // Completely random movement
      if (Math.random() < 0.3) {
        // 30% chance to change direction
        newDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
      } else {
        // Continue in current direction if possible
        newDirection = validMoves.find(move => 
          move.x === bot.direction.x && move.y === bot.direction.y
        ) || validMoves[Math.floor(Math.random() * validMoves.length)]
      }
      break
  }
  
  // Update bot position and direction
  updatedBot.direction = newDirection
  updatedBot.x = bot.x + newDirection.x
  updatedBot.y = bot.y + newDirection.y
  updatedBot.lastMoveTime = currentTime
  
  // Ensure bot stays within bounds
  updatedBot.x = Math.max(0, Math.min(gridSize - 1, updatedBot.x))
  updatedBot.y = Math.max(0, Math.min(gridSize - 1, updatedBot.y))
  
  return updatedBot
}

// Check if snake collides with any bot
export function checkBotCollisions(snakeHead: Position, bots: Bot[]): boolean {
  return bots.some(bot => 
    bot.isActive && bot.x === snakeHead.x && bot.y === snakeHead.y
  )
}

// Initialize bots for the game
export function initializeBots(count: number, gridSize: number, existingPositions: Position[] = []): Bot[] {
  const bots: Bot[] = []
  const allPositions = [...existingPositions]
  
  for (let i = 0; i < count; i++) {
    const bot = createBot(`bot-${i}`, gridSize, allPositions)
    bots.push(bot)
    allPositions.push({ x: bot.x, y: bot.y })
  }
  
  return bots
}

// Update all bots
export function updateAllBots(
  bots: Bot[], 
  currentTime: number, 
  gridSize: number, 
  playerPositions: Position[], 
  obstacles: Position[]
): Bot[] {
  return bots.map(bot => updateBot(bot, currentTime, gridSize, playerPositions, obstacles))
}