import React from "react"
import { get_rank_for_difficulty, type RankInfo } from "@/lib/ranks"
import { cn } from "@/lib/utils"
import img_bronze1 from '../asset/ranks/bronze1.webp';
import img_bronze2 from '../asset/ranks/bronze2.webp';
import img_bronze3 from '../asset/ranks/bronze3.webp';
import img_silver1 from '../asset/ranks/silver1.webp';
import img_silver2 from '../asset/ranks/silver2.webp';
import img_silver3 from '../asset/ranks/silver3.webp';
import img_gold1 from '../asset/ranks/gold1.webp';
import img_gold2 from '../asset/ranks/gold2.webp';
import img_gold3 from '../asset/ranks/gold3.webp';
import img_plat1 from '../asset/ranks/plat1.webp';
import img_plat2 from '../asset/ranks/plat2.webp';
import img_plat3 from '../asset/ranks/plat3.webp';
import img_d1 from '../asset/ranks/d1.webp';
import img_d2 from '../asset/ranks/d2.webp';
import img_d3 from '../asset/ranks/d3.webp';
import img_c1 from '../asset/ranks/c1.webp';
import img_c2 from '../asset/ranks/c2.webp';
import img_c3 from '../asset/ranks/c3.webp';
import img_gc1 from '../asset/ranks/gc1.webp';
import img_gc2 from '../asset/ranks/gc2.webp';
import img_gc3 from '../asset/ranks/gc3.webp';
import img_ssl from '../asset/ranks/ssl.webp';

interface RankIconProps {
  difficulty: number
  size?: number
  show_label?: boolean
  className?: string
}

const Bronze1: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_bronze1.src} width={size} height={size}/>
)
const Bronze2: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_bronze2.src} width={size} height={size}/>
)
const Bronze3: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_bronze3.src} width={size} height={size}/>
)

const Silver1: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_silver1.src} width={size} height={size}/>
)
const Silver2: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_silver2.src} width={size} height={size}/>
)
const Silver3: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_silver3.src} width={size} height={size}/>
)

const Gold1: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_gold1.src} width={size} height={size}/>
)
const Gold2: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_gold2.src} width={size} height={size}/>
)
const Gold3: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_gold3.src} width={size} height={size}/>
)

const Platinum1: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_plat1.src} width={size} height={size}/>
)
const Platinum2: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_plat2.src} width={size} height={size}/>
)
const Platinum3: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_plat3.src} width={size} height={size}/>
)

const Diamond1: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_d1.src} width={size} height={size}/>
)
const Diamond2: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_d2.src} width={size} height={size}/>
)
const Diamond3: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_d3.src} width={size} height={size}/>
)

const Champion1: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_c1.src} width={size} height={size}/>
)
const Champion2: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_c2.src} width={size} height={size}/>
)
const Champion3: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_c3.src} width={size} height={size}/>
)

const GrandChampion1: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_gc1.src} width={size} height={size}/>
)
const GrandChampion2: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_gc2.src} width={size} height={size}/>
)
const GrandChampion3: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_gc3.src} width={size} height={size}/>
)

const SSL: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <img src={img_ssl.src} width={size} height={size}/>
)

const RANK_ICON_MAP: Record<string, React.FC<{ color: string; size: number }>> = {
  bronze1: Bronze1,
  bronze2: Bronze2,
  bronze3: Bronze3,
  silver1: Silver1,
  silver2: Silver2,
  silver3: Silver3,
  gold1: Gold1,
  gold2: Gold2,
  gold3: Gold3,
  platinum1: Platinum1,
  platinum2: Platinum2,
  platinum3: Platinum3,
  diamond1: Diamond1,
  diamond2: Diamond2,
  diamond3: Diamond3,
  champion1: Champion1,
  champion2: Champion2,
  champion3: Champion3,
  grand_champion1: GrandChampion1,
  grand_champion2: GrandChampion2,
  grand_champion3: GrandChampion3,
  ssl: SSL,
}

const RankIcon: React.FC<RankIconProps> = ({
  difficulty,
  size = 32,
  show_label = false,
  className,
}) => {
  const rank_info: RankInfo = get_rank_for_difficulty(difficulty)
  const IconComponent = RANK_ICON_MAP[rank_info.tier]

  if (!IconComponent) return null

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`${rank_info.name} (difficulty ${difficulty}/100)`}
    >
      <IconComponent color={rank_info.color} size={size} />
      {show_label && (
        <span className="text-xs font-medium" style={{ color: rank_info.color }}>
          {rank_info.name}
        </span>
      )}
    </span>
  )
}

export default RankIcon
