import{clean,isHttpUrl}from'../_lib/security.js';
function bad(error,status=400){return Response.json({error},{status})}
export async function onRequestPost({request,env}){if(!env.DB)return bad('Database is not configured.',503);let body;try{body=await request.json()}catch{return bad('Invalid request.')}
const record_name=clean(body.record_name,160),email=clean(body.email,240),message=clean(body.message,4000),source_url=clean(body.source_url,1000);if(!record_name||!email||!message)return bad('Record name, email and correction details are required.');if(source_url&&!isHttpUrl(source_url))return bad('Supporting source must be a valid web link.');
await env.DB.prepare(`INSERT INTO corrections(record_name,email,message,source_url,status) VALUES(?,?,?,?,'open')`).bind(record_name,email,message,source_url||null).run();return Response.json({ok:true,message:'Correction request received.'},{status:201});}
