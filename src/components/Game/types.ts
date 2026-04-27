export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Vector2;
  vel: Vector2;
  width: number;
  height: number;
  type: 'player' | 'enemy' | 'platform' | 'coin' | 'star' | 'spike';
  subType?: 'normal' | 'flyer' | 'speeder';
}

export interface Player extends Entity {
  type: 'player';
  isJumping: boolean;
  isGrounded: boolean;
  jumpCount: number;
  score: number;
  lives: number;
  facing: 'left' | 'right';
}

export interface GameState {
  player: Player;
  entities: Entity[];
  camera: Vector2;
  worldWidth: number;
  worldHeight: number;
  isGameOver: boolean;
}
