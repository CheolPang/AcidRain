// 물방울 이미지 프리로드 (전역 1회)
const waterdropImg = new Image();
waterdropImg.src = "assets/waterdrop.png";

const DROP_W = 110;  // 표시 가로
const DROP_H = 95;   // 표시 세로 (가로가 더 넓음)

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
    // 물방울 이미지 (뾰족한 위쪽이 진행 방향)
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

    // 텍스트 (물방울 중앙에, 흰 외곽선 + 본체색)
    ctx.font = "bold 20px 'R2KDOLAppleKR', 'Malgun Gothic', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(this.text, this.x, this.y + 6); // 물방울 둥근 부분 쪽으로 살짝 내려서
    ctx.fillStyle = isTarget ? "#d62828" : "#000000";
    ctx.fillText(this.text, this.x, this.y + 6);
  }
}
