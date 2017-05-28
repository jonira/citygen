import * as PIXI from 'pixi.js'
import * as R from 'ramda'

import Victor from 'victor'
import gaussian from 'gaussian'

const initVec = () => ({origin: new Victor(0, 250), direction: new Victor(1, 0), roads: []})

const distanceSampler = gaussian(40, 40)
const angleSampler = gaussian(0, 295)

const nextPoint = (distanceDist, angleDist, lastV) => {
  const dev = angleDist.ppf(Math.random())
  const scale = distanceDist.ppf(Math.random())

  const origin = lastV.origin.clone().add(lastV.direction.clone().rotateByDeg(dev).multiply(new Victor(scale, scale)))
  const direction = lastV.direction.clone()
  const ro = distanceDist.ppf(Math.random())
  const rd = angleDist.ppf(Math.random())
  if ((ro < scale) && (rd > dev)) { // heuristics to form a sub road
    const side = Math.sign(Math.random() - .5)
    return {
      origin,
      direction,
      roads: [{
        origin: lastV.origin.clone().add(lastV.direction.clone().rotateByDeg(dev).multiply(new Victor(ro, ro))),
        direction: direction.clone().rotateDeg(side * 45.0),
        roads: []
      }]
    }
  }
  return {origin, direction, roads: []}
}

const buildRoad = (stage, start, segments, distanceDistribution, angleDistribution) => {
  const thickness = 3
  const points = R.until(
    R.pipe(
      R.length,
      R.gt(R.__, segments))
    , arr => R.pipe(
      R.last,
      R.partial(nextPoint, [distanceDistribution, angleDistribution]),
      R.append(R.__, arr)
    )(arr))([start])

  if (segments < 1) return
  let graph = new PIXI.Graphics()
  stage.addChild(graph)

  // drawing

  graph.position.set(0, 0)
  graph.lineStyle(thickness, 0xffffff)
    .moveTo(start.origin.x, start.origin.y)
  R.pipe(
    R.reject(p => p.x < 0 || p.y < 0),
    R.tail,
    R.map(
      p => graph.lineTo(p.origin.x, p.origin.y)
    )
  )(points)

  // sub roads
  R.map(
    R.pipe(
      R.prop('roads'),
      R.map(road => buildRoad(stage, road, segments / 2.5, distanceDistribution, angleDistribution)))
  )(points)

  return points
}

var app = new PIXI.Application()

document.body.appendChild(app.view)

const startP = initVec()

buildRoad(app.stage, startP, 20, distanceSampler, angleSampler)







