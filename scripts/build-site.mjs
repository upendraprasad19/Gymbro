import {mkdir,writeFile} from 'node:fs/promises';
import {renderLayout} from '../site/layout.mjs';
const pages=[['index','home','The club, the people, the work'],['club','club','The Club'],['story','story','Our Story'],['coaches','coaches','Coaches'],['board','board','The Board'],['membership','membership','Membership'],['fuel','fuel','Fuel'],['avya','avya','AVYA'],['staff','staff','Staff access']];
await mkdir('dist',{recursive:true});
for(const [key,module,title] of pages){
 let page;
 try{page=await import(`../site/pages/${module}.mjs`);}catch(error){if(module==='staff'&&error.code==='ERR_MODULE_NOT_FOUND')continue;throw error;}
 await writeFile(`dist/${key}.html`,renderLayout({key,title,description:`${title}. Explore GYMBRO, Jamshedpur's training club.`,body:page.renderPage()}));
}
console.log('Built GYMBRO pages.');
