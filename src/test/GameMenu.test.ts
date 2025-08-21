import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameMenu from '../components/GameMenu.vue'
import type { GameMode, GameSettings } from '../types/game'

describe('GameMenu Component', () => {
  const defaultSettings: GameSettings = {
    headShape: 'square',
    headColor: '#00ff00',
    headColor2: '#0080ff',
    bgColor: '#1a1a2e',
    speed: 'normal',
    wallPattern: 'simple',
    maxFoods: 3,
    teleportEnabled: false,
    gridSize: 20,
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.5
  }

  const defaultProps = {
    gameMode: 'single' as GameMode,
    settings: defaultSettings,
    highScores: [100, 80, 60, 40, 20]
  }

  it('should render correctly', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    expect(wrapper.find('h2').text()).toBe('Game Settings')
    expect(wrapper.find('[data-testid="single-player-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="multiplayer-btn"]').exists()).toBe(true)
  })

  it('should emit game mode change', async () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    await wrapper.find('[data-testid="multiplayer-btn"]').trigger('click')
    
    expect(wrapper.emitted('update-game-mode')).toBeTruthy()
    expect(wrapper.emitted('update-game-mode')?.[0]).toEqual(['multiplayer'])
  })

  it('should emit settings update', async () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    const speedButton = wrapper.find('[data-testid="speed-fast"]')
    await speedButton.trigger('click')
    
    expect(wrapper.emitted('update-settings')).toBeTruthy()
    expect(wrapper.emitted('update-settings')?.[0]).toEqual(['speed', 'fast'])
  })

  it('should emit start game event', async () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    await wrapper.find('[data-testid="start-game-btn"]').trigger('click')
    
    expect(wrapper.emitted('start-game')).toBeTruthy()
  })

  it('should show player 2 color selection in multiplayer mode', () => {
    const multiplayerProps = {
      ...defaultProps,
      gameMode: 'multiplayer' as GameMode
    }
    
    const wrapper = mount(GameMenu, { props: multiplayerProps })
    
    expect(wrapper.text()).toContain('Player Colors')
    expect(wrapper.text()).toContain('P1:')
    expect(wrapper.text()).toContain('P2:')
  })

  it('should hide player 2 color selection in single player mode', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    expect(wrapper.text()).toContain('Colors')
    expect(wrapper.text()).toContain('Snake:')
    expect(wrapper.text()).not.toContain('P2:')
  })

  it('should show background color in single player mode', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    expect(wrapper.text()).toContain('BG:')
  })

  it('should hide background color in multiplayer mode', () => {
    const multiplayerProps = {
      ...defaultProps,
      gameMode: 'multiplayer' as GameMode
    }
    
    const wrapper = mount(GameMenu, { props: multiplayerProps })
    
    expect(wrapper.text()).not.toContain('Background Color')
  })

  it('should highlight selected game mode', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    const singlePlayerBtn = wrapper.find('[data-testid="single-player-btn"]')
    const multiplayerBtn = wrapper.find('[data-testid="multiplayer-btn"]')
    
    expect(singlePlayerBtn.classes()).toContain('border-green-400')
    expect(multiplayerBtn.classes()).not.toContain('border-blue-400')
  })

  it('should display high scores', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    expect(wrapper.text()).toContain('High Scores')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('80')
  })

  it('should show empty state when no high scores', () => {
    const noScoresProps = {
      ...defaultProps,
      highScores: []
    }
    
    const wrapper = mount(GameMenu, { props: noScoresProps })
    
    // Should not show high scores section when empty
    expect(wrapper.text()).not.toContain('🏆 High Scores')
  })

  it('should include teleport toggle', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    expect(wrapper.text()).toContain('Teleport Mode')
    expect(wrapper.text()).toContain('Jump through walls')
  })

  it('should emit teleport setting change', async () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    const teleportToggle = wrapper.find('[data-testid="teleport-toggle"]')
    await teleportToggle.trigger('click')
    
    expect(wrapper.emitted('update-settings')).toBeTruthy()
    const emittedEvents = wrapper.emitted('update-settings') as any[]
    const teleportEvent = emittedEvents.find(event => event[0] === 'teleportEnabled')
    expect(teleportEvent).toBeTruthy()
    expect(teleportEvent[1]).toBe(true)
  })

  it('should show wall pattern options including moving walls', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    const wallPatternSelect = wrapper.find('select[data-testid="wall-pattern-select"]')
    const options = wallPatternSelect.findAll('option')
    const optionTexts = options.map(option => option.text())
    
    expect(optionTexts).toContain('None')
    expect(optionTexts).toContain('Simple')
    expect(optionTexts).toContain('Cross')
    expect(optionTexts).toContain('Maze')
    expect(optionTexts).toContain('Random')
    expect(optionTexts).toContain('Moving')
  })

  it('should show speed options', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    expect(wrapper.find('[data-testid="speed-slow"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="speed-normal"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="speed-fast"]').exists()).toBe(true)
  })

  it('should show max foods options', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    for (let i = 1; i <= 5; i++) {
      expect(wrapper.find(`[data-testid="max-foods-${i}"]`).exists()).toBe(true)
    }
  })

  it('should display game controls instructions', () => {
    const wrapper = mount(GameMenu, { props: defaultProps })
    
    // The controls are only shown in multiplayer mode
    expect(wrapper.text()).toContain('🍎 Food Guide')
    expect(wrapper.text()).toContain('Special Effects:')
  })

  it('should show multiplayer instructions in multiplayer mode', () => {
    const multiplayerProps = {
      ...defaultProps,
      gameMode: 'multiplayer' as GameMode
    }
    
    const wrapper = mount(GameMenu, { props: multiplayerProps })
    
    expect(wrapper.text()).toContain('P1: Arrow Keys')
    expect(wrapper.text()).toContain('P2: WASD')
    expect(wrapper.text()).toContain('🎮 Controls')
  })
})
