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
│   └── scenes/
│       └── Game.ts          # Main game scene with all game logic
├── main.ts                  # Entry point and DOM setup
└── vite-env.d.ts           # TypeScript environment definitions

public/
└── assets/
    ├── bg.png              # Background image
    └── favicon.png         # Site favicon
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

#### Player Class (extends Physics.Arcade.Sprite)
- **Physics Body**: 32x48 collision box with proper offset
- **Controls**: Configurable key bindings per player
- **Movement**: Ground/air speed differentiation
- **Jumping**: Double-jump mechanic with impulse tracking
- **Collision**: Pushable bodies for player interaction

#### Game Scene Architecture
1. **Texture Generation**: Procedural toaster sprites (gold/teal)
2. **Platform System**: Static physics bodies for level geometry
3. **Camera System**: Dynamic following with deadzone
4. **Collision Setup**: Player-platform and player-player interactions
5. **UI Layer**: Fixed-position controls display

## Game Features

### Player Controls
- **Player 1** (Gold Toaster): A/D movement, W jump
- **Player 2** (Teal Toaster): ←/→ movement, ↑ jump

### Physics Mechanics
- **Gravity**: Configurable downward acceleration
- **Double Jump**: Each player can jump twice before landing
- **Player Pushing**: Solid collision with pushable physics
- **Air Control**: Reduced movement speed while airborne

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

### Future Enhancement Areas
- Tweakpane integration for designer controls
- Animation frames for movement states
- Sound effects and background music
- Additional level layouts
- Power-ups and collectibles