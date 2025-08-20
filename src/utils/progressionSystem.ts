import type { 
  Achievement, 
  PlayerLevel, 
  DailyChallenge, 
  PlayerStats, 
  ProgressionData,
  UnlockableReward
} from '../types/progression'

export class ProgressionSystem {
  private data: ProgressionData
  private readonly STORAGE_KEY = 'snakeGameProgression'

  constructor() {
    this.data = this.loadProgressionData()
    this.generateDailyChallenges()
  }

  // Get current progression data
  getData(): ProgressionData {
    return this.data
  }

  // Experience and Leveling
  addExperience(amount: number): { leveledUp: boolean; newLevel?: number } {
    this.data.level.experience += amount
    this.data.level.totalExperience += amount
    
    let leveledUp = false
    let newLevel = this.data.level.level
    
    while (this.data.level.experience >= this.data.level.experienceToNext) {
      this.data.level.experience -= this.data.level.experienceToNext
      this.data.level.level++
      newLevel = this.data.level.level
      leveledUp = true
      
      // Calculate next level requirement (exponential growth)
      this.data.level.experienceToNext = Math.floor(100 * Math.pow(1.5, this.data.level.level - 1))
      
      // Unlock rewards for leveling up
      this.checkLevelUnlocks(this.data.level.level)
    }
    
    this.saveProgressionData()
    return { leveledUp, newLevel: leveledUp ? newLevel : undefined }
  }

