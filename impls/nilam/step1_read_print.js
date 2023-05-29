const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const READ = (arg) => read_str(arg);

const EVAL = (arg) => arg;

const PRINT = (arg) => pr_str(arg);

const rep = (arg) => (PRINT(EVAL(READ(arg))));

const repl = () =>
  rl.question('user> ', line => {
    try {
      console.log(rep(line))
    } catch (error) {
      console.log(error);
    }
    repl();
  });

repl();

