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
  ctx.translate(20 * Math.floor(this.max / 2), 0);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
  ctx.font = this.fontSize + "px monospace";
  ctx.fillText(l, -Math.floor(l.length / 2) * (this.fontSize / 2), 0);
  ctx.restore();
}

// RadarChart.prototype.drawLabel = function (l, angle, ctx) {
//   ctx.save();
//   ctx.translate(center.x, center.y);
//   ctx.rotate(angle);
//   ctx.translate(20 * Math.floor(this.max / 2), 0);
//   ctx.rotate(Math.PI / 2);
//   ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
//   ctx.font = this.fontSize + "px monospace";
//   ctx.fillText(l, -Math.floor(l.length / 2) * (this.fontSize / 2), 0);

//   // Add attribute meanings
//   var meanings = {
//     "Stealth": "This aspect represents the party's ability to avoid detection, move silently, and perform covert actions without being noticed. It takes into account the skills and abilities related to stealth, such as stealth checks, sneaking, and disguises.",
//     "Combat": "This aspect measures the party's overall strength in combat situations. It considers factors like the combat abilities of individual characters, their attack power, defensive capabilities, and strategic coordination in battle.",
//     "Magic": "This aspect reflects the party's proficiency in spellcasting or magical abilities. It takes into account the spellcasting classes or characters in the party, their magical aptitude, and the variety and potency of spells they can utilize.",
//     "Support": "This aspect assesses the party's ability to provide assistance and support to its members. It includes healing abilities, buffs, crowd control, and other support-oriented skills that can enhance the overall effectiveness of the party.",
//     "Sleuthing": "This aspect measures the party's expertise in gathering information, investigating mysteries, and solving puzzles. It considers skills like perception, investigation, insight, and knowledge-based abilities that contribute to problem-solving and uncovering hidden details.",
//     "Social": "This aspect represents the party's interpersonal skills, charisma, and ability to navigate social encounters. It encompasses abilities such as persuasion, deception, intimidation, and other skills related to interacting with non-player characters and negotiating with others.",
//     "Versatility": "This aspect gauges the party's adaptability and flexibility in various situations. It considers the range of skills, abilities, and classes within the party that allow them to handle a broad spectrum of challenges, both in and out of combat.",
//     "Survivability": "This aspect assesses the party's ability to endure in harsh environments, withstand physical challenges, and maintain resources. It takes into account skills like survival, endurance, foraging, and resource management."
//   };
  
//   var meaning = meanings[l];
//   if (meaning) {
//     ctx.font = "12px monospace";
//     ctx.fillText(meaning, -Math.floor(meaning.length / 2) * 6, 16);
//   }

//   ctx.restore();
// }

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

function drawTooltips() {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
  ctx.font = "14px px monospace";
  ctx.textAlign = "left";

  const descriptions = {
    "Stealth": "This aspect represents the party's ability to avoid detection, move silently, and perform covert actions without being noticed. It takes into account the skills and abilities related to stealth, such as stealth checks, sneaking, and disguises.",
    "Combat": "This aspect measures the party's overall strength in combat situations. It considers factors like the combat abilities of individual characters, their attack power, defensive capabilities, and strategic coordination in battle.",
    "Magic": "This aspect reflects the party's proficiency in spellcasting or magical abilities. It takes into account the spellcasting classes or characters in the party, their magical aptitude, and the variety and potency of spells they can utilize.",
    "Support": "This aspect assesses the party's ability to provide assistance and support to its members. It includes healing abilities, buffs, crowd control, and other support-oriented skills that can enhance the overall effectiveness of the party.",
    "Sleuthing": "This aspect measures the party's expertise in gathering information, investigating mysteries, and solving puzzles. It considers skills like perception, investigation, insight, and knowledge-based abilities that contribute to problem-solving and uncovering hidden details.",
    "Social": "This aspect represents the party's interpersonal skills, charisma, and ability to navigate social encounters. It encompasses abilities such as persuasion, deception, intimidation, and other skills related to interacting with non-player characters and negotiating with others.",
    "Versatility": "This aspect gauges the party's adaptability and flexibility in various situations. It considers the range of skills, abilities, and classes within the party that allow them to handle a broad spectrum of challenges, both in and out of combat.",
    "Survivability": "This aspect assesses the party's ability to endure in harsh environments, withstand physical challenges, and maintain resources. It takes into account skills like survival, endurance, foraging, and resource management."
  };
  
  RC.list.forEach((attribute, index) => {
    const angle = (index / RC.list.length) * 2 * Math.PI;
    const radius = RC.max * 10 + 20;

    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);

    const tooltipWidth = 100;
    const tooltipHeight = 40;
    const tooltipX = x - tooltipWidth / 2;
    const tooltipY = y - tooltipHeight / 2;

    // Draw tooltip rectangle
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

    // Draw attribute title
    ctx.fillStyle = "#FFF";
    ctx.fillText(attribute, x, y - 8);

    // Draw description (you can fill in the descriptions here)
    ctx.fillStyle = "#FFF";
    ctx.fillText(descriptions[attribute], x, y + 14);
  });

  ctx.restore();
}

draw();
