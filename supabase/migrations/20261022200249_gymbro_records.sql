-- GYMBRO's isolated record service. Never apply to AVYA or another live project.
create schema gymbro_private;
revoke all on schema gymbro_private from public;
grant usage on schema gymbro_private to authenticated, anon;

create table gymbro_private.staff (
 user_id uuid primary key references auth.users(id), role text not null check(role in ('coach','approver')), active boolean not null default true
);
alter table gymbro_private.staff enable row level security;
create table public.record_definitions (
 id text primary key, discipline text not null check(discipline in ('strength','bodyweight','endurance')), label text not null,
 unit text not null, comparison text not null check(comparison in ('higher','lower')), rules text not null,
 rules_version integer not null check(rules_version>0), active boolean not null default false
);
create table public.record_divisions(id text primary key,label text not null,active boolean not null default true);
create table gymbro_private.submissions (
 id uuid primary key default gen_random_uuid(),definition_id text not null references public.record_definitions(id),division_id text not null references public.record_divisions(id),
 member_name text not null check(length(trim(member_name)) between 1 and 80), portrait_url text,
 value numeric not null check(value>0 and value<'Infinity'::numeric),achieved_on date not null,
 evidence_path text not null,coach_id uuid not null references auth.users(id),state text not null default 'pending' check(state in ('pending','changes_requested','rejected','approved','withdrawn')),
 version integer not null default 1,review_reason text not null default '',membership_verified boolean not null default false,
 idempotency_key uuid not null,supersedes_id uuid references gymbro_private.submissions(id),created_at timestamptz not null default now(),reviewed_at timestamptz,
 unique(coach_id,idempotency_key)
);
create unique index one_pending_revision on gymbro_private.submissions(supersedes_id) where state='pending' and supersedes_id is not null;
alter table gymbro_private.submissions enable row level security;
create index submissions_coach on gymbro_private.submissions(coach_id);
create table gymbro_private.audit (
 id bigint generated always as identity primary key,submission_id uuid not null references gymbro_private.submissions(id),actor_id uuid not null references auth.users(id),action text not null,from_state text,to_state text not null,version integer not null,reason text not null default '',created_at timestamptz not null default now()
);
alter table gymbro_private.audit enable row level security;
create table public.published_records (
 id uuid primary key references gymbro_private.submissions(id),definition_id text not null references public.record_definitions(id),division_id text not null references public.record_divisions(id),member_name text not null,portrait_url text,value numeric not null,achieved_on date not null,approved_at timestamptz not null
);
alter table public.record_definitions enable row level security;
alter table public.record_divisions enable row level security;
alter table public.published_records enable row level security;
revoke all on public.record_definitions,public.record_divisions,public.published_records from public,anon,authenticated;
grant select on public.record_definitions,public.record_divisions,public.published_records to anon,authenticated;
create policy event_read on public.record_definitions for select to anon,authenticated using(active);
create policy division_read on public.record_divisions for select to anon,authenticated using(active);
create policy published_read on public.published_records for select to anon,authenticated using(true);
revoke all on all tables in schema gymbro_private from public,anon,authenticated;
revoke all on all sequences in schema gymbro_private from public,anon,authenticated;

create function gymbro_private.staff_role() returns text language sql stable security definer set search_path='' as $$
 select role from gymbro_private.staff where user_id=(select auth.uid()) and active
