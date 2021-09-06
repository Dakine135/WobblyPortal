class Astronaut {
  constructor({
    x = 500,
    y = 500,
    width = 100,
    ctx = null,
    debug = false,
    moveAmount = 10,
    moveSpeed = 0.01,
    rotationSpeed = 0.001,
  }) {
    this.ctx = ctx;

    this.width = width;
    this.height = Math.ceil(this.width * 1.05464); //ratio of my png
    this.rotation = 0;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;

    this.debug = debug;

    //center movement stuff
    this.moveAmount = moveAmount;
    this.moveSpeed = moveSpeed;
    this.rotationSpeed = rotationSpeed;
    this.xOffset = Math.random() * TWO_PI * 2 - TWO_PI;
    this.yOffset = Math.random() * TWO_PI * 2 - TWO_PI;
    this.directionX = Math.random() * (Math.random() > 0.5 ? 1 : -1);
    this.directionY = Math.random() * (Math.random() > 0.5 ? 1 : -1);

    this.image = new Image();
    this.image.src =
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimagensemoldes.com.br%2Fwp-content%2Fuploads%2F2020%2F08%2FCartoon-Astronauta-PNG.png&f=1&nofb=1";
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

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.rotation);
    //image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
    this.ctx.drawImage(this.image, 0, 0, this.width, this.height);
    this.ctx.restore();
  }
}
