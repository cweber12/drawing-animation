// test/debugAnchors.js

export function debugTorsoAnchors(tl, tr, bl, br, hipCenter){
    ctx.save();
    ctx.fillStyle = 'red';
    [tl, tr, bl, br, hipCenter].forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.restore();
}

export function debugHeadAnchors(leftAnchor, rightAnchor){
    ctx.save();
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(leftAnchor.x, leftAnchor.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rightAnchor.x, rightAnchor.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }

export function debugArmAnchors(from, to){
    ctx.save();
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(from.x, from.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(to.x, to.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    if (!armsDown) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(from.x, from.y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'cyan';
      ctx.beginPath();
      ctx.arc(to.x, to.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
}

export function debugHandAnchors(from, to){
    ctx.save();
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(start.x, start.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(end.x, end.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(start.x, start.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(end.x, end.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

export function debugFootAnchors(from, to){
    ctx.save();
    ctx.fillStyle = 'orange'
    ctx.beginPath();
    ctx.arc(from.x, from.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(to.x, to.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}
