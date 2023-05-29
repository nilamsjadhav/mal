const { MalValue, MalSymbol, MalList, MalVector, MalNil, MalBoolen, MalHashMap } = require("./types");

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const char = this.peek();
    this.position++;
    return char;
  }
}

const tokenize = (str) => {
  const reg_exp = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;

  return [...str.matchAll(reg_exp)].map(char => char[1]).slice(0, -1);
};

const read_atom = reader => {
  const token = reader.next();
  const reg = /^-?[0-9]+$/;

  if (token.match(reg)) {
    return parseInt(token);
  }
  if (token === 'true') {
    return new MalBoolen(true);
  }
  if (token === 'false') {
    return new MalBoolen(false);
  }
  if (token === 'nil') {
    return new MalNil(undefined);
  }
  return new MalSymbol(token);
};

const read_seq = (reader, closingSymbol) => {
  const ast = [];

  reader.next();
  while (reader.peek() !== closingSymbol) {
    if (reader.peek() === undefined) {
      throw 'unbalanced';
    }
    ast.push(read_form(reader));
  }
  reader.next();
  return ast;

};

const read_list = reader => {
  const ast = read_seq(reader, ')')
  return new MalList(ast);
};

const read_vector = reader => {
  const ast = read_seq(reader, ']')
  return new MalVector(ast);
};

const read_hashMap = reader => {
  const ast = read_seq(reader, '}')
  return new MalHashMap(ast);
};

const read_form = reader => {
  const token = reader.peek();

  switch (token[0]) {
    case '(':
      return read_list(reader);
    case '[':
      return read_vector(reader);
    case '{':
      return read_hashMap(reader);
    default:
      return read_atom(reader);
  }
};

const read_str = str => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };