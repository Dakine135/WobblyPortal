class Star {
  constructor({
    x = 500,
    y = 500,
    radius = 10,
    color = "darkgrey",
    strokeColor = "black",
    ctx = null,
    debug = false,
    moveAmount = 200,
    moveSpeed = 0.01,
    rotationSpeed = 0.01,
    numberOfPoints = 5,
  }) {
    this.ctx = ctx;

    this.radius = radius;
    this.rotation = 0;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.color = color;
    this.strokeColor = strokeColor;
    this.path = new Path2D();

    //star stuff
    this.numberOfPoints = numberOfPoints;

    this.debug = debug;

    //center movement stuff
    this.moveAmount = moveAmount;
    this.moveSpeed = moveSpeed;
    this.rotationSpeed = rotationSpeed;
    this.xOffset = Math.random() * TWO_PI * 2 - TWO_PI;
    this.yOffset = Math.random() * TWO_PI * 2 - TWO_PI;
    this.directionX = Math.random() * (Math.random() > 0.5 ? 1 : -1);
    this.directionY = Math.random() * (Math.random() > 0.5 ? 1 : -1);

    this.buildPath();
  }

  update() {
    //move center offset
    this.x = this.startX + this.moveAmount * Math.sin(this.xOffset);
    this.y = this.startY + this.moveAmount * Math.sin(this.yOffset);
    this.xOffset += this.moveSpeed * this.directionX;
    this.yOffset += this.moveSpeed * this.directionY;
    this.rotation += this.rotationSpeed;
    // if (-TWO_PI >= this.xOffset || this.xOffset >= TWO_PI)
    //   this.directionX = this.directionX * -1;
    // if (-TWO_PI >= this.yOffset || this.yOffset >= TWO_PI)
    //   this.directionY = this.directionY * -1;
  }

  buildPath() {
    this.path = new Path2D();
    let rotation = (Math.PI / 2) * 3;
    let x, y;
    let step = Math.PI / this.numberOfPoints;
    this.path.moveTo(0, -this.radius);
    for (let i = 0; i < this.numberOfPoints; i++) {
      x = Math.cos(rotation) * this.radius;
      y = Math.sin(rotation) * this.radius;
      this.path.lineTo(x, y);
      rotation += step;

      x = Math.cos(rotation) * (this.radius / 2);
      y = Math.sin(rotation) * (this.radius / 2);
      this.path.lineTo(x, y);
      rotation += step;
    }
    this.path.lineTo(0, -this.radius);
    this.path.closePath();
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rotation);
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.stroke(this.path);
    this.ctx.fillStyle = this.color;
    this.ctx.fill(this.path);
    this.ctx.restore();
  }
}
