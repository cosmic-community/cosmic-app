'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { TerrainGenerator } from '@/lib/terrain'
import type { World, BlockType } from '@/types'

interface GameEngineProps {
  world: World
  blockTypes: BlockType[]
  onStateChange: (state: any) => void
}

export default function GameEngine({ world, blockTypes, onStateChange }: GameEngineProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const terrainGeneratorRef = useRef<TerrainGenerator>()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!mountRef.current || isInitialized) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB) // Sky blue
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(
      world.metadata.spawn_position?.x || 0,
      world.metadata.spawn_position?.y || 80,
      world.metadata.spawn_position?.z || 0
    )
    cameraRef.current = camera

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Mount renderer
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement)
    }

    // Initialize terrain generator
    terrainGeneratorRef.current = new TerrainGenerator(world.metadata.seed)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Generate initial terrain chunk
    generateTerrainChunk(0, 0)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    setIsInitialized(true)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [world, isInitialized])

  const generateTerrainChunk = (chunkX: number, chunkZ: number) => {
    if (!sceneRef.current || !terrainGeneratorRef.current) return

    const blocks = terrainGeneratorRef.current.generateChunk(chunkX, chunkZ)
    const blockMaterials = createBlockMaterials()

    blocks.forEach(block => {
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = blockMaterials[block.type] || blockMaterials.stone
      const mesh = new THREE.Mesh(geometry, material)
      
      mesh.position.set(block.x, block.y, block.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      
      sceneRef.current?.add(mesh)
    })
  }

  const createBlockMaterials = () => {
    return {
      grass: new THREE.MeshLambertMaterial({ color: 0x5cb85c }),
      dirt: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
      stone: new THREE.MeshLambertMaterial({ color: 0x808080 }),
      wood: new THREE.MeshLambertMaterial({ color: 0xd2691e }),
      cobblestone: new THREE.MeshLambertMaterial({ color: 0x696969 }),
      sand: new THREE.MeshLambertMaterial({ color: 0xf4a460 })
    }
  }

  return <div ref={mountRef} className="w-full h-full" />
}