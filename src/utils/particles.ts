import type { Position, FoodType } from '../types/game'
import { CELL_SIZE, FOOD_TYPES } from './constants'

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'food' | 'trail' | 'explosion' | 'sparkle'
  alpha: number
}

export interface Lightning {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  life: number
  maxLife: number
  segments: Array<{ x: number, y: number }>
  alpha: number
}

export class ParticleSystem {
  particles: Particle[] = []
  lightnings: Lightning[] = []
  private nextId = 0
  private nextLightningId = 0

  update(deltaTime: number): void {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx * deltaTime
      particle.y += particle.vy * deltaTime
      particle.life -= deltaTime
      
      // Update alpha based on remaining life
      particle.alpha = Math.max(0, particle.life / particle.maxLife)
      
      // Apply gravity for explosion particles
      if (particle.type === 'explosion' || particle.type === 'food') {
        particle.vy += 0.0005 * deltaTime
      }
      
      // Shrink particles over time
      if (particle.type === 'sparkle') {
        particle.size = Math.max(0, particle.size * 0.998)
      }
      
      return particle.life > 0
    })

    // Update lightning effects
    this.lightnings = this.lightnings.filter(lightning => {
      lightning.life -= deltaTime
      lightning.alpha = Math.max(0, lightning.life / lightning.maxLife)
      
      // Regenerate lightning segments for flickering effect
      if (Math.random() < 0.3) {
        lightning.segments = this.generateLightningPath(
          lightning.startX, lightning.startY,
          lightning.endX, lightning.endY
        )
      }
      
      return lightning.life > 0
    })
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => {
      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = particle.color
      
      switch (particle.type) {
        case 'food':
        case 'explosion':
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case 'sparkle':
          // Draw a 4-pointed star
          ctx.beginPath()
          const spikes = 4
          const outerRadius = particle.size
          const innerRadius = particle.size * 0.5
          
          for (let i = 0; i < spikes * 2; i++) {
            const angle = (i / (spikes * 2)) * Math.PI * 2
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const x = particle.x + Math.cos(angle) * radius
            const y = particle.y + Math.sin(angle) * radius
            
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
          break
          
        case 'trail':
          ctx.fillRect(
            particle.x - particle.size / 2, 
            particle.y - particle.size / 2, 
            particle.size, 
            particle.size
          )
          break
      }
      
      ctx.restore()
    })

    // Draw lightning effects
    this.lightnings.forEach(lightning => {
      ctx.save()
      ctx.globalAlpha = lightning.alpha
      ctx.strokeStyle = '#00ffff'
      ctx.shadowColor = '#00ffff'
      ctx.shadowBlur = 5
      ctx.lineWidth = 2
      
      // Draw main lightning bolt
      ctx.beginPath()
      if (lightning.segments.length > 0) {
        ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y)
        for (let i = 1; i < lightning.segments.length; i++) {
          ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y)
        }
      }
      ctx.stroke()
      
      // Draw secondary branches for more realistic effect
      ctx.lineWidth = 1
      ctx.globalAlpha = lightning.alpha * 0.6
      for (let i = 1; i < lightning.segments.length - 1; i += 2) {
        if (Math.random() < 0.3) {
          const segment = lightning.segments[i]
          const angle = Math.random() * Math.PI * 2
          const length = 10 + Math.random() * 15
          
          ctx.beginPath()
          ctx.moveTo(segment.x, segment.y)
          ctx.lineTo(
            segment.x + Math.cos(angle) * length,
            segment.y + Math.sin(angle) * length
          )
          ctx.stroke()
        }
      }
      
      ctx.restore()
    })
  }

  createFoodParticles(position: Position, foodType: FoodType): void {
    const foodProps = FOOD_TYPES[foodType]
    const centerX = position.x * CELL_SIZE + CELL_SIZE / 2
    const centerY = position.y * CELL_SIZE + CELL_SIZE / 2
    
    // Create explosion particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const speed = 0.1 + Math.random() * 0.15
      
      this.particles.push({
        id: `food-${this.nextId++}`,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 800 + Math.random() * 400,
        maxLife: 1200,
        size: 2 + Math.random() * 3,
        color: foodProps.color,
        type: 'food',
        alpha: 1
      })
    }
    
    // Create sparkles
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 10 + Math.random() * 20
      
      this.particles.push({
        id: `sparkle-${this.nextId++}`,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        life: 600 + Math.random() * 300,
        maxLife: 900,
        size: 3 + Math.random() * 2,
        color: '#ffff88',
        type: 'sparkle',
        alpha: 1
      })
    }
  }

  createTrailParticles(position: Position, color: string): void {
    if (Math.random() > 0.3) return // Only create particles 30% of the time
    
    const centerX = position.x * CELL_SIZE + CELL_SIZE / 2
    const centerY = position.y * CELL_SIZE + CELL_SIZE / 2
    
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        id: `trail-${this.nextId++}`,
        x: centerX + (Math.random() - 0.5) * CELL_SIZE,
        y: centerY + (Math.random() - 0.5) * CELL_SIZE,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        life: 300 + Math.random() * 200,
        maxLife: 500,
        size: 2 + Math.random() * 2,
        color: color + '80', // Add transparency
        type: 'trail',
        alpha: 0.6
      })
    }
  }

  createBulletImpact(position: Position): void {
    const centerX = position.x * CELL_SIZE + CELL_SIZE / 2
    const centerY = position.y * CELL_SIZE + CELL_SIZE / 2
    
    // Create explosion particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const speed = 0.15 + Math.random() * 0.1
      
      this.particles.push({
        id: `explosion-${this.nextId++}`,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 400 + Math.random() * 200,
        maxLife: 600,
        size: 1 + Math.random() * 2,
        color: '#ff6600',
        type: 'explosion',
        alpha: 1
      })
    }
  }

  createFoodSpawnEffect(position: Position, foodType: FoodType): void {
    const foodProps = FOOD_TYPES[foodType]
    const centerX = position.x * CELL_SIZE + CELL_SIZE / 2
    const centerY = position.y * CELL_SIZE + CELL_SIZE / 2
    
    // Create gentle spawn sparkles
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const distance = 15 + Math.random() * 10
      
      this.particles.push({
        id: `spawn-${this.nextId++}`,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: -Math.cos(angle) * 0.03,
        vy: -Math.sin(angle) * 0.03,
        life: 500 + Math.random() * 300,
        maxLife: 800,
        size: 1 + Math.random() * 1.5,
        color: foodProps.color,
        type: 'sparkle',
        alpha: 0.8
      })
    }
  }

  createLightning(startPos: Position, endPos: Position): void {
    const startX = startPos.x * CELL_SIZE + CELL_SIZE / 2
    const startY = startPos.y * CELL_SIZE + CELL_SIZE / 2
    const endX = endPos.x * CELL_SIZE + CELL_SIZE / 2
    const endY = endPos.y * CELL_SIZE + CELL_SIZE / 2
    
    const lightning: Lightning = {
      id: `lightning-${this.nextLightningId++}`,
      startX,
      startY,
      endX,
      endY,
      life: 500, // 0.5 seconds
      maxLife: 500,
      segments: this.generateLightningPath(startX, startY, endX, endY),
      alpha: 1
    }
    
    this.lightnings.push(lightning)
  }

  private generateLightningPath(startX: number, startY: number, endX: number, endY: number): Array<{ x: number, y: number }> {
    const segments: Array<{ x: number, y: number }> = []
    
    // Start with the starting point
    segments.push({ x: startX, y: startY })
    
    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
    const numSegments = Math.max(3, Math.floor(distance / 15)) // One segment every 15 pixels
    
    for (let i = 1; i < numSegments; i++) {
      const progress = i / numSegments
      
      // Linear interpolation between start and end
      const baseX = startX + (endX - startX) * progress
      const baseY = startY + (endY - startY) * progress
      
      // Add random jitter perpendicular to the line
      const perpAngle = Math.atan2(endY - startY, endX - startX) + Math.PI / 2
      const jitterAmount = (Math.random() - 0.5) * 20 * (1 - Math.abs(progress - 0.5) * 2) // More jitter in the middle
      
      const jitteredX = baseX + Math.cos(perpAngle) * jitterAmount
      const jitteredY = baseY + Math.sin(perpAngle) * jitterAmount
      
      segments.push({ x: jitteredX, y: jitteredY })
    }
    
    // End with the ending point
    segments.push({ x: endX, y: endY })
    
    return segments
  }

  clear(): void {
    this.particles = []
    this.lightnings = []
  }
}