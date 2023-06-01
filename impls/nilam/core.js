const { Env } = require("./env");
const { MalSymbol, MalBoolen, MalNil } = require("./types");

const equal = (...args) => {
  const [firstEle,] = args
  if (firstEle instanceof MalNil) {
    return args.every((ele) => {
      return ele instanceof MalNil;
    })
  }
  if (firstEle instanceof MalBoolen) {
    return args.every((ele) => {
      return ele instanceof MalBoolen;
    })
  }

  return args.reduce(((a, b) => a === b));
}

const greaterThan = (...args) => {
  const result = args.every((first, index, list) => {
    return !list[index + 1] ? true : first > list[index + 1]
  });

  return new MalBoolen(result);
};

const lessThan = (...args) => {
  const result = args.every((first, index, list) => {
    return !list[index + 1] ? true : first < list[index + 1]
  });

  return new MalBoolen(result);
};

const lessThanEquals = (...args) => {
  const result = args.every((first, index, list) => {
    return !list[index + 1] ? true : first <= list[index + 1]
  });

  return result;
};

const greaterThanEquals = (...args) => {
  const result = args.every((first, index, list) => {
    return !list[index + 1] ? true : first >= list[index + 1]
  });

  return new MalBoolen(result);
};

const createEnv = () => {
  const env = new Env();
  env.set(new MalSymbol('+'), (...args) => args.reduce(((a, b) => a + b)));
  env.set(new MalSymbol('*'), (...args) => args.reduce(((a, b) => a * b)));
  env.set(new MalSymbol('-'), (...args) => args.reduce(((a, b) => a - b)));
  env.set(new MalSymbol('/'), (...args) => args.reduce(((a, b) => a / b)));
  env.set(new MalSymbol('='), equal);
  env.set(new MalSymbol('>'), greaterThan);
  env.set(new MalSymbol('<'), lessThan);
  env.set(new MalSymbol('>='), greaterThanEquals);
  env.set(new MalSymbol('<='), lessThanEquals);
  return env;
}

module.exports = { createEnv };