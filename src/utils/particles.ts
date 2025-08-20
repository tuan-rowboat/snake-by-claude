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

export class ParticleSystem {
  particles: Particle[] = []
  private nextId = 0

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

  clear(): void {
    this.particles = []
  }
}