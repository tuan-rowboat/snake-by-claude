import type { ShapeType, HeadShape, Direction, Position, Food } from '../types/game'
import type { Bot } from '../types/bot'
import { CELL_SIZE, getGameSize, FOOD_TYPES } from './constants'

export const drawShape = (ctx: CanvasRenderingContext2D, shape: ShapeType, x: number, y: number, size: number, color: string | CanvasGradient): void => {
  ctx.fillStyle = color
  ctx.strokeStyle = typeof color === 'string' ? color : '#000000'
  
  switch (shape) {
    case 'circle':
      ctx.beginPath()
      ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'triangle':
      ctx.beginPath()
      ctx.moveTo(x + size/2, y)
      ctx.lineTo(x, y + size)
      ctx.lineTo(x + size, y + size)
      ctx.closePath()
      ctx.fill()
      break
    case 'diamond':
      ctx.beginPath()
      ctx.moveTo(x + size/2, y)
      ctx.lineTo(x + size, y + size/2)
      ctx.lineTo(x + size/2, y + size)
      ctx.lineTo(x, y + size/2)
      ctx.closePath()
      ctx.fill()
      break
    case 'star':
      ctx.beginPath()
      const centerX = x + size/2
      const centerY = y + size/2
      const outerRadius = size/2
      const innerRadius = outerRadius * 0.4
      
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const pointX = centerX + Math.cos(angle - Math.PI/2) * radius
        const pointY = centerY + Math.sin(angle - Math.PI/2) * radius
        
        if (i === 0) ctx.moveTo(pointX, pointY)
        else ctx.lineTo(pointX, pointY)
      }
      ctx.closePath()
      ctx.fill()
      break
    case 'rectangle':
      ctx.fillRect(x + size * 0.2, y + size * 0.3, size * 0.6, size * 0.4)
      break
    default: // square
      ctx.fillRect(x, y, size, size)
  }
}

export const drawSnakeEyes = (
  ctx: CanvasRenderingContext2D, 
  segment: Position, 
  direction: Direction, 
  headShape: HeadShape
): void => {
  if (headShape === 'triangle') return
  
  ctx.fillStyle = 'white'
  const eyeSize = 3
  const eyeOffset = 5
  
  if (direction.x === 1) { // facing right
    ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
    ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
  } else if (direction.x === -1) { // facing left
    ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
    ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
  } else if (direction.y === -1) { // facing up
    ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
    ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + eyeOffset, eyeSize, eyeSize)
  } else { // facing down
    ctx.fillRect(segment.x * CELL_SIZE + eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
    ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize)
  }
}

export const drawGrid = (ctx: CanvasRenderingContext2D, gridSize: number): void => {
  const gameSize = getGameSize(gridSize)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath()
    ctx.moveTo(i * CELL_SIZE, 0)
    ctx.lineTo(i * CELL_SIZE, gameSize.height)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(0, i * CELL_SIZE)
    ctx.lineTo(gameSize.width, i * CELL_SIZE)
    ctx.stroke()
  }
}

export const drawWalls = (ctx: CanvasRenderingContext2D, walls: Position[]): void => {
  ctx.fillStyle = '#666666'
  ctx.strokeStyle = '#999999'
  walls.forEach(wall => {
    ctx.fillRect(wall.x * CELL_SIZE + 1, wall.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    ctx.strokeRect(wall.x * CELL_SIZE + 1, wall.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
  })
}

export const drawPauseOverlay = (ctx: CanvasRenderingContext2D, gridSize: number): void => {
  const gameSize = getGameSize(gridSize)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, gameSize.width, gameSize.height)
  
  ctx.fillStyle = 'white'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('PAUSED', gameSize.width / 2, gameSize.height / 2)
}

export const drawSnakeWithTrail = (
  ctx: CanvasRenderingContext2D,
  snake: Position[],
  direction: Direction,
  headShape: HeadShape,
  headColor: string
): void => {
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Draw head with glow effect
      ctx.save()
      ctx.shadowColor = headColor
      ctx.shadowBlur = 8
      drawShape(ctx, headShape, segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, headColor)
      ctx.restore()
      
      // Draw eyes for head
      drawSnakeEyes(ctx, segment, direction, headShape)
    } else {
      // Draw body with gradient effect and subtle glow
      const opacity = 1 - (index / snake.length) * 0.3
      const alpha = Math.floor(opacity * 255).toString(16).padStart(2, '0')
      const bodyColor = headColor + alpha
      
      ctx.save()
      ctx.shadowColor = headColor
      ctx.shadowBlur = 3
      ctx.fillStyle = bodyColor
      ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
      ctx.restore()
    }
  })
}

