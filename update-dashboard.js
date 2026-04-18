import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.resolve(__dirname, '../Diseño de dashboard ciberseguridad/src/app/App.tsx');
const targetPath = path.resolve(__dirname, 'src/app/components/dashboard/index.tsx');

let content = fs.readFileSync(sourcePath, 'utf8');

// Replace imports
content = content.replace(/'\.\/components\//g, "'../");
content = content.replace(/'\.\/types'/g, "'../../types'");
content = content.replace(/'\.\/lib\//g, "'../../lib/");

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Dashboard component updated successfully.');
