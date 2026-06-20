const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

async function extract() {
  const policyPath = path.join(__dirname, "docs/Marco Normativo Relevante_/Política de Protección y Tratamiento de Datos Personales.docx");
  const termsPath = path.join(__dirname, "docs/Marco Normativo Relevante_/Terminos y condiciones_.docx");

  const policyResult = await mammoth.extractRawText({path: policyPath});
  const termsResult = await mammoth.extractRawText({path: termsPath});

  const splitIntoParagraphs = (text) => text.split("\n").filter(p => p.trim().length > 10);

  const outPath = path.join(__dirname, "src/constants/legalTexts.js");
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
  }

  const outContent = `
export const POLICY_TEXT = ${JSON.stringify(splitIntoParagraphs(policyResult.value), null, 2)};
export const TERMS_TEXT = ${JSON.stringify(splitIntoParagraphs(termsResult.value), null, 2)};
  `.trim();

  fs.writeFileSync(outPath, outContent);
  console.log("Extracted to src/constants/legalTexts.js");
}

extract();
