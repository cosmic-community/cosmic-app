'use client'

import { useState, useReducer, useEffect } from 'react'
import { BlockType, World, Player } from '@/lib/cosmic'
import { gameReducer, initialGameState, getBlockTexture } from '@/lib/gameState'

interface GameEngineProps {
  blockTypes: BlockType[]
  worlds: World[]
  players: Player[]
}

export default function GameEngine({ blockTypes, worlds, players }: GameEngineProps) {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)
  const [activeTab, setActiveTab] = useState<'blocks' | 'worlds' | 'players'>('blocks')

  useEffect(() => {
    dispatch({ type: 'SET_BLOCK_TYPES', payload: blockTypes })
    if (players.length > 0) {
      dispatch({ type: 'SET_PLAYER', payload: players[0] })
    }
    if (worlds.length > 0) {
      dispatch({ type: 'SET_WORLD', payload: worlds[0] })
    }
  }, [blockTypes, worlds, players])

  const handleBlockSelect = (blockId: string) => {
    dispatch({ type: 'SELECT_BLOCK', payload: blockId })
  }

  const handleWorldSelect = (world: World) => {
    dispatch({ type: 'SET_WORLD', payload: world })
  }

  const handlePlayerSelect = (player: Player) => {
    dispatch({ type: 'SET_PLAYER', payload: player })
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Game Engine</h2>
      
      {/* Game Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded p-4">
          <h3 className="font-semibold text-green-400">Current Player</h3>
          <p className="text-sm">
            {gameState.currentPlayer?.metadata?.username || 'None selected'}
          </p>
        </div>
        
        <div className="bg-gray-700 rounded p-4">
          <h3 className="font-semibold text-blue-400">Current World</h3>
          <p className="text-sm">
            {gameState.currentWorld?.title || 'None selected'}
          </p>
        </div>
        
        <div className="bg-gray-700 rounded p-4">
          <h3 className="font-semibold text-purple-400">Selected Block</h3>
          <p className="text-sm">
            {gameState.selectedBlock || 'None selected'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {(['blocks', 'worlds', 'players'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gray-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'blocks' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Block Inventory</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {blockTypes.map((block) => (
                <button
                  key={block.id}
                  onClick={() => handleBlockSelect(block.metadata?.block_id || block.slug)}
                  className={`block-texture ${getBlockTexture(block.metadata?.block_id || '')} 
                    hover:scale-110 transition-transform ${
                    gameState.selectedBlock === block.metadata?.block_id
                      ? 'ring-2 ring-blue-400'
                      : ''
                  }`}
                  title={`${block.title} - ${block.metadata?.texture_description}`}
                />
              ))}
            </div>
            
            {gameState.selectedBlock && (
              <div className="mt-4 p-4 bg-gray-700 rounded">
                <h4 className="font-semibold">Block Properties</h4>
                {(() => {
                  const selectedBlockData = blockTypes.find(
                    b => b.metadata?.block_id === gameState.selectedBlock
                  )
                  if (!selectedBlockData?.metadata) return null
                  
                  return (
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Hardness:</span> {selectedBlockData.metadata.hardness}
                      </div>
                      <div>
                        <span className="text-gray-400">Stack Size:</span> {selectedBlockData.metadata.max_stack_size}
                      </div>
                      <div>
                        <span className="text-gray-400">Tool:</span> {selectedBlockData.metadata.tool_required.value}
                      </div>
                      <div>
                        <span className="text-gray-400">Light Level:</span> {selectedBlockData.metadata.light_level}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === 'worlds' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Worlds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {worlds.map((world) => (
                <button
                  key={world.id}
                  onClick={() => handleWorldSelect(world)}
                  className={`p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left ${
                    gameState.currentWorld?.id === world.id
                      ? 'ring-2 ring-blue-400'
                      : ''
                  }`}
                >
                  <h4 className="font-semibold">{world.title}</h4>
                  <div className="text-sm text-gray-400 mt-2">
                    <p>Seed: {world.metadata?.seed}</p>
                    <p>Mode: {world.metadata?.game_mode?.value}</p>
                    <p>Difficulty: {world.metadata?.difficulty?.value}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Players</h3>
            <div className="space-y-4">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className={`w-full p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left ${
                    gameState.currentPlayer?.id === player.id
                      ? 'ring-2 ring-blue-400'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{player.metadata?.username}</h4>
                      <p className="text-sm text-gray-400">
                        World: {player.metadata?.current_world?.title}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>Health: {player.metadata?.health}/20</p>
                      <p>XP: {player.metadata?.experience}</p>
                    </div>
                  </div>
                  
                  {player.metadata?.inventory && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-400 mb-2">Inventory:</p>
                      <div className="flex space-x-1">
                        {player.metadata.inventory.slots.slice(0, 9).map((item, index) => (
                          <div
                            key={index}
                            className={`w-8 h-8 bg-gray-600 rounded border ${
                              player.metadata?.hotbar?.selected === index
                                ? 'border-yellow-400'
                                : 'border-gray-500'
                            }`}
                            title={`${item.blockId} (${item.quantity})`}
                          >
                            <div className={`w-full h-full block-texture ${getBlockTexture(item.blockId)} rounded`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}