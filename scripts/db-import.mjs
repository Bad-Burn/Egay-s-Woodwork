/**
 * Import schema.sql (and optionally your local artwork rows) into a remote
 * MySQL such as Railway.
 *
 *   1. In Railway: MySQL service -> Variables -> copy MYSQL_PUBLIC_URL
 *      (the public one, NOT mysql.railway.internal -- that only resolves
 *      inside Railway's own network and Vercel cannot reach it).
 *   2. Add it to .env.local as:  REMOTE_MYSQL_URL=mysql://user:pass@host:port/db
 *   3. Run:
 *        node scripts/db-import.mjs             # schema only
 *        node scripts/db-import.mjs --with-data # schema + copy local artworks
 *
 * Safe to re-run: every CREATE is "IF NOT EXISTS" and rows are matched on title.
 */
import { config } from 'dotenv';
import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
config({ path: path.join(ROOT, '.env.local') });

const url = process.env.REMOTE_MYSQL_URL;
if (!url) {
  console.error('\nREMOTE_MYSQL_URL is not set in .env.local.');
  console.error('Copy MYSQL_PUBLIC_URL from Railway (MySQL -> Variables) and add:');
  console.error('  REMOTE_MYSQL_URL=mysql://user:password@host:port/railway\n');
  process.exit(1);
}

const withData = process.argv.includes('--with-data');
const safeHost = (() => {
  try { return new URL(url).host; } catch { return '(unparseable URL)'; }
})();

console.log(`Target: ${safeHost}`);
if (safeHost.includes('railway.internal')) {
  console.error('\nThat is the PRIVATE Railway host. It only works from inside');
  console.error('Railway. Use MYSQL_PUBLIC_URL instead.\n');
  process.exit(1);
}

// mysql2 does not understand the "?ssl-mode=REQUIRED" query parameter that
// Aiven puts in its Service URI, so translate it into a real ssl option.
// Without this the server rejects the connection outright.
const parsed = new URL(url);
const wantsSsl =
  /ssl-mode=required/i.test(parsed.search) || parsed.hostname.includes('aivencloud.com');

const remote = await mysql.createConnection({
  host: parsed.hostname,
  port: Number(parsed.port || 3306),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.replace(/^\//, ''),
  ssl: wantsSsl ? { rejectUnauthorized: false } : undefined,
  multipleStatements: true,
});
console.log(`Connected${wantsSsl ? ' (TLS)' : ''}.\n`);

// ---- Schema -------------------------------------------------------------
const sql = readFileSync(path.join(ROOT, 'schema.sql'), 'utf8');
const statements = sql
  .split(';')
  .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
  .filter(Boolean);

for (const statement of statements) {
  const name = statement.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/i)?.[1];
  await remote.query(statement);
  console.log(`  ✓ table ready: ${name ?? statement.slice(0, 40)}`);
}

const [tables] = await remote.query('SHOW TABLES');
console.log(`\nTables now on remote: ${tables.map((t) => Object.values(t)[0]).join(', ')}`);

// ---- Optional data copy -------------------------------------------------
if (withData) {
  console.log('\nCopying artworks from your local database...');
  const local = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [rows] = await local.execute('SELECT * FROM artworks ORDER BY id');
  let copied = 0;
  let skipped = 0;

  for (const r of rows) {
    const [[dup]] = await remote.execute(
      'SELECT COUNT(*) AS n FROM artworks WHERE title = ?',
      [r.title]
    );
    if (dup.n > 0) { skipped++; console.log(`  – skipped (already there): ${r.title}`); continue; }

    await remote.execute(
      `INSERT INTO artworks
         (title, image_url, category, medium, dimensions, year_created, price, status, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [r.title, r.image_url, r.category, r.medium, r.dimensions,
       r.year_created, r.price, r.status, r.description, r.created_at]
    );
    copied++;
    console.log(`  ✓ copied: ${r.title}`);
  }

  console.log(`\nCopied ${copied}, skipped ${skipped}.`);
  await local.end();
}

await remote.end();
console.log('\nDone. Remember to set the same MYSQL_* values in Vercel.\n');
