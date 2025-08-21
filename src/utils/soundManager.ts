import type { SoundEffect, BackgroundMusic, AudioSettings, SoundConfig, MusicConfig } from '../types/audio'

export class SoundManager {
  private sounds: Map<SoundEffect, HTMLAudioElement[]> = new Map()
  private music: Map<BackgroundMusic, HTMLAudioElement> = new Map()
  private currentMusic: BackgroundMusic | null = null
  private settings: AudioSettings = {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.5
  }

  constructor() {
    this.loadSettings()
    this.initializeSounds()
    this.initializeMusic()
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('snakeGameAudioSettings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error)
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('snakeGameAudioSettings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save audio settings:', error)
    }
  }

  private initializeSounds(): void {
    // Create placeholder audio elements - sounds will be generated using Web Audio API
    const soundConfigs: { id: SoundEffect, volume: number }[] = [
      { id: 'eat_food', volume: 0.3 },
      { id: 'eat_golden_food', volume: 0.4 },
      { id: 'eat_special_food', volume: 0.4 },
      { id: 'teleport', volume: 0.5 },
      { id: 'bullet_fire', volume: 0.3 },
      { id: 'wall_break', volume: 0.4 },
      { id: 'game_over', volume: 0.6 },
      { id: 'achievement_unlock', volume: 0.5 },
      { id: 'level_up', volume: 0.5 },
      { id: 'button_click', volume: 0.2 },
      { id: 'pause', volume: 0.3 },
      { id: 'resume', volume: 0.3 }
    ]

    soundConfigs.forEach(config => {
      // Create empty audio elements - we'll use Web Audio API directly
      const audio = new Audio()
      audio.volume = config.volume * this.settings.soundVolume
      this.sounds.set(config.id, [audio])
    })
  }

  private initializeMusic(): void {
    // Create placeholder audio elements for background music
    const musicConfigs: { id: BackgroundMusic, volume: number, loop: boolean }[] = [
      { id: 'menu', volume: 0.3, loop: true },
      { id: 'gameplay', volume: 0.25, loop: true },
      { id: 'game_over', volume: 0.4, loop: false }
    ]

    musicConfigs.forEach(config => {
      const audio = new Audio()
      audio.volume = config.volume * this.settings.musicVolume
      audio.loop = config.loop
      this.music.set(config.id, audio)
    })
  }

  // Web Audio API context
  private audioContext: AudioContext | null = null
  
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private playTone(frequency: number, duration: number, waveType: OscillatorType = 'sine', volume: number = 0.3): void {
    if (!this.settings.soundEnabled) return
    
    try {
      const audioContext = this.getAudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = waveType
      
      const adjustedVolume = volume * this.settings.soundVolume
      gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      console.warn('Failed to play tone:', error)
    }
  }

  // Public API methods
  playSound(effect: SoundEffect): void {
    if (!this.settings.soundEnabled) return

    // Play sounds using Web Audio API for immediate response
    switch (effect) {
      case 'eat_food':
        this.playTone(800, 0.1, 'sine', 0.3)
        break
      case 'eat_golden_food':
        this.playTone(1200, 0.15, 'triangle', 0.4)
        break
      case 'eat_special_food':
        this.playTone(400, 0.1, 'sine', 0.3)
        setTimeout(() => this.playTone(600, 0.1, 'sine', 0.3), 50)
        setTimeout(() => this.playTone(800, 0.1, 'sine', 0.3), 100)
        break
      case 'teleport':
        this.playTone(300, 0.2, 'sawtooth', 0.4)
        setTimeout(() => this.playTone(600, 0.1, 'sawtooth', 0.3), 100)
        break
      case 'bullet_fire':
        this.playTone(150, 0.05, 'square', 0.3)
        break
      case 'wall_break':
        this.playTone(100, 0.1, 'square', 0.4)
        setTimeout(() => this.playTone(200, 0.1, 'square', 0.3), 50)
        break
      case 'game_over':
        this.playTone(600, 0.3, 'sine', 0.5)
        setTimeout(() => this.playTone(400, 0.3, 'sine', 0.4), 150)
        setTimeout(() => this.playTone(200, 0.4, 'sine', 0.6), 300)
        break
      case 'achievement_unlock':
        this.playTone(523, 0.2, 'sine', 0.4)
        setTimeout(() => this.playTone(659, 0.2, 'sine', 0.4), 100)
        setTimeout(() => this.playTone(784, 0.3, 'sine', 0.5), 200)
        break
      case 'level_up':
        this.playTone(440, 0.15, 'triangle', 0.4)
        setTimeout(() => this.playTone(554, 0.15, 'triangle', 0.4), 100)
        setTimeout(() => this.playTone(659, 0.15, 'triangle', 0.4), 200)
        setTimeout(() => this.playTone(880, 0.3, 'triangle', 0.5), 300)
        break
      case 'button_click':
        this.playTone(600, 0.05, 'square', 0.2)
        break
      case 'pause':
        this.playTone(400, 0.1, 'sine', 0.3)
        break
      case 'resume':
        this.playTone(600, 0.1, 'sine', 0.3)
        break
    }
  }

  playMusic(track: BackgroundMusic): void {
    if (!this.settings.musicEnabled) return

    // Stop current music
    this.stopMusic()

    const audio = this.music.get(track)
    if (audio) {
      this.currentMusic = track
      audio.currentTime = 0
      audio.play().catch(error => {
        console.warn(`Failed to play music ${track}:`, error)
      })
    }
  }

  stopMusic(): void {
    if (this.currentMusic) {
      const audio = this.music.get(this.currentMusic)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      this.currentMusic = null
    }
  }

  pauseMusic(): void {
    if (this.currentMusic) {
      const audio = this.music.get(this.currentMusic)
      if (audio) {
        audio.pause()
      }
    }
  }

  resumeMusic(): void {
    if (this.currentMusic && this.settings.musicEnabled) {
      const audio = this.music.get(this.currentMusic)
      if (audio) {
        audio.play().catch(error => {
          console.warn(`Failed to resume music ${this.currentMusic}:`, error)
        })
      }
    }
  }

  // Settings management
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    this.updateVolumes()
  }

  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  private updateVolumes(): void {
    // Update sound effect volumes
    this.sounds.forEach((audioElements) => {
      audioElements.forEach(audio => {
        const baseVolume = parseFloat(audio.dataset.baseVolume || '0.5')
        audio.volume = baseVolume * this.settings.soundVolume
      })
    })

    // Update music volumes
    this.music.forEach((audio) => {
      const baseVolume = parseFloat(audio.dataset.baseVolume || '0.5')
      audio.volume = baseVolume * this.settings.musicVolume
    })
  }

  // Initialize audio context on user interaction (required by browsers)
  async initializeAudio(): Promise<void> {
    try {
      const audioContext = this.getAudioContext()
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
      
      console.log('Audio context initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize audio context:', error)
    }
  }
}