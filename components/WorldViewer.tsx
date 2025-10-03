'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GameWorldEngine, Block } from '@/lib/worldEngine'
import { World, Player, BlockType } from '@/lib/cosmic'
import { getBlockTexture } from '@/lib/gameState'

interface WorldViewerProps {
  world: World | null
  player: Player | null
  blockTypes: BlockType[]
  selectedBlock: string | null
  onPlayerMove?: (x: number, y: number, z: number) => void
  onBlockPlace?: (x: number, y: number, z: number, blockType: string) => void
  onBlockBreak?: (x: number, y: number, z: number) => void
}

interface Camera {
  x: number
  y: number
  z: number
  yaw: number
  pitch: number
}

export default function WorldViewer({
  world,
  player,
  blockTypes,
  selectedBlock,
  onPlayerMove,
  onBlockPlace,
  onBlockBreak
}: WorldViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameWorldEngine | null>(null)
  const animationRef = useRef<number>()
  
  const [camera, setCamera] = useState<Camera>({
    x: 0,
    y: 80,
    z: 0,
    yaw: 0,
    pitch: 0
  })
  
  const [isMouseLocked, setIsMouseLocked] = useState(false)
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [gameMode, setGameMode] = useState<'creative' | 'survival'>('creative')

  // Initialize world engine
  useEffect(() => {
    if (blockTypes.length > 0) {
      engineRef.current = new GameWorldEngine(blockTypes)
    }
  }, [blockTypes])

  // Set world and player
  useEffect(() => {
    if (world && engineRef.current) {
      engineRef.current.setWorld(world)
      
      if (player?.metadata?.position) {
        setCamera({
          x: player.metadata.position.x,
          y: player.metadata.position.y + 1.8, // Eye level
          z: player.metadata.position.z,
          yaw: player.metadata.rotation?.yaw || 0,
          pitch: player.metadata.rotation?.pitch || 0
        })
      }

      setGameMode(player?.metadata?.game_mode?.key as 'creative' | 'survival' || 'creative')
    }
  }, [world, player])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set([...prev, e.code]))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev)
        newKeys.delete(e.code)
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Handle mouse controls
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseLocked) return

    const sensitivity = 0.002
    setCamera(prev => ({
      ...prev,
      yaw: (prev.yaw + e.movementX * sensitivity) % (2 * Math.PI),
      pitch: Math.max(-Math.PI/2, Math.min(Math.PI/2, prev.pitch - e.movementY * sensitivity))
    }))
  }, [isMouseLocked])

  const handleCanvasClick = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      try {
        await canvas.requestPointerLock()
        setIsMouseLocked(true)
      } catch (error) {
        console.warn('Pointer lock not supported:', error)
      }
    }
  }

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsMouseLocked(document.pointerLockElement === canvasRef.current)
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  // Handle mouse clicks for block interaction
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!isMouseLocked || !engineRef.current) return

    // Cast ray to find target block
    const targetBlock = raycast(camera, engineRef.current, 5)
    
    if (e.button === 0) { // Left click - break block
      if (targetBlock && onBlockBreak) {
        onBlockBreak(targetBlock.x, targetBlock.y, targetBlock.z)
        engineRef.current.breakBlock(targetBlock.x, targetBlock.y, targetBlock.z)
      }
    } else if (e.button === 2) { // Right click - place block
      if (targetBlock && selectedBlock && onBlockPlace) {
        const placePos = getPlacePosition(targetBlock, camera)
        if (placePos && engineRef.current.canPlaceBlock(placePos.x, placePos.y, placePos.z)) {
          onBlockPlace(placePos.x, placePos.y, placePos.z, selectedBlock)
          engineRef.current.placeBlock(placePos.x, placePos.y, placePos.z, selectedBlock)
        }
      }
    }
  }

  // Movement logic
  const updateMovement = useCallback(() => {
    if (!engineRef.current) return

    const speed = gameMode === 'creative' ? 0.5 : 0.2
    const flySpeed = gameMode === 'creative' ? 0.3 : 0
    
    setCamera(prev => {
      let newCamera = { ...prev }
      
      // Forward/backward
      if (keys.has('KeyW')) {
        newCamera.x += Math.sin(prev.yaw) * speed
        newCamera.z += Math.cos(prev.yaw) * speed
      }
      if (keys.has('KeyS')) {
        newCamera.x -= Math.sin(prev.yaw) * speed
        newCamera.z -= Math.cos(prev.yaw) * speed
      }
      
      // Strafe left/right
      if (keys.has('KeyA')) {
        newCamera.x += Math.sin(prev.yaw - Math.PI/2) * speed
        newCamera.z += Math.cos(prev.yaw - Math.PI/2) * speed
      }
      if (keys.has('KeyD')) {
        newCamera.x += Math.sin(prev.yaw + Math.PI/2) * speed
        newCamera.z += Math.cos(prev.yaw + Math.PI/2) * speed
      }
      
      // Vertical movement (creative mode)
      if (gameMode === 'creative') {
        if (keys.has('Space')) {
          newCamera.y += flySpeed
        }
        if (keys.has('ShiftLeft')) {
          newCamera.y -= flySpeed
        }
      }

      // Call movement callback
      if (onPlayerMove && (
        Math.abs(newCamera.x - prev.x) > 0.1 ||
        Math.abs(newCamera.y - prev.y) > 0.1 ||
        Math.abs(newCamera.z - prev.z) > 0.1
      )) {
        onPlayerMove(newCamera.x, newCamera.y - 1.8, newCamera.z) // Convert back to feet position
      }

      return newCamera
    })
  }, [keys, gameMode, onPlayerMove])

  // Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !engineRef.current) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      updateMovement()
      
      // Clear canvas
      ctx.fillStyle = '#87CEEB' // Sky blue
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (engineRef.current && world) {
        const playerPos = {
          x: camera.x,
          y: camera.y - 1.8,
          z: camera.z,
          chunkX: Math.floor(camera.x / 16),
          chunkZ: Math.floor(camera.z / 16)
        }

        const blocks = engineRef.current.getVisibleBlocks(playerPos, 32)
        renderBlocks(ctx, blocks, camera, canvas.width, canvas.height)
      }

      // Render crosshair
      renderCrosshair(ctx, canvas.width, canvas.height)

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [camera, world, updateMovement])

  if (!world) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Select a world to start exploring</p>
      </div>
    )
  }

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded p-4 text-white text-sm">
        <p>Click to capture mouse</p>
        <p>WASD: Move</p>
        <p>Mouse: Look around</p>
        <p>Left click: Break block</p>
        <p>Right click: Place block</p>
        {gameMode === 'creative' && (
          <>
            <p>Space: Fly up</p>
            <p>Shift: Fly down</p>
          </>
        )}
        <p>ESC: Release mouse</p>
      </div>

      {/* World info */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded p-4 text-white text-sm">
        <p>World: {world.title}</p>
        <p>Mode: {gameMode}</p>
        <p>Position: {Math.floor(camera.x)}, {Math.floor(camera.y)}, {Math.floor(camera.z)}</p>
        {selectedBlock && (
          <p>Selected: {selectedBlock}</p>
        )}
      </div>
    </div>
  )
}

