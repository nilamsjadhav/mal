const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { Env } = require("./env")
const { MalSymbol, MalList, MalValue, MalVector, MalHashMap, MalNil } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (arg) => read_str(arg);

const _env = {
  '+': (...args) => args.reduce(((a, b) => a + b)),
  '*': (...args) => args.reduce(((a, b) => a * b)),
  '-': (...args) => args.reduce(((a, b) => a - b)),
  '/': (...args) => args.reduce(((a, b) => a / b))
};

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

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) {
    return ast;
  }

  switch (ast.value[0].value) {
    case 'def!':
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);
    case 'let*':
      const newEnv = new Env(env);
      const newAst = ast.value[1];

      for (let index = 0; index < newAst.value.length; index += 2) {
        newEnv.set(newAst.value[index], EVAL(newAst.value[index + 1], newEnv));
      }

      return EVAL(ast.value[2], newEnv);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = arg => pr_str(arg);

const env = new Env();
env.set(new MalSymbol('+'), (...args) => args.reduce(((a, b) => a + b)));
env.set(new MalSymbol('*'), (...args) => args.reduce(((a, b) => a * b)));
env.set(new MalSymbol('-'), (...args) => args.reduce(((a, b) => a - b)));
env.set(new MalSymbol('/'), (...args) => args.reduce(((a, b) => a / b)));

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