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
  const forms = new MalList(new MalSymbol('do'), ast.value.slice(1));

  for (let index = 0; index < newAst.value.length; index += 2) {
    newEnv.set(newAst.value[index], EVAL(newAst.value[index + 1], newEnv));
  }

  return [newEnv, ...forms];
};

const defBlock = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const isFalse = result => {
  return result.value === false || result.value === 'false';
}

const ifBlock = (ast, env) => {
  const [_, pred, trueBlock, falseBlock] = ast.value;
  const result = EVAL(pred, env);

  if (isFalse(result)) {
    return ast.value[3] !== undefined ? falseBlock : new MalNil();
  }
  return trueBlock;
};

const doBlock = (ast, env) => {
  // remove do
  const newAst = ast.value.slice(1);
  newAst.slice(0, -1).map(ele => EVAL(ele, env));
  return newAst.slice(-1);
}

const fnBlock = (ast, env) => {
  const [, params, fnBody] = ast.value;
  return (...args) => {
    const newEnv = new Env(env);

    for (let index = 0; index < params.value.length; index++) {
      newEnv.set(params.value[index], args[index]);
    }
    return EVAL(fnBody, newEnv);
  };
}

const EVAL = (ast, env) => {
  while (true) {
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
        [env, ast] = letBlock(ast, env);
        break;
      case 'do':
        ast = doBlock(ast, env);
        break;
      case 'if':
        return ifBlock(ast, env);
      case 'fn*':
        return fnBlock(ast, env);
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        return fn.apply(null, args);
    }
  }

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