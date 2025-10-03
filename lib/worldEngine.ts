import { WorldGenerator, Chunk } from './worldGenerator'
import { World, Player, BlockType } from './cosmic'

export interface WorldEngine {
  world: World | null
  generator: WorldGenerator | null
  chunks: Map<string, Chunk>
  renderDistance: number
}

export interface PlayerPosition {
  x: number
  y: number
  z: number
  chunkX: number
  chunkZ: number
}

export interface Block {
  x: number
  y: number
  z: number
  type: string
  visible: boolean
}

export class GameWorldEngine implements WorldEngine {
  world: World | null = null
  generator: WorldGenerator | null = null
  chunks: Map<string, Chunk> = new Map()
  renderDistance: number = 3
  blockTypes: BlockType[] = []

  constructor(blockTypes: BlockType[]) {
    this.blockTypes = blockTypes
  }

  setWorld(world: World) {
    this.world = world
    if (world.metadata?.seed) {
      this.generator = new WorldGenerator(world.metadata.seed)
    }
    this.chunks.clear()
  }

  private getChunkKey(chunkX: number, chunkZ: number): string {
    return `${chunkX},${chunkZ}`
  }

  getPlayerPosition(player: Player): PlayerPosition {
    const x = player.metadata?.position?.x || 0
    const y = player.metadata?.position?.y || 80
    const z = player.metadata?.position?.z || 0
    
    return {
      x,
      y, 
      z,
      chunkX: Math.floor(x / 16),
      chunkZ: Math.floor(z / 16)
    }
  }

  loadChunksAroundPlayer(playerPos: PlayerPosition): Chunk[] {
    if (!this.generator) return []

    const loadedChunks: Chunk[] = []
    
    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        const chunkX = playerPos.chunkX + x
        const chunkZ = playerPos.chunkZ + z
        const key = this.getChunkKey(chunkX, chunkZ)
        
        if (!this.chunks.has(key)) {
          const chunk = this.generator.generateChunk(chunkX, chunkZ)
          this.chunks.set(key, chunk)
          loadedChunks.push(chunk)
        } else {
          const chunk = this.chunks.get(key)
          if (chunk) {
            loadedChunks.push(chunk)
          }
        }
      }
    }
    
    return loadedChunks
  }

  getVisibleBlocks(playerPos: PlayerPosition, viewDistance: number = 32): Block[] {
    const blocks: Block[] = []
    const chunks = this.loadChunksAroundPlayer(playerPos)
    
    const minX = Math.floor(playerPos.x - viewDistance)
    const maxX = Math.floor(playerPos.x + viewDistance)
    const minY = Math.max(0, Math.floor(playerPos.y - viewDistance))
    const maxY = Math.min(128, Math.floor(playerPos.y + viewDistance))
    const minZ = Math.floor(playerPos.z - viewDistance)
    const maxZ = Math.floor(playerPos.z + viewDistance)

    chunks.forEach(chunk => {
      const chunkWorldX = chunk.x * 16
      const chunkWorldZ = chunk.z * 16
      
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 128; y++) {
          for (let z = 0; z < 16; z++) {
            const worldX = chunkWorldX + x
            const worldY = y
            const worldZ = chunkWorldZ + z
            
            if (worldX >= minX && worldX <= maxX &&
                worldY >= minY && worldY <= maxY &&
                worldZ >= minZ && worldZ <= maxZ) {
              
              const blockType = chunk.blocks[x][y][z]
              if (blockType && blockType !== 'air') {
                const isVisible = this.isBlockVisible(chunk, x, y, z)
                
                blocks.push({
                  x: worldX,
                  y: worldY,
                  z: worldZ,
                  type: blockType,
                  visible: isVisible
                })
              }
            }
          }
        }
      }
    })

    return blocks
  }

  private isBlockVisible(chunk: Chunk, x: number, y: number, z: number): boolean {
    // Check if any adjacent face is exposed to air
    const directions = [
      { dx: 1, dy: 0, dz: 0 },  // East
      { dx: -1, dy: 0, dz: 0 }, // West
      { dx: 0, dy: 1, dz: 0 },  // Up
      { dx: 0, dy: -1, dz: 0 }, // Down
      { dx: 0, dy: 0, dz: 1 },  // South
      { dx: 0, dy: 0, dz: -1 }  // North
    ]

    for (const dir of directions) {
      const nx = x + dir.dx
      const ny = y + dir.dy
      const nz = z + dir.dz

      // Check bounds
      if (nx < 0 || nx >= 16 || ny < 0 || ny >= 128 || nz < 0 || nz >= 16) {
        return true // Edge blocks are visible
      }

      // Check if adjacent block is air
      if (chunk.blocks[nx][ny][nz] === 'air') {
        return true
      }
    }

    return false
  }

  getBlockAt(x: number, y: number, z: number): string | null {
    const chunkX = Math.floor(x / 16)
    const chunkZ = Math.floor(z / 16)
    const key = this.getChunkKey(chunkX, chunkZ)
    
    const chunk = this.chunks.get(key)
    if (!chunk) return null

    const localX = x - (chunkX * 16)
    const localZ = z - (chunkZ * 16)
    
    if (localX < 0 || localX >= 16 || y < 0 || y >= 128 || localZ < 0 || localZ >= 16) {
      return null
    }

    return chunk.blocks[localX][y][localZ]
  }

  setBlockAt(x: number, y: number, z: number, blockType: string): boolean {
    const chunkX = Math.floor(x / 16)
    const chunkZ = Math.floor(z / 16)
    const key = this.getChunkKey(chunkX, chunkZ)
    
    const chunk = this.chunks.get(key)
    if (!chunk) return false

    const localX = x - (chunkX * 16)
    const localZ = z - (chunkZ * 16)
    
    if (localX < 0 || localX >= 16 || y < 0 || y >= 128 || localZ < 0 || localZ >= 16) {
      return false
    }

    chunk.blocks[localX][y][localZ] = blockType
    return true
  }

  canPlaceBlock(x: number, y: number, z: number): boolean {
    const currentBlock = this.getBlockAt(x, y, z)
    return currentBlock === 'air' || currentBlock === null
  }

  breakBlock(x: number, y: number, z: number): string | null {
    const blockType = this.getBlockAt(x, y, z)
    if (blockType && blockType !== 'air') {
      this.setBlockAt(x, y, z, 'air')
      return blockType
    }
    return null
  }

  placeBlock(x: number, y: number, z: number, blockType: string): boolean {
    if (this.canPlaceBlock(x, y, z)) {
      return this.setBlockAt(x, y, z, blockType)
    }
    return false
  }
}