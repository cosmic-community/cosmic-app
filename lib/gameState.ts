import { BlockType, World, Player } from './cosmic'

export interface GameState {
  currentPlayer: Player | null
  currentWorld: World | null
  blockTypes: BlockType[]
  selectedBlock: string | null
  gameMode: 'creative' | 'survival'
  isLoading: boolean
  error: string | null
}

export const initialGameState: GameState = {
  currentPlayer: null,
  currentWorld: null,
  blockTypes: [],
  selectedBlock: null,
  gameMode: 'creative',
  isLoading: false,
  error: null,
}

export type GameAction =
  | { type: 'SET_PLAYER'; payload: Player }
  | { type: 'SET_WORLD'; payload: World }
  | { type: 'SET_BLOCK_TYPES'; payload: BlockType[] }
  | { type: 'SELECT_BLOCK'; payload: string }
  | { type: 'SET_GAME_MODE'; payload: 'creative' | 'survival' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload }
    case 'SET_WORLD':
      return { ...state, currentWorld: action.payload }
    case 'SET_BLOCK_TYPES':
      return { ...state, blockTypes: action.payload }
    case 'SELECT_BLOCK':
      return { ...state, selectedBlock: action.payload }
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

export function getBlockTexture(blockId: string): string {
  const textureMap: Record<string, string> = {
    grass: 'grass-block',
    wood: 'wood-block',
    stone: 'stone-block',
    cobblestone: 'cobblestone-block',
    dirt: 'stone-block', // fallback
  }
  
  return textureMap[blockId] || 'stone-block'
}