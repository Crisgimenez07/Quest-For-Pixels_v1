import { GameState, Entity } from './types';

export class GameRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  render(state: GameState) {
    const { ctx, canvas } = this;
    const { camera, player, entities } = state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Parallax clouds (simplified)
    this.drawClouds(ctx, camera.x);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Draw Entities
    entities.forEach((entity) => {
      this.drawEntity(ctx, entity);
    });

    // Draw Player
    this.drawPlayer(ctx, player);

    ctx.restore();

    // HUD
    this.drawHUD(ctx, state);
  }

  private drawClouds(ctx: CanvasRenderingContext2D, cameraX: number) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 10; i++) {
      const x = (i * 400 - cameraX * 0.2) % 1200;
      this.drawCloud(ctx, x, 100 + (i % 3) * 50);
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawEntity(ctx: CanvasRenderingContext2D, entity: Entity) {
    switch (entity.type) {
      case 'platform':
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(entity.pos.x, entity.pos.y, entity.width, entity.height);
        ctx.fillStyle = '#228B22'; // Green top
        ctx.fillRect(entity.pos.x, entity.pos.y, entity.width, 10);
        break;
      case 'coin':
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.beginPath();
        ctx.arc(entity.pos.x + entity.width/2, entity.pos.y + entity.height/2, entity.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      case 'star':
        this.drawStar(ctx, entity.pos.x + entity.width/2, entity.pos.y + entity.height/2, 5, entity.width/2, entity.width/4);
        break;
      case 'enemy':
        if (entity.subType === 'flyer') {
          ctx.fillStyle = '#FF00FF'; // Purple for flyers
          ctx.beginPath();
          ctx.ellipse(entity.pos.x + entity.width/2, entity.pos.y + entity.height/2, entity.width/2, entity.height/2, 0, 0, Math.PI * 2);
          ctx.fill();
          // Wings
          ctx.fillStyle = 'white';
          ctx.fillRect(entity.pos.x - 5, entity.pos.y + 5, 10, 5);
          ctx.fillRect(entity.pos.x + entity.width - 5, entity.pos.y + 5, 10, 5);
        } else if (entity.subType === 'speeder') {
          ctx.fillStyle = '#FF4500'; // Orange-red for speeders
          ctx.beginPath();
          ctx.moveTo(entity.pos.x, entity.pos.y);
          ctx.lineTo(entity.pos.x + entity.width, entity.pos.y + entity.height/2);
          ctx.lineTo(entity.pos.x, entity.pos.y + entity.height);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#00FF00'; // Green
          ctx.fillRect(entity.pos.x, entity.pos.y, entity.width, entity.height);
        }
        // Eyes
        ctx.fillStyle = 'black';
        ctx.fillRect(entity.pos.x + 5, entity.pos.y + 10, 5, 5);
        ctx.fillRect(entity.pos.x + 30, entity.pos.y + 10, 5, 5);
        break;
      case 'spike':
        ctx.fillStyle = '#708090'; // Slate Gray
        ctx.beginPath();
        ctx.moveTo(entity.pos.x, entity.pos.y + entity.height);
        ctx.lineTo(entity.pos.x + entity.width / 2, entity.pos.y);
        ctx.lineTo(entity.pos.x + entity.width, entity.pos.y + entity.height);
        ctx.fill();
        break;
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, player: any) {
    ctx.save();
    if (player.facing === 'left') {
      ctx.translate(player.pos.x + player.width, player.pos.y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(player.pos.x, player.pos.y);
    }

    // Body (Simplified "Mario" look)
    ctx.fillStyle = 'red';
    ctx.fillRect(5, 20, player.width - 10, player.height - 20); // Overalls/Shirt
    ctx.fillStyle = '#F5DEB3'; // Skin
    ctx.fillRect(10, 0, player.width - 20, 25); // Head
    ctx.fillStyle = 'red';
    ctx.fillRect(5, 0, player.width - 10, 8); // Hat
    ctx.fillStyle = 'blue';
    ctx.fillRect(5, 40, player.width - 10, 20); // Pants/Bottom overalls
    
    // Eyes
    ctx.fillStyle = 'black';
    ctx.fillRect(player.width - 15, 10, 4, 4);

    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spans: number, outer: number, inner: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spans;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outer);
    for (let i = 0; i < spans; i++) {
        x = cx + Math.cos(rot) * outer;
        y = cy + Math.sin(rot) * outer;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * inner;
        y = cy + Math.sin(rot) * inner;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outer);
    ctx.closePath();
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }

  private drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 80);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`SCORE: ${state.player.score}`, 20, 40);
    ctx.fillText(`LIVES: ${'❤️'.repeat(state.player.lives)}`, 20, 70);
  }
}
