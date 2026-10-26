// Painted upholstery study from references/sofa.jpg: clustered roses, blue
// companion flowers and branching olive foliage on an ivory ground.
export function paintFloral(ctx: CanvasRenderingContext2D) {
  let seed = 87;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const rose = (x: number, y: number, radius: number, blue = false) => {
    const colors = blue
      ? ['#586b69', '#82918c', '#a9b3a6', '#c3c7b7']
      : ['#854e42', '#b57562', '#d19b83', '#e4baa0'];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(random() * Math.PI * 2);
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.86, 0, Math.PI * 2);
    ctx.fill();
    for (let ring = 4; ring >= 0; ring--) {
      const count = 5 + ring * 2;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + ring * 1.7;
        const r = radius * (0.13 + ring * 0.17);
        ctx.save();
        ctx.translate(Math.cos(angle) * r, Math.sin(angle) * r);
        ctx.rotate(angle + 0.3);
        const w = radius * (0.24 + random() * 0.13);
        const h = w * (0.55 + random() * 0.35);
        ctx.fillStyle = colors[1 + ((i + ring) % 3)];
        ctx.beginPath();
        ctx.moveTo(-w, 0);
        ctx.bezierCurveTo(-w, -h, -w * 0.3, -h * 1.3, 0, -h);
        ctx.bezierCurveTo(w * 0.8, -h * 1.6, w * 1.2, 0, w * 0.6, h * 0.5);
        ctx.quadraticCurveTo(0, -h * 0.4, -w, 0);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  };
  // Repeat identical motifs across tile borders, including their paint variation.
  const motifs = [
    [70, 80, 0.3],
    [330, 170, 2.2],
    [175, 355, -0.6],
    [445, 430, 1.5],
  ];
  for (const [x, y, angle] of motifs) {
    for (const dx of [-512, 0, 512])
      for (const dy of [-512, 0, 512]) {
        seed = 87 + x;
        ctx.save();
        ctx.translate(x + dx, y + dy);
        ctx.rotate(angle);
        for (let branch = 0; branch < 7; branch++) {
          ctx.save();
          ctx.rotate(branch * 2.4);
          const length = 60 + random() * 38;
          ctx.strokeStyle = '#827b53';
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(22, -length * 0.6, 9, -length);
          ctx.stroke();
          for (let leaf = 0; leaf < 5; leaf++) {
            ctx.save();
            ctx.translate(10, -28 - leaf * 12);
            ctx.rotate((leaf % 2 ? -1 : 1) * 0.9);
            ctx.fillStyle = ['#59664a', '#7e805b', '#99906a'][leaf % 3];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-15, -8, -13, -25, 0, -31);
            ctx.bezierCurveTo(12, -21, 13, -8, 0, 0);
            ctx.fill();
            ctx.strokeStyle = '#b3ac80';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -2);
            ctx.lineTo(0, -27);
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
        }
        rose(30, -29, 28, true);
        rose(-17, 6, 37);
        rose(32, 33, 21);
        rose(-30, -48, 13);
        ctx.restore();
      }
  }
}
