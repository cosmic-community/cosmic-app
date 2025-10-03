import { createBucketClient } from '@cosmicjs/sdk'

// Types for Cosmic CMS objects based on the API responses
export interface BlockType {
  id: string
  slug: string
  title: string
  metadata?: {
    block_name: string
    block_id: string
    texture_description: string
    hardness: number
    transparent: boolean
    stackable: boolean
    max_stack_size: number
    drops: Array<{
      blockId: string
      quantity: number
    }>
    tool_required: {
      key: string
      value: string
    }
    light_level: number
  }
}

export interface World {
  id: string
  slug: string
  title: string
  thumbnail?: string
  metadata?: {
    world_name: string
    seed: string
    terrain_data: {
      chunks: any[]
      modifiedBlocks: Record<string, any>
    }
    spawn_position: {
      x: number
      y: number
      z: number
    }
    game_mode: {
      key: string
      value: string
    }
    difficulty: {
      key: string
      value: string
    }
    time_of_day: number
    weather: {
      key: string
      value: string
    }
  }
}

export interface Player {
  id: string
  slug: string
  title: string
  metadata?: {
    username: string
    current_world?: World
    position: {
      x: number
      y: number
      z: number
    }
    rotation: {
      yaw: number
      pitch: number
    }
    inventory: {
      slots: Array<{
        slot: number
        blockId: string
        quantity: number
      }>
    }
    hotbar: {
      slots: number[]
      selected: number
    }
    health: number
    hunger: number
    experience: number
    game_mode: {
      key: string
      value: string
    }
  }
}

// Initialize Cosmic client
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG || 'cubeworld-production',
  readKey: process.env.COSMIC_READ_KEY || 'ABrzL7069VfynTsKxn8XRI2t7D5xDIkKS2ZMDydTXvWnht7W88',
})

export async function getBlockTypes(): Promise<BlockType[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'block-types' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return response.objects as BlockType[]
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw new Error(`Failed to fetch block types: ${error}`)
  }
}

export async function getWorlds(): Promise<World[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'worlds' })
      .props(['id', 'title', 'slug', 'thumbnail', 'metadata'])
      .depth(1)

    return response.objects as World[]
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw new Error(`Failed to fetch worlds: ${error}`)
  }
}

export async function getPlayers(): Promise<Player[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'players' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return response.objects as Player[]
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return []
    }
    throw new Error(`Failed to fetch players: ${error}`)
  }
}

export async function getPlayer(slug: string): Promise<Player | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'players', slug })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return response.object as Player
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch player: ${error}`)
  }
}