function codeGenerator(size = 4) {
  let code = "";
  for (let i = 0; i < size; i++) {
    const digits = Math.floor(Math.random() * 9);
    code += digits.toString();
  }
  return code;
}

module.exports = codeGenerator;
