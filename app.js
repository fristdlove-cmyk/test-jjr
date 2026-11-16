(function(){
  const header=document.getElementById('header');
  const burger=document.getElementById('burger');
  const nav=document.getElementById('nav');
  const onScroll=()=>header.classList.toggle('is-scrolled',scrollY>10);
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  const setMenu=open=>{nav.classList.toggle('is-open',open);burger.setAttribute('aria-expanded',open);burger.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');};
  burger.addEventListener('click',()=>setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

  // Active link
  const links=[...nav.querySelectorAll('a:not(.btn)')];
  const secs=links.map(l=>document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle('is-active',l.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(s=>so.observe(s));

  // Tabs
  const tabs=[...document.querySelectorAll('[role=tab]')];
  const select=t=>{tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});};
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(t));t.addEventListener('keydown',e=>{let n=null;if(e.key==='ArrowRight')n=tabs[(i+1)%tabs.length];if(e.key==='ArrowLeft')n=tabs[(i-1+tabs.length)%tabs.length];if(n){select(n);n.focus();}});});

  // Counters
  const fmt=n=>n.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ');
  const nums=[...document.querySelectorAll('[data-count]')];
  const run=()=>{const t0=performance.now(),d=1400;nums.forEach(el=>el.textContent='0');
    const tick=()=>{const p=Math.min((performance.now()-t0)/d,1),e=1-Math.pow(1-p,3);nums.forEach(el=>el.textContent=fmt(Math.round(+el.dataset.count*e))+(el.dataset.suffix||''));if(p<1)setTimeout(tick,16)};tick();};
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const st=document.querySelector('.stats');const co=new IntersectionObserver(es=>{if(es[0].isIntersecting){run();co.disconnect()}},{threshold:.3});co.observe(st);}

  // Reveal
  const rv=document.querySelectorAll('.section__head,.split__text,.split__media,.panel,.mosaic,.services,.news,.contact,.opts,.cal,.tt,.comms');
  const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');ro.unobserve(e.target)}}),{threshold:.08});
  rv.forEach(el=>{el.classList.add('reveal');ro.observe(el)});


  // Calendrier scolaire 2026-2027
  const EV=[
    ['2026-09-01','2026-09-01','cours','Rentrée scolaire 2026–2027'],
    ['2026-10-30','2026-10-30','event','Remise des bulletins (1re période)'],
    ['2026-11-27','2026-11-27','event','Réunion parents–professeurs'],
    ['2026-12-07','2026-12-18','exam','Examens du 1er trimestre'],
    ['2026-12-21','2027-01-01','conge','Vacances de Noël et Nouvel An'],
    ['2026-12-25','2026-12-25','ferie','Noël'],
    ['2027-01-01','2027-01-01','ferie','Nouvel An'],
    ['2027-01-04','2027-01-04','cours','Reprise du 2e trimestre'],
    ['2027-01-16','2027-01-17','ferie','Journées des Héros nationaux'],
    ['2027-03-15','2027-03-26','exam','Examens du 2e trimestre'],
    ['2027-03-29','2027-04-09','conge','Vacances de Pâques'],
    ['2027-04-12','2027-04-12','cours','Reprise du 3e trimestre'],
    ['2027-05-01','2027-05-01','ferie','Fête du Travail'],
    ['2027-05-17','2027-05-17','ferie','Journée de la Libération'],
    ['2027-06-07','2027-06-25','exam','ENAFEP, TENASOSP et Examen d\u2019État'],
    ['2027-07-02','2027-07-02','event','Proclamation des résultats et fin d\u2019année']
  ].map(([a,b,t,l])=>({a:new Date(a+'T00:00'),b:new Date(b+'T00:00'),t,l}));
  const PRI={ferie:4,exam:3,cours:2,event:2,conge:1};
  const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const JOURS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const START=new Date(2026,8,1),END=new Date(2027,6,1);
  const grid=document.getElementById('calGrid'),title=document.getElementById('calTitle'),evList=document.getElementById('calEvents');
  const prev=document.getElementById('calPrev'),next=document.getElementById('calNext');
  const today=new Date();today.setHours(0,0,0,0);
  let cur=new Date(today.getFullYear(),today.getMonth(),1);
  if(cur<START)cur=new Date(START);if(cur>END)cur=new Date(END);
  const dd=d=>String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
  const render=()=>{
    const y=cur.getFullYear(),m=cur.getMonth();
    title.textContent=MOIS[m]+' '+y;
    let h=JOURS.map(j=>'<div class="cal__dow" role="columnheader">'+j+'</div>').join('');
    const off=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();
    for(let i=0;i<off;i++)h+='<div class="cal__day cal__day--out" aria-hidden="true"></div>';
    for(let d=1;d<=n;d++){
      const dt=new Date(y,m,d),wd=(dt.getDay()+6)%7;
      const hits=EV.filter(e=>dt>=e.a&&dt<=e.b).sort((p,q)=>PRI[q.t]-PRI[p.t]);
      const cls='cal__day'+(wd===6?' cal__day--we':'')+(+dt===+today?' cal__day--today':'');
      const lab=d+' '+MOIS[m]+(hits.length?' : '+hits.map(e=>e.l).join(', '):'');
      h+='<div class="'+cls+'"'+(hits.length?' data-type="'+hits[0].t+'" title="'+hits.map(e=>e.l).join(' · ')+'"':'')+' role="gridcell" aria-label="'+lab+'">'+d+'</div>';
    }
    grid.innerHTML=h;
    const first=new Date(y,m,1),last=new Date(y,m,n);
    const evs=EV.filter(e=>e.b>=first&&e.a<=last);
    evList.innerHTML=evs.length?evs.map(e=>'<li><time>'+(+e.a===+e.b?dd(e.a):dd(e.a)+' – '+dd(e.b))+'</time><span>'+e.l+'</span></li>').join(''):'<li class="none">Aucun événement particulier ce mois-ci.</li>';
    prev.disabled=cur<=START;next.disabled=cur>=END;
  };
  prev.addEventListener('click',()=>{cur=new Date(cur.getFullYear(),cur.getMonth()-1,1);render();});
  next.addEventListener('click',()=>{cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);render();});
  render();

  // Horaire des cours
  const S={
    'Mathématiques':'sci','Sciences':'sci','Physique':'sci','Chimie':'sci','Biologie':'sci','Informatique':'sci','Géométrie':'sci','Algèbre':'sci','Philosophie':'hum','Pédagogie':'hum','Psychologie':'hum','Didactique':'hum',
    'Français':'lang','Anglais':'lang','Lingala':'lang','Latin':'lang',
    'Histoire':'hum','Géographie':'hum','Éducation civique':'hum','Religion':'hum',
    'Dessin':'art','Musique':'art','Éducation physique':'art','Club sciences':'art','Soutien scolaire':'art','Sport':'art','Stages pratiques':'art'
  };
  const SLOTS=['07h30 – 08h20','08h20 – 09h10','09h10 – 10h00','PAUSE','10h20 – 11h10','11h10 – 12h00','12h00 – 12h50'];
  const TT={
    p6:{n:'6e année primaire',d:[
      ['Mathématiques','Français','Mathématiques','Français','Mathématiques','Soutien scolaire'],
      ['Français','Mathématiques','Sciences','Mathématiques','Français','Soutien scolaire'],
      ['Sciences','Anglais','Français','Histoire','Géographie','Sport'],
      ['Géographie','Éducation civique','Anglais','Sciences','Religion','Sport'],
      ['Religion','Dessin','Informatique','Lingala','Musique','—'],
      ['Éducation physique','Lingala','—','Éducation physique','—','—']]},
    eb8:{n:'8e Éducation de base',d:[
      ['Algèbre','Français','Géométrie','Français','Physique','Club sciences'],
      ['Français','Algèbre','Anglais','Biologie','Algèbre','Club sciences'],
      ['Biologie','Anglais','Français','Géométrie','Anglais','Sport'],
      ['Histoire','Chimie','Informatique','Latin','Français','Sport'],
      ['Géographie','Éducation civique','Religion','Histoire','Dessin','—'],
      ['Éducation physique','Latin','—','Éducation physique','Musique','—']]},
    h3s:{n:'3e Humanités Scientifique',d:[
      ['Algèbre','Physique','Chimie','Algèbre','Biologie','Soutien scolaire'],
      ['Physique','Algèbre','Chimie','Géométrie','Physique','Soutien scolaire'],
      ['Chimie','Biologie','Français','Physique','Algèbre','Club sciences'],
      ['Français','Anglais','Géométrie','Biologie','Français','Club sciences'],
      ['Biologie','Français','Anglais','Informatique','Religion','—'],
      ['Éducation physique','Histoire','—','Géographie','Éducation civique','—']]},
    h3l:{n:'3e Humanités Latin-Philo',d:[
      ['Latin','Philosophie','Français','Latin','Histoire','Soutien scolaire'],
      ['Français','Latin','Philosophie','Français','Latin','Soutien scolaire'],
      ['Philosophie','Anglais','Histoire','Mathématiques','Français','Sport'],
      ['Histoire','Français','Latin','Anglais','Philosophie','Sport'],
      ['Mathématiques','Géographie','Anglais','Biologie','Religion','—'],
      ['Éducation physique','Éducation civique','—','Géographie','Musique','—']]},
    h3p:{n:'3e Humanités Pédagogie',d:[
      ['Pédagogie','Psychologie','Didactique','Pédagogie','Français','Stages pratiques'],
      ['Psychologie','Pédagogie','Français','Didactique','Mathématiques','Stages pratiques'],
      ['Français','Mathématiques','Pédagogie','Psychologie','Didactique','Sport'],
      ['Didactique','Français','Mathématiques','Français','Anglais','Sport'],
      ['Mathématiques','Anglais','Sciences','Histoire','Religion','—'],
      ['Éducation physique','Géographie','—','Dessin','Musique','—']]}
  };
  const ttSel=document.getElementById('ttClass'),ttBody=document.getElementById('ttBody'),ttCap=document.getElementById('ttCaption');
  const cell=c=>c==='—'?'<td aria-label="Pas de cours">—</td>':'<td><span class="subj subj--'+(S[c]||'hum')+'">'+c+'</span></td>';
  const renderTT=()=>{
    const t=TT[ttSel.value];let r=0;
    ttCap.textContent='Horaire de la '+t.n;
    ttBody.innerHTML=SLOTS.map(s=>s==='PAUSE'?'<tr class="is-break"><th scope="row">10h00 – 10h20</th><td colspan="6">Récréation</td></tr>':'<tr><th scope="row">'+s+'</th>'+t.d[r++].map(cell).join('')+'</tr>').join('');
  };
  ttSel.addEventListener('change',renderTT);renderTT();
  document.getElementById('ttPrint').addEventListener('click',()=>{document.body.classList.add('print-tt');print();});
  addEventListener('afterprint',()=>document.body.classList.remove('print-tt'));

  // Filtre des communiqués
  const chips=[...document.querySelectorAll('.chip')],comms=[...document.querySelectorAll('.comm')],empty=document.getElementById('commsEmpty');
  document.querySelectorAll('[data-count-for]').forEach(n=>{const f=n.dataset.countFor;n.textContent=comms.filter(a=>f==='all'||a.dataset.cat===f).length;});
  chips.forEach(c=>c.addEventListener('click',()=>{
    const f=c.dataset.filter;
    chips.forEach(x=>{const on=x===c;x.classList.toggle('is-on',on);x.setAttribute('aria-pressed',on);});
    let shown=0;comms.forEach(a=>{const ok=f==='all'||a.dataset.cat===f;a.hidden=!ok;if(ok)shown++;});
    empty.hidden=shown>0;
  }));

})();
