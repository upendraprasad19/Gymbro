import {readFileSync} from 'node:fs';
import {foundersData,coachesData,peopleDisclosure,founderDisclosure} from './people.mjs';
import {gymInstagram,personSocial} from '../dist/social-profiles.mjs';
const original=readFileSync(new URL('./legacy.html',import.meta.url),'utf8');
const destinations={home:'index.html',training:'club.html#training',club:'club.html',memberships:'membership.html',fuel:'fuel.html'};
export const relink=html=>html.replace(/href="#(home|training|club|memberships|fuel)"/g,(_,id)=>`href="${destinations[id]}"`);
export function legacy(id){
 const result=original.match(new RegExp(`<section\\b[^>]*\\bid="${id}"[\\s\\S]*?<\\/section>`));
 if(!result)throw new Error(`Missing legacy section ${id}`);
 return relink(result[0]);
}
export const dialogs=original.slice(original.indexOf('<dialog'),original.indexOf('</body>'));
export const kicker=(left,right='GYMBRO / Jamshedpur')=>`<div class="section-kicker"><span>${left}</span><span>${right}</span></div>`;
export function mast({number,title,description,image='arena.jpg',label='The GYMBRO club'}){
 return `<section class="page-mast" style="--mast-image:url('assets/${image}')"><div class="mast-image" aria-hidden="true"></div><div class="mast-copy"><p class="eyebrow">GYMBRO / ${number} — ${label}</p><h1>${title}</h1><p>${description}</p></div><span class="mast-note">AI concept imagery</span></section>`;
}
export function founders({detailed=false}={}){return `${founderDisclosure}<div class="founder-grid">${foundersData.map((person,i)=>`<article class="founder reveal"><div class="founder-photo"><img src="assets/people/${person.image}.jpg" alt="AI-generated fictional portrait used as a placeholder for ${person.name}" loading="lazy"><span class="portrait-label">AI sample portrait / 0${i+1}</span></div><div class="founder-caption"><div><p class="micro-label">Co-founder / GYMBRO</p><h3>${person.name}</h3></div></div><p class="profile-focus">${person.focus}</p>${personSocial(person.name)}${detailed?`<h4 class="founder-line">${person.line}</h4><p class="founder-bio">${person.copy}</p>`:''}</article>`).join('')}</div>`;}
export const team=({detailed=false}={})=>`${peopleDisclosure}<div class="coach-grid">${coachesData.map((person,i)=>`<article class="coach-profile reveal"><div class="coach-photo"><img src="assets/people/${person.image}.jpg" alt="AI-generated fictional portrait used as a placeholder for coach ${person.name}" loading="lazy"><span class="portrait-label">AI sample portrait</span><span class="coach-photo-number" aria-hidden="true">0${i+1}</span></div><div class="coach-caption"><h3>${person.name}</h3></div><p class="profile-focus">${person.focus}</p>${personSocial(person.name)}${detailed?`<h4>${person.line}</h4><p class="coach-bio">${person.copy}</p><button class="text-link" data-trial>Explore a trial <span>↗</span></button>`:''}</article>`).join('')}</div>`;
export const avyaFeature=()=>`<section class="avya-feature section-pad">${kicker('Beyond the gym','AVYA / Live on the web')}<div class="avya-feature-layout"><h2>THE WORK<br>CONTINUES.<br><em>AVYA.</em></h2><div><p>Make training, nutrition and progress part of the same routine.</p><a class="button light-button" href="avya.html">Meet AVYA <span>↗</span></a><a class="text-link light" href="https://app.icanbefitter.com/" target="_blank" rel="noopener">Open the web app <span>↗</span></a></div></div></section>`;
export const closing=()=>`<section class="closing section-pad"><p class="eyebrow">Your next chapter</p><h2>MAKE YOUR MOVE.</h2><a class="text-link" href="membership.html">Explore membership <span>↗</span></a></section>`;

export const socialFeature=()=>`<section class="social-feature section-pad" aria-labelledby="social-title">${kicker("Stay close to the club","GYMBRO / Instagram")}<div class="social-feature-layout"><h2 class="display" id="social-title">LIFE AT<br><em>GYMBRO.</em></h2><div><p>The sessions. The people. The next personal best.<br>Follow the club beyond the gym floor.</p><a class="button blue" href="${gymInstagram.url}" target="_blank" rel="noopener noreferrer">Follow GYMBRO on Instagram <span aria-hidden="true">↗</span></a><a class="social-handle" href="${gymInstagram.url}" target="_blank" rel="noopener noreferrer">${gymInstagram.handle}</a></div></div></section>`;
