const { Env } = require("./env");
const { MalSymbol, MalBoolen, MalNil, MalKeyword, MalList } = require("./types");

const equalTo = (args) => args.reduce(((a, b) => a === b));

const equal = (...args) => {
  const [firstEle,] = args
  if (firstEle instanceof MalNil) {
    return args.every((ele) => {
      return ele instanceof MalNil;
    })
  }

  if (firstEle instanceof MalBoolen) {
    const result = args.every((first, index, list) => {
      return !list[index + 1] ? true : first.value === list[index + 1].value;
    });
    return result;
  }

  if (firstEle instanceof MalKeyword) {
    return args.reduce((first, second) => first.equal(second));
  }

  return equalTo(args);
}

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
  // console.log(args);
  if (Array.isArray(args)) {
    // return args.join('');
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
  console.log(!args, args);
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
  env.set(new MalSymbol('='), (...args) => equal(...args));
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