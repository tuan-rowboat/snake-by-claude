import type { ShapeType, HeadShape, Direction, Position } from '../types/game'
import { CELL_SIZE, getGameSize } from './constants'

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
