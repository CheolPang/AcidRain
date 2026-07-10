
const waterdropImg = new Image();
waterdropImg.src = "assets/waterdrop.png";

const DROP_W = 110;  
const DROP_H = 95;   

class FallingWord {
  constructor(text, canvasWidth, speed) {
    this.text = text;
    this.x = 60 + Math.random() * (canvasWidth - 120);
    this.y = 0;
    this.speed = speed;
  }

  update(dt) {
    this.y += this.speed * dt;
  }

  draw(ctx, isTarget) {
    if (waterdropImg.complete && waterdropImg.naturalWidth > 0) {
      ctx.save();
      if (isTarget) ctx.filter = "brightness(1.25) saturate(1.2)";
      ctx.drawImage(
        waterdropImg,
        this.x - DROP_W / 2,
        this.y - DROP_H / 2,
        DROP_W,
        DROP_H
      );
      ctx.restore();
    }

    ctx.font = "bold 20px 'R2KDOLAppleKR', 'Malgun Gothic', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(this.text, this.x, this.y + 6); 
    ctx.fillStyle = isTarget ? "#2ecc71" : "#000000";
    ctx.fillText(this.text, this.x, this.y + 6);
  }
}
