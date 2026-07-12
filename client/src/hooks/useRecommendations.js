import { useMemo } from 'react'

export function useRecommendations(wallpapers, tagScores, limit = 10) {
  const hasHistory = Object.keys(tagScores).length > 0 &&
    Object.values(tagScores).some(v => v > 1)

  const recommendations = useMemo(() => {
    if (!hasHistory || !wallpapers.length) return []

    return wallpapers
      .filter(w => Array.isArray(w.tags) && w.tags.length > 0)
      .map(w => ({
        ...w,
        recScore: w.tags.reduce((sum, tag) => sum + (tagScores[tag] || 0), 0),
      }))
      .filter(w => w.recScore > 0)
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, limit)
  }, [wallpapers, tagScores, hasHistory, limit])

  return { recommendations, hasHistory }
}