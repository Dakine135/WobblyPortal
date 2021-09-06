class Blob {
  constructor({
    x = 500,
    y = 500,
    radius = 500,
    color = "darkgrey",
    ctx = null,
    debug = false,
    moveAmount = 25,
    moveSpeed = 0.001,
    segments = 15,
    wobbleSpeed = 0.005,
  }) {
    this.ctx = ctx;
    this.wobbleIncrement = 0;
    this.radius = radius;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.color = color;
    this.path = new Path2D();

    this.shadowCanvas = document.createElement("canvas");
    this.shadowCanvas.width = canvas.width;
    this.shadowCanvas.height = canvas.height;
    this.shadowCtx = this.shadowCanvas.getContext("2d");

    this.debug = debug;
    this.segments = segments;
    this.step = TWO_PI / this.segments;
    this.anchors = [];
    this.radii = [];
    this.thetaOff = [];

    const bumpRadius = this.radius / 2;
    const halfBumpRadius = bumpRadius / 2;

    for (let i = 0; i < this.segments; i++) {
      this.anchors.push({ x: 0, y: 0 });
      this.radii.push(Math.random() * bumpRadius - halfBumpRadius);
      this.thetaOff.push(Math.random() * 2 * Math.PI);
    }

    // console.log("this.anchors :>> ", this.anchors);

    //center movement stuff
    this.moveAmount = moveAmount;
    this.moveSpeed = moveSpeed;
    this.xOffset = Math.random() * TWO_PI * 2 - TWO_PI;
    this.yOffset = Math.random() * TWO_PI * 2 - TWO_PI;
    this.directionX = Math.random() * (Math.random() > 0.5 ? 1 : -1);
    this.directionY = Math.random() * (Math.random() > 0.5 ? 1 : -1);

    this.theta = 0;
    this.thetaSpeed = wobbleSpeed;
    this.thetaRamp = 0;
    this.thetaRampDest = 0; //initial intense wobble at load
    this.rampDamp = 5; //initial speed
  }
  update() {
    //move center offset
    this.x = this.startX + this.moveAmount * Math.sin(this.xOffset);
    this.y = this.startY + this.moveAmount * Math.sin(this.yOffset);
    this.xOffset += this.moveSpeed * this.directionX;
    this.yOffset += this.moveSpeed * this.directionY;
    // if (-TWO_PI >= this.xOffset || this.xOffset >= TWO_PI)
    //   this.directionX = this.directionX * -1;
    // if (-TWO_PI >= this.yOffset || this.yOffset >= TWO_PI)
    //   this.directionY = this.directionY * -1;

    this.thetaRamp += (this.thetaRampDest - this.thetaRamp) / this.rampDamp;
    this.theta += this.thetaSpeed;

    this.anchors = [{ x: 0, y: this.radius }];
    for (let i = 0; i < this.segments + 2; i++) {
      const sine = Math.sin(this.thetaOff[i] + this.theta + this.thetaRamp);
      // console.log("this.radii[i],this.radii :>> ", this.radii[i], this.radii);
      const rad = this.radius + this.radii[i] * sine;
      let middleNum = this.step * i;
      const x = rad * Math.sin(middleNum);
      const y = rad * Math.cos(middleNum);
      // console.log("x, y, middleNum, rad :>> ", x, y, middleNum, rad);
      this.anchors.push({ x, y });
    }
    this.buildPath(this.anchors, true);
  }

  buildPath() {
    this.path = new Path2D();
    const points = this.getPoints();

    let firstAnchor = this.anchors[0];
    let secondAnchor = this.anchors[1];
    let lastAnchor = this.anchors[this.anchors.length - 1];

    let firstPoint = points[0];
    let secondPoint = points[1];
    let lastPoint = points[points.length - 1];

    this.path.moveTo(secondPoint.x, secondPoint.y);
    //Go through all points
    let anchor, point;
    let start = 2;
    let end = points.length - 1;
    for (let i = 0; i < points.length; i++) {
      anchor = this.anchors[i];
      point = points[i];

      if (this.debug) this.drawDot({ ...anchor, color: "red", text: `A${i}` });
      if (this.debug) this.drawDot({ ...point, color: "blue", text: `P${i}` });

      if (start <= i && i <= end)
        this.path.quadraticCurveTo(anchor.x, anchor.y, point.x, point.y);
    }

    let bezierA1 = this.anchors[this.anchors.length - 3];
    let bezierA2 = this.anchors[1];
    let bezierP1 = points[1];
    // this.drawDot({ ...bezierA1, color: "purple", size: 6, text: `BA1` });
    // this.drawDot({ ...bezierA2, color: "purple", size: 6, text: `BA2` });
    // this.drawDot({ ...bezierP1, color: "purple", size: 6, text: `BP1` });

    this.path.bezierCurveTo(
      bezierA1.x,
      bezierA1.y,
      bezierA2.x,
      bezierA2.y,
      bezierP1.x,
      bezierP1.y
    );
    this.path.closePath();
  }

  // create anchor points by averaging the control points
  getPoints() {
    const avg = [];

    let previousAnchor;
    for (let i = 1; i < this.anchors.length; i++) {
      previousAnchor = this.anchors[i - 1];
      let x = (previousAnchor.x + this.anchors[i].x) / 2;
      let y = (previousAnchor.y + this.anchors[i].y) / 2;
      avg.push({ x, y });
    }
    // close
    let x = (this.anchors[0].x + this.anchors[this.anchors.length - 1].x) / 2;
    let y = (this.anchors[0].y + this.anchors[this.anchors.length - 1].y) / 2;
    avg.push({ x, y });
    return avg;
  }

  drawCurveFill() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.fillStyle = this.color;
    this.ctx.fill(this.path);
    this.ctx.restore();
  }

  drawPath({ width = 1, color = "rgba(255, 255, 255, 0.5)" } = {}) {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.stroke(this.path);
    this.ctx.restore();
  }

  drawShadow({ width = 30, color = "black" } = {}) {
    this.shadowCtx.save();
    //setup
    this.shadowCtx.globalCompositeOperation = "source-over";
    this.shadowCtx.clearRect(0, 0, canvas.width, canvas.height);
    this.shadowCtx.translate(this.x, this.y);
    //calc scale needed
    let scale = width / this.radius;
    this.shadowCtx.scale(1 + scale, 1 + scale);

    //line and shadow
    this.shadowCtx.lineWidth = width;
    this.shadowCtx.strokeStyle = "red";
    this.shadowCtx.shadowColor = color;
    this.shadowCtx.shadowOffsetX = 0;
    this.shadowCtx.shadowOffsetY = 0;
    this.shadowCtx.shadowBlur = 40;
    this.shadowCtx.stroke(this.path);

    this.shadowCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.shadowCtx.translate(this.x, this.y);

    //fill
    this.shadowCtx.globalCompositeOperation = "destination-in";
    this.shadowCtx.fillStyle = "green";
    this.shadowCtx.fill(this.path);
    this.shadowCtx.restore();
    this.ctx.drawImage(this.shadowCanvas, 0, 0);
  }

  drawDot({ x = 0, y = 0, size = 3, color = "red", text = "" }) {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.fillStyle = color;
    this.ctx.font = "15px Arial";
    this.ctx.fillText(text, x + size, y);
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.restore();
  }

  debugDraw() {
    for (let i = 0; i < this.anchors.length; i++) {
      this.drawDot({ ...this.anchors[i] });
    }
    let avg = this.getPoints();
    for (let i = 2; i < avg.length - 2; i += 2) {
      let x = avg[i];
      let y = avg[i + 1];
      this.drawDot({ x, y, color: "blue" });
    }
  }
}
