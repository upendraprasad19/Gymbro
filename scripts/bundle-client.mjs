import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});
await build({stdin:{contents:"export {createClient} from '@supabase/supabase-js';",resolveDir:process.cwd()},bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true,outfile:'dist/vendor/supabase.js',legalComments:'eof'});
await copyFile('node_modules/@supabase/supabase-js/LICENSE','dist/vendor/supabase-LICENSE.txt');
console.log('Bundled pinned Supabase browser client.');
