import{clean,identityFingerprintInput,hmacHex,encryptJson,isHttpUrl}from'../_lib/security.js';

const ISLANDS=new Set(['New Providence','Grand Bahama','Abaco','Andros','Eleuthera','Exuma','Long Island','Bimini','Berry Islands','Cat Island','San Salvador','Acklins','Crooked Island','Mayaguana','Inagua','Ragged Island']);
const TYPES=new Set(['firsthand','secondhand']);
const RELATIONSHIPS=new Set(['Family member','Partner / spouse','Friend / acquaintance','Teacher / coach / clergy / trusted adult','Employer / coworker','Stranger','Other / unknown']);
const CONDUCT=new Set(['Rape / forced intercourse','Sexual assault / unwanted touching','Child sexual abuse','Grooming / exploitation','Indecent exposure','Other sexual misconduct']);
const AGES=new Set(['Child under 13','Teen 13–17','Adult 18+','Unknown / prefer not to say']);
const PATTERNS=new Set(['single','repeated','multiple','unknown']);

function bad(error,status=400){return Response.json({error},{status})}

export async function onRequestPost({request,env}){
  if(!env.DB)return bad('Database is not configured.',503);
  if(!env.MATCH_SECRET||!env.REPORT_ENCRYPTION_KEY)return bad('Secure identity storage is not configured yet.',503);
  let body;try{body=await request.json()}catch{return bad('Invalid request.')}
  if(body.website)return Response.json({message:'Submitted.'});
  if(body.certify!==true)return bad('Good-faith certification is required.');

  const accused_name=clean(body.accused_name,180);
  const accused_aliases=clean(body.accused_aliases,240);
  const accused_age_hint=clean(body.accused_age_hint,40);
  const accused_private_note=clean(body.accused_private_note,300);
  const private_source_url=clean(body.private_source_url,1000);
  const island=clean(body.island,80);
  const settlement=clean(body.settlement,120);
  const account_type=clean(body.account_type,20);
  const relationship=clean(body.relationship,100);
  const conduct=clean(body.conduct,100);
  const period=clean(body.period,80);
  const victim_age_group=clean(body.victim_age_group,60);
  const repeat_pattern=clean(body.repeat_pattern,20);

  if(!accused_name)return bad('Enter the accused person’s name or identifying name in the private field.');
  if(!ISLANDS.has(island))return bad('Select a valid island.');
  if(!TYPES.has(account_type)||!RELATIONSHIPS.has(relationship)||!CONDUCT.has(conduct)||!AGES.has(victim_age_group)||!PATTERNS.has(repeat_pattern))return bad('One or more report fields are invalid.');
  if(private_source_url&&!isHttpUrl(private_source_url))return bad('Private source must be a valid web link.');

  const fingerprint=identityFingerprintInput({accused_name,accused_age_hint});
  if(!fingerprint||fingerprint.startsWith('|'))return bad('Unable to create a secure identity match.');
  const identity_match_key=await hmacHex(env.MATCH_SECRET,fingerprint);
  const encrypted_identity=await encryptJson(env.REPORT_ENCRYPTION_KEY,{accused_name,accused_aliases,accused_age_hint,accused_private_note,private_source_url});

  const result=await env.DB.prepare(`INSERT INTO community_reports(identity_match_key,encrypted_identity,island,settlement,account_type,relationship,conduct,period,victim_age_group,repeat_pattern,status) VALUES(?,?,?,?,?,?,?,?,?,?,'published')`)
    .bind(identity_match_key,encrypted_identity,island,settlement||null,account_type,relationship,conduct,period||null,victim_age_group,repeat_pattern).run();
  const row=await env.DB.prepare(`SELECT COUNT(*) AS n FROM community_reports WHERE identity_match_key=? AND status='published'`).bind(identity_match_key).first();
  return Response.json({ok:true,id:result.meta?.last_row_id??null,cluster_code:identity_match_key.slice(0,10).toUpperCase(),cluster_count:Number(row?.n||1),message:'Community report published. The accused person’s identifying fields were encrypted and withheld from the public report.'},{status:201});
}
