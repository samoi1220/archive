const fs = require('fs');
const path = require('path');

const FILES = [
  { file: '人文史哲類(YH)-表格 1.csv', category: '人文史哲', prefix: 'YH' },
  { file: '心理學類(YP)-表格 1.csv', category: '心理學', prefix: 'YP' },
  { file: '文學類(YR)-表格 1.csv', category: '文學', prefix: 'YR' },
  { file: '財經類(YF)-表格 1.csv', category: '財經', prefix: 'YF' },
  { file: '設計類(YD)-表格 1.csv', category: '設計', prefix: 'YD' },
  { file: '語言類(YL)-表格 1.csv', category: '語言', prefix: 'YL' },
  { file: '繪畫類(YW)-表格 1.csv', category: '繪畫', prefix: 'YW' },
];

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i+1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row=[]; cell=''; }
      else if (c === '\r') {}
      else cell += c;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const all = [];
const remarks = {};
const excluded = { sold: 0, deleted: 0, moved: 0 };

for (const f of FILES) {
  const text = fs.readFileSync(path.join('/sessions/gifted-admiring-euler/mnt/uploads/', f.file), 'utf8');
  const rows = parseCSV(text);
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || !r[1] || !r[0].trim()) continue;
    const note = (r[10] || '').trim();
    if (note) remarks[note] = (remarks[note]||0)+1;
    if (note === '售出' || note === '已售出') { excluded.sold++; continue; }
    if (note === '刪除') { excluded.deleted++; continue; }
    if (note.startsWith('轉到')) { excluded.moved++; continue; }
    let year = (r[5] || '').trim();
    if (year.includes('/')) year = year.split('/')[0];
    let title = (r[1] || '').trim();
    all.push({
      id: r[0].trim(),
      title,
      author: (r[2] || '').trim(),
      translator: (r[3] || '').trim(),
      publisher: (r[4] || '').trim(),
      year,
      edition: (r[6] || '').trim(),
      price: (r[7] || '').trim().replace(/[^\d]/g,''),
      isbn: (r[8] || '').trim(),
      binding: (r[9] || '').trim(),
      category: f.category,
      tags: [],
      status: '',
      summary: '',
      coreIdea: '',
      myThoughts: '',
      designLessons: '',
      authorBg: '',
      publishBg: '',
      appliedProjects: '',
      addedAt: '',
      remark: note
    });
  }
}

console.log('Total imported:', all.length);
console.log('Excluded:', excluded);
console.log('\nUnique remarks (with count):');
Object.entries(remarks).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`  "${k}" × ${v}`));
console.log('\nBy category:');
const cats = {};
all.forEach(b => cats[b.category]=(cats[b.category]||0)+1);
console.log(cats);

fs.writeFileSync('/sessions/gifted-admiring-euler/mnt/outputs/books.json', JSON.stringify(all, null, 2));
console.log('\nWrote books.json (' + fs.statSync('/sessions/gifted-admiring-euler/mnt/outputs/books.json').size + ' bytes)');
