// Confirmed destinations and deliberately non-clickable preview aliases.
export const gymInstagram={handle:'@gym.br0_',url:'https://www.instagram.com/gym.br0_/'};
export const avyaUrl='https://app.icanbefitter.com/';
const profiles={
 Upendra:{handle:'@icanbefitter',url:'https://www.instagram.com/icanbefitter/'},
 Vicky:{handle:'@vicky.gymbro',alias:true},
 Rohit:{handle:'@rohit.gymbro',alias:true},
 Sameer:{handle:'@sameer.gymbro',alias:true},
 Amit:{handle:'@amit.gymbro',alias:true}
};
export function personSocial(name){
 const profile=profiles[name];
 if(!profile)return '';
 return profile.alias?`<p class="profile-social profile-social-alias"><span>${profile.handle}</span><small>Placeholder handle</small></p>`:`<a class="profile-social" href="${profile.url}" target="_blank" rel="noopener noreferrer" aria-label="${name} on Instagram, ${profile.handle}"><span>${profile.handle}</span><small>Instagram ↗</small></a>`;
}
