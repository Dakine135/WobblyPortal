class Layer {
  constructor({
    blobX = 500,
    blobY = 500,
    blobRadius = 500,
    layerColor = "#0000f0",
    layerDebug = false,
    blobDebug = false,
    moveAmount = 25,
    moveSpeed = 0.001,
    segments = 15,
    wobbleSpeed = 0.005,
  }) {
    this.type = "layer";
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCanvas.width = canvas.width;
    this.offscreenCanvas.height = canvas.height;
    this.ctx = this.offscreenCanvas.getContext("2d");
    this.debug = layerDebug;
    this.blob = new Blob({
      x: blobX,
      y: blobY,
      radius: blobRadius,
      ctx: this.ctx,
      debug: blobDebug,
      moveAmount,
      moveSpeed,
      segments,
      wobbleSpeed,
    });

    // console.log("newLayer color :>> ", layerColor);

    this.layerColor = layerColor;
  }

  update() {
    this.blob.update();
  }

  draw() {
    this.ctx.save();
    this.ctx.fillStyle = this.layerColor;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.ctx.globalCompositeOperation = "destination-out";
    this.blob.drawCurveFill();
    this.ctx.globalCompositeOperation = "source-over";
    this.blob.drawShadow();
    this.blob.drawPath({ width: 3 });

    // this.blob.debugDraw();
    this.ctx.restore();

    c.drawImage(this.offscreenCanvas, 0, 0);
  }
}
