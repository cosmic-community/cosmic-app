import GameEngine from '@/components/GameEngine'
import { getBlockTypes, getWorlds, getPlayers } from '@/lib/cosmic'

export default async function HomePage() {
  try {
    const [blockTypes, worlds, players] = await Promise.all([
      getBlockTypes(),
      getWorlds(),
      getPlayers()
    ])

    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Welcome to CubeWorld
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Block Types</h2>
              <p className="text-gray-300 mb-4">{blockTypes.length} blocks available</p>
              <div className="space-y-2">
                {blockTypes.slice(0, 3).map((block) => (
                  <div key={block.id} className="bg-gray-700 rounded p-3">
                    <h3 className="font-medium">{block.title}</h3>
                    <p className="text-sm text-gray-400">{block.metadata?.texture_description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Worlds</h2>
              <p className="text-gray-300 mb-4">{worlds.length} worlds created</p>
              <div className="space-y-2">
                {worlds.map((world) => (
                  <div key={world.id} className="bg-gray-700 rounded p-3">
                    <h3 className="font-medium">{world.title}</h3>
                    <p className="text-sm text-gray-400">
                      Mode: {world.metadata?.game_mode?.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Players</h2>
              <p className="text-gray-300 mb-4">{players.length} active players</p>
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.id} className="bg-gray-700 rounded p-3">
                    <h3 className="font-medium">{player.metadata?.username}</h3>
                    <p className="text-sm text-gray-400">
                      World: {player.metadata?.current_world?.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <GameEngine 
            blockTypes={blockTypes}
            worlds={worlds}
            players={players}
          />
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error loading game data:', error)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">CubeWorld</h1>
          <p className="text-red-400">Error loading game data. Please try again later.</p>
        </div>
      </main>
    )
  }
}