  // Achievement System
  updateAchievementProgress(type: string, value: number): Achievement[] {
    const unlockedAchievements: Achievement[] = []
    
    this.data.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.type === type) {
        achievement.progress = Math.min(achievement.requirement, achievement.progress + value)
        
        if (achievement.progress >= achievement.requirement) {
          achievement.unlocked = true
          unlockedAchievements.push(achievement)
          
          // Apply reward
          if (achievement.reward) {
            this.unlockReward(achievement.reward)
          }
          
          // Give experience for unlocking achievement
          this.addExperience(50)
        }
      }
    })
    
    this.saveProgressionData()
    return unlockedAchievements
  }

  // Game Statistics Tracking
  recordGameEnd(score: number, gameTime: number, foodsEaten: number, wallsBroken: number, bulletsFired: number, teleports: number, snakeLength: number, gameMode: 'single' | 'multiplayer'): void {
    const stats = this.data.stats
    
    // Update basic stats
    stats.totalGames++
    stats.totalScore += score
    stats.totalFoodsEaten += foodsEaten
    stats.totalWallsBroken += wallsBroken
    stats.totalSurvivalTime += gameTime
    stats.totalBulletsFired += bulletsFired
    stats.totalTeleports += teleports
    
    // Update records
    if (score > stats.highestScore) {
      stats.highestScore = score
    }
    
    if (snakeLength > stats.longestSnake) {
      stats.longestSnake = snakeLength
    }
    
    // Update average game time
    stats.averageGameTime = stats.totalSurvivalTime / stats.totalGames
    
    // Track perfect games (no walls hit, high score)
    if (score >= 500 && wallsBroken === 0) {
      stats.perfectGames++
    }
    
    // Update favorite game mode
    stats.favoriteGameMode = gameMode
    
    // Calculate experience gained
    let expGained = Math.floor(score / 10) // 1 exp per 10 points
    expGained += Math.floor(gameTime / 1000) // 1 exp per second survived
    expGained += foodsEaten * 2 // 2 exp per food
    
    // Bonus experience for milestones
    if (score >= 1000) expGained += 50
    if (gameTime >= 60000) expGained += 30 // 1 minute survival
    if (snakeLength >= 20) expGained += 25
    
    this.addExperience(expGained)
    
    // Check achievements
    this.updateAchievementProgress('score', score)
    this.updateAchievementProgress('games_played', 1)
    this.updateAchievementProgress('foods_eaten', foodsEaten)
    this.updateAchievementProgress('walls_broken', wallsBroken)
    this.updateAchievementProgress('survival_time', gameTime)
    this.updateAchievementProgress('bullet_master', bulletsFired)
    this.updateAchievementProgress('teleport_expert', teleports)
    
    if (stats.perfectGames > 0) {
      this.updateAchievementProgress('perfect_games', stats.perfectGames)
    }
    
    // Update daily challenges
    this.updateDailyChallengeProgress(score, gameTime, foodsEaten, bulletsFired, teleports)
    
    this.data.lastPlayed = new Date().toISOString()
    this.saveProgressionData()
  }

  // Daily Challenges
  private generateDailyChallenges(): void {
    const today = new Date().toDateString()
    const existingChallenge = this.data.dailyChallenges.find(c => c.date === today)
    
    if (!existingChallenge) {
      // Remove old challenges (keep only last 7 days)
      this.data.dailyChallenges = this.data.dailyChallenges.filter(c => {
        const challengeDate = new Date(c.date)
        const daysDiff = (Date.now() - challengeDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7
      })
      
      // Generate new daily challenge
      const challenges = this.getDailyChallengeTemplates()
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]
      
      this.data.dailyChallenges.push({
        ...randomChallenge,
        id: `daily-${Date.now()}`,
        date: today,
        progress: 0,
        completed: false
      })
    }
  }

  private updateDailyChallengeProgress(score: number, gameTime: number, foodsEaten: number, bulletsFired: number, teleports: number): void {
    const today = new Date().toDateString()
    const todayChallenge = this.data.dailyChallenges.find(c => c.date === today && !c.completed)
    
    if (todayChallenge) {
      switch (todayChallenge.type) {
        case 'score':
          todayChallenge.progress = Math.max(todayChallenge.progress, score)
          break
        case 'survival':
          todayChallenge.progress = Math.max(todayChallenge.progress, gameTime)
          break
        case 'food_collection':
          todayChallenge.progress += foodsEaten
          break
        case 'bullet_usage':
          todayChallenge.progress += bulletsFired
          break
        case 'teleport_usage':
          todayChallenge.progress += teleports
          break
      }
      
      if (todayChallenge.progress >= todayChallenge.target) {
        todayChallenge.completed = true
        this.addExperience(todayChallenge.reward.experience)
        
        if (todayChallenge.reward.unlockable) {
          this.unlockReward(todayChallenge.reward.unlockable)
        }
      }
    }
  }

  // Unlockables Management
  private unlockReward(reward: UnlockableReward): void {
    switch (reward.type) {
      case 'skin':
        if (!this.data.unlockedSkins.includes(reward.id)) {
          this.data.unlockedSkins.push(reward.id)
        }
        break
      case 'color':
        if (!this.data.unlockedColors.includes(reward.id)) {
          this.data.unlockedColors.push(reward.id)
        }
        break
      case 'trail':
        if (!this.data.unlockedTrails.includes(reward.id)) {
          this.data.unlockedTrails.push(reward.id)
        }
        break
      case 'head_shape':
        if (!this.data.unlockedHeadShapes.includes(reward.id)) {
          this.data.unlockedHeadShapes.push(reward.id)
        }
        break
    }
  }

  private checkLevelUnlocks(level: number): void {
    const levelRewards: { [key: number]: UnlockableReward } = {
      5: { type: 'skin', id: 'stripes', name: 'Striped Snake' },
      10: { type: 'trail', id: 'sparkles', name: 'Sparkle Trail' },
      15: { type: 'color', id: '#ff6b6b', name: 'Coral Red' },
      20: { type: 'skin', id: 'spots', name: 'Spotted Snake' },
      25: { type: 'trail', id: 'fire', name: 'Fire Trail' },
      30: { type: 'head_shape', id: 'star', name: 'Star Head' }
    }
    
    if (levelRewards[level]) {
      this.unlockReward(levelRewards[level])
    }
  }

  // Data Management
  private loadProgressionData(): ProgressionData {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        // Merge with default data to handle new properties
        return { ...this.getDefaultProgressionData(), ...data }
      }
    } catch (error) {
      console.warn('Failed to load progression data:', error)
    }
    
    return this.getDefaultProgressionData()
  }

  private saveProgressionData(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data))
    } catch (error) {
      console.warn('Failed to save progression data:', error)
    }
  }

  private getDefaultProgressionData(): ProgressionData {
    return {
      level: {
        level: 1,
        experience: 0,
        experienceToNext: 100,
        totalExperience: 0
      },
      achievements: this.getDefaultAchievements(),
      unlockedSkins: ['solid'],
      unlockedTrails: ['basic'],
      unlockedColors: ['#00ff00', '#0080ff', '#ff0000'],
      unlockedHeadShapes: ['square', 'circle'],
      selectedSkin: 'solid',
      selectedTrail: 'basic',
      dailyChallenges: [],
      stats: {
        totalGames: 0,
        totalScore: 0,
        highestScore: 0,
        totalFoodsEaten: 0,
        totalWallsBroken: 0,
        totalSurvivalTime: 0,
        perfectGames: 0,
        totalBulletsFired: 0,
        totalTeleports: 0,
        longestSnake: 0,
        averageGameTime: 0,
        favoriteGameMode: 'single'
      },
      lastPlayed: new Date().toISOString()
    }
  }

  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Play your first game',
        icon: '🎮',
        requirement: 1,
        unlocked: false,
        progress: 0,
        type: 'games_played'
      },
      {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Reach a score of 500',
        icon: '🏆',
        requirement: 500,
        unlocked: false,
        progress: 0,
        type: 'score',
        reward: { type: 'color', id: '#ffd700', name: 'Golden' }
      },
      {
        id: 'food_lover',
        name: 'Food Lover',
        description: 'Eat 100 foods total',
        icon: '🍎',
        requirement: 100,
        unlocked: false,
        progress: 0,
        type: 'foods_eaten'
      },
      {
        id: 'wall_breaker',
        name: 'Wall Breaker',
        description: 'Break 50 walls with bullets',
        icon: '💥',
        requirement: 50,
        unlocked: false,
        progress: 0,
        type: 'walls_broken',
        reward: { type: 'trail', id: 'fire', name: 'Fire Trail' }
      },
      {
        id: 'survivor',
        name: 'Survivor',
        description: 'Survive for 2 minutes in a single game',
        icon: '⏱️',
        requirement: 120000,
        unlocked: false,
        progress: 0,
        type: 'survival_time'
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete 5 perfect games',
        icon: '⭐',
        requirement: 5,
        unlocked: false,
        progress: 0,
        type: 'perfect_games',
        reward: { type: 'skin', id: 'rainbow', name: 'Rainbow Snake' }
      },
      {
        id: 'marksman',
        name: 'Marksman',
        description: 'Fire 200 bullets total',
        icon: '🎯',
        requirement: 200,
        unlocked: false,
        progress: 0,
        type: 'bullet_master'
      },
      {
        id: 'teleporter',
        name: 'Teleporter',
        description: 'Use teleport 100 times',
        icon: '🌀',
        requirement: 100,
        unlocked: false,
        progress: 0,
        type: 'teleport_expert',
        reward: { type: 'trail', id: 'electric', name: 'Electric Trail' }
      }
    ]
  }

  private getDailyChallengeTemplates(): Omit<DailyChallenge, 'id' | 'date' | 'progress' | 'completed'>[] {
    return [
      {
        title: 'Score Master',
        description: 'Achieve a high score',
        objective: 'Reach a score of 300 points',
        target: 300,
        type: 'score',
        reward: { experience: 100 }
      },
      {
        title: 'Endurance Test',
        description: 'Survive for an extended period',
        objective: 'Survive for 90 seconds',
        target: 90000,
        type: 'survival',
        reward: { experience: 150 }
      },
      {
        title: 'Hungry Snake',
        description: 'Collect lots of food',
        objective: 'Eat 25 foods in total today',
        target: 25,
        type: 'food_collection',
        reward: { experience: 80 }
      },
      {
        title: 'Sharp Shooter',
        description: 'Use your bullets effectively',
        objective: 'Fire 15 bullets today',
        target: 15,
        type: 'bullet_usage',
        reward: { experience: 120 }
      },
      {
        title: 'Portal Master',
        description: 'Master the teleport ability',
        objective: 'Use teleport 10 times today',
        target: 10,
        type: 'teleport_usage',
        reward: { 
          experience: 100,
          unlockable: { type: 'color', id: '#9c27b0', name: 'Portal Purple' }
        }
      }
    ]
  }

  // Public API methods
  getAchievements(): Achievement[] {
    return this.data.achievements
  }

  getUnlockedAchievements(): Achievement[] {
    return this.data.achievements.filter(a => a.unlocked)
  }

  getPlayerLevel(): PlayerLevel {
    return this.data.level
  }

  getPlayerStats(): PlayerStats {
    return this.data.stats
  }

  getTodaysChallenge(): DailyChallenge | null {
    const today = new Date().toDateString()
    return this.data.dailyChallenges.find(c => c.date === today) || null
  }

  isUnlocked(type: 'skin' | 'trail' | 'color' | 'head_shape', id: string): boolean {
    switch (type) {
      case 'skin': return this.data.unlockedSkins.includes(id)
      case 'trail': return this.data.unlockedTrails.includes(id)
      case 'color': return this.data.unlockedColors.includes(id)
      case 'head_shape': return this.data.unlockedHeadShapes.includes(id)
      default: return false
    }
  }

  setSelected(type: 'skin' | 'trail', id: string): void {
    if (this.isUnlocked(type, id)) {
      if (type === 'skin') this.data.selectedSkin = id
      if (type === 'trail') this.data.selectedTrail = id
      this.saveProgressionData()
    }
  }
}