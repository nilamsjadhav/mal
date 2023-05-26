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

  return [...str.matchAll(reg_exp)].map(char => char[1]);
};

const read_atom = reader => {
  const token = reader.next();
  const reg = /^-?[0-9]+$/;
  if (token.match(reg)) {
    return parseInt(token);
  }

  return token;
};

const read_list = reader => {
  const ast = [];

  while (reader.peek() != ')') {
    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
};

const read_form = reader => {
  const token = reader.peek();

  switch (token[0]) {
    case '(':
      reader.next();
      return read_list(reader);
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