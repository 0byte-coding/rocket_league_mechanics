import type { MechanicsData, Mechanic } from "./types"
import raw_data from "../../../rl_mechanics_data/asset/data.jsonc?raw"

/**
 * Strips JSONC comments (// and block comments) while respecting string literals.
 * This is a state-machine approach that avoids removing content inside strings.
 */
const strip_jsonc_comments = (input: string): string => {
  let result = ""
  let i = 0
  const len = input.length

  while (i < len) {
    const ch = input[i]

    // String literal — copy until closing unescaped quote
    if (ch === '"') {
      result += ch
      i++
      while (i < len) {
        const c = input[i]
        result += c
        if (c === "\\") {
          // escape sequence: copy next char too
          i++
          if (i < len) {
            result += input[i]
          }
        } else if (c === '"') {
          break
        }
        i++
      }
      i++
      continue
    }

    // Block comment /* ... */
    if (ch === "/" && input[i + 1] === "*") {
      i += 2
      while (i < len) {
        if (input[i] === "*" && input[i + 1] === "/") {
          i += 2
          break
        }
        i++
      }
      continue
    }

    // Line comment // ...
    if (ch === "/" && input[i + 1] === "/") {
      i += 2
      while (i < len && input[i] !== "\n") {
        i++
      }
      continue
    }

    result += ch
    i++
  }

  return result
}

const parse_mechanics_data = (): MechanicsData => {
  const stripped = strip_jsonc_comments(raw_data)
  return JSON.parse(stripped) as MechanicsData
}

export const get_mechanics_data = (): MechanicsData => {
  return parse_mechanics_data()
}

export const get_mechanics = (): Mechanic[] => {
  return parse_mechanics_data().mechanics
}

export const get_all_tags = (mechanics: Mechanic[]): string[] => {
  const tag_set = new Set<string>()
  for (const mechanic of mechanics) {
    for (const tag of mechanic.tags) {
      tag_set.add(tag)
    }
  }
  return Array.from(tag_set).sort()
}
