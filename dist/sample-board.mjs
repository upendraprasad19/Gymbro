// Fictional identities/results for visual review. Never written to a record service.
export const sampleDefinitions=[
 {id:'deadlift-v1',group:'strength',label:'Deadlift',unit:'kg',comparison:'higher',rulesVersion:1,rules:'Sample conditions: conventional deadlift, completed lockout, no lifting straps.'},
 {id:'squat-v1',group:'strength',label:'Back squat',unit:'kg',comparison:'higher',rulesVersion:1,rules:'Sample conditions: barbell back squat to agreed depth, no supportive suit.'},
 {id:'bench-v1',group:'strength',label:'Bench press',unit:'kg',comparison:'higher',rulesVersion:1,rules:'Sample conditions: paused barbell bench press, completed lockout.'},
 {id:'pullups-v1',group:'bodyweight',label:'Strict pull-ups',unit:'reps',comparison:'higher',rulesVersion:1,rules:'Sample conditions: overhand grip, full hang to chin over bar, one continuous set.'},
 {id:'pushups-v1',group:'bodyweight',label:'Push-ups',unit:'reps',comparison:'higher',rulesVersion:1,rules:'Sample conditions: full-range repetitions in one continuous set.'},
 {id:'row-500-demo',group:'endurance',label:'500 m row',unit:'seconds',comparison:'lower',rulesVersion:1,rules:'Sample conditions: 500 metres on the same indoor rower. Lower time wins.'}
];
const members={arjun:{memberName:'Arjun Mehta',instagramAlias:'@arjun.gymbro',portraitUrl:'assets/people/member-arjun.jpg'},meera:{memberName:'Meera Rao',instagramAlias:'@meera.gymbro',portraitUrl:'assets/people/member-meera.jpg'},kabir:{memberName:'Kabir Sethi',instagramAlias:'@kabir.gymbro',portraitUrl:'assets/people/member-kabir.jpg'}};
function record(id,member,definitionId,value,achievedOn,divisionId){return {id,...members[member],definitionId,divisionId,value,achievedOn,approvedAt:achievedOn+'T12:00:00Z',sample:true};}
export const sampleRecords=[
 record('sample-dl-current','arjun','deadlift-v1',205,'2026-10-18','Men · Open'),
 record('sample-squat-current','meera','squat-v1',85,'2026-10-16','Women · Open'),
 record('sample-bench-current','kabir','bench-v1',105,'2026-10-20','Men · Open'),
 record('sample-pull-current','arjun','pullups-v1',22,'2026-10-14','Men · Open'),
 record('sample-pull-tie','kabir','pullups-v1',22,'2026-10-19','Men · Open'),
 record('sample-push-current','meera','pushups-v1',42,'2026-10-21','Women · Open'),
 record('sample-row-current','kabir','row-500-demo',96,'2026-10-17','Men · Open'),
 record('sample-row-women','meera','row-500-demo',116,'2026-10-12','Women · Open'),
 record('sample-dl-history','arjun','deadlift-v1',190,'2026-08-22','Men · Open'),
 record('sample-squat-history','meera','squat-v1',75,'2026-09-04','Women · Open'),
 record('sample-bench-history','kabir','bench-v1',95,'2026-08-30','Men · Open'),
 record('sample-row-history','kabir','row-500-demo',105,'2026-09-08','Men · Open')
];
