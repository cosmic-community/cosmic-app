import { create } from 'zustand'
import type { World, Player, BlockType, GameState } from '@/types'

interface GameStore extends GameState {
  setCurrentWorld: (world: World | null) => void
  setCurrentPlayer: (player: Player | null) => void
  setBlockTypes: (blockTypes: BlockType[]) => void
  setIsPlaying: (isPlaying: boolean) => void
  setIsPaused: (isPaused: boolean) => void
  updatePlayerPosition: (position: { x: number; y: number; z: number }) => void
  updatePlayerRotation: (rotation: { yaw: number; pitch: number }) => void
  updatePlayerHealth: (health: number) => void
  updatePlayerHunger: (hunger: number) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentWorld: null,
  currentPlayer: null,
  blockTypes: [],
  isPlaying: false,
  isPaused: false,

  setCurrentWorld: (world) => set({ currentWorld: world }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setBlockTypes: (blockTypes) => set({ blockTypes }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsPaused: (isPaused) => set({ isPaused }),

  updatePlayerPosition: (position) => set(state => ({
    currentPlayer: state.currentPlayer ? {
      ...state.currentPlayer,
      metadata: {
        ...state.currentPlayer.metadata,
        position
      }
    } : null
  })),

  updatePlayerRotation: (rotation) => set(state => ({
    currentPlayer: state.currentPlayer ? {
      ...state.currentPlayer,
      metadata: {
        ...state.currentPlayer.metadata,
        rotation
      }
    } : null
  })),

  updatePlayerHealth: (health) => set(state => ({
    currentPlayer: state.currentPlayer ? {
      ...state.currentPlayer,
      metadata: {
        ...state.currentPlayer.metadata,
        health
      }
    } : null
  })),

  updatePlayerHunger: (hunger) => set(state => ({
    currentPlayer: state.currentPlayer ? {
      ...state.currentPlayer,
      metadata: {
        ...state.currentPlayer.metadata,
        hunger
      }
    } : null
  }))
}))

// Game controls and input handling
export class GameControls {
  private keys: Record<string, boolean> = {}
  private mouseX: number = 0
  private mouseY: number = 0
  private camera: THREE.Camera | null = null

  constructor() {
    this.initEventListeners()
  }

  private initEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true
    })

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false
    })

    // Mouse controls
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.movementX || 0
      this.mouseY = e.movementY || 0
    })

    // Pointer lock for first-person controls
    document.addEventListener('click', () => {
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock()
      }
    })
  }

  public update(camera: THREE.Camera) {
    this.camera = camera
    this.handleMovement()
    this.handleMouseLook()
  }

  private handleMovement() {
    if (!this.camera) return

    const moveSpeed = 0.1
    const direction = new THREE.Vector3()

    if (this.keys['w']) direction.z -= moveSpeed
    if (this.keys['s']) direction.z += moveSpeed
    if (this.keys['a']) direction.x -= moveSpeed
    if (this.keys['d']) direction.x += moveSpeed

    // Apply movement relative to camera rotation
    direction.applyQuaternion(this.camera.quaternion)
    this.camera.position.add(direction)
  }

  private handleMouseLook() {
    if (!this.camera || document.pointerLockElement !== document.body) return

    const sensitivity = 0.002
    
    // Rotate camera based on mouse movement
    this.camera.rotation.y -= this.mouseX * sensitivity
    this.camera.rotation.x -= this.mouseY * sensitivity

    // Clamp vertical rotation
    this.camera.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.camera.rotation.x)
    )

    // Reset mouse movement
    this.mouseX = 0
    this.mouseY = 0
  }

  public isKeyPressed(key: string): boolean {
    return this.keys[key.toLowerCase()] || false
  }
}