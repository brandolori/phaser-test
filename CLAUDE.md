# Toaster Platformer - 2 Player Game

## Project Overview
A local 2-player side-scrolling platformer built with **Phaser 3** and **TypeScript**. Two toaster characters can run, jump, double-jump, and push each other around in an arcade physics world with dynamic camera following.

## Project Structure
```
src/
├── game/
│   ├── main.ts              # Phaser game configuration with physics
│   ├── GameSettings.ts      # Singleton for all tunable game parameters
│   ├── Player.ts            # Player class with physics and controls
│   ├── Toast.ts             # Hot-potato toast mechanic implementation
│   ├── LevelBuilder.ts      # Level construction and world building
│   └── scenes/
│       └── Game.ts          # Main game scene orchestration
├── main.ts                  # Entry point and DOM setup
└── vite-env.d.ts           # TypeScript environment definitions

public/
└── assets/
    ├── bg.png              # Background image
    ├── favicon.png         # Site favicon
    └── sounds/             # Audio assets for game effects
        ├── bell.mp3        # Toast ejection sound
        ├── clock-long.mp3  # Timer warning sound
        └── clock-short.mp3 # Timer tick sound
```

## Technical Stack

### Core Technologies
- **Phaser 3.90.0** - Game engine with Arcade Physics
- **TypeScript 5.7.2** - Type-safe development
- **Vite 6.3.1** - Fast build tool and dev server

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Stylelint** - CSS linting
- **Husky** - Git hooks for quality control
- **lint-staged** - Pre-commit linting
- **Commitlint** - Conventional commit messages
- **Knip** - Unused code detection
- **Semantic Release** - Automated versioning

### Game Architecture

#### GameSettings (Singleton Pattern)
Centralized configuration for all tunable parameters:
- Physics: `gravityY`, `levelWidth`, `levelHeight`
- Movement: `runSpeed`, `airSpeed`, `pushDrag`
- Jumping: `jumpImpulse`, `doubleJumpImpulse`
- Toast: `timeToEject`, `ejectImpulseY`, `toastOffsetY`, `pickupCooldownMs`
- Toast Physics: `toastCollisionWidth/Height`, collision offsets, `toastHorizontalMultiplier`

#### Player Class (extends Physics.Arcade.Sprite)
- **Physics Body**: 32x48 collision box with proper offset
- **Controls**: Configurable key bindings per player
- **Movement**: Ground/air speed differentiation
- **Jumping**: Double-jump mechanic with impulse tracking
- **Collision**: Pushable bodies for player interaction

#### Toast Class (extends Physics.Arcade.Sprite)
- **Hot-Potato Mechanic**: Alternating ownership between players
- **Timed Ejection**: Automatic launch after configurable countdown
- **Physics Integration**: Dynamic body for flight, disabled when owned
- **Safety Features**: World bounds detection, pickup cooldown, null guards
- **Performance**: Optimized position updates with dirty flagging

#### LevelBuilder Class (Builder Pattern)
- **Single Responsibility**: Dedicated to level construction and world building
- **Configuration-Driven**: Uses LevelConfig interface for flexible level design
- **Platform Management**: Creates and configures all platforms with proper physics
- **World Setup**: Handles background, world bounds, and physics boundaries
- **Ground Detection**: Identifies and tracks ground platform for special collision logic

#### Game Scene Architecture (Orchestration Layer)
1. **Level Construction**: Delegates to LevelBuilder for world creation
2. **Texture Generation**: Procedural toaster and toast sprites
3. **Game Object Creation**: Players, toast, and interactive elements
4. **System Integration**: Camera, collision, and UI systems
5. **Game Loop Management**: Updates and coordinate game state

## Game Features

### Player Controls
- **Player 1** (Gold Toaster): A/D movement, W jump
- **Player 2** (Teal Toaster): ←/→ movement, ↑ jump

### Physics Mechanics
- **Gravity**: Configurable downward acceleration
- **Double Jump**: Each player can jump twice before landing
- **Player Pushing**: Solid collision with pushable physics
- **Air Control**: Reduced movement speed while airborne

