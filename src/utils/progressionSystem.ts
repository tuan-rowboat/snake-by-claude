import type { 
  Achievement,
  PlayerLevel, 
  DailyChallenge,
  WeeklyChallenge,
  SeasonalEvent, 
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
    this.generateWeeklyChallenges()
    this.updateSeasonalEvents()
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
      if (!achievement.unlocked) {
        // Handle multi-step achievements
        if (achievement.steps && achievement.steps.length > 0) {
          this.updateMultiStepAchievement(achievement, type, value)
          
          // Check if all steps are completed
          const allStepsCompleted = achievement.steps.every(step => step.completed)
          if (allStepsCompleted && !achievement.unlocked) {
            achievement.unlocked = true
            unlockedAchievements.push(achievement)
            
            if (achievement.reward) {
              this.unlockReward(achievement.reward)
              this.updateUnlocksCount()
            }
            
            this.addExperience(100) // More XP for multi-step achievements
          }
        } else if (achievement.type === type) {
          // Handle regular achievements
          if (type === 'snake_length') {
            achievement.progress = Math.max(achievement.progress, value)
          } else {
            achievement.progress = Math.min(achievement.requirement, achievement.progress + value)
          }
          
          if (achievement.progress >= achievement.requirement) {
            achievement.unlocked = true
            unlockedAchievements.push(achievement)
            
            if (achievement.reward) {
              this.unlockReward(achievement.reward)
              this.updateUnlocksCount()
            }
            
            this.addExperience(achievement.milestone ? 200 : 50)
          }
        }
      }
    })
    
    this.saveProgressionData()
    return unlockedAchievements
  }

  private updateMultiStepAchievement(achievement: Achievement, type: string, value: number): void {
    if (!achievement.steps) return
    
    achievement.steps.forEach(step => {
      if (!step.completed && step.type === type) {
        if (type === 'snake_length') {
          step.progress = Math.max(step.progress, value)
        } else {
          step.progress = Math.min(step.requirement, step.progress + value)
        }
        
        if (step.progress >= step.requirement) {
          step.completed = true
        }
      }
    })
    
    // Update overall achievement progress based on completed steps
    const completedSteps = achievement.steps.filter(step => step.completed).length
    achievement.progress = completedSteps
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
    this.updateAchievementProgress('snake_length', snakeLength)
    
    // Track multiplayer games
    if (gameMode === 'multiplayer') {
      this.updateAchievementProgress('multiplayer_games', 1)
    }
    
    if (stats.perfectGames > 0) {
      this.updateAchievementProgress('perfect_games', stats.perfectGames)
    }
    
    // Update daily challenges
    this.updateDailyChallengeProgress(score, gameTime, foodsEaten, bulletsFired, teleports)
    
    // Update weekly challenges
    this.updateWeeklyChallengeProgress(score, gameTime, foodsEaten, bulletsFired, teleports, snakeLength)
    
    // Update seasonal event challenges
    this.updateSeasonalChallengeProgress(score, gameTime, foodsEaten, bulletsFired, teleports, snakeLength)
    
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

  private updateDailyChallengeProgress(score: number, gameTime: number, foodsEaten: number, _bulletsFired: number, _teleports: number): void {
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
          todayChallenge.progress += _bulletsFired
          break
        case 'teleport_usage':
          todayChallenge.progress += _teleports
          break
      }
      
      if (todayChallenge.progress >= todayChallenge.target) {
        todayChallenge.completed = true
        this.addExperience(todayChallenge.reward.experience)
        
        // Track daily challenge completion
        this.updateAchievementProgress('daily_challenges', 1)
        
        if (todayChallenge.reward.unlockable) {
          this.unlockReward(todayChallenge.reward.unlockable)
        }
      }
    }
  }

  // Weekly Challenges
  private generateWeeklyChallenges(): void {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekStart = startOfWeek.toDateString()
    
    const existingChallenge = this.data.weeklyChallenges.find(c => c.weekStart === weekStart)
    
    if (!existingChallenge) {
      // Remove old challenges (keep only last 4 weeks)
      this.data.weeklyChallenges = this.data.weeklyChallenges.filter(c => {
        const challengeDate = new Date(c.weekStart)
        const daysDiff = (Date.now() - challengeDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 28
      })
      
      // Generate new weekly challenge
      const challenges = this.getWeeklyChallengeTemplates()
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]
      
      this.data.weeklyChallenges.push({
        ...randomChallenge,
        id: `weekly-${Date.now()}`,
        weekStart,
        progress: 0,
        completed: false
      })
    }
  }

  private updateWeeklyChallengeProgress(score: number, gameTime: number, foodsEaten: number, _bulletsFired: number, _teleports: number, _snakeLength: number): void {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekStart = startOfWeek.toDateString()
    const thisWeekChallenge = this.data.weeklyChallenges.find(c => c.weekStart === weekStart && !c.completed)
    
    if (thisWeekChallenge) {
      switch (thisWeekChallenge.type) {
        case 'multi_score':
          thisWeekChallenge.progress += score
          break
        case 'marathon':
          thisWeekChallenge.progress += gameTime
          break
        case 'perfect_streak':
          // Check if this was a perfect game (no walls broken, score >= 500)
          if (score >= 500 && this.data.stats.perfectGames > 0) {
            thisWeekChallenge.progress += 1
          }
          break
        case 'combo_master':
          thisWeekChallenge.progress += foodsEaten
          break
        case 'speed_challenge':
          // Only count if playing on fast speed
          // This would need to be passed from game settings, for now assume it counts
          thisWeekChallenge.progress = Math.max(thisWeekChallenge.progress, score)
          break
        case 'survival_master':
          thisWeekChallenge.progress = Math.max(thisWeekChallenge.progress, gameTime)
          break
      }
      
      if (thisWeekChallenge.progress >= thisWeekChallenge.target) {
        thisWeekChallenge.completed = true
        this.addExperience(thisWeekChallenge.reward.experience)
        
        if (thisWeekChallenge.reward.unlockable) {
          this.unlockReward(thisWeekChallenge.reward.unlockable)
        }
      }
    }
  }

  private updateSeasonalChallengeProgress(score: number, gameTime: number, foodsEaten: number, _bulletsFired: number, _teleports: number, _snakeLength: number): void {
    this.data.seasonalEvents.forEach(event => {
      if (event.active) {
        event.challenges.forEach(challenge => {
          if (!challenge.completed) {
            switch (challenge.type) {
              case 'score':
                challenge.progress = Math.max(challenge.progress, score)
                break
              case 'survival':
                challenge.progress = Math.max(challenge.progress, gameTime)
                break
              case 'food_collection':
                challenge.progress += foodsEaten
                break
              case 'streak':
                // This is handled differently based on the specific challenge
                if (challenge.id.includes('harvest') || challenge.id.includes('games')) {
                  challenge.progress += 1
                } else if (challenge.id.includes('perfect') && this.data.stats.perfectGames > 0) {
                  challenge.progress += 1
                }
                break
              case 'special_action':
                // Handle special Halloween/Holiday actions
                if (challenge.id === 'holiday_gift') {
                  const today = new Date()
                  if (today.getMonth() === 11 && today.getDate() === 25) { // December 25th
                    challenge.progress = Math.max(challenge.progress, score)
                  }
                } else if (challenge.id === 'spooky_score') {
                  challenge.progress = Math.max(challenge.progress, score)
                }
                break
            }
            
            if (challenge.progress >= challenge.target) {
              challenge.completed = true
              this.addExperience(challenge.reward.experience)
              
              if (challenge.reward.eventPoints) {
                this.data.eventPoints[event.id] = (this.data.eventPoints[event.id] || 0) + challenge.reward.eventPoints
              }
              
              if (challenge.reward.unlockable) {
                this.unlockReward(challenge.reward.unlockable)
              }
            }
          }
        })
      }
    })
  }

  // Unlockables Management
  private unlockReward(reward: UnlockableReward): void {
    let wasNewUnlock = false
    
    switch (reward.type) {
      case 'skin':
        if (!this.data.unlockedSkins.includes(reward.id)) {
          this.data.unlockedSkins.push(reward.id)
          wasNewUnlock = true
        }
        break
      case 'color':
        if (!this.data.unlockedColors.includes(reward.id)) {
          this.data.unlockedColors.push(reward.id)
          wasNewUnlock = true
        }
        break
      case 'trail':
        if (!this.data.unlockedTrails.includes(reward.id)) {
          this.data.unlockedTrails.push(reward.id)
          wasNewUnlock = true
        }
        break
      case 'head_shape':
        if (!this.data.unlockedHeadShapes.includes(reward.id)) {
          this.data.unlockedHeadShapes.push(reward.id)
          wasNewUnlock = true
        }
        break
    }
    
    if (wasNewUnlock) {
      this.updateUnlocksCount()
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
      weeklyChallenges: [],
      seasonalEvents: [],
      eventPoints: {},
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
      // Beginner Achievements
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
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Play 10 games total',
        icon: '🌱',
        requirement: 10,
        unlocked: false,
        progress: 0,
        type: 'games_played',
        reward: { type: 'head_shape', id: 'triangle', name: 'Triangle Head' }
      },
      {
        id: 'dedicated_player',
        name: 'Dedicated Player',
        description: 'Play 50 games total',
        icon: '💪',
        requirement: 50,
        unlocked: false,
        progress: 0,
        type: 'games_played',
        reward: { type: 'color', id: '#ff6b6b', name: 'Coral Red' }
      },
      {
        id: 'game_addict',
        name: 'Game Addict',
        description: 'Play 200 games total',
        icon: '🔥',
        requirement: 200,
        unlocked: false,
        progress: 0,
        type: 'games_played',
        reward: { type: 'skin', id: 'neon', name: 'Neon Snake' }
      },

      // Score-based Achievements
      {
        id: 'first_points',
        name: 'First Points',
        description: 'Score 100 points in a single game',
        icon: '🎯',
        requirement: 100,
        unlocked: false,
        progress: 0,
        type: 'score'
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
        id: 'master_scorer',
        name: 'Master Scorer',
        description: 'Reach a score of 1000',
        icon: '👑',
        requirement: 1000,
        unlocked: false,
        progress: 0,
        type: 'score',
        reward: { type: 'skin', id: 'gradient', name: 'Gradient Snake' }
      },
      {
        id: 'score_legend',
        name: 'Score Legend',
        description: 'Reach a score of 2500',
        icon: '🌟',
        requirement: 2500,
        unlocked: false,
        progress: 0,
        type: 'score',
        reward: { type: 'trail', id: 'rainbow', name: 'Rainbow Trail' }
      },
      {
        id: 'ultimate_scorer',
        name: 'Ultimate Scorer',
        description: 'Reach a score of 5000',
        icon: '💫',
        requirement: 5000,
        unlocked: false,
        progress: 0,
        type: 'score',
        reward: { type: 'skin', id: 'legendary', name: 'Legendary Snake' }
      },

      // Food-based Achievements
      {
        id: 'first_bite',
        name: 'First Bite',
        description: 'Eat 10 foods total',
        icon: '🍎',
        requirement: 10,
        unlocked: false,
        progress: 0,
        type: 'foods_eaten'
      },
      {
        id: 'food_lover',
        name: 'Food Lover',
        description: 'Eat 100 foods total',
        icon: '😋',
        requirement: 100,
        unlocked: false,
        progress: 0,
        type: 'foods_eaten',
        reward: { type: 'color', id: '#00ffff', name: 'Cyan' }
      },
      {
        id: 'gourmand',
        name: 'Gourmand',
        description: 'Eat 500 foods total',
        icon: '🍽️',
        requirement: 500,
        unlocked: false,
        progress: 0,
        type: 'foods_eaten',
        reward: { type: 'trail', id: 'sparkles', name: 'Sparkle Trail' }
      },
      {
        id: 'food_master',
        name: 'Food Master',
        description: 'Eat 1000 foods total',
        icon: '👨‍🍳',
        requirement: 1000,
        unlocked: false,
        progress: 0,
        type: 'foods_eaten',
        reward: { type: 'skin', id: 'spots', name: 'Spotted Snake' }
      },

      // Combat Achievements
      {
        id: 'first_shot',
        name: 'First Shot',
        description: 'Fire your first bullet',
        icon: '🔫',
        requirement: 1,
        unlocked: false,
        progress: 0,
        type: 'bullet_master'
      },
      {
        id: 'marksman',
        name: 'Marksman',
        description: 'Fire 50 bullets total',
        icon: '🎯',
        requirement: 50,
        unlocked: false,
        progress: 0,
        type: 'bullet_master'
      },
      {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: 'Fire 200 bullets total',
        icon: '🏹',
        requirement: 200,
        unlocked: false,
        progress: 0,
        type: 'bullet_master',
        reward: { type: 'color', id: '#ff6600', name: 'Fire Orange' }
      },
      {
        id: 'bullet_storm',
        name: 'Bullet Storm',
        description: 'Fire 500 bullets total',
        icon: '⚡',
        requirement: 500,
        unlocked: false,
        progress: 0,
        type: 'bullet_master',
        reward: { type: 'trail', id: 'electric', name: 'Electric Trail' }
      },
      {
        id: 'wall_breaker',
        name: 'Wall Breaker',
        description: 'Break 25 walls with bullets',
        icon: '💥',
        requirement: 25,
        unlocked: false,
        progress: 0,
        type: 'walls_broken'
      },
      {
        id: 'demolition_expert',
        name: 'Demolition Expert',
        description: 'Break 100 walls with bullets',
        icon: '🧨',
        requirement: 100,
        unlocked: false,
        progress: 0,
        type: 'walls_broken',
        reward: { type: 'trail', id: 'fire', name: 'Fire Trail' }
      },
      {
        id: 'destroyer',
        name: 'Destroyer',
        description: 'Break 250 walls with bullets',
        icon: '💀',
        requirement: 250,
        unlocked: false,
        progress: 0,
        type: 'walls_broken',
        reward: { type: 'color', id: '#8b0000', name: 'Dark Red' }
      },

      // Survival Achievements
      {
        id: 'first_minute',
        name: 'First Minute',
        description: 'Survive for 1 minute in a single game',
        icon: '⏰',
        requirement: 60000,
        unlocked: false,
        progress: 0,
        type: 'survival_time'
      },
      {
        id: 'survivor',
        name: 'Survivor',
        description: 'Survive for 2 minutes in a single game',
        icon: '⏱️',
        requirement: 120000,
        unlocked: false,
        progress: 0,
        type: 'survival_time',
        reward: { type: 'trail', id: 'ice', name: 'Ice Trail' }
      },
      {
        id: 'endurance_master',
        name: 'Endurance Master',
        description: 'Survive for 5 minutes in a single game',
        icon: '🏃‍♂️',
        requirement: 300000,
        unlocked: false,
        progress: 0,
        type: 'survival_time',
        reward: { type: 'color', id: '#4169e1', name: 'Royal Blue' }
      },
      {
        id: 'immortal',
        name: 'Immortal',
        description: 'Survive for 10 minutes in a single game',
        icon: '👑',
        requirement: 600000,
        unlocked: false,
        progress: 0,
        type: 'survival_time',
        reward: { type: 'skin', id: 'immortal', name: 'Immortal Snake' }
      },

      // Teleport Achievements
      {
        id: 'first_teleport',
        name: 'First Teleport',
        description: 'Use teleport for the first time',
        icon: '🌀',
        requirement: 1,
        unlocked: false,
        progress: 0,
        type: 'teleport_expert'
      },
      {
        id: 'teleporter',
        name: 'Teleporter',
        description: 'Use teleport 50 times total',
        icon: '🌪️',
        requirement: 50,
        unlocked: false,
        progress: 0,
        type: 'teleport_expert'
      },
      {
        id: 'portal_master',
        name: 'Portal Master',
        description: 'Use teleport 200 times total',
        icon: '🌌',
        requirement: 200,
        unlocked: false,
        progress: 0,
        type: 'teleport_expert',
        reward: { type: 'color', id: '#9c27b0', name: 'Portal Purple' }
      },
      {
        id: 'dimension_walker',
        name: 'Dimension Walker',
        description: 'Use teleport 500 times total',
        icon: '🌠',
        requirement: 500,
        unlocked: false,
        progress: 0,
        type: 'teleport_expert',
        reward: { type: 'trail', id: 'portal', name: 'Portal Trail' }
      },

      // Perfect Game Achievements
      {
        id: 'first_perfect',
        name: 'First Perfect',
        description: 'Complete your first perfect game',
        icon: '⭐',
        requirement: 1,
        unlocked: false,
        progress: 0,
        type: 'perfect_games'
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete 5 perfect games',
        icon: '🌟',
        requirement: 5,
        unlocked: false,
        progress: 0,
        type: 'perfect_games',
        reward: { type: 'skin', id: 'rainbow', name: 'Rainbow Snake' }
      },
      {
        id: 'flawless_master',
        name: 'Flawless Master',
        description: 'Complete 20 perfect games',
        icon: '💎',
        requirement: 20,
        unlocked: false,
        progress: 0,
        type: 'perfect_games',
        reward: { type: 'head_shape', id: 'diamond', name: 'Diamond Head' }
      },

      // Special Challenge Achievements
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Score 1000 points on fast speed',
        icon: '🏃‍♂️',
        requirement: 1000,
        unlocked: false,
        progress: 0,
        type: 'speed_demon',
        reward: { type: 'trail', id: 'sonic', name: 'Sonic Trail' }
      },
      {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Eat 10 foods in a row without missing',
        icon: '🔥',
        requirement: 10,
        unlocked: false,
        progress: 0,
        type: 'combo_master',
        reward: { type: 'color', id: '#ff4500', name: 'Orange Red' }
      },
      {
        id: 'multitasker',
        name: 'Multitasker',
        description: 'Complete a multiplayer game',
        icon: '👥',
        requirement: 1,
        unlocked: false,
        progress: 0,
        type: 'multiplayer_games'
      },
      {
        id: 'giant_snake',
        name: 'Giant Snake',
        description: 'Reach a snake length of 50 segments',
        icon: '🐍',
        requirement: 50,
        unlocked: false,
        progress: 0,
        type: 'snake_length',
        reward: { type: 'skin', id: 'giant', name: 'Giant Snake' }
      },
      {
        id: 'daily_warrior',
        name: 'Daily Warrior',
        description: 'Complete 10 daily challenges',
        icon: '⚔️',
        requirement: 10,
        unlocked: false,
        progress: 0,
        type: 'daily_challenges',
        reward: { type: 'color', id: '#ffd700', name: 'Champion Gold' }
      },
      {
        id: 'collector',
        name: 'Collector',
        description: 'Unlock 10 different customization items',
        icon: '🎁',
        requirement: 10,
        unlocked: false,
        progress: 0,
        type: 'unlocks_count'
      },

      // Milestone Achievements
      {
        id: 'snake_master',
        name: 'Snake Master',
        description: 'Achieve true mastery of Snake',
        icon: '👑',
        requirement: 4,
        unlocked: false,
        progress: 0,
        type: 'milestone',
        milestone: true,
        reward: { type: 'skin', id: 'master', name: 'Master Snake' },
        steps: [
          {
            id: 'master_score',
            name: 'High Score Master',
            description: 'Reach a score of 3000',
            completed: false,
            requirement: 3000,
            progress: 0,
            type: 'score'
          },
          {
            id: 'master_survival',
            name: 'Survival Expert',
            description: 'Survive for 8 minutes',
            completed: false,
            requirement: 480000,
            progress: 0,
            type: 'survival_time'
          },
          {
            id: 'master_perfect',
            name: 'Perfectionist',
            description: 'Complete 10 perfect games',
            completed: false,
            requirement: 10,
            progress: 0,
            type: 'perfect_games'
          },
          {
            id: 'master_length',
            name: 'Giant Snake',
            description: 'Reach 75 segments',
            completed: false,
            requirement: 75,
            progress: 0,
            type: 'snake_length'
          }
        ]
      },
      {
        id: 'combat_specialist',
        name: 'Combat Specialist',
        description: 'Master all combat aspects',
        icon: '⚔️',
        requirement: 3,
        unlocked: false,
        progress: 0,
        type: 'milestone',
        milestone: true,
        reward: { type: 'trail', id: 'combat', name: 'Combat Trail' },
        steps: [
          {
            id: 'combat_bullets',
            name: 'Sharpshooter',
            description: 'Fire 1000 bullets',
            completed: false,
            requirement: 1000,
            progress: 0,
            type: 'bullet_master'
          },
          {
            id: 'combat_walls',
            name: 'Wall Destroyer',
            description: 'Break 500 walls',
            completed: false,
            requirement: 500,
            progress: 0,
            type: 'walls_broken'
          },
          {
            id: 'combat_teleports',
            name: 'Teleport Master',
            description: 'Use teleport 1000 times',
            completed: false,
            requirement: 1000,
            progress: 0,
            type: 'teleport_expert'
          }
        ]
      },
      {
        id: 'ultimate_collector',
        name: 'Ultimate Collector',
        description: 'Unlock everything in the game',
        icon: '🏆',
        requirement: 4,
        unlocked: false,
        progress: 0,
        type: 'milestone',
        milestone: true,
        reward: { type: 'head_shape', id: 'ultimate', name: 'Ultimate Head' },
        steps: [
          {
            id: 'collect_skins',
            name: 'Skin Collector',
            description: 'Unlock 15 different skins',
            completed: false,
            requirement: 15,
            progress: 0,
            type: 'unlocks_count'
          },
          {
            id: 'collect_trails',
            name: 'Trail Master',
            description: 'Unlock 10 different trails',
            completed: false,
            requirement: 10,
            progress: 0,
            type: 'unlocks_count'
          },
          {
            id: 'collect_colors',
            name: 'Color Enthusiast',
            description: 'Unlock 20 different colors',
            completed: false,
            requirement: 20,
            progress: 0,
            type: 'unlocks_count'
          },
          {
            id: 'collect_achievements',
            name: 'Achievement Hunter',
            description: 'Unlock 30 achievements',
            completed: false,
            requirement: 30,
            progress: 0,
            type: 'unlocks_count'
          }
        ]
      },
      {
        id: 'dedication_master',
        name: 'Dedication Master',
        description: 'Show ultimate dedication to the game',
        icon: '💎',
        requirement: 3,
        unlocked: false,
        progress: 0,
        type: 'milestone',
        milestone: true,
        reward: { type: 'skin', id: 'diamond', name: 'Diamond Snake' },
        steps: [
          {
            id: 'dedication_games',
            name: 'Veteran Player',
            description: 'Play 1000 games',
            completed: false,
            requirement: 1000,
            progress: 0,
            type: 'games_played'
          },
          {
            id: 'dedication_food',
            name: 'Food Connoisseur',
            description: 'Eat 5000 foods',
            completed: false,
            requirement: 5000,
            progress: 0,
            type: 'foods_eaten'
          },
          {
            id: 'dedication_daily',
            name: 'Daily Champion',
            description: 'Complete 100 daily challenges',
            completed: false,
            requirement: 100,
            progress: 0,
            type: 'daily_challenges'
          }
        ]
      },

      // Mastery Challenges for Advanced Players
      {
        id: 'legendary_snake',
        name: 'Legendary Snake',
        description: 'Achieve legendary status in Snake mastery',
        icon: '🐉',
        requirement: 5,
        unlocked: false,
        progress: 0,
        type: 'milestone',
        milestone: true,
        reward: { type: 'skin', id: 'legendary_dragon', name: 'Legendary Dragon Snake' },
        steps: [
          {
            id: 'legend_score',
            name: 'Legendary Score',
            description: 'Score 10,000 points in a single game',
            completed: false,
            requirement: 10000,
            progress: 0,
            type: 'score'
          },
          {
            id: 'legend_length',
            name: 'Colossal Snake',
            description: 'Reach 150 segments in a single game',
            completed: false,
            requirement: 150,
            progress: 0,
            type: 'snake_length'
          },
          {
            id: 'legend_survival',
            name: 'Immortal Being',
            description: 'Survive for 30 minutes in a single game',
            completed: false,
            requirement: 1800000, // 30 minutes
            progress: 0,
            type: 'survival_time'
          },
          {
            id: 'legend_perfect',
            name: 'Master Perfectionist',
            description: 'Complete 50 perfect games',
            completed: false,
            requirement: 50,
            progress: 0,
            type: 'perfect_games'
          },
          {
            id: 'legend_dedication',
            name: 'Ultimate Dedication',
            description: 'Play 5000 games total',
            completed: false,
            requirement: 5000,
            progress: 0,
            type: 'games_played'
          }
        ]
      },
      {
        id: 'speed_demon_master',
        name: 'Speed Demon Master',
        description: 'Master the art of high-speed Snake gameplay',
        icon: '⚡',
        requirement: 5000,
        unlocked: false,
        progress: 0,
        type: 'speed_demon',
        milestone: true,
        reward: { type: 'trail', id: 'lightning_bolt', name: 'Lightning Bolt Trail' }
      },
      {
        id: 'combat_overlord',
        name: 'Combat Overlord',
        description: 'Dominate the battlefield with overwhelming firepower',
        icon: '💥',
        requirement: 10000,
        unlocked: false,
        progress: 0,
        type: 'bullet_master',
        milestone: true,
        reward: { type: 'color', id: '#FF0000', name: 'War Crimson' }
      },
      {
        id: 'destruction_incarnate',
        name: 'Destruction Incarnate',
        description: 'Demolish everything in your path',
        icon: '💣',
        requirement: 2500,
        unlocked: false,
        progress: 0,
        type: 'walls_broken',
        milestone: true,
        reward: { type: 'head_shape', id: 'explosion', name: 'Explosion Head' }
      },
      {
        id: 'dimension_lord',
        name: 'Dimension Lord',
        description: 'Master the art of interdimensional travel',
        icon: '🌌',
        requirement: 2500,
        unlocked: false,
        progress: 0,
        type: 'teleport_expert',
        milestone: true,
        reward: { type: 'trail', id: 'dimensional_rift', name: 'Dimensional Rift Trail' }
      },
      {
        id: 'eternal_glutton',
        name: 'Eternal Glutton',
        description: 'Consume an unfathomable amount of food',
        icon: '🍎',
        requirement: 25000,
        unlocked: false,
        progress: 0,
        type: 'foods_eaten',
        milestone: true,
        reward: { type: 'color', id: '#32CD32', name: 'Eternal Green' }
      },
      {
        id: 'time_lord',
        name: 'Time Lord',
        description: 'Master the flow of time itself',
        icon: '⏳',
        requirement: 3600000, // 1 hour total survival time
        unlocked: false,
        progress: 0,
        type: 'survival_time',
        milestone: true,
        reward: { type: 'skin', id: 'time_crystal', name: 'Time Crystal Snake' }
      },
      {
        id: 'impossible_achievement',
        name: 'The Impossible',
        description: 'Achieve the impossible - only legends can unlock this',
        icon: '🏆',
        requirement: 4,
        unlocked: false,
        progress: 0,
        type: 'milestone',
        milestone: true,
        reward: { type: 'head_shape', id: 'impossible_crown', name: 'Impossible Crown' },
        steps: [
          {
            id: 'impossible_score',
            name: 'Transcendent Score',
            description: 'Score 25,000 points in a single game',
            completed: false,
            requirement: 25000,
            progress: 0,
            type: 'score'
          },
          {
            id: 'impossible_length',
            name: 'World Serpent',
            description: 'Reach 500 segments in a single game',
            completed: false,
            requirement: 500,
            progress: 0,
            type: 'snake_length'
          },
          {
            id: 'impossible_survival',
            name: 'Eternal Existence',
            description: 'Survive for 2 hours in a single game',
            completed: false,
            requirement: 7200000, // 2 hours
            progress: 0,
            type: 'survival_time'
          },
          {
            id: 'impossible_perfect',
            name: 'Absolute Perfection',
            description: 'Complete 100 perfect games',
            completed: false,
            requirement: 100,
            progress: 0,
            type: 'perfect_games'
          }
        ]
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

  private getWeeklyChallengeTemplates(): Omit<WeeklyChallenge, 'id' | 'weekStart' | 'progress' | 'completed'>[] {
    return [
      // Easy Weekly Challenges
      {
        title: 'Weekly Warrior',
        description: 'Accumulate points throughout the week',
        objective: 'Score a total of 5000 points this week',
        target: 5000,
        type: 'multi_score',
        difficulty: 'easy',
        reward: { 
          experience: 300,
          unlockable: { type: 'color', id: '#32cd32', name: 'Lime Green' }
        }
      },
      {
        title: 'Marathon Runner',
        description: 'Survive for long periods',
        objective: 'Accumulate 30 minutes of survival time',
        target: 1800000, // 30 minutes in milliseconds
        type: 'marathon',
        difficulty: 'medium',
        reward: {
          experience: 500,
          unlockable: { type: 'trail', id: 'marathon', name: 'Marathon Trail' }
        }
      },
      {
        title: 'Perfect Streak',
        description: 'Complete multiple perfect games',
        objective: 'Complete 3 perfect games this week',
        target: 3,
        type: 'perfect_streak',
        difficulty: 'hard',
        reward: {
          experience: 800,
          unlockable: { type: 'skin', id: 'perfect', name: 'Perfect Snake' }
        }
      },
      {
        title: 'Combo Master',
        description: 'Achieve high food collection streaks',
        objective: 'Eat 500 foods this week',
        target: 500,
        type: 'combo_master',
        difficulty: 'medium',
        reward: {
          experience: 400,
          unlockable: { type: 'color', id: '#ff69b4', name: 'Hot Pink' }
        }
      },
      {
        title: 'Speed Demon',
        description: 'Score high on fastest speed',
        objective: 'Score 2000 points on fast speed',
        target: 2000,
        type: 'speed_challenge',
        difficulty: 'hard',
        reward: {
          experience: 700,
          unlockable: { type: 'trail', id: 'speed', name: 'Speed Trail' }
        }
      },
      {
        title: 'Survival Master',
        description: 'Ultimate endurance challenge',
        objective: 'Survive for 15 minutes in a single game',
        target: 900000, // 15 minutes in milliseconds
        type: 'survival_master',
        difficulty: 'expert',
        reward: {
          experience: 1000,
          unlockable: { type: 'head_shape', id: 'crown', name: 'Crown Head' }
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

  getThisWeeksChallenge(): WeeklyChallenge | null {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekStart = startOfWeek.toDateString()
    return this.data.weeklyChallenges.find(c => c.weekStart === weekStart) || null
  }

  // Seasonal Events
  private updateSeasonalEvents(): void {
    const now = new Date()
    const currentEvents = this.getCurrentSeasonalEvents(now)
    
    // Remove expired events
    this.data.seasonalEvents = this.data.seasonalEvents.filter(event => {
      const endDate = new Date(event.endDate)
      return endDate > now
    })
    
    // Add new events
    currentEvents.forEach(newEvent => {
      const existingEvent = this.data.seasonalEvents.find(e => e.id === newEvent.id)
      if (!existingEvent) {
        this.data.seasonalEvents.push({
          ...newEvent,
          active: true,
          challenges: newEvent.challenges.map((challenge: any) => ({
            ...challenge,
            progress: 0,
            completed: false
          }))
        })
        
        // Initialize event points
        if (!this.data.eventPoints[newEvent.id]) {
          this.data.eventPoints[newEvent.id] = 0
        }
      }
    })
  }

  private getCurrentSeasonalEvents(date: Date): SeasonalEvent[] {
    const events: SeasonalEvent[] = []
    const month = date.getMonth() + 1 // 1-12
    const day = date.getDate()
    
    // Spring Event (March 20 - June 21)
    if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 21)) {
      events.push(this.getSpringEvent() as any)
    }
    
    // Summer Event (June 21 - September 23)
    if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 23)) {
      events.push(this.getSummerEvent() as any)
    }
    
    // Fall Event (September 23 - December 21)
    if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day <= 21)) {
      events.push(this.getFallEvent() as any)
    }
    
    // Winter Event (December 21 - March 20)
    if ((month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day < 20)) {
      events.push(this.getWinterEvent() as any)
    }
    
    // Special Holiday Events
    if (month === 12 && day >= 24 && day <= 31) {
      events.push(this.getWinterHolidayEvent() as any)
    }
    
    if (month === 10 && day >= 25 && day <= 31) {
      events.push(this.getHalloweenEvent() as any)
    }
    
    return events
  }

  private getSpringEvent() {
    return {
      id: 'spring_2025',
      name: 'Spring Awakening',
      description: 'Celebrate the season of growth and renewal',
      startDate: '2025-03-20',
      endDate: '2025-06-21',
      icon: '🌱',
      theme: 'spring' as const,
      active: true,
      challenges: [
        {
          id: 'spring_growth',
          eventId: 'spring_2025',
          name: 'Growth Spurt',
          description: 'Grow your snake to new lengths',
          objective: 'Eat 100 foods during the spring event',
          target: 100,
          progress: 0,
          completed: false,
          type: 'food_collection' as const,
          reward: {
            experience: 300,
            unlockable: { type: 'color', id: '#90EE90', name: 'Spring Green' },
            eventPoints: 50
          }
        },
        {
          id: 'spring_bloom',
          eventId: 'spring_2025',
          name: 'Blooming Score',
          description: 'Achieve a blooming high score',
          objective: 'Score 1500 points in a single game',
          target: 1500,
          progress: 0,
          completed: false,
          type: 'score' as const,
          reward: {
            experience: 500,
            unlockable: { type: 'trail', id: 'flower', name: 'Flower Trail' },
            eventPoints: 100
          }
        }
      ],
      rewards: [
        { type: 'skin', id: 'spring_blossom', name: 'Spring Blossom Snake' }
      ]
    }
  }

  private getSummerEvent() {
    return {
      id: 'summer_2025',
      name: 'Summer Heat Wave',
      description: 'Beat the heat with intense gameplay',
      startDate: '2025-06-21',
      endDate: '2025-09-23',
      icon: '☀️',
      theme: 'summer' as const,
      active: true,
      challenges: [
        {
          id: 'summer_endurance',
          eventId: 'summer_2025',
          name: 'Heat Endurance',
          description: 'Survive the summer heat',
          objective: 'Survive for 5 minutes in a single game',
          target: 300000,
          progress: 0,
          completed: false,
          type: 'survival' as const,
          reward: {
            experience: 400,
            unlockable: { type: 'color', id: '#FFD700', name: 'Summer Gold' },
            eventPoints: 75
          }
        }
      ],
      rewards: [
        { type: 'trail', id: 'sun_ray', name: 'Sun Ray Trail' }
      ]
    }
  }

  private getFallEvent() {
    return {
      id: 'fall_2025',
      name: 'Autumn Harvest',
      description: 'Harvest the rewards of your skills',
      startDate: '2025-09-23',
      endDate: '2025-12-21',
      icon: '🍂',
      theme: 'fall' as const,
      active: true,
      challenges: [
        {
          id: 'fall_harvest',
          eventId: 'fall_2025',
          name: 'Bountiful Harvest',
          description: 'Collect a bountiful harvest',
          objective: 'Play 20 games during the fall event',
          target: 20,
          progress: 0,
          completed: false,
          type: 'streak' as const,
          reward: {
            experience: 350,
            unlockable: { type: 'color', id: '#FF8C00', name: 'Autumn Orange' },
            eventPoints: 60
          }
        }
      ],
      rewards: [
        { type: 'head_shape', id: 'leaf', name: 'Leaf Head' }
      ]
    }
  }

  private getWinterEvent() {
    return {
      id: 'winter_2025',
      name: 'Winter Wonderland',
      description: 'Navigate through the winter wonderland',
      startDate: '2025-12-21',
      endDate: '2026-03-20',
      icon: '❄️',
      theme: 'winter' as const,
      active: true,
      challenges: [
        {
          id: 'winter_survival',
          eventId: 'winter_2025',
          name: 'Winter Survival',
          description: 'Survive the harsh winter',
          objective: 'Complete 5 perfect games',
          target: 5,
          progress: 0,
          completed: false,
          type: 'streak' as const,
          reward: {
            experience: 500,
            unlockable: { type: 'color', id: '#87CEEB', name: 'Ice Blue' },
            eventPoints: 100
          }
        }
      ],
      rewards: [
        { type: 'skin', id: 'ice_crystal', name: 'Ice Crystal Snake' }
      ]
    }
  }

  private getWinterHolidayEvent() {
    return {
      id: 'winter_holidays_2025',
      name: 'Winter Holidays',
      description: 'Celebrate the winter holidays with special challenges',
      startDate: '2025-12-24',
      endDate: '2025-12-31',
      icon: '🎄',
      theme: 'holiday' as const,
      active: true,
      challenges: [
        {
          id: 'holiday_gift',
          eventId: 'winter_holidays_2025',
          name: 'Gift Collector',
          description: 'Collect holiday gifts',
          objective: 'Score 2000 points on December 25th',
          target: 2000,
          progress: 0,
          completed: false,
          type: 'special_action' as const,
          reward: {
            experience: 750,
            unlockable: { type: 'trail', id: 'festive', name: 'Festive Trail' },
            eventPoints: 150
          }
        }
      ],
      rewards: [
        { type: 'head_shape', id: 'santa_hat', name: 'Santa Hat' }
      ]
    }
  }

  private getHalloweenEvent() {
    return {
      id: 'halloween_2025',
      name: 'Spooky Snake',
      description: 'Get into the Halloween spirit',
      startDate: '2025-10-25',
      endDate: '2025-10-31',
      icon: '🎃',
      theme: 'holiday' as const,
      active: true,
      challenges: [
        {
          id: 'spooky_score',
          eventId: 'halloween_2025',
          name: 'Spooky High Score',
          description: 'Achieve a frightening score',
          objective: 'Score 1666 points in a single game',
          target: 1666,
          progress: 0,
          completed: false,
          type: 'score' as const,
          reward: {
            experience: 666,
            unlockable: { type: 'color', id: '#FF4500', name: 'Pumpkin Orange' },
            eventPoints: 100
          }
        }
      ],
      rewards: [
        { type: 'skin', id: 'ghost', name: 'Ghost Snake' }
      ]
    }
  }

  getActiveSeasonalEvents(): SeasonalEvent[] {
    return this.data.seasonalEvents.filter(event => event.active)
  }

  getEventPoints(eventId: string): number {
    return this.data.eventPoints[eventId] || 0
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

  // Helper method to update unlocks count for achievements
  private updateUnlocksCount(): void {
    const totalUnlocks = 
      this.data.unlockedSkins.length + 
      this.data.unlockedTrails.length + 
      this.data.unlockedColors.length + 
      this.data.unlockedHeadShapes.length
    
    const totalAchievements = this.data.achievements.filter(a => a.unlocked).length
    
    // Update unlocks count achievements
    this.data.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.type === 'unlocks_count') {
        achievement.progress = totalUnlocks
        if (achievement.progress >= achievement.requirement) {
          achievement.unlocked = true
          this.addExperience(50)
        }
      }
      
      // Update multi-step achievement steps that track unlocks
      if (achievement.steps) {
        achievement.steps.forEach(step => {
          if (!step.completed) {
            if (step.id === 'collect_skins') {
              step.progress = this.data.unlockedSkins.length
            } else if (step.id === 'collect_trails') {
              step.progress = this.data.unlockedTrails.length
            } else if (step.id === 'collect_colors') {
              step.progress = this.data.unlockedColors.length
            } else if (step.id === 'collect_achievements') {
              step.progress = totalAchievements
            } else if (step.type === 'unlocks_count') {
              step.progress = totalUnlocks
            }
            
            if (step.progress >= step.requirement) {
              step.completed = true
            }
          }
        })
      }
    })
  }
}