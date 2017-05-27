import * as PIXI from 'pixi.js'
import Victor from 'victor'
import * as R from 'ramda'

const initVec = () => new Victor(50, 50)

const nextPoint = lastV => {
  const unit = new Victor(1, 0)
  const dev = Math.PI * (Math.random() - .5)
  const scale = 20 * Math.random()
  return lastV.clone().add(unit.rotateBy(dev).multiply(new Victor(scale, scale)))
}

var app = new PIXI.Application()

document.body.appendChild(app.view)

let myGraph = new PIXI.Graphics()
app.stage.addChild(myGraph)

const startP = initVec()

myGraph.position.set(startP.x, startP.y)

const segmentCount = 50

const points = R.until(
  R.pipe(
    R.length,
    R.gt(R.__, segmentCount))
  , arr => R.pipe(
    R.last,
    nextPoint,
    R.append(R.__, arr)
  )(arr))([startP])

console.log('points', points)

const endPoint = {x: 80, y: 80}

const thickness = 2
const graph = myGraph.lineStyle(thickness, 0xffffff)
  .moveTo(0, 0)

R.map(p =>
  graph.lineTo(p.x, p.y), points)