$$;
create function gymbro_private.staff_context() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('userId',user_id,'role',role) from gymbro_private.staff where user_id=(select auth.uid()) and active
$$;
create function gymbro_private.can_read_evidence(path text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (gymbro_private.staff_role()='approver' or (gymbro_private.staff_role()='coach' and split_part(path,'/',1)=auth.uid()::text))
$$;

create function gymbro_private.submit_record(input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); role_name text:=gymbro_private.staff_role(); result gymbro_private.submissions; original gymbro_private.submissions; event public.record_definitions; amount numeric; day date; evidence text; key uuid;
begin
 if actor is null or role_name is null then raise exception 'Designated staff permission required'; end if;
 key:=(input->>'idempotencyKey')::uuid;
 -- Serialize retries by coach/key and revisions by original record.
 perform pg_advisory_xact_lock(hashtextextended(actor::text||key::text,0));
 select * into result from gymbro_private.submissions where coach_id=actor and idempotency_key=key;
 if found then return jsonb_build_object('id',result.id,'state',result.state,'version',result.version); end if;
 select * into event from public.record_definitions where id=input->>'definitionId' and active;
 if not found then raise exception 'Event is not active'; end if;
 if not exists(select 1 from public.record_divisions where id=input->>'divisionId' and active) then raise exception 'Division is not active'; end if;
 if input->>'memberName' is null or length(trim(input->>'memberName')) not between 1 and 80 then raise exception 'Member name is required'; end if;
 amount:=(input->>'value')::numeric;
 if amount is null or not(amount>0 and amount<'Infinity'::numeric) then raise exception 'Result must be positive and finite'; end if;
 if input->>'achievedOn' is null or (input->>'achievedOn')!~'^\d{4}-\d{2}-\d{2}$' then raise exception 'Date is required'; end if;
 day:=(input->>'achievedOn')::date;
 if day>(now() at time zone 'Asia/Kolkata')::date then raise exception 'Achievement date cannot be in the future'; end if;
 evidence:=input->>'evidencePath';
 if evidence is null or split_part(evidence,'/',1)<>actor::text or evidence !~ '\.(jpg|png|webp|mp4|webm)$' then raise exception 'Private evidence is required'; end if;
 if not exists(select 1 from storage.objects where bucket_id='record-evidence' and name=evidence and metadata->>'mimetype' in ('image/jpeg','image/png','image/webp','video/mp4','video/webm') and (metadata->>'size')::bigint between 1 and 26214400) then raise exception 'Evidence file has not been uploaded'; end if;
 if input->>'portraitUrl' is not null then raise exception 'Portrait publication requires separate approval'; end if;
 if input->>'supersedesId' is not null then
  select * into original from gymbro_private.submissions where id=(input->>'supersedesId')::uuid for update;
  if not found or original.coach_id<>actor or original.state not in ('approved','changes_requested') then raise exception 'Only your eligible submission can be revised'; end if;
 end if;
 insert into gymbro_private.submissions(definition_id,division_id,member_name,value,achieved_on,evidence_path,coach_id,idempotency_key,supersedes_id)
 values(event.id,input->>'divisionId',trim(input->>'memberName'),amount,day,evidence,actor,key,(input->>'supersedesId')::uuid) returning * into result;
 insert into gymbro_private.audit(submission_id,actor_id,action,to_state,version) values(result.id,actor,'submit','pending',1);
 return jsonb_build_object('id',result.id,'state',result.state,'version',result.version);
end $$;

create function gymbro_private.review_record(input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); result gymbro_private.submissions; original gymbro_private.submissions; decision text:=input->>'decision'; new_state text; note text:=coalesce(trim(input->>'reason'),''); previous text; ancestor_id uuid;
begin
 if actor is null or gymbro_private.staff_role() is distinct from 'approver' then raise exception 'Approver permission required'; end if;
 select * into result from gymbro_private.submissions where id=(input->>'id')::uuid for update;
 if not found then raise exception 'Submission unavailable'; end if;
 if (input->>'version')::integer is distinct from result.version then raise exception 'Stale review conflict'; end if;
 if length(note)>1000 then raise exception 'Review note is too long'; end if;
 previous:=result.state;
 if decision='withdraw' then
  if previous<>'approved' then raise exception 'Only approved records can be withdrawn'; end if;
  new_state:='withdrawn';
 else
  if previous<>'pending' then raise exception 'Only pending records can be reviewed'; end if;
  new_state:=case decision when 'approve' then 'approved' when 'reject' then 'rejected' when 'request_changes' then 'changes_requested' else null end;
  if new_state is null then raise exception 'Invalid review decision'; end if;
 end if;
 if decision='approve' and coalesce((input->>'membershipVerified')::boolean,false)=false then raise exception 'Membership and event checks must be confirmed'; end if;
 if decision<>'approve' and note='' then raise exception 'A review reason is required'; end if;
 if decision='approve' then
  if not exists(select 1 from public.record_definitions where id=result.definition_id and active) or not exists(select 1 from public.record_divisions where id=result.division_id and active) then raise exception 'Record category is no longer active'; end if;
  ancestor_id:=result.supersedes_id;
  while ancestor_id is not null loop
   select * into original from gymbro_private.submissions where id=ancestor_id for update;
   if not found or original.state not in ('approved','changes_requested') then raise exception 'Stale revision conflict'; end if;
   update gymbro_private.submissions set state='withdrawn',version=version+1,review_reason='Replaced by approved revision',reviewed_at=now() where id=original.id;
   delete from public.published_records where id=original.id;
   insert into gymbro_private.audit(submission_id,actor_id,action,from_state,to_state,version,reason) values(original.id,actor,'replace',original.state,'withdrawn',original.version+1,'Replaced by approved revision');
   -- A requested correction can itself be corrected. Retire that chain up to
   -- its still-approved ancestor, never leaving the obsolete record public.
   exit when original.state='approved';
   ancestor_id:=original.supersedes_id;
  end loop;
  insert into public.published_records(id,definition_id,division_id,member_name,portrait_url,value,achieved_on,approved_at) values(result.id,result.definition_id,result.division_id,result.member_name,result.portrait_url,result.value,result.achieved_on,now());
 else
  delete from public.published_records where id=result.id;
 end if;
 update gymbro_private.submissions set state=new_state,version=version+1,review_reason=note,membership_verified=(decision='approve'),reviewed_at=now() where id=result.id returning * into result;
 insert into gymbro_private.audit(submission_id,actor_id,action,from_state,to_state,version,reason) values(result.id,actor,decision,previous,new_state,result.version,note);
 return jsonb_build_object('id',result.id,'state',result.state,'version',result.version);
end $$;

create function gymbro_private.staff_submissions() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare role_name text:=gymbro_private.staff_role(); result jsonb;
begin
 if auth.uid() is null or role_name is null then raise exception 'Designated staff permission required'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'definitionId',s.definition_id,'divisionId',s.division_id,'eventLabel',d.label,'divisionLabel',v.label,'unit',d.unit,'memberName',s.member_name,'value',s.value,'achievedOn',s.achieved_on,'evidencePath',s.evidence_path,'coachId',s.coach_id,'state',s.state,'version',s.version,'reviewReason',s.review_reason,'supersedesId',s.supersedes_id) order by s.created_at desc),'[]'::jsonb) into result
 from gymbro_private.submissions s join public.record_definitions d on d.id=s.definition_id join public.record_divisions v on v.id=s.division_id where role_name='approver' or s.coach_id=auth.uid();
 return result;
