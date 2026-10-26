import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const plusDays = n => { const d = new Date(); d.setDate(d.getDate()+n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const daysUntil = due => Math.round((new Date(`${due}T00:00:00`) - new Date(`${todayISO()}T00:00:00`)) / 86400000);
const score = task => { const days=daysUntil(task.due); const urgency=days<0?115:days===0?100:days===1?88:days<=3?70:days<=7?48:Math.max(18,40-days); return urgency+(task.importance-1)*16-(task.effort-1)*5; };
const priority = task => score(task)>=105?'Do this next':score(task)>=75?'Coming up':'On the horizon';
const dateLabel = due => { const n=daysUntil(due); if(n<0)return `${Math.abs(n)} day${n===-1?'':'s'} overdue`; if(n===0)return 'Due today'; if(n===1)return 'Due tomorrow'; return `Due ${new Date(`${due}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'})}`; };
const effortLabel = value => ({1:'Quick',2:'Medium',3:'Big'}[value] || 'Medium');
const importanceLabel = value => ({1:'Normal',2:'Important',3:'High stakes'}[value] || 'Normal');

let authToken = '';
function saveAuthToken(token) {
  authToken = token || '';
  if (authToken) localStorage.setItem('lastlap_token', authToken);
  else localStorage.removeItem('lastlap_token');
}
async function request(path, options={}) {
  let response;
  try { response = await fetch(`${API_BASE}/api${path}`, { ...options, headers: { 'Content-Type':'application/json', ...(authToken ? { Authorization: 'Bearer ' + authToken } : {}), ...options.headers } }); }
  catch { throw new Error('Could not reach the LastLap API. Make sure the server is running.'); }
  const payload = await response.json().catch(()=>({}));
  if(!response.ok){const error=new Error(payload.error||'Request failed ('+response.status+').');error.status=response.status;throw error;}
  return payload;
}

export default function App() {
  const [tasks,setTasks]=useState([]),[filter,setFilter]=useState('active'),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[modalOpen,setModalOpen]=useState(false),[saving,setSaving]=useState(false),[formError,setFormError]=useState(''),[toast,setToast]=useState(''),[remaining,setRemaining]=useState(1500),[running,setRunning]=useState(false),[timerDone,setTimerDone]=useState(false);
  const [user,setUser]=useState(null),[authChecked,setAuthChecked]=useState(false),[authMode,setAuthMode]=useState('register'),[authBusy,setAuthBusy]=useState(false),[authError,setAuthError]=useState('');
  const formRef=useRef(null),dialogRef=useRef(null),toastTimer=useRef(null);
  const notify=useCallback(message=>{setToast(message);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),2800)},[]);
const loadTasks=useCallback(async()=>{
    setLoading(true);setLoadError('');
    try{const data=await request('/tasks');setTasks(data.tasks)}
    catch(error){if(error.status===401){saveAuthToken('');setUser(null);setTasks([])}else setLoadError(error.message)}
    finally{setLoading(false)}
  },[]);
  useEffect(()=>{authToken=localStorage.getItem('lastlap_token')||'';if(!authToken){setAuthChecked(true);return}request('/auth/me').then(data=>setUser(data.user)).catch(error=>{if(error.status===401)saveAuthToken('');else setAuthError(error.message)}).finally(()=>setAuthChecked(true))},[]);
  useEffect(()=>{if(user)loadTasks();return()=>clearTimeout(toastTimer.current)},[loadTasks,user]);
  useEffect(()=>{const dialog=dialogRef.current;if(modalOpen&&dialog&&!dialog.open)dialog.showModal();else if(!modalOpen&&dialog?.open)dialog.close()},[modalOpen]);
  useEffect(()=>{if(!running)return;const id=setInterval(()=>setRemaining(t=>{if(t<=1){clearInterval(id);setRunning(false);setTimerDone(true);notify('Focus session complete — well done!');return 0}return t-1}),1000);return()=>clearInterval(id)},[running,notify]);

  const openTasks=tasks.filter(t=>!t.done),doneTasks=tasks.filter(t=>t.done),soonCount=openTasks.filter(t=>daysUntil(t.due)<=2).length;
  const shown=useMemo(()=>tasks.filter(t=>filter==='today'?!t.done&&daysUntil(t.due)===0:filter==='done'?t.done:!t.done).sort((a,b)=>filter==='done'?new Date(b.completedAt||b.updatedAt||0)-new Date(a.completedAt||a.updatedAt||0):score(b)-score(a)),[tasks,filter]);
  async function submitAuth(event){event.preventDefault();setAuthBusy(true);setAuthError('');const form=new FormData(event.currentTarget);const data={email:String(form.get('email')||'').trim(),password:String(form.get('password')||'')};try{const result=await request(`/auth/${authMode}`,{method:'POST',body:JSON.stringify(data)});saveAuthToken(result.token);setUser(result.user);setTasks([])}catch(error){setAuthError(error.message)}finally{setAuthBusy(false)}}
  function signOut(){saveAuthToken('');setUser(null);setTasks([]);setLoadError('');setAuthError('');setFilter('active')}
  function showModal(){setFormError('');setModalOpen(true)}
  function hideModal(){setModalOpen(false);setFormError('');formRef.current?.reset()}
  async function createTask(event){event.preventDefault();setSaving(true);setFormError('');const form=new FormData(event.currentTarget);const data={title:String(form.get('title')||'').trim(),course:String(form.get('course')||'').trim(),due:String(form.get('due')||''),effort:Number(form.get('effort')),importance:Number(form.get('importance'))};try{const result=await request('/tasks',{method:'POST',body:JSON.stringify(data)});setTasks(list=>[...list,result.task]);setFilter('active');hideModal();notify('Assignment added. Your priorities are updated.')}catch(error){setFormError(error.message)}finally{setSaving(false)}}
  async function toggleTask(task){try{const {task:updated}=await request(`/tasks/${task._id}`,{method:'PATCH',body:JSON.stringify({done:!task.done})});setTasks(list=>list.map(t=>t._id===updated._id?updated:t));notify(updated.done?'Nice work — marked complete.':'Moved back to active work.')}catch(error){notify(error.message)}}
  async function deleteTask(task){try{await request(`/tasks/${task._id}`,{method:'DELETE'});setTasks(list=>list.filter(t=>t._id!==task._id));notify('Assignment removed.')}catch(error){notify(error.message)}}
  function changeFilter(value){setFilter(value)}
  function resetTimer(){setRunning(false);setRemaining(1500);setTimerDone(false)}
  const timerText=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  const pageTitle=filter==='today'?'Due today':filter==='done'?'Completed':'Your workload';

  if(!authChecked)return <div className="auth-screen"><div className="auth-card"><a className="brand"><b>L</b> lastlap<span>.</span></a><p>Checking your sign-in…</p></div></div>;
  if(!user)return <div className="auth-screen"><div className="auth-card"><a className="brand"><b>L</b> lastlap<span>.</span></a><small className="eyebrow">YOUR PERSONAL STUDY DESK</small><h1>{authMode==='register'?'Make room for focus.':'Welcome back.'}</h1><p>{authMode==='register'?'Create an account to keep your assignments private and in sync.':'Sign in to pick up where you left off.'}</p><form onSubmit={submitAuth}><label>Email address<input type="email" name="email" autoComplete="email" maxLength="254" required placeholder="you@example.com"/></label><label>Password<input type="password" name="password" autoComplete={authMode==='register'?'new-password':'current-password'} minLength="8" maxLength="72" required placeholder="At least 8 characters"/></label>{authError&&<div className="auth-error" role="alert">{authError}</div>}<button className="primary auth-submit" disabled={authBusy}>{authBusy?'Please wait…':authMode==='register'?'Create account':'Sign in'}</button></form><button className="auth-switch" onClick={()=>{setAuthMode(authMode==='register'?'login':'register');setAuthError('')}}>{authMode==='register'?'Already have an account? Sign in':'New to LastLap? Create an account'}</button><small className="auth-foot">Your assignments are visible only to your account.</small></div></div>;
  return <div className="shell">
    <aside className="sidebar"><a className="brand" href="#"><b>L</b> lastlap<span>.</span></a><small className="overline">YOUR SPACE</small>
      <button className={`nav ${filter==='active'?'active':''}`} onClick={()=>changeFilter('active')}>▦ &nbsp; My workload <i id="navcount">{openTasks.length}</i></button><button className={`nav ${filter==='today'?'active':''}`} onClick={()=>changeFilter('today')}>◷ &nbsp; Due today</button><button className={`nav ${filter==='done'?'active':''}`} onClick={()=>changeFilter('done')}>✓ &nbsp; Completed</button>
      <div className="sidebar-bottom"><div className="note">✳<p>Small steps<br/><strong>add up.</strong></p><small>ONE TASK AT A TIME</small></div><div className="profile"><b>{user.email.slice(0,1).toUpperCase()}</b><span><strong>{user.email}</strong><small>Your tasks are private</small><button className="signout" onClick={signOut}>Sign out</button></span><i/></div></div>
    </aside>
    <main><header><small>MY SPACE　/　<strong>{filter==='today'?'DUE TODAY':filter==='done'?'COMPLETED':'MY WORKLOAD'}</strong></small><span>{new Date().toLocaleDateString(undefined,{weekday:'short',month:'long',day:'numeric'})}</span></header>
      <section className="hero"><div><small className="eyebrow">● &nbsp; YOUR PERSONAL STUDY DESK</small><h1>Make the next<br/><em>hour count.</em></h1><p>A little clarity goes a long way. Here’s what’s on your plate.</p></div><div className="sun" aria-hidden="true">✳</div></section>
      <section className="stats"><article><small>IN YOUR QUEUE <b>↗</b></small><strong>{openTasks.length}</strong><span>things to work through</span></article><article className="urgent"><small>NEEDS ATTENTION <b>●</b></small><strong>{soonCount}</strong><span>due in the next 48 hours</span></article><article><small>ALREADY DONE <b>✳</b></small><strong>{doneTasks.length}</strong><span>you’re making progress</span></article></section>
      <section className="work"><div className="section-title"><div><small className="eyebrow">THE GAME PLAN</small><h2>{pageTitle}<span>.</span></h2></div><button className="primary" onClick={showModal}>＋ Add assignment</button></div>
        <div className="toolbar"><div className="tabs"><button className={`tab ${filter==='active'?'selected':''}`} onClick={()=>changeFilter('active')}>All active <b>{openTasks.length}</b></button><button className={`tab ${filter==='today'?'selected':''}`} onClick={()=>changeFilter('today')}>Due today</button><button className={`tab ${filter==='done'?'selected':''}`} onClick={()=>changeFilter('done')}>Completed</button></div><small>SORTED BY &nbsp;<b>PRIORITY ↓</b></small></div>
        {loadError&&<div className="api-error" role="alert"><span>{loadError}</span><button onClick={loadTasks}>Try again</button></div>}
        {loading?<div className="empty"><b>◌</b><h3>Loading your workload…</h3><p>Getting your assignments from the database.</p></div>:shown.length?shown.map(task=>{const days=daysUntil(task.due),dueClass=task.done?'done':days<0?'late':days===0?'today':days<=2?'soon':'';return <article className={`task ${task.done?'completed':''}`} key={task._id}><button className="check" onClick={()=>toggleTask(task)} aria-label={task.done?'Mark incomplete':'Mark complete'}>{task.done?'✓':''}</button><div><h3>{task.title}</h3><div className="meta">{task.course} <span>·</span> {effortLabel(task.effort)} effort</div>{!task.done&&<div className={`priority ${score(task)>=75?'high':'low'}`}>{priority(task)} · {importanceLabel(task.importance)}</div>}</div><div className="task-actions"><span className={`due ${dueClass}`}>{task.done?'Completed':dateLabel(task.due)}</span><button className="delete" onClick={()=>deleteTask(task)} aria-label={`Delete ${task.title}`} title="Delete assignment">×</button></div></article>}):<div className="empty"><b>✳</b><h3>{filter==='today'?'Nothing due today.':filter==='done'?'Your wins will show up here.':'A clean slate.'}</h3><p>{filter==='today'?'Enjoy the breathing room, or add an assignment to keep your week in view.':filter==='done'?'Complete an assignment when you finish it. Every step counts.':'Add your first assignment and we’ll help you figure out what deserves your attention first.'}</p>{filter!=='done'&&<button className="link" onClick={showModal}>Add your first assignment　↗</button>}</div>}
      </section><footer><span>MADE FOR THE MOMENT BEFORE “I’LL DO IT LATER.”</span><span>YOUR PROGRESS IS SAVED TO MONGODB　<i/></span></footer>
    </main>
    <aside className="rail"><small>FOCUS CORNER <span>···</span></small><div className="focus"><small>◉　A MOMENT FOR YOU</small><h3>Give one thing<br/>your full attention.</h3><p>Pick a task. Set a small intention. Start where you are.</p><div className="ring"><div><strong>{timerText}</strong><small>MINUTES</small></div></div><div className="controls"><button id="start" onClick={()=>timerDone?resetTimer():setRunning(value=>!value)}>{timerDone?'Start again':running?'Pause focus　Ⅱ':remaining<1500?'Resume focus　→':'Start focus　→'}</button><button id="reset" onClick={resetTimer} aria-label="Reset timer">↺</button></div><div id="caption">{timerDone?'Focus session complete. Take a well-earned break.':running?'You’re doing great. Stay with this one thing.':remaining<1500?'Paused. Pick it back up when you’re ready.':'A focused 25 minutes can change your day.'}</div></div><div className="quote"><b>“</b><p>You don’t have to see the whole staircase. Just take the first step.</p><small>— MARTIN LUTHER KING JR.</small></div><div className="tip"><b>✧</b><span><strong>A gentle reminder</strong><p>Done is better than perfect. Start small, then keep going.</p></span></div></aside>
    {modalOpen&&<dialog ref={dialogRef} onClose={hideModal} onClick={event=>{if(event.target===event.currentTarget)hideModal()}}><form ref={formRef} onSubmit={createTask}><div className="modalhead"><div><small className="eyebrow">MAKE A PLAN</small><h2>What’s on your plate?</h2></div><button type="button" id="close" onClick={hideModal} aria-label="Close">×</button></div><label>Assignment name<input name="title" maxLength="80" placeholder="e.g. Biology lab report" required autoFocus/></label><div className="row"><label>Course or subject<input name="course" maxLength="40" placeholder="e.g. Biology" required/></label><label>Due date<input name="due" type="date" min={todayISO()} defaultValue={plusDays(2)} required/></label></div><div className="row"><label>Estimated effort<select name="effort" defaultValue="2"><option value="1">Quick · under 1 hour</option><option value="2">Medium · 1–3 hours</option><option value="3">Big · 3+ hours</option></select></label><label>Importance<select name="importance" defaultValue="2"><option value="1">Normal</option><option value="2">Important</option><option value="3">High stakes</option></select></label></div><p className="hint">Priority weighs urgency, importance, and effort to help you choose what to tackle next.</p><div className="actions"><button type="button" onClick={hideModal}>Cancel</button><button className="primary" disabled={saving}>{saving?'Saving…':'Add to my workload　→'}</button></div>{formError&&<div id="error" role="alert">{formError}</div>}</form></dialog>}
    {toast&&<div className="toast show" role="status" aria-live="polite">{toast}</div>}
  </div>;
}



