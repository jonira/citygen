import * as PIXI from 'pixi.js'
import * as R from 'ramda'

import Victor from 'victor'
import gaussian from 'gaussian'

const initVec = () => new Victor(100, 100)

const distanceSampler = gaussian(100, 40)
const angleSampler = gaussian(0, 295)

const nextPoint = lastV => {
  const unit = new Victor(1, 0)
  const dev = angleSampler.ppf(Math.random())
  const scale = distanceSampler.ppf(Math.random())
  return lastV.clone().add(unit.rotateByDeg(dev).multiply(new Victor(scale, scale)))
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

const thickness = 2
const graph = myGraph.lineStyle(thickness, 0xffffff)
  .moveTo(0, 0)

R.pipe(
  R.tail,
  R.map(p =>
    graph.lineTo(p.x, p.y)))(points)



