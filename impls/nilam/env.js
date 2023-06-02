class Env {
  #outer
  constructor(outer) {
    this.#outer = outer;
    this.data = {};
  }

  set(symbol, malValue) {
    // console.log("set env", symbol.value, malValue)
    this.data[symbol.value] = malValue;
  }

  find(symbol) {
    if (this.data[symbol.value] !== undefined) {
      return this;
    }
    if (this.#outer) {
      return this.#outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    // console.log("get env", symbol);
    // console.log("get env", env);
    if (!env) throw `${symbol.value} not found`;
    // console.log("get env", env.data[symbol.value]);
    return env.data[symbol.value];
  }
}

module.exports = { Env };