export interface RankInfo {
  name: string
  tier: string
  color: string
  difficulty_min: number
  difficulty_max: number
}

export const RANK_TIERS: RankInfo[] = [
  { name: "Bronze 1",         tier: "bronze1",        color: "#cd7f32", difficulty_min: 0,   difficulty_max: 4  },
  { name: "Bronze 2",         tier: "bronze2",        color: "#cd7f32", difficulty_min: 4,   difficulty_max: 6  },
  { name: "Bronze 3",         tier: "bronze3",        color: "#cd7f32", difficulty_min: 6,   difficulty_max: 10  },
  { name: "Silver 1",         tier: "silver1",       color: "#c0c0c0", difficulty_min: 10,  difficulty_max: 13  },
  { name: "Silver 2",         tier: "silver2",       color: "#c0c0c0", difficulty_min: 13,  difficulty_max: 16  },
  { name: "Silver 3",         tier: "silver3",       color: "#c0c0c0", difficulty_min: 16,  difficulty_max: 20  },
  { name: "Gold 1",           tier: "gold1",         color: "#ffd700", difficulty_min: 20,  difficulty_max: 23  },
  { name: "Gold 2",           tier: "gold2",         color: "#ffd700", difficulty_min: 23,  difficulty_max: 26  },
  { name: "Gold 3",           tier: "gold3",         color: "#ffd700", difficulty_min: 26,  difficulty_max: 30  },
  { name: "Platinum 1",       tier: "platinum1",     color: "#5fd4f4", difficulty_min: 30,  difficulty_max: 33  },
  { name: "Platinum 2",       tier: "platinum2",     color: "#5fd4f4", difficulty_min: 33,  difficulty_max: 36  },
  { name: "Platinum 3",       tier: "platinum3",     color: "#5fd4f4", difficulty_min: 36,  difficulty_max: 40  },
  { name: "Diamond 1",        tier: "diamond1",      color: "#4aaeff", difficulty_min: 40,  difficulty_max: 45  },
  { name: "Diamond 2",        tier: "diamond2",      color: "#4aaeff", difficulty_min: 45,  difficulty_max: 50  },
  { name: "Diamond 3",        tier: "diamond3",      color: "#4aaeff", difficulty_min: 50,  difficulty_max: 55  },
  { name: "Champion 1",       tier: "champion1",     color: "#b44ff2", difficulty_min: 55,  difficulty_max: 60  },
  { name: "Champion 2",       tier: "champion2",     color: "#b44ff2", difficulty_min: 60,  difficulty_max: 65  },
  { name: "Champion 3",       tier: "champion3",     color: "#b44ff2", difficulty_min: 65,  difficulty_max: 70  },
  { name: "Grand Champion 1", tier: "grand_champion1",color: "#e93939", difficulty_min: 70,  difficulty_max: 75  },
  { name: "Grand Champion 2", tier: "grand_champion2",color: "#e93939", difficulty_min: 75,  difficulty_max: 80  },
  { name: "Grand Champion 3", tier: "grand_champion3",color: "#e93939", difficulty_min: 80,  difficulty_max: 85  },
  { name: "Supersonic Legend", tier: "ssl",        color: "#ff6fff", difficulty_min: 85,  difficulty_max: 101 },
]

export const get_rank_for_difficulty = (difficulty: number): RankInfo => {
  const rank = RANK_TIERS.find(
    (r) => difficulty >= r.difficulty_min && difficulty < r.difficulty_max
  )
  return rank ?? RANK_TIERS[RANK_TIERS.length - 1]
}
