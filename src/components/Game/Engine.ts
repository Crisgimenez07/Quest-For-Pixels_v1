import { GameState, Entity, Player } from './types';

const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;
const FRICTION = 0.8;

export class GameEngine {
  state: GameState;
  private lastGeneratedX: number = 0;
  private generationStep: number = 400;

  constructor(width: number, height: number) {
    this.state = this.createInitialState(width, height);
    this.lastGeneratedX = 2000; // Start with some initial distance
  }

  createInitialState(width: number, height: number): GameState {
    const worldWidth = 1000000; // Effectively infinite
    const worldHeight = height;

    const initialPlayer: Player = {
      id: 'player',
      pos: { x: 100, y: height - 150 },
      vel: { x: 0, y: 0 },
      width: 40,
      height: 60,
      type: 'player',
      isJumping: false,
      isGrounded: false,
      jumpCount: 0,
      score: 0,
      lives: 3,
      facing: 'right',
    };

    const entities: Entity[] = [
      // Floor (Will expand as we go)
      { id: 'floor', pos: { x: 0, y: height - 40 }, vel: { x: 0, y: 0 }, width: 2000, height: 40, type: 'platform' },
      
      // Starting Platforms
      { id: 'p1', pos: { x: 300, y: height - 150 }, vel: { x: 0, y: 0 }, width: 200, height: 30, type: 'platform' },
      { id: 'p2', pos: { x: 600, y: height - 250 }, vel: { x: 0, y: 0 }, width: 200, height: 30, type: 'platform' },
      { id: 'p3', pos: { x: 900, y: height - 150 }, vel: { x: 0, y: 0 }, width: 200, height: 30, type: 'platform' },
      
      // Initial Collectibles
      { id: 'c1', pos: { x: 350, y: height - 200 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'coin' },
    ];

    return {
      player: initialPlayer,
      entities,
      camera: { x: 0, y: 0 },
      worldWidth,
      worldHeight,
      isGameOver: false,
    };
  }

  generateChunk(playerX: number) {
    while (this.lastGeneratedX < playerX + 2000) {
      const x = this.lastGeneratedX;
      const height = this.state.worldHeight;
      
      // Random platform
      const py = height - 150 - Math.random() * 300;
      const pw = 150 + Math.random() * 150;
      this.state.entities.push({
        id: `p_gen_${x}`,
        pos: { x, y: py },
        vel: { x: 0, y: 0 },
        width: pw,
        height: 30,
        type: 'platform'
      });

      // Maybe a coin
      if (Math.random() > 0.3) {
        this.state.entities.push({
          id: `c_gen_${x}`,
          pos: { x: x + pw / 2 - 10, y: py - 40 },
          vel: { x: 0, y: 0 },
          width: 20,
          height: 20,
          type: 'coin'
        });
      }

      // Enemy variety
      const enemyRand = Math.random();
      if (enemyRand > 0.8) {
        // Normal enemy
        this.state.entities.push({
          id: `e_gen_${x}`,
          pos: { x: x + 10, y: py - 50 },
          vel: { x: -2, y: 0 },
          width: 40,
          height: 40,
          type: 'enemy',
          subType: 'normal'
        });
      } else if (enemyRand > 0.7) {
        // Flyer
        this.state.entities.push({
          id: `ef_gen_${x}`,
          pos: { x, y: 100 + Math.random() * 200 },
          vel: { x: -3, y: 1 },
          width: 40,
          height: 30,
          type: 'enemy',
          subType: 'flyer'
        });
      } else if (enemyRand > 0.6) {
        // Speeder
        this.state.entities.push({
          id: `es_gen_${x}`,
          pos: { x: x + 50, y: height - 80 },
          vel: { x: -6, y: 0 },
          width: 30,
          height: 30,
          type: 'enemy',
          subType: 'speeder'
        });
      }

      // Maybe a spike
      if (Math.random() > 0.8) {
        this.state.entities.push({
          id: `sp_gen_${x}`,
          pos: { x: x + pw, y: height - 70 },
          vel: { x: 0, y: 0 },
          width: 40,
          height: 30,
          type: 'spike'
        });
      }

      // Extend floor
      const floor = this.state.entities.find(e => e.id === 'floor');
      if (floor) {
        floor.width = this.lastGeneratedX + this.generationStep * 2;
      }

      this.lastGeneratedX += this.generationStep;
    }

    // Cleanup far away entities
    if (this.state.entities.length > 200) {
      this.state.entities = this.state.entities.filter(e => e.id === 'floor' || e.pos.x > playerX - 1000);
    }
  }

  update(keys: Set<string>, keysJustPressed: Set<string>) {
    if (this.state.isGameOver) return;

    const { player } = this.state;

    // Infinite generation
    this.generateChunk(player.pos.x);

    // Player Movement
    if (keys.has('ArrowLeft') || keys.has('a')) {
      player.vel.x = -MOVE_SPEED;
      player.facing = 'left';
    } else if (keys.has('ArrowRight') || keys.has('d')) {
      player.vel.x = MOVE_SPEED;
      player.facing = 'right';
    } else {
      player.vel.x *= FRICTION;
    }

    // Double Jump Logic
    if (keysJustPressed.has('ArrowUp') || keysJustPressed.has('w') || keysJustPressed.has(' ')) {
      if (player.isGrounded) {
        player.vel.y = JUMP_FORCE;
        player.isGrounded = false;
        player.isJumping = true;
        player.jumpCount = 1;
      } else if (player.jumpCount < 2) {
        player.vel.y = JUMP_FORCE * 0.9;
        player.jumpCount = 2;
      }
    }

    // Gravity
    player.vel.y += GRAVITY;

    // Apply Velocity
    player.pos.x += player.vel.x;
    player.pos.y += player.vel.y;

    // Collision Detection
    player.isGrounded = false;
    this.state.entities.forEach((entity) => {
      if (entity.type === 'platform') {
        this.handlePlatformCollision(player, entity);
      } else if (entity.type === 'coin') {
        if (this.checkCollision(player, entity)) {
          player.score += 10;
          this.removeEntity(entity.id);
        }
      } else if (entity.type === 'star') {
        if (this.checkCollision(player, entity)) {
          player.score += 100;
          this.removeEntity(entity.id);
        }
      } else if (entity.type === 'enemy') {
        if (this.checkCollision(player, entity)) {
          // Check if player is falling onto the enemy (stomping)
          if (player.vel.y > 0 && player.pos.y + player.height - player.vel.y <= entity.pos.y + 20) {
            player.vel.y = JUMP_FORCE * 0.7; // Give a little bounce
            player.score += 25;
            this.removeEntity(entity.id);
          } else {
            this.handlePlayerDamage();
          }
        }
      } else if (entity.type === 'spike') {
        if (this.checkCollision(player, entity)) {
          this.handlePlayerDamage();
        }
      }
    });

    // Enemy movement
    this.state.entities.forEach(entity => {
      if (entity.type === 'enemy') {
        entity.pos.x += entity.vel.x;
        
        if (entity.subType === 'flyer') {
          entity.pos.y += Math.sin(this.state.player.pos.x * 0.01 + Number(entity.id.slice(-3)) || 0) * 2;
        }

        // Simple AI: bounce off platforms or world bounds
        if (entity.pos.x < 0 || entity.pos.x > this.state.player.pos.x + 3000) {
           entity.vel.x *= -1;
        }
      }
    });

    // Screen Bounds
    if (player.pos.x < 0) player.pos.x = 0;
    if (player.pos.x > this.state.worldWidth - player.width) player.pos.x = this.state.worldWidth - player.width;
    if (player.pos.y > this.state.worldHeight) {
       this.handlePlayerDamage();
       player.pos.y = -100; // Reset above
       player.pos.x = Math.max(0, player.pos.x - 200);
    }

    // Camera follow
    this.state.camera.x = player.pos.x - 400;
    if (this.state.camera.x < 0) this.state.camera.x = 0;
    if (this.state.camera.x > this.state.worldWidth - 800) this.state.camera.x = this.state.worldWidth - 800;
  }

  handlePlatformCollision(player: Player, platform: Entity) {
    if (
      player.pos.x < platform.pos.x + platform.width &&
      player.pos.x + player.width > platform.pos.x &&
      player.pos.y < platform.pos.y + platform.height &&
      player.pos.y + player.height > platform.pos.y
    ) {
      // Coming from top
      if (player.vel.y > 0 && player.pos.y + player.height - player.vel.y <= platform.pos.y) {
        player.pos.y = platform.pos.y - player.height;
        player.vel.y = 0;
        player.isGrounded = true;
        player.isJumping = false;
      } 
      // Coming from bottom
      else if (player.vel.y < 0 && player.pos.y - player.vel.y >= platform.pos.y + platform.height) {
        player.pos.y = platform.pos.y + platform.height;
        player.vel.y = 0;
      }
      // Coming from sides
      else {
        if (player.vel.x > 0) {
          player.pos.x = platform.pos.x - player.width;
        } else if (player.vel.x < 0) {
          player.pos.x = platform.pos.x + platform.width;
        }
      }
    }
  }

  checkCollision(a: Entity, b: Entity) {
    return (
      a.pos.x < b.pos.x + b.width &&
      a.pos.x + a.width > b.pos.x &&
      a.pos.y < b.pos.y + b.height &&
      a.pos.y + a.height > b.pos.y
    );
  }

  handlePlayerDamage() {
    const { player } = this.state;
    player.lives -= 1;
    if (player.lives <= 0) {
      this.state.isGameOver = true;
    } else {
      // Temporary invincibility or knockback?
      player.pos.y -= 100;
      player.vel.y = -5;
    }
  }

  removeEntity(id: string) {
    this.state.entities = this.state.entities.filter(e => e.id !== id);
  }
}
