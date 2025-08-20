export class ScreenShake {
  private intensity = 0
  private duration = 0
  private currentTime = 0
  private offsetX = 0
  private offsetY = 0

  start(intensity: number, duration: number): void {
    this.intensity = intensity
    this.duration = duration
    this.currentTime = 0
  }

  update(deltaTime: number): void {
    if (this.currentTime < this.duration) {
      this.currentTime += deltaTime
      
      // Calculate shake intensity based on remaining time
      const progress = this.currentTime / this.duration
      const currentIntensity = this.intensity * (1 - progress)
      
      // Generate random offset
      this.offsetX = (Math.random() - 0.5) * currentIntensity * 2
      this.offsetY = (Math.random() - 0.5) * currentIntensity * 2
    } else {
      this.offsetX = 0
      this.offsetY = 0
    }
  }

  apply(ctx: CanvasRenderingContext2D): void {
    if (this.offsetX !== 0 || this.offsetY !== 0) {
      ctx.translate(this.offsetX, this.offsetY)
    }
  }

  reset(ctx: CanvasRenderingContext2D): void {
    if (this.offsetX !== 0 || this.offsetY !== 0) {
      ctx.translate(-this.offsetX, -this.offsetY)
    }
  }

  isActive(): boolean {
    return this.currentTime < this.duration
  }
}