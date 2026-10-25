import {readFileSync} from 'node:fs';
export function renderPage(){return readFileSync(new URL('../story-content.html',import.meta.url),'utf8');}
