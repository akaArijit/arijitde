const ts = require('typescript');
const program = ts.createProgram(['src/types/admin.ts'], { noEmit: true, strict: true });
const diagnostics = program.getSyntacticDiagnostics().concat(program.getSemanticDiagnostics());
diagnostics.forEach(d => {
  if (d.file) {
    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
    console.log(`Line ${line + 1}, Col ${character + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  }
});