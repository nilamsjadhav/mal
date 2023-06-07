const { MalList } = require("./types");

class Env {
  #outer
  constructor(outer, binds = [], expr = []) {
    this.#outer = outer;
    this.data = {};
    this.#bindValues(binds, expr);
  }

  #bindValues(binds, expr) {
    for (let index = 0; index < binds.length; index++) {

      if (binds[index].value === '&') {
        this.set(binds[index + 1], new MalList(expr.slice(index)));
        return;
      }
      this.set(binds[index], expr[index]);
    }
  }

  set(symbol, malValue) {
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
    if (!env) throw `${symbol.value} not found`;
    return env.data[symbol.value];
  }
}

module.exports = { Env };