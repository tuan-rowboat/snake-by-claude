export const saveHighScores = (scores: number[]): void => {
  try {
    localStorage.setItem('snakeHighScores', JSON.stringify(scores))
  } catch (error) {
    console.error('Failed to save high scores:', error)
  }
}

export const loadHighScores = (): number[] => {
  try {
    const saved = localStorage.getItem('snakeHighScores')
    if (saved) {
      return JSON.parse(saved) as number[]
    }
  } catch (error) {
    console.error('Failed to load high scores:', error)
  }
  return []
}

export const updateHighScores = (currentScore: number, existingScores: number[]): number[] => {
  const newScores = [...existingScores, currentScore].sort((a, b) => b - a).slice(0, 5)
  saveHighScores(newScores)
  return newScores
}
