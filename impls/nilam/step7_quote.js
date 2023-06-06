const readline = require("readline");
const { read_str, CommentException } = require("./reader");
const { pr_str } = require("./printer");
const { MalSymbol, MalList, MalVector, MalHashMap, MalNil, MalFunction, MalSequence } = require("./types");
const { createEnv } = require("./core.js");
const { Env } = require("./env");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (arg) => read_str(arg);

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
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
  const [, bindings, ...exprs] = ast.value;
  const forms = new MalList([new MalSymbol('do'), ...exprs]);

  for (let index = 0; index < bindings.value.length; index += 2) {
    newEnv.set(bindings.value[index], EVAL(bindings.value[index + 1], newEnv));
  }

  return [newEnv, forms];
};

const defBlock = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const isFalse = result => {
  return result.value === false || result.value === 'false' || result instanceof MalNil || result === false;
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
  const newAst = ast.value.slice(1);
  newAst.slice(0, -1).forEach(ele => EVAL(ele, env));
  return newAst[newAst.length - 1];
}

const fnBlock = (ast, env) => {
  const [, params, ...fnBody] = ast.value;
  const doForms = new MalList([new MalSymbol('do'), ...fnBody]);

  const fn = (...args) => {
    const newEnv = new Env(env, params.value, args);
    return EVAL(ast.value[2], newEnv)
  }
  return new MalFunction(doForms, params, env, fn);
}

const quasiquote = (ast, env) => {
  if (ast instanceof MalList && ast.beginsWith('unquote'))
    return ast.value[1];

  if (ast instanceof MalSequence) {
    let result = new MalList([]);
    const length = ast.value.length - 1;

    for (let index = length; index >= 0; index--) {
      const element = ast.value[index];

      if (element instanceof MalList &&
        element.beginsWith('splice-unquote')) {
        result = new MalList(
          [new MalSymbol('concat'),
          element.value[1], result]);
      } else {
        result = new MalList(
          [new MalSymbol('cons'),
          quasiquote(element, env), result]);
      }
    }
    if (result instanceof MalList) return result;

    return new MalList([new MalSymbol('vec'), result]);
  }

  if (ast instanceof MalSymbol) {
    return new MalList([new MalSymbol('quote'), ast]);
  }
  return ast;
};

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
        ast = ifBlock(ast, env);
        break;
      case 'quote':
        console.log(ast.value[1] instanceof MalList);
        return ast.value[1];
      case 'quasiquoteexpand':
        return quasiquote(ast.value[1], env);
      case 'quasiquote':
        ast = quasiquote(ast.value[1], env);
        break;
      case 'fn*':
        ast = fnBlock(ast, env);
        break;
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        console.log("args", args);
        console.log("fn", fn);
        if (fn instanceof MalFunction) {
          const newEnv = new Env(fn.oldEnv, fn.binds.value, args);
          env = newEnv;
          ast = fn.value;
        } else {
          return fn.apply(null, args);
        }
    }
  }

};

const PRINT = arg => pr_str(arg, true);

const env = createEnv();

const createReplEnv = () => {
  env.set(new MalSymbol('eval'), ast => EVAL(ast, env))
  env.set(new MalSymbol('*ARGV*'), new MalList(process.argv.slice(2)));
}

createReplEnv();

const rep = arg => (PRINT(EVAL(READ(arg), env)));

rep("(def! not (fn* [x] (if x false true)))")

rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');

const repl = () =>
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (e) {
      console.log(e);
    }
    repl();
  });

const main = () => {
  if (process.argv.length >= 3) {
    rep('(load-file "' + process.argv[2] + '")');
    rl.close();
  } else {
    repl();
  }
};

main();
