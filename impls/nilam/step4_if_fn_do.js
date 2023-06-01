const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { MalSymbol, MalList, MalVector, MalHashMap, MalNil } = require("./types");
const { createEnv } = require("./core.js");
const { Env } = require("./env");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (arg) => read_str(arg);

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast) ? env.get(ast) : ast.value;
  }
  if (ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env))
    return new MalList(newAst)
  }
  if (ast instanceof MalVector) {
    const newAst = ast.value.map(x => EVAL(x, env))
    return new MalVector(newAst)
  }
  if (ast instanceof MalHashMap) {
    const newAst = ast.value.map((x) => EVAL(x, env))
    return new MalHashMap(newAst)
  }

  return ast;
};

const letBlock = (ast, env) => {
  const newEnv = new Env(env);
  const newAst = ast.value[1];

  for (let index = 0; index < newAst.value.length; index += 2) {
    newEnv.set(newAst.value[index], EVAL(newAst.value[index + 1], newEnv));
  }

  return EVAL(ast.value[2], newEnv);
};

const defBlock = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const isFalse = result => {
  return result.value === false || result.value === 'false' || result.value === null;
}

const ifBlock = (ast, env) => {
  const [_, pred, trueBlock, falseBlock] = ast.value;
  const result = EVAL(pred, env);

  if (isFalse(result)) {
    return ast.value[3] ? EVAL(falseBlock, env) : new MalNil();
  }
  return EVAL(trueBlock, env);
};

const doBlock = (ast, env) => {
  const newAst = ast.value.slice(1);
  return newAst.map(ele => EVAL(ele, env)).slice(-1);
}

const fnBlock = (ast, env) => {
  const [, params, fnBody] = ast.value;
  return (...args) => {
    const newEnv = new Env(env, params.value, args);
    return EVAL(fnBody, newEnv);
  };
}

const countBlock = (ast, env) => {
  if (ast.value[1] instanceof MalList) {
    return EVAL(ast.value[1], env).value.length;
  }
  if (ast.value[1] instanceof MalNil) {
    console.log(ast.value[1]);
    return 0;
  }
  const value = ast.value.slice(1);
  return value[0] ? value.length : 0;
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) {
    return ast;
  }

  switch (ast.value[0].value) {
    case 'def!':
      return defBlock(ast, env);
    case 'let*':
      return letBlock(ast, env);
    case 'do':
      return doBlock(ast, env);
    case 'if':
      return ifBlock(ast, env);
    case 'count':
      return countBlock(ast, env);
    case 'list':
      return new MalList(ast.value.slice(1));
    case 'list?':
      return ast.value.slice(1) instanceof MalList;
    case 'empty?':
      return ast.value[1].value.length == 0;
    case 'fn*':
      return fnBlock(ast, env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = arg => pr_str(arg);

const env = createEnv();

const rep = arg => (PRINT(EVAL(READ(arg), env)));

const repl = () =>
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(error);
    }
    repl();
  });

repl();