import{clean,isHttpUrl}from'../_lib/security.js';
const STATUSES=new Set(['convicted','charged','allegation','appeal']);
function bad(error,status=400){return Response.json({error},{status})}
export async function onRequestPost({request,env}){if(!env.DB)return bad('Database is not configured.',503);let body;try{body=await request.json()}catch{return bad('Invalid request.')}
const name=clean(body.name,160),source_url=clean(body.source_url,1000),reported_status=clean(body.reported_status,30),island=clean(body.island,80);if(!name||!isHttpUrl(source_url)||!STATUSES.has(reported_status))return bad('Name, valid public source URL and reported status are required.');
await env.DB.prepare(`INSERT INTO source_submissions(name,source_url,reported_status,island,status) VALUES(?,?,?,?,'received')`).bind(name,source_url,reported_status,island||null).run();
return Response.json({ok:true,message:'Public source received for indexing. It will not be converted into a named profile unless the source supports the stated status.'},{status:201});}
