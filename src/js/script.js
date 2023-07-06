var canvas = document.querySelector("#main");
var ctx = canvas.getContext("2d");

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

var center = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

function nGon(sides, radius, c) {
  this.center = c;
  this.vertices = [];
  for (var i = 0; i < sides; i++) {
    this.vertices.push({
      x: c.x + radius * Math.cos(((2 * Math.PI) / sides) * i),
      y: c.y + radius * Math.sin(((2 * Math.PI) / sides) * i)
    });
  }
}

nGon.prototype.draw = function () {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(128, 128, 128, 1.0)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  this.vertices.map(function (p) {
    ctx.lineTo(p.x, p.y);
    ctx.lineTo(this.center.x, this.center.y);
    ctx.moveTo(p.x, p.y);
  });
  ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
  ctx.lineTo(this.center.x, this.center.y);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
};

function distance(a, b) {
  return Math.sqrt(((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)));
}

var attributeList = ["Stealth", "Combat", "Magic", "Support", "Sleuthing", "Social", "Versatility", "Survivability"];

function RadarChart(list, max) {
  this.sides = list.length;
  this.list = list;
  this.vals = {};
  this.shadowVals = {};
  this.max = max;
  this.fontSize = 18;
  var me = this;
  list.map(b => { me.shadowVals[b] = 3; me.vals[b] = 0; });
  this.ngons = [];
  for (var i = 0; i < (max / 2); i++) {
    this.ngons.push(new nGon(this.sides, 20 * i, center));
  }
  this.points = [];
  this.calculatePoints();
}

RadarChart.prototype.draw = function (ctx) {
  this.ngons.map(b => b.draw(ctx));

  for (var i = 0; i < this.list.length; i++) {
    this.drawLabel(this.list[i], (i / this.list.length) * 2 * Math.PI, ctx);
  }

  this.drawPolygon(ctx);
}

RadarChart.prototype.update = function () {
  this.list.map(function (b) {
    this.vals[b] = lerp(this.vals[b], this.shadowVals[b], 0.1);
  }.bind(this));
  this.calculatePoints();
}

RadarChart.prototype.drawLabel = function (l, angle, ctx) {
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(angle);

  // Adjust rotation for specific attribute labels
  if (l === "Social" || l === "Versatility" || l === "Survivability") {
    ctx.rotate(Math.PI); // Flip upside down
  }

  ctx.translate(20 * Math.floor(this.max / 2), 0);
  ctx.rotate(-Math.PI / 2); // Rotate back to the original orientation
  ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
  ctx.font = this.fontSize + "px monospace";

  ctx.fillText(l, -Math.floor(l.length / 2) * (this.fontSize / 2), 0);

  ctx.restore();
};

RadarChart.prototype.drawPolygon = function (ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(200, 255, 200, 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(100, 255, 100, 1.0)";

  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);

  for (var i = 1; i < this.points.length; i++) {
    ctx.lineTo(this.points[i].x, this.points[i].y);
  }
  ctx.lineTo(this.points[0].x, this.points[0].y);
  ctx.stroke();
  ctx.fill();

  ctx.restore();
}

RadarChart.prototype.calculatePoints = function () {
  this.points = [];
  for (var i = 0; i < this.list.length; i++) {
    var val = this.vals[this.list[i]];
    var angle = (i / this.sides) * 2 * Math.PI;

    this.points.push({
      x: center.x + (val * 10) * Math.cos(angle),
      y: center.y + (val * 10) * Math.sin(angle)
    });
  }
}

function lerp(a, b, frac) {
  return a + ((b - a) * frac);
}

var RC = new RadarChart(attributeList, 20);
var gui = new dat.GUI();
var controls = [];
RC.list.map(b => controls.push(gui.add(RC.shadowVals, b, 3, 18).step(1)));

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  RC.update();
  RC.draw(ctx);
  ctx.restore();
  requestAnimationFrame(draw);
}

draw();
