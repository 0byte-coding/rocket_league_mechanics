export interface RankInfo {
  name: string
  tier: string
  color: string
  difficulty_min: number
  difficulty_max: number
}

export const RANK_TIERS: RankInfo[] = [
  { name: "Bronze",         tier: "bronze",        color: "#cd7f32", difficulty_min: 0,   difficulty_max: 10  },
  { name: "Silver",         tier: "silver",        color: "#c0c0c0", difficulty_min: 10,  difficulty_max: 20  },
  { name: "Gold",           tier: "gold",          color: "#ffd700", difficulty_min: 20,  difficulty_max: 30  },
  { name: "Platinum",       tier: "platinum",      color: "#5fd4f4", difficulty_min: 30,  difficulty_max: 40  },
  { name: "Diamond",        tier: "diamond",       color: "#4aaeff", difficulty_min: 40,  difficulty_max: 55  },
  { name: "Champion",       tier: "champion",      color: "#b44ff2", difficulty_min: 55,  difficulty_max: 70  },
  { name: "Grand Champion", tier: "grand_champion",color: "#e93939", difficulty_min: 70,  difficulty_max: 85  },
  { name: "Supersonic Legend", tier: "ssl",        color: "#ff6fff", difficulty_min: 85,  difficulty_max: 101 },
]

export const get_rank_for_difficulty = (difficulty: number): RankInfo => {
  const rank = RANK_TIERS.find(
    (r) => difficulty >= r.difficulty_min && difficulty < r.difficulty_max
  )
  return rank ?? RANK_TIERS[RANK_TIERS.length - 1]
}
