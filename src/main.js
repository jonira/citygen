import * as PIXI from 'pixi.js'
// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container.
var app = new PIXI.Application();

// The application will create a canvas element for you that you
// can then insert into the DOM.
document.body.appendChild(app.view);

let myGraph = new PIXI.Graphics();
app.stage.addChild(myGraph);

myGraph.position.set(10, 10);

const endPoint = {x: 80, y: 80};

const thickness = 2
myGraph.lineStyle(thickness, 0xffffff)
    .moveTo(0, 0)
    .lineTo(endPoint.x, endPoint.y);
