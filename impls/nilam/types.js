const pr_str = (malValue, print_readably = false) => {
  if (malValue instanceof MalValue) {
    return malValue.pr_str(print_readably);
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

  isEmpty() {
    return this.value.length == 0;
  }

  nth(n) {
    if (n >= this.value.length) {
      throw "Index out of range";
    }
    return this.value[n];
  }

  first() {
    if (this.isEmpty()) {
      return new MalNil();
    }
    return this.nth(0);
  }

  rest() {
    return new MalList(this.value.slice(1));
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

  pr_str(print_readably = false) {
    const mapOfKeyValue = zipmap(this.value)
    const keyValMapping = mapOfKeyValue.map(([key, value]) =>
      [pr_str(key, true), value + ','].join(' '));

    return '{' + keyValMapping.join(' ').slice(0, -1).trim() + '}'
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

  first() {
    return this.pr_str();
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

  pr_str(print_readably = false) {
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

  pr_str(print_readably = false) {
    if (print_readably) {
      const value = '"' + this.value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
      return value;
    }

    return this.value.toString();
  }
}

const createMalString = (str) => {
  const char = str.replace(/\\(.)/g, (y, captured) => captured === "n" ? "\n" : captured)
  return new MalString(char);
};

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn, isMacros = false) {
    super(ast);
    this.binds = binds;
    this.oldEnv = env;
    this.fn = fn;
    this.isMacros = isMacros
  }

  pr_str(print_readably = false) {
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

  pr_str(print_readably = false) {
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