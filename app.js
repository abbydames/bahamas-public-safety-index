const state={records:[],community:[]};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function recordLabel(r){
  if(r.record_type==='conviction')return'SOURCE-BACKED CONVICTION / GUILTY PLEA';
  if(r.record_type==='charged')return'PUBLICLY REPORTED CHARGE — NOT A CONVICTION';
  if(r.record_type==='allegation')return'PUBLICLY REPORTED ALLEGATION — UNPROVEN';
  if(r.record_type==='acquitted')return'ACQUITTED / NOT GUILTY';
  if(r.record_type==='dismissed')return'CHARGE DISMISSED';
  if(r.record_type==='withdrawn')return'CHARGE WITHDRAWN';
  if(r.record_type==='appeal')return'APPEAL / STATUS CHANGE';
  return'SOURCE-BACKED PUBLIC RECORD';
}

function renderRecords(){
  const q=$('#searchInput')?.value.trim().toLowerCase()||'';
  const island=$('#islandFilter')?.value.trim().toLowerCase()||'';
  const settlement=$('#settlementFilter')?.value.trim().toLowerCase()||'';
  const status=$('#statusFilter')?.value.trim().toLowerCase()||'';
  const rows=state.records.filter(r=>{
    const text=`${r.name||''} ${r.aliases||''}`.toLowerCase();
    return(!q||text.includes(q))&&(!island||String(r.island||'').toLowerCase().includes(island))&&(!settlement||String(r.settlement||'').toLowerCase().includes(settlement))&&(!status||String(r.record_type||'').toLowerCase()===status);
  });
  $('#resultCount').textContent=`${rows.length} named record${rows.length===1?'':'s'}`;
  $('#emptyState').hidden=rows.length>0;
  $('#records').innerHTML=rows.map(r=>`<article class="record-card">${r.photo_url?`<img class="record-photo" src="${esc(r.photo_url)}" alt="Public-source image for ${esc(r.name)}" loading="lazy" referrerpolicy="no-referrer">`:''}<span class="badge">${esc(recordLabel(r))}</span><h3>${esc(r.name)}</h3>${r.aliases?`<div class="record-meta"><strong>Aliases:</strong> ${esc(r.aliases)}</div>`:''}<div class="record-meta">${r.settlement||r.island?`<span><strong>Location:</strong> ${esc([r.settlement,r.island].filter(Boolean).join(', '))}</span>`:''}${r.offence?`<span><strong>Reported offence:</strong> ${esc(r.offence)}</span>`:''}${r.court?`<span><strong>Court:</strong> ${esc(r.court)}</span>`:''}${r.conviction_date?`<span><strong>Conviction / plea date:</strong> ${esc(r.conviction_date)}</span>`:''}${r.sentence?`<span><strong>Sentence / disposition:</strong> ${esc(r.sentence)}</span>`:''}${r.case_ref?`<span><strong>Case reference:</strong> ${esc(r.case_ref)}</span>`:''}${r.status_note?`<span><strong>Status note:</strong> ${esc(r.status_note)}</span>`:''}</div><div class="record-source"><strong>Source:</strong> ${r.source_url?`<a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">${esc(r.source_name||'View public source')}</a>`:esc(r.source_name||'Public source')}<br><strong>Source checked:</strong> ${esc(r.last_verified_at||'')}</div></article>`).join('');
}

function renderCommunity(){
  const island=$('#communityIslandFilter')?.value.trim().toLowerCase()||'';
  const type=$('#communityTypeFilter')?.value.trim().toLowerCase()||'';
  const conduct=$('#communityConductFilter')?.value.trim().toLowerCase()||'';
  const rows=state.community.filter(r=>(!island||String(r.island||'').toLowerCase()===island)&&(!type||String(r.account_type||'').toLowerCase()===type)&&(!conduct||String(r.conduct||'').toLowerCase()===conduct));
  $('#communityCount').textContent=`${rows.length} community report${rows.length===1?'':'s'}`;
  $('#communityEmpty').hidden=rows.length>0;
  $('#communityReports').innerHTML=rows.map(r=>`<article class="record-card community-card"><span class="badge">UNVERIFIED COMMUNITY REPORT</span><h3>${esc(r.conduct||'Community report')}</h3>${Number(r.cluster_count)>1?`<div class="repeat-alert"><strong>${esc(r.cluster_count)} reports</strong> are linked to the same privately identified person.<br><span>Private match code: ${esc(r.cluster_code)}</span></div>`:`<div class="record-source"><strong>Private match code:</strong> ${esc(r.cluster_code||'pending')}</div>`}<div class="record-meta"><span><strong>Island:</strong> ${esc(r.island)}</span>${r.settlement_display?`<span><strong>Settlement/city:</strong> ${esc(r.settlement_display)}</span>`:''}<span><strong>Report type:</strong> ${esc(r.account_type==='firsthand'?'Firsthand':'Secondhand')}</span><span><strong>Relationship:</strong> ${esc(r.relationship)}</span><span><strong>Victim age group:</strong> ${esc(r.victim_age_group)}</span>${r.period?`<span><strong>Approximate period:</strong> ${esc(r.period)}</span>`:''}<span><strong>Pattern:</strong> ${esc((r.repeat_pattern||'').replaceAll('_',' '))}</span></div><div class="record-source"><strong>Submitted:</strong> ${esc(r.created_at||'')}<br>The accused person's identifying information is encrypted and not displayed on this unverified report.</div></article>`).join('');
}

function enhanceCommunityForm(){
  const form=$('#communityForm');if(!form)return;
  const intro=form.previousElementSibling;if(intro)intro.innerHTML='This path is built for scale. Enter identifying information about the accused person in the <strong>private identity</strong> fields below. Those fields are encrypted and used to match repeat reports; they are not displayed on an unverified public report. The structured safety report publishes immediately.';
  const first=form.querySelector('.two-col');
  const privateBox=document.createElement('div');
  privateBox.className='private-box';
  privateBox.innerHTML=`<p class="eyebrow">PRIVATE IDENTITY • ENCRYPTED • NOT PUBLIC</p><label>Accused person's name or identifying name <input name="accused_name" required maxlength="180" autocomplete="off" placeholder="Full name if known"></label><label>Aliases / nicknames <input name="accused_aliases" maxlength="240" autocomplete="off" placeholder="Optional"></label><div class="two-col"><label>Approximate birth year / age <input name="accused_age_hint" maxlength="40" autocomplete="off" placeholder="e.g. 1978 or about 50"></label><label>Private distinguishing note <input name="accused_private_note" maxlength="300" autocomplete="off" placeholder="Optional; do not identify the victim"></label></div><label>Private source/evidence URL <input name="private_source_url" type="url" maxlength="1000" autocomplete="off" placeholder="Optional"></label><p class="private-note">This identity is used for secure matching and later connection to a qualifying public record. It is not returned by the public API.</p>`;
  form.insertBefore(privateBox,first);
  const cert=form.querySelector('input[name="certify"]')?.parentElement?.querySelector('span');
  if(cert)cert.textContent='I am submitting this in good faith. I understand the public report is unverified. I have not entered a victim’s identity, exact private address, phone number, intimate image, threat, or other unnecessary identifying information.';
  const honeypot=document.createElement('input');honeypot.type='text';honeypot.name='website';honeypot.tabIndex=-1;honeypot.autocomplete='off';honeypot.setAttribute('aria-hidden','true');honeypot.style.position='absolute';honeypot.style.left='-10000px';form.appendChild(honeypot);
}

function enhanceRecordFilters(){
  const filters=document.querySelector('#directory .filters');if(!filters||$('#statusFilter'))return;
  const label=document.createElement('label');
  label.innerHTML='Public record status <select id="statusFilter"><option value="">All statuses</option><option value="conviction">Conviction / guilty plea</option><option value="charged">Charged / arraigned</option><option value="allegation">Publicly reported allegation</option><option value="acquitted">Acquitted / not guilty</option><option value="dismissed">Charge dismissed</option><option value="withdrawn">Charge withdrawn</option><option value="appeal">Appeal / status change</option></select>';
  filters.appendChild(label);
}

function enhanceNavigation(){
  const nav=document.querySelector('.site-header nav');if(nav)nav.insertAdjacentHTML('beforeend','<a href="./resources.html">Get help now</a><a href="./methodology.html">How it works</a>');
  const footer=document.querySelector('footer');if(footer)footer.insertAdjacentHTML('beforeend','<p><a href="./resources.html">Get help now</a> · <a href="./privacy.html">Privacy</a> · <a href="./methodology.html">How it works</a></p>');
}

async function loadJsonRecords(url){try{const res=await fetch(url,{headers:{Accept:'application/json'}});if(!res.ok)throw new Error('unavailable');const data=await res.json();return Array.isArray(data.records)?data.records:[]}catch(e){return[]}}
function mergeRecords(...sets){const out=[],seen=new Set();for(const set of sets){for(const r of Array.isArray(set)?set:[]){const key=`${String(r.name||'').toLowerCase()}|${String(r.record_type||'').toLowerCase()}|${String(r.source_url||'').toLowerCase()}`;if(!seen.has(key)){seen.add(key);out.push(r)}}}return out}
async function loadRecords(){
  let api=[];
  try{const res=await fetch('./api/records',{headers:{Accept:'application/json'}});if(res.ok){const data=await res.json();api=Array.isArray(data.records)?data.records:[]}}catch(e){}
  const [convictions,reported,historical]=await Promise.all([loadJsonRecords('./data/seed-records.json'),loadJsonRecords('./data/publicly-reported-cases.json'),loadJsonRecords('./data/historical-records.json')]);
  state.records=mergeRecords(api,convictions,reported,historical);
  renderRecords();
}
async function loadCommunity(){try{const res=await fetch('./api/community-reports',{headers:{Accept:'application/json'}});if(!res.ok)throw new Error('not deployed');const data=await res.json();state.community=Array.isArray(data.reports)?data.reports:[]}catch(e){state.community=[]}renderCommunity()}

async function postForm(form,statusEl,url,success){const status=$(statusEl);status.textContent='Sending…';const data=Object.fromEntries(new FormData(form).entries());if(data.certify)data.certify=true;try{const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const out=await res.json().catch(()=>({}));if(!res.ok)throw new Error(out.error||'Unable to submit.');status.textContent=out.message||success||'Submitted.';form.reset();return out}catch(err){status.textContent=err.message||'Unable to submit.';return null}}

enhanceNavigation();enhanceRecordFilters();enhanceCommunityForm();
['#searchInput','#islandFilter','#settlementFilter','#statusFilter'].forEach(id=>$(id)?.addEventListener('input',renderRecords));
['#communityIslandFilter','#communityTypeFilter','#communityConductFilter'].forEach(id=>$(id)?.addEventListener('input',renderCommunity));
$('#communityForm')?.addEventListener('submit',async e=>{e.preventDefault();const out=await postForm(e.currentTarget,'#communitySubmissionStatus','./api/community-submit','Community report published.');if(out)loadCommunity()});
$('#sourceForm')?.addEventListener('submit',e=>{e.preventDefault();postForm(e.currentTarget,'#sourceStatus','./api/source-submit','Public source received for indexing.')});
$('#correctionForm')?.addEventListener('submit',e=>{e.preventDefault();postForm(e.currentTarget,'#correctionStatus','./api/corrections','Correction request received.')});
loadRecords();loadCommunity();
