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
│   └── scenes/
│       └── Game.ts          # Main game scene with all game logic
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
- Toast Physics: `toastCollisionWidth/Height`, collision offsets

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

#### Game Scene Architecture
1. **Texture Generation**: Procedural toaster and toast sprites
2. **Platform System**: Static physics bodies for level geometry
3. **Toast System**: Hot-potato mechanic with collision detection
4. **Camera System**: Dynamic following with deadzone
5. **Collision Setup**: Player-platform, player-player, and toast interactions
6. **UI Layer**: Fixed-position controls and dynamic toast timer

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
- **Timer**: 3-second countdown with visual urgency indicators
- **Ejection**: Automatic launch with inherited horizontal velocity
- **Alternation Rule**: Only the non-owner can catch flying toast
- **Reset**: Toast returns to Player 1 on ground contact or world exit
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

### Hot-Potato Toast Mechanic (Latest)
- **Implementation**: Complete hot-potato mechanic as per ToastMechanic.md
- **Robustness**: World bounds detection, physics safety guards, pickup cooldown
- **Performance**: Optimized position updates with dirty flag system
- **UX Improvements**: Enhanced timer UI with owner display and urgency colors
- **Configuration**: All constants moved to GameSettings for easy tweaking
- **Quality**: All linting, type checking, and build processes pass