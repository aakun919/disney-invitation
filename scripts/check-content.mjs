import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('src/data');
const ERRORS = [];

function checkFile(filePath) {
  const ext = path.extname(filePath);
  
  // Only check .ts files
  if (ext !== '.ts') return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for [REPLACE]
  if (content.includes('[REPLACE]')) {
    ERRORS.push(`${filePath}: [REPLACE] ラベルが見つかりました`);
  }
  
  // Check for valid status values
  const statusMatch = content.match(/status:\s*"([^"]+)"/g);
  if (statusMatch) {
    for (const match of statusMatch) {
      const status = match.match(/"([^"]+)"/)[1];
      if (status !== 'sample' && status !== 'confirmed') {
        ERRORS.push(`${filePath}: 無効な status 値 "${status}"`);
      }
    }
  }
  
  // Check for basic DayPlan structure
  if (content.includes('export const') && content.includes('items')) {
    // Basic bracket balance check
    const brackets = (content.match(/\[/g) || []).length;
    const closingBrackets = (content.match(/\]/g) || []).length;
    if (brackets !== closingBrackets) {
      ERRORS.push(`${filePath}: brackets が不均衡`);
    }
  }
}

const dataDir = path.resolve('src/data'); // Use different variable name
const tsFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'));
for (const file of tsFiles) {
  checkFile(path.join(DATA_DIR, file));
}

if (ERRORS.length > 0) {
  console.error('check-content エラー:');
  ERRORS.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('check-content: すべて検証パス');
  process.exit(0);
}