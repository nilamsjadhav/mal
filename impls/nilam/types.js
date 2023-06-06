const pr_str = (malValue) => {
  if (malValue instanceof MalValue) {
    return malValue.pr_str(true);
  }
  return malValue.toString();
};


class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalSequence extends MalValue {
  constructor(value) {
    super(value)
  }
}

class MalList extends MalSequence {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return '(' + this.value.map(x => pr_str(x, true)).join(' ') + ')';
  }

  toString() {
    return '\"' + this.pr_str() + '\"';
  }

  isEmpty() {
    return this.value.length == 0;
  }

  beginsWith(str) {
    return this.value.length > 0 && this.value[0].value === str;
  }
}

class MalVector extends MalSequence {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return '[' + this.value.map(x => pr_str(x, print_readably)).join(' ') + ']';
  }

  toString() {
    return '\"' + this.pr_str() + '\"';
  }
}

const zipmap = (list) => {
  const length = list.length;
  const mapOfKeyValue = [];

  for (let index = 0; index < length; index++) {
    if (index % 2 == 0) {
      mapOfKeyValue.push([list[index], list[index + 1]]);
    }
  }
  return mapOfKeyValue;
};

class MalHashMap extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    const mapOfKeyValue = zipmap(this.value)

    return '{' + mapOfKeyValue.map(([key, value]) => {
      return [key, value + ','].join(' ');
    }).join(' ').slice(0, -1).trim() + '}'
  }
}

class MalNil extends MalValue {
  constructor(value) {
    super(null);
  }

  pr_str() {
    return 'nil';
  }

  equal(newNil) {
    return this.value === newNil.value;
  }
}

class MalBoolen extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return this.value.toString();
  }

  equal(newBool) {
    return this.value === newBool.value;
  }
}

class MalKeyword extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return this.value.toString();
  }

  equal(newKeyword) {
    return this.value === newKeyword.value;
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  // toString() {
  //   return this.value;
  // }

  pr_str(print_readably = false) {
    console.log("in pr_str", print_readably);
    if (print_readably) {
      return '"' + this.value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }
    return this.value;
  }
}

const createMalString = (str) => {
  return str.replace(/\\(.)/g, (y, captured) => captured === "n" ? "\n" : captured)
};

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn) {
    super(ast);
    this.binds = binds;
    this.oldEnv = env;
    this.fn = fn
  }

  pr_str() {
    return '#<function>';
  }

  apply(context, args) {
    return this.fn.apply(context, args);
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return `(atom ${pr_str(this.value)
      })`;
  }

  deref() {
    return this.value;
  }

  reset(value) {
    this.value = value;
    return this.value;
  }

  swap(f, args) {
    this.value = f.apply(null, [this.value, ...args]);
    return this.value;
  }
}

module.exports = { MalKeyword, MalSymbol, MalValue, MalList, MalVector, MalNil, MalBoolen, pr_str, MalHashMap, MalString, MalFunction, createMalString, MalAtom, MalSequence };