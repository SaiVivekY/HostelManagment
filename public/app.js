const app=document.querySelector('#app');
const state={token:localStorage.getItem('hostelToken'),user:JSON.parse(localStorage.getItem('hostelUser')||'null'),page:'Overview',cache:{}};
const navAdmin=['Overview','Applications','Hostel setup','Rooms & beds','Allocations','Payments','Food & timings','Food analytics','Complaints','Leave requests','Notifications'];
const navStudent=['Overview','My profile','My room','Payments','Food & feedback','Complaints','Leave requests','Notifications'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v?new Date(v).toLocaleDateString():'—';
async function api(url,opts={}){const r=await fetch('/api'+url,{...opts,headers:{'Content-Type':'application/json',...(state.token?{Authorization:`Bearer ${state.token}`}:{}) ,...(opts.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Something went wrong.');return d}
function msg(s,error=false){let n=document.querySelector('#message');if(!n)return;n.className='notice'+(error?' error':'');n.textContent=s;n.hidden=false;setTimeout(()=>{if(n)n.hidden=true},5000)}
function authView(register=false){app.innerHTML=`<main class="auth-page"><section class="auth-card"><div class="eyebrow">Hostel Management System</div><h1>${register?'Student application':'Welcome back'}</h1><p class="muted">${register?'Create an account for Admin review.':'Sign in to your hostel account.'}</p><div id="message" hidden></div><form id="authForm"><div class="form-grid">${register?field('fullName','Full name','text',true)+field('phone','Phone')+field('address','Address','text',false,'wide')+field('profession','Profession','select',false,'','STUDENT,OFFICE,OTHER')+field('institutionName','Institution')+field('organizationName','Organization')+field('dateOfBirth','Date of birth','date')+field('bloodGroup','Blood group')+field('guardianName','Guardian name')+field('guardianPhone','Guardian phone')+field('citizenshipId','Citizenship ID')+field('nationalId','National ID')+`<label>Preferred room type<select name="preferredRoomType"><option value="">No preference</option></select></label><label>Preferred room<select name="preferredRoom"><option value="">No preference</option></select></label>`:''}${field('email','Email','email',true)}${field('password','Password','password',true)}</div><div class="form-actions"><button>${register?'Submit application':'Sign in'}</button><button class="secondary" type="button" id="swap">${register?'Back to sign in':'Student registration'}</button></div></form></section></main>`;
 if(register)api('/application-options').then(d=>{const t=document.querySelector('[name="preferredRoomType"]'),r=document.querySelector('[name="preferredRoom"]');if(t)t.innerHTML+='<option value="">No preference</option>'+d.roomTypes.map(x=>`<option value="${x._id}">${esc(x.name)}</option>`).join('');if(r)r.innerHTML+='<option value="">No preference</option>'+d.rooms.map(x=>`<option value="${x._id}">${esc(x.number)}</option>`).join('')}).catch(()=>{});
 document.querySelector('#swap').onclick=()=>authView(!register);document.querySelector('#authForm').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));try{if(register){const r=await api('/auth/register',{method:'POST',body:JSON.stringify(data)});msg(r.message);setTimeout(()=>authView(false),1600)}else{const r=await api('/auth/login',{method:'POST',body:JSON.stringify(data)});state.token=r.token;state.user=r.user;localStorage.setItem('hostelToken',r.token);localStorage.setItem('hostelUser',JSON.stringify(r.user));render()} }catch(err){msg(err.message,true)}}}
function field(name,label,type='text',required=false,cls='',options=''){let control=type==='select'?`<select name="${name}" ${required?'required':''}>${options.split(',').filter(Boolean).map(x=>`<option>${esc(x)}</option>`).join('')}</select>`:type==='textarea'?`<textarea name="${name}" ${required?'required':''}></textarea>`:`<input name="${name}" type="${type}" ${required?'required':''}>`;return `<label class="${cls}">${esc(label)}${control}</label>`}
function shell(){const nav=state.user.role==='ADMIN'?navAdmin:navStudent;app.innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand">Hostel Management<small>Simple operations dashboard</small></div><div class="nav">${state.user.role==='ADMIN'?'Administrator':'Student'} workspace</div>${nav.map(n=>`<button class="nav-btn ${n===state.page?'active':''}" data-page="${esc(n)}">${esc(n)}</button>`).join('')}<div class="sidebar-bottom">${esc(state.user.email)}<br><br><button class="secondary" id="logout">Sign out</button></div></aside><main class="main"><div class="topline"><div><div class="eyebrow">${state.user.role==='ADMIN'?'Admin workspace':'Student workspace'}</div><h1>${esc(state.page)}</h1></div><div class="toolbar"><span class="statusline">${esc(state.user.email)}</span><button class="secondary" id="refresh">Refresh</button></div></div><div id="message" hidden></div><div id="content"><div class="loading">Loading…</div></div></main></div>`;document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;render()});document.querySelector('#logout').onclick=()=>{localStorage.clear();state.token=null;state.user=null;authView()};document.querySelector('#refresh').onclick=()=>loadPage()}
function badge(s){return `<span class="badge ${String(s).toLowerCase()}">${esc(s||'—')}</span>`}
function table(headers,rows){if(!rows.length)return '<div class="empty">Nothing to show yet.</div>';return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
function panel(title,body,extra=''){return `<section class="panel"><div class="toolbar" style="justify-content:space-between"><h2>${title}</h2>${extra}</div>${body}</section>`}
function form(title,action,fields,submit='Save'){return `<section class="panel"><h2>${title}</h2><form data-action="${action}"><div class="form-grid">${fields}</div><div class="form-actions"><button>${submit}</button></div></form></section>`}
async function loadPage(){if(!state.token){authView();return}shell();const root=document.querySelector('#content');try{const role=state.user.role;switch(state.page){case'Overview':root.innerHTML=role==='ADMIN'?await adminOverview():await studentOverview();break;case'Applications':root.innerHTML=await applications();break;case'Hostel setup':root.innerHTML=await inventoryPage(true);break;case'Rooms & beds':root.innerHTML=await inventoryPage(false);break;case'Allocations':root.innerHTML=await allocations();break;case'Payments':root.innerHTML=await payments();break;case'Food & timings':root.innerHTML=await foodPage();break;case'Food analytics':root.innerHTML=await foodAnalytics();break;case'Complaints':root.innerHTML=await complaints();break;case'Leave requests':root.innerHTML=await leaves();break;case'My profile':root.innerHTML=await profile();break;case'My room':root.innerHTML=await myRoom();break;case'Food & feedback':root.innerHTML=await foodPage();break;case'Notifications':root.innerHTML=await notifications();break;default:root.innerHTML='';}bindForms()}catch(e){root.innerHTML=`<div class="notice error">${esc(e.message)}</div>`}}
async function render(){if(!state.token)return authView();await loadPage()}
async function adminOverview(){const x=await api('/admin/summary');return `<div class="grid">${[['Students',x.students],['Applications to review',x.pendingApplications],['Active allocations',x.activeAllocations],['Payments pending',x.pendingPayments],['Open complaints',x.openComplaints]].map(([a,b])=>`<article class="metric"><span>${a}</span><strong>${b}</strong></article>`).join('')}</div><p class="muted">Choose a section to manage the hostel, student requests, fees, meals, or maintenance.</p>`}
async function studentOverview(){const m=await api('/me');const p=m.student||{};return `<div class="grid">${[['Account',badge(m.user.status)],['Room',p.fullName?esc(p.fullName):'Profile pending'],['Role',esc(m.user.role)]].map(([a,b])=>`<article class="metric"><span>${a}</span><strong style="font-size:18px">${b}</strong></article>`).join('')}</div><section class="panel"><h2>Hello, ${esc(p.fullName||m.user.email)}</h2><p class="muted">${m.user.status==='ACTIVE'?'Use the sections to view your room, submit payment references, share meal feedback, and track requests.':'Your account is awaiting Admin review. You can sign out and check back later.'}</p></section>`}
async function applications(){
  const a=await api('/admin/applications');
  const rows=a.map(s=>'<tr><td>'+esc(s.fullName)+'<br><small>'+esc(s.user?.email)+'</small></td><td>'+esc(s.phone||'—')+'</td><td>'+esc(s.profession||'—')+'</td><td>'+esc(s.preferredRoomType?.name||'No preference')+'</td><td>'+fmt(s.createdAt)+'</td><td><div class="actions"><button data-status="ACTIVE" data-id="'+esc(s.user?._id)+'">Approve</button><button class="danger" data-status="REJECTED" data-id="'+esc(s.user?._id)+'">Reject</button></div></td></tr>');
  return panel('Student applications',table(['Applicant','Contact','Profession','Preference','Registered','Action'],rows));
}
async function inventoryPage(setup){
  const d=await api('/inventory');
  const optionList=(key,display)=>d[key].map(x=>'<option value="'+esc(x._id)+'">'+esc(display(x))+'</option>').join('');
  const blockName=x=>[x.hostel?.name,x.name].filter(Boolean).join(' / ');
  const floorName=x=>[x.block?.name,x.name||x.number].filter(Boolean).join(' / ');
  let forms='';
  if(setup){
    forms+=form('Add hostel','inventory:hostels',field('name','Hostel name','text',true)+field('code','Hostel code','text',true)+field('address','Address')+field('type','Type'));
    forms+=form('Add block','inventory:blocks','<label>Hostel<select name="hostel" required>'+optionList('hostels',x=>x.name)+'</select></label>'+field('name','Block name','text',true)+field('code','Block code','text',true));
    forms+=form('Add floor','inventory:floors','<label>Block<select name="block" required>'+optionList('blocks',blockName)+'</select></label>'+field('number','Floor number','number',true)+field('name','Floor name'));
    forms+=form('Add room type','inventory:roomTypes',field('name','Type name','text',true)+field('capacity','Capacity','number',true)+field('monthlyFee','Monthly fee','number',true));
  }else{
    forms=form('Add room with beds','inventory:rooms','<label>Floor<select name="floor" required>'+optionList('floors',floorName)+'</select></label><label>Room type<select name="roomType" required>'+optionList('roomTypes',x=>x.name)+'</select></label>'+field('number','Room number','text',true)+field('bedNumbers','Bed numbers (comma-separated)','text',true));
  }
  const rows=d.rooms.map(r=>{
    const beds=r.beds.map(b=>'<form class="toolbar bed-status" data-room="'+r._id+'" data-bed="'+b._id+'"><span>'+esc(b.number)+'</span><select name="status"><option '+(b.status==='AVAILABLE'?'selected':'')+'>AVAILABLE</option><option '+(b.status==='MAINTENANCE'?'selected':'')+'>MAINTENANCE</option><option '+(b.status==='INACTIVE'?'selected':'')+'>INACTIVE</option></select><button class="secondary">Set</button></form>').join('');
    const roomStatus='<form class="toolbar room-status" data-room="'+r._id+'"><select name="status"><option '+(r.status==='ACTIVE'?'selected':'')+'>ACTIVE</option><option '+(r.status==='MAINTENANCE'?'selected':'')+'>MAINTENANCE</option><option '+(r.status==='INACTIVE'?'selected':'')+'>INACTIVE</option></select><button class="secondary">Set</button></form>';
    return '<tr><td>'+esc(r.floor?.block?.hostel?.name||'')+'</td><td>'+esc(r.floor?.block?.name||'')+'</td><td>'+esc(r.floor?.name||r.floor?.number||'')+'</td><td>'+esc(r.number)+'</td><td>'+esc(r.roomType?.name||'')+'</td><td>'+beds+'</td><td>'+roomStatus+'</td></tr>';
  });
  return forms+panel('Room and bed inventory',table(['Hostel','Block','Floor','Room','Type','Beds','Room status'],rows));
}
async function allocations(){
  const d=await api('/inventory');
  const a=await api('/admin/allocations');
  const activeStudents=await api('/admin/students');
  const sopts=activeStudents.map(s=>'<option value="'+esc(s._id)+'">'+esc(s.fullName)+'</option>').join('');
  const ropts=d.rooms.map(r=>'<option value="'+esc(r._id)+'">'+esc(r.number)+' — '+esc(r.floor?.block?.hostel?.name||'')+' '+esc(r.floor?.block?.name||'')+'</option>').join('');
  const beds=d.rooms.flatMap(r=>r.beds.filter(b=>b.status==='AVAILABLE').map(b=>'<option value="'+esc(b._id)+'">'+esc(r.number)+' / Bed '+esc(b.number)+'</option>')).join('');
  const allocateForm='<label>Student<select name="studentId" required>'+sopts+'</select></label><label>Room<select name="roomId" required>'+ropts+'</select></label><label class="wide">Bed<select name="bedId" required>'+beds+'</select></label>';
  const rows=a.map(x=>'<tr><td>'+esc(x.student?.fullName)+'<br><small>'+esc(x.student?.user?.email)+'</small></td><td>'+esc(x.room?.number)+'</td><td>'+esc(x.room?.beds?.find(b=>String(b._id)===String(x.bedId))?.number||'')+'</td><td>'+fmt(x.allocatedAt)+'</td></tr>');
  return form('Allocate a bed','allocation',allocateForm,'Allocate')+panel('Current allocations',table(['Student','Room','Bed','Allocated'],rows));
}
async function payments(){
  const rows=await api('/payments');
  const admin=state.user.role==='ADMIN';
  const studentForm=admin?'':form('Submit payment reference','payment',field('billingMonth','Billing month','month',true)+field('amount','Amount','number',true)+field('transactionId','Transaction/reference ID','text',true)+field('paymentDate','Payment date','date',true)+field('proofPath','Proof file link (optional)'));
  const headers=['Student','Month','Amount','Reference','Date','Status'];
  if(admin)headers.push('Action');
  const rowHtml=rows.map(p=>{
    let action='';
    if(admin)action=p.status==='PENDING'?'<td><div class="actions"><button data-payment="APPROVED" data-id="'+esc(p._id)+'">Approve</button><button class="danger" data-payment="REJECTED" data-id="'+esc(p._id)+'">Reject</button></div></td>':'<td>'+esc(p.adminRemarks||'Reviewed')+'</td>';
    return '<tr><td>'+esc(p.student?.fullName||state.user.email)+'</td><td>'+esc(p.billingMonth||'—')+'</td><td>'+esc(p.amount)+'</td><td>'+esc(p.transactionId)+'</td><td>'+esc(p.paymentDate||'—')+'</td><td>'+badge(p.status)+'</td>'+action+'</tr>';
  });
  return studentForm+panel(admin?'Payments for review':'My payment records',table(headers,rowHtml));
}
async function foodPage(){
  const result=await Promise.all([api('/food/menu'),api('/food/schedule')]);
  const menu=result[0],schedule=result[1],admin=state.user.role==='ADMIN';
  let body='';
  if(admin){
    const published='<label><span>Published</span><select name="published"><option value="true">Yes</option><option value="false">No</option></select></label>';
    body+=form('Publish or update weekly menu','menu',field('dayOfWeek','Day (1 Sunday – 7 Saturday)','number',true)+field('mealType','Meal','select',true,'','BREAKFAST,LUNCH,SNACK,DINNER')+field('description','Menu description','textarea',true,'wide')+published);
    const scheduleForms=schedule.map(s=>'<form class="toolbar schedule" data-action="schedule" data-meal="'+esc(s.mealType)+'"><strong>'+esc(s.mealType)+'</strong><input name="startTime" type="time" value="'+esc(s.startTime)+'"><input name="endTime" type="time" value="'+esc(s.endTime)+'"><button>Save time</button></form>').join('');
    body+=panel('Shared meal timings',scheduleForms);
  }else{
    const menuOptions=menu.map(m=>'<option value="'+esc(m._id)+'">'+esc(m.dayName)+' — '+esc(m.mealType)+': '+esc(m.description)+'</option>').join('');
    const feedbackFields='<label class="wide">Menu item<select name="menuId" required>'+menuOptions+'</select></label>'+field('date','Date','date',true)+field('rating','Rating','select',true,'','GOOD,AVERAGE,SUGGESTIONS')+field('comments','Comments','textarea',false,'wide');
    body+=form('Meal feedback','feedback',feedbackFields);
    body+=form('Meal attendance','attendance',field('date','Date','date',true)+field('mealType','Meal','select',true,'','BREAKFAST,LUNCH,SNACK,DINNER')+field('willAttend','Will attend?','select',true,'','true,false'));
  }
  const menuRows=menu.map(m=>'<tr><td>'+esc(m.dayName||m.dayOfWeek)+'</td><td>'+esc(m.mealType)+'</td><td>'+esc(m.description)+'</td><td>'+badge(m.published?'PUBLISHED':'DRAFT')+'</td></tr>');
  return body+panel('Weekly menu',table(['Day','Meal','Menu','Published'],menuRows));
}
async function foodAnalytics(){
  const d=await api('/admin/food/analytics');
  const feedback=d.feedback.map(x=>'<tr><td>'+esc(x._id)+'</td><td>'+x.count+'</td></tr>');
  const attendance=d.attendance.map(x=>'<tr><td>'+esc(x._id.date)+'</td><td>'+esc(x._id.mealType)+'</td><td>'+x.responses+'</td><td>'+x.attending+'</td><td>'+(x.responses-x.attending)+'</td></tr>');
  const recent=d.latestFeedback.map(x=>'<tr><td>'+esc(x.student?.fullName)+'</td><td>'+esc(x.menu?.mealType)+'</td><td>'+badge(x.rating)+'</td><td>'+esc(x.comments||'—')+'</td><td>'+esc(x.date)+'</td></tr>');
  return panel('Feedback totals',table(['Rating','Responses'],feedback))+panel('Meal attendance',table(['Date','Meal','Responses','Attending','Not attending'],attendance))+panel('Recent student feedback',table(['Student','Meal','Rating','Comments','Date'],recent));
}
async function complaints(){
  const d=await api('/complaints'),admin=state.user.role==='ADMIN';
  const studentForm=admin?'<p class="muted">Update the status and add progress or resolution notes.</p>':form('Raise a maintenance complaint','complaint',field('category','Category','select',true,'','PLUMBING,ELECTRICAL,CARPENTER,CLEANING,OTHER')+field('otherProfessional','Other category detail')+field('description','Describe the issue','textarea',true,'wide'));
  const headers=['Student','Room','Category','Description','Status','Notes'];if(admin)headers.push('Update');
  const rows=d.map(c=>{
    const action=admin?'<td><form class="actions inline-complaint" data-id="'+esc(c._id)+'"><select name="status"><option>PENDING</option><option>IN_PROGRESS</option><option>SOLVED</option><option>REJECTED</option></select><input name="resolutionNote" placeholder="Progress / resolution note"><button>Save</button></form></td>':'';
    return '<tr><td>'+esc(c.student?.fullName||'')+'</td><td>'+esc(c.room?.number||'—')+'</td><td>'+esc(c.category)+'</td><td>'+esc(c.description)+'</td><td>'+badge(c.status)+'</td><td>'+esc(c.resolutionNote||'—')+'</td>'+action+'</tr>';
  });
  return studentForm+panel(admin?'Complaints':'My complaints',table(headers,rows));
}
async function leaves(){
  const d=await api('/leaves'),admin=state.user.role==='ADMIN';
  const studentForm=admin?'':form('Request leave','leave',field('startDate','Start date','date',true)+field('endDate','End date','date',true)+field('reason','Reason','textarea',true,'wide'));
  const headers=['Student','Dates','Reason','Status'];if(admin)headers.push('Action');
  const rows=d.map(x=>{
    const action=admin?'<td><div class="actions"><button data-leave="APPROVED" data-id="'+esc(x._id)+'">Approve</button><button class="danger" data-leave="REJECTED" data-id="'+esc(x._id)+'">Reject</button></div></td>':'';
    return '<tr><td>'+esc(x.student?.fullName||'')+'</td><td>'+esc(x.startDate)+' – '+esc(x.endDate)+'</td><td>'+esc(x.reason)+'</td><td>'+badge(x.status)+'</td>'+action+'</tr>';
  });
  return studentForm+panel(admin?'Leave requests':'My leave requests',table(headers,rows));
}
async function profile(){
  const d=await api('/me'),s=d.student||{};
  const details={Name:s.fullName,Email:d.user.email,Phone:s.phone,Address:s.address,Profession:s.profession,Institution:s.institutionName||s.organizationName,Guardian:s.guardianName,'Guardian phone':s.guardianPhone,'Date of birth':s.dateOfBirth,'Blood group':s.bloodGroup,'Account status':d.user.status};
  const cards=Object.entries(details).map(([k,v])=>'<div class="item-card"><small class="muted">'+esc(k)+'</small><p>'+esc(v||'Not provided')+'</p></div>').join('');
  return panel('Student profile','<div class="cards">'+cards+'</div>');
}
async function myRoom(){
  const result=await api('/me/allocation'),allocation=result.allocation,roommates=result.roommates;
  if(!allocation)return panel('Current allocation','<p class="muted">No room or bed has been assigned yet. Contact the Admin after your application is approved.</p>');
  const room=allocation.room,bed=room?.beds?.find(b=>String(b._id)===String(allocation.bedId)),host=room?.floor?.block?.hostel;
  const names=roommates.length?roommates.map(n=>'<p>'+esc(n)+'</p>').join(''):'<p class="muted">No other students are allocated to this room yet.</p>';
  const body='<p><b>Hostel:</b> '+esc(host?.name)+'</p><p><b>Block / floor:</b> '+esc(room?.floor?.block?.name)+' / '+esc(room?.floor?.name||room?.floor?.number)+'</p><p><b>Room:</b> '+esc(room?.number)+' ('+esc(room?.roomType?.name)+')</p><p><b>Bed:</b> '+esc(bed?.number)+'</p><p><b>Monthly fee:</b> '+esc(room?.roomType?.monthlyFee)+'</p><h3>Roommates</h3>'+names;
  return panel('Current allocation',body);
}
async function notifications(){
  const d=await api('/notifications');
  const rows=d.map(n=>'<tr><td><b>'+esc(n.title)+'</b><br>'+esc(n.message)+(n.read?'':' <button class="secondary" data-read="'+esc(n._id)+'">Mark read</button>')+'</td><td>'+fmt(n.createdAt)+'</td><td>'+badge(n.read?'READ':'NEW')+'</td></tr>');
  return panel('Notifications',table(['Message','Date','Read'],rows));
}
function bindForms(){
  document.querySelectorAll('form[data-action]').forEach(f=>{
    f.onsubmit=async e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(f)),action=f.dataset.action;
      try{
        if(action==='inventory:rooms'){data.beds=data.bedNumbers.split(',').map(number=>({number:number.trim(),status:'AVAILABLE'})).filter(x=>x.number);delete data.bedNumbers;await api('/inventory/rooms',{method:'POST',body:JSON.stringify(data)})}
        else if(action.startsWith('inventory:'))await api('/inventory/'+action.split(':')[1],{method:'POST',body:JSON.stringify(data)});
        else if(action==='allocation')await api('/admin/allocations',{method:'POST',body:JSON.stringify(data)});
        else if(action==='payment')await api('/payments',{method:'POST',body:JSON.stringify(data)});
        else if(action==='menu'){data.dayOfWeek=Number(data.dayOfWeek);data.published=data.published==='true';await api('/admin/food/menu',{method:'POST',body:JSON.stringify(data)})}
        else if(action==='schedule')await api('/admin/food/schedule/'+f.dataset.meal,{method:'PUT',body:JSON.stringify(data)});
        else if(action==='feedback')await api('/food/feedback',{method:'POST',body:JSON.stringify(data)});
        else if(action==='attendance'){data.willAttend=data.willAttend==='true';await api('/food/attendance',{method:'POST',body:JSON.stringify(data)})}
        else if(action==='complaint')await api('/complaints',{method:'POST',body:JSON.stringify(data)});
        else if(action==='leave')await api('/leaves',{method:'POST',body:JSON.stringify(data)});
        msg('Saved successfully.');await loadPage();
      }catch(err){msg(err.message,true)}
    };
  });
  document.querySelectorAll('.bed-status').forEach(f=>{
    f.onsubmit=async e=>{e.preventDefault();try{const url='/admin/rooms/'+f.dataset.room+'/beds/'+f.dataset.bed;await api(url,{method:'PATCH',body:JSON.stringify(Object.fromEntries(new FormData(f)))});msg('Bed status updated.');await loadPage()}catch(x){msg(x.message,true)}};
  });
  document.querySelectorAll('.room-status').forEach(f=>{
    f.onsubmit=async e=>{e.preventDefault();try{await api('/inventory/rooms/'+f.dataset.room,{method:'PATCH',body:JSON.stringify(Object.fromEntries(new FormData(f)))});msg('Room status updated.');await loadPage()}catch(x){msg(x.message,true)}};
  });
  document.querySelectorAll('[data-status]').forEach(b=>{
    b.onclick=async()=>{try{await api('/admin/applications/'+b.dataset.id,{method:'PATCH',body:JSON.stringify({status:b.dataset.status})});msg('Application updated.');await loadPage()}catch(e){msg(e.message,true)}};
  });
  document.querySelectorAll('[data-payment]').forEach(b=>{
    b.onclick=async()=>{try{await api('/admin/payments/'+b.dataset.id,{method:'PATCH',body:JSON.stringify({status:b.dataset.payment})});await loadPage()}catch(e){msg(e.message,true)}};
  });
  document.querySelectorAll('[data-leave]').forEach(b=>{
    b.onclick=async()=>{try{await api('/admin/leaves/'+b.dataset.id,{method:'PATCH',body:JSON.stringify({status:b.dataset.leave})});await loadPage()}catch(e){msg(e.message,true)}};
  });
  document.querySelectorAll('.inline-complaint').forEach(f=>{
    f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));try{await api('/admin/complaints/'+f.dataset.id,{method:'PATCH',body:JSON.stringify(d)});msg('Complaint updated.');await loadPage()}catch(x){msg(x.message,true)}};
  });
  document.querySelectorAll('[data-read]').forEach(b=>{
    b.onclick=async()=>{await api('/notifications/'+b.dataset.read+'/read',{method:'PATCH'});await loadPage()};
  });
}
render();
