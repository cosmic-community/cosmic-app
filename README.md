# 🎮 CubeWorld - Voxel Sandbox Game

![CubeWorld Banner](https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=300&fit=crop&auto=format)

A browser-based voxel sandbox game inspired by Minecraft, built with Next.js, Three.js, and Cosmic CMS. Generate procedural worlds, build with blocks, and explore in first-person view with all your progress automatically saved to the cloud.

## ✨ Features

- 🌍 **Procedural World Generation** - Generate infinite worlds with Perlin noise terrain
- 🎮 **First-Person Controls** - WASD movement, mouse look, and smooth camera controls
- 🧱 **Block Building** - Break blocks with left-click, place with right-click
- 🎒 **Inventory System** - 9-slot hotbar with multiple block types
- 💾 **Cloud Save** - All worlds, terrain, and player data saved to Cosmic CMS
- 🖼️ **Real-Time 3D** - WebGL rendering with Three.js for smooth performance
- 📊 **HUD Display** - Health, hunger, and hotbar indicators
- 🌤️ **Weather & Time** - Dynamic day/night cycle and weather system
- 🎯 **Game Modes** - Survival, Creative, and Adventure modes

## 🚀 Clone this Project

<!-- CLONE_PROJECT_BUTTON -->

## 📝 Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "Build a voxel-based sandbox game similar to Minecraft as a web app.
> 	•	When the user clicks "Generate World" a new randomized 3D terrain is created (using Perlin noise or similar for terrain generation).
> 	•	The game should run in the browser using WebGL with Three.js.
> 	•	The player spawns in first-person view and can walk around with WASD keys and look with mouse.
> 	•	Left click breaks blocks, right click places blocks from the hotbar.
> 	•	Add a simple inventory and hotbar system with a few block types (grass, dirt, stone, wood).
> 	•	Save each generated world to Cosmic so it can be reloaded later.
> 	•	Content model in Cosmic: Worlds (with seed, terrain data, player spawn), Players (username, inventory, position), Blocks (type, texture, properties), Items (tools, resources).
> 	•	Keep the code modular so features like crafting, mobs, or multiplayer can be added later.
> 	•	Add a minimal UI: title screen with a "Generate World" button, in-game HUD with health, hunger, and hotbar."

### Code Generation Prompt

> Based on the content model I created for "Build a voxel-based sandbox game similar to Minecraft as a web app.
> 	•	When the user clicks "Generate World" a new randomized 3D terrain is created (using Perlin noise or similar for terrain generation).
> 	•	The game should run in the browser using WebGL with Three.js.
> 	•	The player spawns in first-person view and can walk around with WASD keys and look with mouse.
> 	•	Left click breaks blocks, right click places blocks from the hotbar.
> 	•	Add a simple inventory and hotbar system with a few block types (grass, dirt, stone, wood).
> 	•	Save each generated world to Cosmic so it can be reloaded later.
> 	•	Content model in Cosmic: Worlds (with seed, terrain data, player spawn), Players (username, inventory, position), Blocks (type, texture, properties), Items (tools, resources).
> 	•	Keep the code modular so features like crafting, mobs, or multiplayer can be added later.
> 	•	Add a minimal UI: title screen with a "Generate World" button, in-game HUD with health, hunger, and hotbar.", now build a complete web application that showcases this content. Include a modern, responsive design with proper navigation, content display, and user-friendly interface.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies

- **Next.js 15** - React framework with App Router
- **Three.js** - 3D WebGL rendering library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Cosmic CMS** - Headless CMS for content management
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Simplex Noise** - Procedural terrain generation
- **Zustand** - State management

## 📋 Prerequisites

- Node.js 18+ or Bun
- A Cosmic account and bucket
- Basic understanding of React and Three.js

## 🚀 Getting Started

### 1. Clone the Repository