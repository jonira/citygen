import * as PIXI from 'pixi.js'
import * as R from 'ramda'

import Victor from 'victor'
import gaussian from 'gaussian'

const initVec = () => new Victor(0, 100)

const distanceSampler = gaussian(40, 40)
const angleSampler = gaussian(0, 295)

const nextPoint = (distanceDist, angleDist, lastV) => {
  const unit = new Victor(1, 0)
  const dev = angleDist.ppf(Math.random())
  const scale = distanceDist.ppf(Math.random())
  return lastV.clone().add(unit.rotateByDeg(dev).multiply(new Victor(scale, scale)))
}

const buildRoad = (graph, start, distanceDistribution, angleDistribution) => {
  const segmentCount = 50
  const thickness = 3
  const points = R.until(
    R.pipe(
      R.length,
      R.gt(R.__, segmentCount))
    , arr => R.pipe(
      R.last,
      R.partial(nextPoint, [distanceDistribution, angleDistribution]),
      R.append(R.__, arr)
    )(arr))([startP])

  graph.position.set(startP.x, startP.y)
  graph.lineStyle(thickness, 0xffffff)
    .moveTo(0, 0)
  R.pipe(
    R.map(p =>
      graph.lineTo(p.x, p.y)))(points)
}

var app = new PIXI.Application()

document.body.appendChild(app.view)

let myGraph = new PIXI.Graphics()
app.stage.addChild(myGraph)

const startP = initVec()

buildRoad(myGraph, startP, distanceSampler, angleSampler)