// Helper functions for 3D rendering and raycasting
function renderBlocks(
  ctx: CanvasRenderingContext2D, 
  blocks: Block[], 
  camera: Camera, 
  width: number, 
  height: number
) {
  const fov = Math.PI / 3
  const centerX = width / 2
  const centerY = height / 2
  
  // Sort blocks by distance for proper depth rendering
  const sortedBlocks = blocks
    .filter(block => block.visible)
    .map(block => ({
      ...block,
      distance: Math.sqrt(
        Math.pow(block.x - camera.x, 2) +
        Math.pow(block.y - camera.y, 2) +
        Math.pow(block.z - camera.z, 2)
      )
    }))
    .sort((a, b) => b.distance - a.distance)

  sortedBlocks.forEach(block => {
    const screenPos = worldToScreen(
      block.x, block.y, block.z,
      camera, fov, centerX, centerY
    )
    
    if (screenPos.visible) {
      const color = getBlockColor(block.type)
      const size = Math.max(1, 50 / block.distance)
      
      ctx.fillStyle = color
      ctx.fillRect(
        screenPos.x - size/2,
        screenPos.y - size/2,
        size,
        size
      )
    }
  })
}

function worldToScreen(
  x: number, y: number, z: number,
  camera: Camera, fov: number, centerX: number, centerY: number
) {
  // Transform to camera space
  const dx = x - camera.x
  const dy = y - camera.y
  const dz = z - camera.z
  
  // Rotate by camera yaw
  const rotX = dx * Math.cos(-camera.yaw) - dz * Math.sin(-camera.yaw)
  const rotZ = dx * Math.sin(-camera.yaw) + dz * Math.cos(-camera.yaw)
  
  // Check if in front of camera
  if (rotZ <= 0) {
    return { x: 0, y: 0, visible: false }
  }
  
  // Project to screen
  const screenX = centerX + (rotX / rotZ) * (centerX / Math.tan(fov / 2))
  const screenY = centerY - (dy / rotZ) * (centerY / Math.tan(fov / 2))
  
  return {
    x: screenX,
    y: screenY,
    visible: rotZ > 0 && screenX >= -50 && screenX <= centerX * 2 + 50 &&
             screenY >= -50 && screenY <= centerY * 2 + 50
  }
}

function getBlockColor(blockType: string): string {
  const colors: Record<string, string> = {
    grass: '#4CAF50',
    dirt: '#8D6E63',
    stone: '#9E9E9E',
    wood: '#795548',
    cobblestone: '#616161',
    air: 'transparent'
  }
  return colors[blockType] || '#757575'
}

function renderCrosshair(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2
  const centerY = height / 2
  const size = 10
  
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  
  // Horizontal line
  ctx.beginPath()
  ctx.moveTo(centerX - size, centerY)
  ctx.lineTo(centerX + size, centerY)
  ctx.stroke()
  
  // Vertical line
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - size)
  ctx.lineTo(centerX, centerY + size)
  ctx.stroke()
}

function raycast(camera: Camera, engine: GameWorldEngine, maxDistance: number): { x: number, y: number, z: number } | null {
  const dx = Math.sin(camera.yaw) * Math.cos(camera.pitch)
  const dy = -Math.sin(camera.pitch)
  const dz = Math.cos(camera.yaw) * Math.cos(camera.pitch)
  
  for (let t = 0; t < maxDistance; t += 0.1) {
    const x = Math.floor(camera.x + dx * t)
    const y = Math.floor(camera.y + dy * t)
    const z = Math.floor(camera.z + dz * t)
    
    const block = engine.getBlockAt(x, y, z)
    if (block && block !== 'air') {
      return { x, y, z }
    }
  }
  
  return null
}

function getPlacePosition(targetBlock: { x: number, y: number, z: number }, camera: Camera): { x: number, y: number, z: number } | null {
  // For simplicity, place on top of the target block
  return {
    x: targetBlock.x,
    y: targetBlock.y + 1,
    z: targetBlock.z
  }
}