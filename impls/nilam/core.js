const { Env } = require("./env");
const { MalSymbol, MalBoolen, MalNil, MalKeyword, MalList } = require("./types");

const areBothArrays = function (array1, array2) {
  return Array.isArray(array1) && Array.isArray(array2);
};

const deepEqual = function (list1, list2) {
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

const countBlock = (ast, env) => {
  if (ast[0] instanceof MalList) {
    return EVAL(ast[1], env).length;
  }
  if (ast[0] instanceof MalNil) {
    return 0;
  }
  const value = ast.slice(1);
  return value[0] ? value.length : 0;
};

const empty = (args) => {
  return args.value.length === 0;
};

const str = (args) => {
  if (Array.isArray(args)) {
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

const createEnv = () => {
  const env = new Env();
  env.set(new MalSymbol('+'), (...args) => args.reduce(((a, b) => a + b)));
  env.set(new MalSymbol('*'), (...args) => args.reduce(((a, b) => a * b)));
  env.set(new MalSymbol('-'), (...args) => args.reduce(((a, b) => a - b)));
  env.set(new MalSymbol('/'), (...args) => args.reduce(((a, b) => a / b)));
  env.set(new MalSymbol('='), (a, b) => deepEqual(a, b));
  env.set(new MalSymbol('>'), (...args) => compare(args, '>'));
  env.set(new MalSymbol('<'), (...args) => compare(args, '<'));
  env.set(new MalSymbol('>='), (...args) => compare(args, '>='));
  env.set(new MalSymbol('<='), (...args) => compare(args, '<='));
  env.set(new MalSymbol('<='), (...args) => compare(args, '<='));
  env.set(new MalSymbol('count'), (...args) => countBlock(args, env));
  env.set(new MalSymbol('list'), (...args) => new MalList(args));
  env.set(new MalSymbol('list?'), (...args) => args.slice(1) instanceof MalList);
  env.set(new MalSymbol('empty?'), empty);
  env.set(new MalSymbol('not'), not);
  env.set(new MalSymbol('str'), (...args) => str(args));
  env.set(new MalSymbol('prn'), prnBlock);
  return env;
}

module.exports = { createEnv };