export const drawAnimatedFood = (
  ctx: CanvasRenderingContext2D,
  food: Food,
  currentTime: number
): void => {
  const foodProps = FOOD_TYPES[food.type]
  const spawnTime = food.spawnTime || 0
  const age = currentTime - spawnTime
  
  // Calculate scale based on spawn animation and pulsing
  let scale = 1
  if (age < 300) {
    // Spawn animation: grow from 0 to 1
    scale = Math.min(1, age / 300)
  } else {
    // Pulsing animation for special foods
    if (foodProps.effect) {
      scale = 1 + Math.sin(currentTime * 0.005) * 0.1
    }
  }
  
  // Calculate position and size
  const size = (CELL_SIZE - 4) * scale
  const offset = (CELL_SIZE - size) / 2
  const x = food.x * CELL_SIZE + offset
  const y = food.y * CELL_SIZE + offset
  
  ctx.save()
  
  // Add glow effect for special foods
  if (foodProps.effect) {
    ctx.shadowColor = foodProps.color
    ctx.shadowBlur = 10 + Math.sin(currentTime * 0.01) * 3
  }
  
  // Draw the food shape
  drawShape(ctx, foodProps.shape, x, y, size, foodProps.color)
  
  ctx.restore()
  
  // Draw emoji
  ctx.font = `${Math.floor(16 * scale)}px Arial`
  ctx.textAlign = 'center'
  ctx.fillStyle = 'white'
  ctx.fillText(
    foodProps.emoji, 
    food.x * CELL_SIZE + CELL_SIZE / 2, 
    food.y * CELL_SIZE + CELL_SIZE / 2 + 4
  )
}

export const drawBulletWithTrail = (
  ctx: CanvasRenderingContext2D,
  bullet: { x: number, y: number, playerId: 1 | 2 }
): void => {
  const bulletColor = bullet.playerId === 1 ? '#ff6600' : '#ff0088'
  const x = bullet.x * CELL_SIZE + 8
  const y = bullet.y * CELL_SIZE + 8
  
  ctx.save()
  
  // Draw bullet with intense glow
  ctx.shadowColor = bulletColor
  ctx.shadowBlur = 15
  ctx.fillStyle = bulletColor
  ctx.fillRect(x, y, 9, 9)
  
  // Add inner bright core
  ctx.shadowBlur = 5
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x + 2, y + 2, 5, 5)
  
  ctx.restore()
  
  // Draw bullet symbol
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('●', bullet.x * CELL_SIZE + 12, bullet.y * CELL_SIZE + 16)
}

// Draw a bot with visual effects
export const drawBot = (ctx: CanvasRenderingContext2D, bot: Bot): void => {
  if (!bot.isActive) return
  
  const x = bot.x * CELL_SIZE
  const y = bot.y * CELL_SIZE
  const size = CELL_SIZE * bot.size
  const offsetX = (CELL_SIZE - size) / 2
  const offsetY = (CELL_SIZE - size) / 2
  
  ctx.save()
  
  // Add pulsing glow effect
  const pulseIntensity = 0.3 + 0.2 * Math.sin(Date.now() * 0.005)
  ctx.shadowColor = bot.color
  ctx.shadowBlur = 10 + pulseIntensity * 5
  
  // Draw bot body (circle with danger appearance)
  ctx.fillStyle = bot.color
  ctx.beginPath()
  ctx.arc(x + offsetX + size/2, y + offsetY + size/2, size/2, 0, Math.PI * 2)
  ctx.fill()
  
  // Draw inner highlight
  ctx.shadowBlur = 0
  ctx.fillStyle = '#ffffff'
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.arc(x + offsetX + size/3, y + offsetY + size/3, size/6, 0, Math.PI * 2)
  ctx.fill()
  
  // Draw directional indicator (small triangle)
  ctx.globalAlpha = 0.8
  ctx.fillStyle = '#ffffff'
  const centerX = x + offsetX + size/2
  const centerY = y + offsetY + size/2
  const arrowSize = size/4
  
  ctx.beginPath()
  if (bot.direction.x === 1) {
    // Right arrow
    ctx.moveTo(centerX + arrowSize/2, centerY)
    ctx.lineTo(centerX - arrowSize/2, centerY - arrowSize/2)
    ctx.lineTo(centerX - arrowSize/2, centerY + arrowSize/2)
  } else if (bot.direction.x === -1) {
    // Left arrow
    ctx.moveTo(centerX - arrowSize/2, centerY)
    ctx.lineTo(centerX + arrowSize/2, centerY - arrowSize/2)
    ctx.lineTo(centerX + arrowSize/2, centerY + arrowSize/2)
  } else if (bot.direction.y === -1) {
    // Up arrow
    ctx.moveTo(centerX, centerY - arrowSize/2)
    ctx.lineTo(centerX - arrowSize/2, centerY + arrowSize/2)
    ctx.lineTo(centerX + arrowSize/2, centerY + arrowSize/2)
  } else if (bot.direction.y === 1) {
    // Down arrow
    ctx.moveTo(centerX, centerY + arrowSize/2)
    ctx.lineTo(centerX - arrowSize/2, centerY - arrowSize/2)
    ctx.lineTo(centerX + arrowSize/2, centerY - arrowSize/2)
  }
  ctx.closePath()
  ctx.fill()
  
  // Draw bot type indicator
  ctx.globalAlpha = 1
  ctx.font = `${Math.floor(size/3)}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  
  let typeSymbol = '?'
  switch (bot.type) {
    case 'wanderer': typeSymbol = '~'; break
    case 'chaser': typeSymbol = '!'; break
    case 'guard': typeSymbol = '#'; break
    case 'patrol': typeSymbol = '↔'; break
    case 'random': typeSymbol = '*'; break
  }
  
  ctx.fillText(typeSymbol, centerX, centerY + size/8)
  
  ctx.restore()
}
