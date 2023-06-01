const pr_str = malValue => {
  if (malValue instanceof MalValue) {
    return malValue.pr_str();
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

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '(' + this.value.map(pr_str).join(' ') + ')';
  }

  isEmpty() {
    return this.value.length == 0;
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '[' + this.value.map(pr_str).join(' ') + ']';
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
    console.log(this.value);
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

module.exports = { MalKeyword, MalSymbol, MalValue, MalList, MalVector, MalNil, MalBoolen, pr_str, MalHashMap };