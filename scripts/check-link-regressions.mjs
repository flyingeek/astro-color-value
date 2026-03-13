import { readFile } from 'node:fs/promises';
import process from 'node:process';

const checks = [
  {
    file: 'dist/reference/tag_t/index.html',
    mustInclude: 'href="../tag_n/"',
    description: 'tag_t should link to sibling tag_n with ../tag_n/',
  },
];

async function main() {
  let hasFailures = false;

  for (const check of checks) {
    const content = await readFile(check.file, 'utf8');
    if (!content.includes(check.mustInclude)) {
      hasFailures = true;
      console.error(`check:link-regressions FAILED - ${check.description}`);
      console.error(`Expected to find ${check.mustInclude} in ${check.file}`);
    }
  }

  if (hasFailures) {
    process.exit(1);
  }

  console.log('check:link-regressions OK - no known regressions found.');
}

main().catch((error) => {
  console.error('check:link-regressions FAILED');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
