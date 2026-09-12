export async function onRequestGet({request,env}){
  if(!env.DB)return Response.json({reports:[],warning:'D1 binding DB is not configured.'});
  const url=new URL(request.url);const limit=Math.min(Math.max(Number(url.searchParams.get('limit'))||250,1),500);
  const {results}=await env.DB.prepare(`SELECT id,island,CASE WHEN settlement IS NULL OR TRIM(settlement)='' THEN NULL ELSE settlement END AS settlement_display,account_type,relationship,conduct,period,victim_age_group,repeat_pattern,created_at,UPPER(SUBSTR(identity_match_key,1,10)) AS cluster_code,COUNT(*) OVER(PARTITION BY identity_match_key) AS cluster_count FROM community_reports WHERE status='published' ORDER BY datetime(created_at) DESC LIMIT ?`).bind(limit).all();
  return Response.json({reports:results||[]},{headers:{'Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
}
