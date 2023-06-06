const { Env } = require("./env");
const { MalSymbol, MalBoolen, MalNil, MalList, MalVector, MalKeyword, MalString, MalAtom } = require("./types");
const { read_str } = require("./reader")
const fs = require("fs")

const areBothArrays = function (array1, array2) {
  return Array.isArray(array1) && Array.isArray(array2);
};

const isOfSameType = (type, value1, value2) => {
  return (value1 instanceof type) && (value2 instanceof type);
};

const deepEqual = function (list1, list2) {

  if (isOfSameType(MalBoolen, list1, list2)) {
    return list1.value === list2.value;
  }

  if (isOfSameType(MalNil, list1, list2)) {
    return true;
  }

  if (isOfSameType(MalKeyword, list1, list2)) {
    return list1.value === list2.value;
  }

  if (isOfSameType(MalString, list1, list2)) {
    return list1.value === list2.value;
  }

  if (!areBothArrays(list1.value, list2.value)) {
    return list1 === list2;
  }

  if (list1.value.length !== list2.value.length) {
    return false;
  }

  for (let index = 0; index < list1.value.length; index++) {
    if (!deepEqual(list1.value[index], list2.value[index])) {
      return false;
    }
  }

  return true;
};

const greaterThan = (first, second) => first > second;
const lessThan = (first, second) => first < second;
const lessThanEquals = (first, second) => first <= second;
const greaterThanEquals = (first, second) => first >= second;

const compare = (args, operator) => {
  const operatorMap = {
    '>': greaterThan,
    '<': lessThan,
    '>=': greaterThanEquals,
    '<=': lessThanEquals
  }
  const func = operatorMap[operator];

  const result = args.every((first, index, list) => {
    return !list[index + 1] ? true : func(first, list[index + 1]);
  });

  return new MalBoolen(result);
}

const countBlock = (args) => {
  const [element] = args;

  if (element instanceof MalList || element instanceof MalVector) {
    return element.value.length;
  }
  if (element instanceof MalNil) {
    return 0;
  }

  return args.length;
};

const empty = (args) => {
  return args.value.length === 0;
};

const str = (args) => {
  if (Array.isArray(args.value)) {
    console.log(args.value);
    return args.map(a => a.value).join('');
  }
  return args ? args.toString() : '\"\"';
};

const prnBlock = (...args) => {
  args.map(ele => {
    let value = '';
    if (ele.value) {
      value = ele.value;
    }
    return value;
  });

  console.log(args.join(' '));
  return 'nil';
};

const not = args => {
  if (typeof args === 'number') {
    return false;
  }
  return !args.value;
};

const printlnBlock = (args) => {
  if (args === undefined) {
    console.log();
    return 'nil';
  }
  console.log(args.value);
  return 'nil';
};

const ns = {
  '+': (...args) => args.reduce(((a, b) => a + b)),
  '*': (...args) => args.reduce(((a, b) => a * b)),
  '-': (...args) => args.reduce(((a, b) => a - b)),
  '/': (...args) => args.reduce(((a, b) => a / b)),
  '=': (a, b) => deepEqual(a, b),
  '>': (...args) => compare(args, '>'),
  '>=': (...args) => compare(args, '>='),
  '<=': (...args) => compare(args, '<='),
  '<': (...args) => compare(args, '<'),
  'count': (...args) => countBlock(args),
  'list': (...args) => new MalList(args),
  'list?': (args) => args instanceof MalList,
  'empty?': empty,
  'not': not,
  'str': (...args) => str(args),
  'prn': prnBlock,
  'println': printlnBlock,
  'read-string': args => read_str(args),
  'slurp': filename => new MalString(fs.readFileSync(filename, "utf-8")),
  'atom': args => new MalAtom(args),
  'atom?': args => args instanceof MalAtom,
  'deref': atom => atom.deref(),
  'reset!': (atom, value) => atom.reset(value),
  'swap!': (atom, f, ...args) => atom.swap(f, args)
}

const createEnv = () => {
  const env = new Env();
  Object.keys(ns).map(key => {
    env.set(new MalSymbol(key), ns[key]);
  })
  return env;
}

module.exports = { createEnv };
