const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = `${dir}/${file}`;
        if (fs.statSync(name).isDirectory()) {
            if (!name.includes('node_modules') && !name.includes('.git')) {
                getFiles(name, files);
            }
        } else {
            if (name.endsWith('.js') || name.endsWith('.hbs') || name.endsWith('.html')) {
                files.push(name);
            }
        }
    }
    return files;
}

const allFiles = getFiles('.');
const tables = new Set();
const regexes = [
    /FROM\s+([a-zA-Z0-9_\.]+)/gi,
    /INTO\s+([a-zA-Z0-9_\.]+)/gi,
    /UPDATE\s+([a-zA-Z0-9_\.]+)/gi,
    /getAllFrom\(["']([a-zA-Z0-9_\.]+)["']/gi,
    /getAllFromWhere\(["']([a-zA-Z0-9_\.]+)["']/gi,
    /getOneFromWhere\(["']([a-zA-Z0-9_\.]+)["']/gi
];

for (const f of allFiles) {
    const content = fs.readFileSync(f, 'utf8');
    for (const r of regexes) {
        let match;
        while ((match = r.exec(content)) !== null) {
            let t = match[1].toLowerCase();
            if (t !== 'where' && t !== 'set' && t !== 'values' && !t.includes('this.')) {
                if(t.startsWith('appointcutdb.')) t = t.replace('appointcutdb.', '');
                tables.add(t);
            }
        }
    }
}
console.log(Array.from(tables).sort().join('\n'));