end $$;

create function public.staff_context() returns jsonb language sql stable security invoker set search_path='' as $$select gymbro_private.staff_context()$$;
create function public.staff_submissions() returns jsonb language sql stable security invoker set search_path='' as $$select gymbro_private.staff_submissions()$$;
create function public.submit_record(input jsonb) returns jsonb language sql security invoker set search_path='' as $$select gymbro_private.submit_record(input)$$;
create function public.review_record(input jsonb) returns jsonb language sql security invoker set search_path='' as $$select gymbro_private.review_record(input)$$;
revoke all on all functions in schema gymbro_private from public,anon,authenticated;
revoke all on function public.staff_context(),public.staff_submissions(),public.submit_record(jsonb),public.review_record(jsonb) from public,anon,authenticated;
grant execute on function gymbro_private.staff_context() to anon,authenticated;
grant execute on function public.staff_context() to anon,authenticated;
grant execute on function gymbro_private.staff_role(),gymbro_private.can_read_evidence(text),gymbro_private.staff_submissions(),gymbro_private.submit_record(jsonb),gymbro_private.review_record(jsonb) to authenticated;
grant execute on function public.staff_submissions(),public.submit_record(jsonb),public.review_record(jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('record-evidence','record-evidence',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']);
create policy evidence_insert on storage.objects for insert to authenticated with check(bucket_id='record-evidence' and gymbro_private.staff_role() in ('coach','approver') and split_part(name,'/',1)=auth.uid()::text and name~'^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$');
create policy evidence_read on storage.objects for select to authenticated using(bucket_id='record-evidence' and gymbro_private.can_read_evidence(name));
-- No UPDATE/DELETE policies: uploaded evidence is immutable to staff.

create function gymbro_private.immutable_event() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from gymbro_private.submissions where definition_id=old.id) and (new.discipline,new.unit,new.comparison,new.rules,new.rules_version) is distinct from (old.discipline,old.unit,old.comparison,old.rules,old.rules_version) then raise exception 'Create a new event version; used comparison rules are immutable'; end if;
 return new;
end $$;
revoke all on function gymbro_private.immutable_event() from public,anon,authenticated;
create trigger immutable_event before update on public.record_definitions for each row execute function gymbro_private.immutable_event();

insert into public.record_divisions(id,label) values('open','Open — conditions agreed with coach');
-- Deliberately inactive until the owner confirms precise event and division rules.
insert into public.record_definitions(id,discipline,label,unit,comparison,rules,rules_version) values
 ('deadlift-v1','strength','Deadlift','kg','higher','Owner must confirm equipment, technique, division and attempt rules before activation.',1),
 ('squat-v1','strength','Squat','kg','higher','Owner must confirm depth, equipment, division and attempt rules before activation.',1),
 ('bench-v1','strength','Bench press','kg','higher','Owner must confirm pause, equipment, division and attempt rules before activation.',1),
 ('pullups-v1','bodyweight','Pull-ups','reps','higher','Owner must confirm grip, range of motion, assistance and rest rules before activation.',1),
 ('pushups-v1','bodyweight','Push-ups','reps','higher','Owner must confirm depth, lockout, duration and rest rules before activation.',1);
-- Add a versioned endurance event only after its distance/equipment/timing rules are agreed.
