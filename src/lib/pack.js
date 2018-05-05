export function Pack (pack) {
  return Object.assign({}, {
    fromNodeName: '',
    toNodeName: '',
    time: Date.now(),
    gameTime: {
      time: 0,
      day: 0,
      isWorking: false
    }
  }, pack)
}

export function OrderPack ({ fromNodeName, toNodeName, goodsList }) {
  return {
    fromNodeName: fromNodeName || '',
    toNodeName: toNodeName || '',
    goods: new Map(goodsList),
    inGameTime: 0
  }
}

/**
 * @param {object} packageContent `fromNodeid`, `toNodeid`, `goodsList`.
 */
export function DeliverPack ({ fromNodeName, toNodeName, goodsList }) {
  return {
    fromNodeName: fromNodeName || '',
    toNodeName: toNodeName || '',
    goods: new Map(goodsList),
    inGameTime: 0
  }
}
