export interface Chunk {
  x: number
  z: number
  blocks: string[][][]
  generated: boolean
}

export interface TerrainGenerator {
  seed: string
  chunkSize: number
  worldHeight: number
}

export class WorldGenerator implements TerrainGenerator {
  seed: string
  chunkSize: number = 16
  worldHeight: number = 128
  private seedHash: number

  constructor(seed: string) {
    this.seed = seed
    this.seedHash = this.hashSeed(seed)
  }

  private hashSeed(seed: string): number {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private noise(x: number, z: number): number {
    // Simple deterministic noise function based on coordinates and seed
    const n = Math.sin(x * 12.9898 + z * 78.233 + this.seedHash) * 43758.5453
    return n - Math.floor(n)
  }

  private getHeight(x: number, z: number): number {
    // Generate terrain height using multiple noise octaves
    let height = 0
    let amplitude = 1
    let frequency = 0.01
    
    for (let i = 0; i < 4; i++) {
      height += this.noise(x * frequency, z * frequency) * amplitude
      amplitude *= 0.5
      frequency *= 2
    }
    
    // Scale to world height and add base level
    return Math.floor(Math.max(1, Math.min(this.worldHeight - 10, 60 + height * 30)))
  }

  private getBiome(x: number, z: number): 'grass' | 'desert' | 'forest' | 'stone' {
    const temperature = this.noise(x * 0.005, z * 0.005)
    const humidity = this.noise(x * 0.007 + 1000, z * 0.007 + 1000)
    
    if (temperature > 0.7) return 'desert'
    if (humidity > 0.6 && temperature > 0.3) return 'forest'
    if (temperature < 0.2) return 'stone'
    return 'grass'
  }

  generateChunk(chunkX: number, chunkZ: number): Chunk {
    const blocks: string[][][] = []
    
    // Initialize 3D array
    for (let x = 0; x < this.chunkSize; x++) {
      blocks[x] = []
      for (let y = 0; y < this.worldHeight; y++) {
        blocks[x][y] = []
        for (let z = 0; z < this.chunkSize; z++) {
          blocks[x][y][z] = 'air'
        }
      }
    }

    // Generate terrain
    for (let x = 0; x < this.chunkSize; x++) {
      for (let z = 0; z < this.chunkSize; z++) {
        const worldX = chunkX * this.chunkSize + x
        const worldZ = chunkZ * this.chunkSize + z
        const height = this.getHeight(worldX, worldZ)
        const biome = this.getBiome(worldX, worldZ)
        
        // Fill from bedrock up to terrain height
        for (let y = 0; y <= height; y++) {
          // FIX: Add proper null checks for array access - resolves TS2532 errors
          const blockRow = blocks[x]
          if (!blockRow) continue
          
          const blockColumn = blockRow[y]
          if (!blockColumn) continue
          
          if (y === 0) {
            blockColumn[z] = 'stone' // Bedrock layer
          } else if (y === height && biome === 'grass') {
            blockColumn[z] = 'grass'
          } else if (y > height - 3 && biome === 'grass') {
            blockColumn[z] = 'dirt'
          } else if (biome === 'desert') {
            blockColumn[z] = y === height ? 'stone' : 'stone'
          } else {
            blockColumn[z] = y > height - 4 ? 'dirt' : 'stone'
          }
        }

        // Add trees in forest biome
        if (biome === 'forest' && this.noise(worldX * 0.1, worldZ * 0.1) > 0.8 && height < this.worldHeight - 10) {
          const treeHeight = 4 + Math.floor(this.noise(worldX + worldZ, worldZ + worldX) * 3)
          for (let y = height + 1; y <= height + treeHeight; y++) {
            if (y < this.worldHeight) {
              // FIX: Add proper null checks for tree placement array access
              const blockRow = blocks[x]
              if (!blockRow) continue
              
              const blockColumn = blockRow[y]
              if (!blockColumn) continue
              
              blockColumn[z] = 'wood'
            }
          }
        }
      }
    }

    return {
      x: chunkX,
      z: chunkZ,
      blocks,
      generated: true
    }
  }
}