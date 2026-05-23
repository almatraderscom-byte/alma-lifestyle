import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const example = join(root, '.env.example');
const local = join(root, '.env.local');

if (!existsSync(local) && existsSync(example)) {
  copyFileSync(example, local);
  console.log(
    '[alma-lifestyle] Created .env.local from .env.example — edit Supabase keys when you connect the database.'
  );
}
