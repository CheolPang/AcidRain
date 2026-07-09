class FallingWord {
  constructor(text, canvasWidth, speed) {
    this.text = text;
    this.x = 40 + Math.random() * (canvasWidth - 120);
    this.y = 0;
    this.speed = speed;
  }

  update(dt) {
    this.y += this.speed * dt;
  }

  draw(ctx, isTarget) {
    ctx.font = "bold 24px 'R2KDOLAppleKR', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 배경 캡슐
    const w = ctx.measureText(this.text).width + 24;
    const h = 36;
    ctx.fillStyle = isTarget ? "rgba(110, 168, 255, 0.25)" : "rgba(255, 255, 255, 0.7)";
    ctx.strokeStyle = isTarget ? "#6effad" : "#2ecc71";
    ctx.lineWidth = 2;
    roundRect(ctx, this.x - w / 2, this.y - h / 2, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // 텍스트
    ctx.fillStyle = isTarget ? "#ffffff" : "#e0e6f0";
    ctx.fillText(this.text, this.x, this.y);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