### Hot-Potato Toast Mechanic
- **Ownership**: Toast starts with Player 1, alternates between players
- **Timer**: X-second countdown with visual urgency indicators
- **Ejection**: Automatic launch with configurable horizontal velocity multiplier
- **Platform Interaction**: Toast passes through floating platforms but resets on ground contact
- **Alternation Rule**: Only the non-owner can catch flying toast
- **Reset**: Toast returns to Player 1 on ground platform contact or world bounds exit
- **UI Feedback**: Real-time timer with color-coded urgency levels

### Camera System
- **Dynamic Following**: Centers on midpoint between players
- **Level Bounds**: Constrained to level dimensions
- **Deadzone**: 100x100px area to prevent micro-movements

## Quality Control Standards

### Pre-commit Checks (Automated)
- **ESLint**: TypeScript/JavaScript linting
- **Stylelint**: CSS validation
- **Prettier**: Code formatting enforcement

### Build Pipeline
```bash
npm run lint        # Run all linting checks
npm run lint:fix    # Auto-fix linting issues
npm run build       # Production build
npm run dev         # Development server
```

### TypeScript Configuration
- Strict type checking enabled
- No implicit any types
- Proper interface definitions for all data structures

## Development Guidelines

### Code Generation
- Always explain architectural decisions
- Ask clarifying questions if requirements are ambiguous
- Suggest improvements but don't implement without approval
- Generate complete, working code blocks (no placeholders)

### Problem Solving
- Start with the simplest solution that works
- Only add complexity when specifically requested
- Highlight potential issues or edge cases
- Suggest testing approaches for new features

### Communication
- Use clear, structured explanations
- Provide code comments in generated files
- Flag when you're making assumptions
- Offer alternatives when multiple approaches exist

### Quality Standards
**IMPORTANT**: Before considering any task complete:
1. Run `npm run lint` and fix all issues
2. Run `npx tsc --noEmit` for type checking
3. Run `npm run build` to ensure production build works
4. Test functionality in browser
5. No shortcuts or temporary hacks allowed

## Game Design Notes

### Level Design
- Ground platform spans full level width
- Multiple floating platforms at varying heights
- Level dimensions: 2048x768 pixels
- Platform texture: Procedurally generated brown rectangles

### Character Design
- Toaster sprites: 64x64 pixels with rounded corners
- Color coding: Gold (#FFD700) vs Teal (#4ECDC4)
- Orange heating elements for visual detail
- Collision box smaller than sprite for better feel

### Toast Design
- Toast sprite: 32x24 pixels brown rectangle with rounded corners
- Collision box: 24x16 pixels with 4x8 offset for precise interaction
- Visual feedback: Always visible when owned, physics-driven when flying
- UI Integration: Timer display with owner identification and urgency colors

### Future Enhancement Areas
- **Audio Integration**: Sound effects for toast ejection and timer warnings
- **Tweakpane GUI**: Real-time parameter tuning for all GameSettings
- **Animation System**: Movement frames for players and toast
- **Level Expansion**: Multiple layouts and environmental hazards
- **Game Modes**: Score system, competitive rounds, power-ups
- **Visual Polish**: Particle effects, screen shake, visual juice

## Recent Updates

### Architecture Refactoring - Single Responsibility Principle (Latest)
- **LevelBuilder Class**: Extracted level construction logic from Game scene
- **Configuration-Driven**: Flexible level design through LevelConfig interface
- **Separation of Concerns**: Game scene now focuses on orchestration, not construction
- **Improved Maintainability**: Easier to add new levels and modify existing ones
- **Clean Architecture**: Follows SOLID principles for better code organization

### Hot-Potato Toast Mechanic
- **Implementation**: Complete hot-potato mechanic as per ToastMechanic.md
- **Robustness**: World bounds detection, physics safety guards, pickup cooldown
- **Performance**: Optimized position updates with dirty flag system
- **UX Improvements**: Enhanced timer UI with owner display and urgency colors
- **Configuration**: All constants moved to GameSettings for easy tweaking
- **Quality**: All linting, type checking, and build processes pass