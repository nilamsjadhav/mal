const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const READ = (arg) => arg;

const EVAL = (arg) => arg;

const PRINT = (arg) => arg;

const rep = (arg) => (PRINT(EVAL(READ(arg))));

const repl = () =>
  rl.question('user> ', line => {
    console.log(rep(line));
    repl();
  });

repl();

