import * as PIXI from 'pixi.js'
import * as R from 'ramda'

import Victor from 'victor'
import gaussian from 'gaussian'
const mapIndexed = R.addIndex(R.map)

const initVec = () => ({origin: new Victor(0, 250), direction: new Victor(1, 0), roads: []})

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
      R.gte(R.__, segments))
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
  const subPoints = R.map(
    R.pipe(
      R.prop('roads'),
      R.map(road => buildRoad(stage, road, segments / 2.5, distanceDistribution, angleDistribution)))
  )(points)

  mapIndexed((r, i) => points[i].roads = r)(subPoints)

  return points
}

const buildHouse = (stage, point, vec) => {
  const distribution = gaussian(10, 10)
  const h = distribution.ppf(Math.random()), w = distribution.ppf(Math.random())
  const bh = vec.clone().normalize().multiply(new Victor(h, h))
  const bw = vec.clone().normalize().rotateDeg(90).multiply(new Victor(w, w))
  const c1 = point.clone().add(bh.clone())
  const c2 = c1.clone().add(bw.clone())
  const c3 = c2.clone().add(bh.clone().invert())
  const c4 = c3.clone().add(bw.clone().invert())

  // drawing
  let graph = new PIXI.Graphics()
  stage.addChild(graph)
  graph.beginFill(0xFFFFFF)

  graph.position.set(0, 0)
  graph.lineStyle(5, 0xffffff)
    graph.moveTo(c1.x, c1.y)
    graph.lineTo(c2.x, c2.y)
    graph.lineTo(c3.x, c3.y)
    graph.lineTo(c4.x, c4.y)

  return [c1, c2, c3, c4]
}

const buildHousing = (stage, houses, roads = []) => {
  const segment = R.take(2, roads)
  if (R.lte(segment.length, 1)) return [] // no houses for one piece segmend, i.e. end of road

  const rnd = Math.random()
  const side = Math.sign(Math.random() - .5)
  const svec = segment[1].origin.clone().subtract(segment[0].origin.clone())
  const hvec = svec.multiply(new Victor(rnd, rnd))
  const offset = svec.clone().normalize().rotateDeg(side * 90).multiply(new Victor(20, 20))
  const building_vec = segment[0].origin.clone().add(hvec).add(offset)
  houses.push(building_vec)

  buildHouse(stage, building_vec.clone(), offset.clone())

  if (segment[0].roads.length > 0) { // iterate sub roads
    R.until(R.isEmpty, R.partial(buildHousing, [stage, houses]))(segment[0].roads[0]) // issue: last segment never gets iterated
  }
  return R.drop(1, roads)
}

var app = new PIXI.Application()

document.body.appendChild(app.view)

const startP = initVec()
const distanceSampler = gaussian(40, 40)
const angleSampler = gaussian(0, 295)

const roads = buildRoad(app.stage, startP, 20, distanceSampler, angleSampler)

console.log('roads', roads)

let houses = []
R.until(R.isEmpty, R.partial(buildHousing, [app.stage, houses]))(roads)

console.log('houses', houses)
