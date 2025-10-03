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

  private initializeBlocks(): string[][][] {
    // Create a properly initialized 3D array with guaranteed structure
    const blocks: string[][][] = Array(this.chunkSize)
    
    for (let x = 0; x < this.chunkSize; x++) {
      blocks[x] = Array(this.worldHeight)
      for (let y = 0; y < this.worldHeight; y++) {
        blocks[x][y] = Array(this.chunkSize).fill('air')
      }
    }
    
    return blocks
  }

  private setBlock(blocks: string[][][], x: number, y: number, z: number, blockType: string): void {
    // Guaranteed safe block setter with bounds checking and proper validation
    if (x >= 0 && x < this.chunkSize && 
        y >= 0 && y < this.worldHeight && 
        z >= 0 && z < this.chunkSize) {
      
      // FIX for TS2532 - Use proper validation instead of non-null assertions
      const xArray = blocks[x]
      if (xArray) {
        const yArray = xArray[y]
        if (yArray) {
          yArray[z] = blockType
        }
      }
    }
  }

  generateChunk(chunkX: number, chunkZ: number): Chunk {
    // Use the safe initialization method
    const blocks = this.initializeBlocks()

    // Generate terrain
    for (let x = 0; x < this.chunkSize; x++) {
      for (let z = 0; z < this.chunkSize; z++) {
        const worldX = chunkX * this.chunkSize + x
        const worldZ = chunkZ * this.chunkSize + z
        const height = this.getHeight(worldX, worldZ)
        const biome = this.getBiome(worldX, worldZ)
        
        // Fill from bedrock up to terrain height using safe setter
        for (let y = 0; y <= height; y++) {
          let blockType: string
          
          if (y === 0) {
            blockType = 'stone' // Bedrock layer
          } else if (y === height && biome === 'grass') {
            blockType = 'grass'
          } else if (y > height - 3 && biome === 'grass') {
            blockType = 'dirt'
          } else if (biome === 'desert') {
            blockType = y === height ? 'stone' : 'stone'
          } else {
            blockType = y > height - 4 ? 'dirt' : 'stone'
          }
          
          this.setBlock(blocks, x, y, z, blockType)
        }

        // Add trees in forest biome
        if (biome === 'forest' && this.noise(worldX * 0.1, worldZ * 0.1) > 0.8 && height < this.worldHeight - 10) {
          const treeHeight = 4 + Math.floor(this.noise(worldX + worldZ, worldZ + worldX) * 3)
          for (let y = height + 1; y <= height + treeHeight; y++) {
            if (y < this.worldHeight) {
              this.setBlock(blocks, x, y, z, 'wood')
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