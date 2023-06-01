class Env {
  #outer
  constructor(outer, binds = [], expr = []) {
    this.#outer = outer;
    this.data = {};

    for (let index = 0; index < binds.length; index++) {
      this.data[binds[index].value] = expr[index];
    }
  }

  set(symbol, malValue) {
    this.data[symbol.value] = malValue;
  }

  find(symbol) {
    if (this.data[symbol.value]) {
      return this;
    }
    if (this.#outer) {
      return this.#outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    if (!env) throw `${symbol.value} not found`;
    return env.data[symbol.value];
  }
}

module.exports = { Env };