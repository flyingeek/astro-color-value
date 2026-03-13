import { readFile } from 'node:fs/promises';
import process from 'node:process';

const indexPath = 'src/content/docs/index.mdx';
const htmlPath = 'src/content/docs/html.mdx';

function normalize(text) {
  return text.replace(/\r\n/g, '\n').trimEnd();
}

async function main() {
  const [indexRaw, htmlRaw] = await Promise.all([
    readFile(indexPath, 'utf8'),
    readFile(htmlPath, 'utf8'),
  ]);

  if (normalize(indexRaw) === normalize(htmlRaw)) {
    console.log('check:home-sync OK - index.mdx and html.mdx are identical.');
    return;
  }

  console.error('check:home-sync FAILED');
  console.error('Files differ:');
  console.error(`- ${indexPath}`);
  console.error(`- ${htmlPath}`);
  console.error('Keep both files identical to avoid dev/prod homepage drift.');
  process.exit(1);
}

main().catch((error) => {
  console.error('check:home-sync FAILED');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
