import proj4 from 'proj4'

class SRSTranslator {

  /**
   * @param {Object} [projectionDefinitions]
   */
  constructor (projectionDefinitions) {
    this.projections = {}
    this.transformations = {}

    projectionDefinitions = Object.assign(
      SRSTranslator._getDefaultDefinitions(),
      projectionDefinitions || {}
    )
    for (let name in projectionDefinitions) {
      this.addProjection(name, projectionDefinitions[name])
    }
  }

  /**
   * @param {String} name
   * @param {String} projection
   */
  addProjection (name, projection) {
    this.projections[name] = projection
  }

  /**
   * @param {Number[]} coords
   * @param {String} projectionFrom
   * @param {String} projectionTo
   * @return {Number[]}
   */
  forward (coords, projectionFrom, projectionTo) {
    let height = undefined
    if (coords.length === 3) {
      // proj4js doesn't support 'height', just preserve the input value
      height = coords.pop()
    }

    let transformation = this._getTransformation(projectionFrom, projectionTo)

    // Weird double swap hack, but works
    if (projectionFrom == "EPSG:3301"){
      coords = transformation.forward([coords[1], coords[0]]);
      // coords = [coords[1], coords[0]];
    } else {
      coords = transformation.forward(coords);
    }

    if (typeof height !== 'undefined') {
      coords[2] = height
    }
    return coords
  }

  /**
   * @param {String} projectionFrom
   * @param {String} projectionTo
   * @return {Function}
   */
  _getTransformation (projectionFrom, projectionTo) {
    let cacheKey = `${projectionFrom}:::${projectionTo}`
    if (!this.transformations[cacheKey]) {
      let from = this._getProjection(projectionFrom)
      let to = this._getProjection(projectionTo)
      this.transformations[cacheKey] = proj4(from, to)
    }
    return this.transformations[cacheKey]
  }

  /**
   * @param {String} name
   * @return {String}
   * @private
   */
  _getProjection (name) {
    if (!this.projections[name]) {
      throw new Error(`Unknown projection name: "${name}".\nSee https://github.com/njam/citygml-to-3dtiles#option-srsprojections for details.`)
    }
    return this.projections[name]
  }

  /**
   * @returns {Object}
   * @private
   */
  static _getDefaultDefinitions () {
    return {
      'WGS84': '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
      'CH1903+': '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
      'EPSG:2056': '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
      'CH1903': '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
      'urn:ogc:def:crs:EPSG::7415': '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +vunits=m +no_defs',
      'EPSG:25833': '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
      'urn:adv:crs:ETRS89_UTM32*DE_DHHN92_NH': '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ',
      'urn:adv:crs:ETRS89_UTM32*DE_DHHN2016_NH': '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs ',
      'urn:ogc:def:crs,crs:EPSG::3414,crs:EPSG::6916': '+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs',
      'EPSG:3301': 'PROJCS["Estonian Coordinate System of 1997",GEOGCS["EST97",DATUM["Estonia_1997",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6180"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4180"]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",59.33333333333334],PARAMETER["standard_parallel_2",58],PARAMETER["latitude_of_origin",57.51755393055556],PARAMETER["central_meridian",24],PARAMETER["false_easting",500000],PARAMETER["false_northing",6375000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","3301"]]',
    }
  }

}

export default SRSTranslator
