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

const PI = Math.PI;
const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const canvas = document.createElement("canvas");
const c = canvas.getContext("2d");

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;
document.body.appendChild(canvas);

const debug = false;
const layerDebug = false;
const blobDebug = false;

function colorBlend(startColor, endColor, fraction) {
  let diffR = endColor.r - startColor.r;
  let diffG = endColor.g - startColor.g;
  let diffB = endColor.b - startColor.b;
  let newR = Math.floor(startColor.r + diffR * fraction);
  let newG = Math.floor(startColor.g + diffG * fraction);
  let newB = Math.floor(startColor.b + diffB * fraction);
  return { r: newR, g: newG, b: newB };
}

let config = {
  numberOfLayers: { min: 2, max: 20, value: 7, label: "Number Of Layers" },
  numberOfSegments: {
    min: 4,
    max: 100,
    value: 15,
    label: "Number Of Segments",
  },
  moveSpeed: {
    min: 0.001,
    max: 0.2,
    value: 0.01,
    step: 0.001,
    label: "Move Speed",
  },
  wobbleSpeed: {
    min: 0.001,
    max: 0.2,
    value: 0.005,
    step: 0.001,
    label: "Wobble Speed",
  },
  space1: { space: true },
  startColorR: { min: 0, max: 255, value: 33, label: "Start Color Red" },
  startColorG: { min: 0, max: 255, value: 56, label: "Start Color Green" },
  startColorB: { min: 0, max: 255, value: 102, label: "Start Color Blue" },
  space2: { space: true },
  endColorR: { min: 0, max: 255, value: 250, label: "End Color Red" },
  endColorG: { min: 0, max: 255, value: 250, label: "End Color Green" },
  endColorB: { min: 0, max: 255, value: 250, label: "End Color Blue" },
};

Object.entries(config).forEach(([key, value]) => {
  if (value.space) {
    document
      .getElementById("sliderContainer")
      .appendChild(document.createElement("br"));
    return;
  }
  let span = document.createElement("span");
  span.innerHTML = value.label + ": ";
  span.width = "500px";
  let slider = document.createElement("input");
  slider.type = "range";
  slider.min = value.min;
  slider.max = value.max;
  slider.value = value.value;
  slider.step = value.step || 1;
  slider.class = "slider";
  slider.oninput = function () {
    config[key].value = Number(this.value);
    this.parentNode.childNodes[1].data = this.value;
    setup();
  };
  span.appendChild(document.createTextNode(value.value));
  span.appendChild(slider);
  document.getElementById("sliderContainer").appendChild(span);
  document
    .getElementById("sliderContainer")
    .appendChild(document.createElement("br"));
});

let layers;
function setup() {
  layers = [];
  let startColor = {
    r: config.startColorR.value,
    g: config.startColorG.value,
    b: config.startColorB.value,
  };
  let endColor = {
    r: config.endColorR.value,
    g: config.endColorG.value,
    b: config.endColorB.value,
  };

  let startRadius = 50;
  let stopRadius = Math.min(canvas.width, canvas.height) * 0.5;
  let radiusStep = (stopRadius - startRadius) / config.numberOfLayers.value;

  if (debug) {
    layers = [
      new Layer({
        blobX: canvas.width / 2,
        blobY: canvas.height / 2,
        blobRadius: 300,
        layerColor: "#aab9e3",
        blobDebug,
        layerDebug,
      }),
    ];
  } else {
    let newLayer, layerColor, layerRadius;
    for (let i = 0; i < config.numberOfLayers.value; i++) {
      layerColor = colorBlend(
        startColor,
        endColor,
        i / (config.numberOfLayers.value - 1)
      );
      layerRadius = startRadius + i * radiusStep;
      newLayer = new Layer({
        blobX: canvas.width / 2,
        blobY: canvas.height / 2,
        blobRadius: layerRadius,
        layerColor: `rgba(${layerColor.r},${layerColor.g},${layerColor.b},1)`,
        moveAmount: 25,
        moveSpeed: config.moveSpeed.value,
        segments: config.numberOfSegments.value,
        wobbleSpeed: config.wobbleSpeed.value,
      });
      layers.push(newLayer);
      layers.push(
        new Star({
          x: canvas.width / 2,
          y: canvas.height / 2,
          ctx: c,
          color: `rgba(${layerColor.r},${layerColor.g},${layerColor.b},1)`,
          numberOfPoints: Math.ceil(Math.random() * 6 + 2),
        })
      );
      if (i == Math.floor(config.numberOfLayers.value / 4)) {
        layers.push(
          new Astronaut({
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: layerRadius * 1.5,
            ctx: c,
          })
        );
      }
    }
  }
}

function loop() {
  c.save();
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = `rgba(${config.startColorR.value},${config.startColorG.value},${config.startColorB.value},1)`;
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.restore();

  layers.forEach((layer) => {
    layer.update();
    layer.draw();
  });

  window.requestAnimationFrame(loop);
}

setup();
loop();
