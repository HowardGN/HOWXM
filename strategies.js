// Estrategias EDUCATIVAS reproducibles en H4. Los parametros son HIPOTESIS, no valores optimos demostrados.
// Senales al CIERRE de la vela i -> ejecucion en la APERTURA de i+1 (sin informacion futura).
const P={emaF:20,emaS:200,atr:14,donIn:20,donOut:10,bb:20,bbK:2,rsi:14,stopTrend:2,trail:3,stopRev:1.5,timeRev:12};
function ema(a,n){const k=2/(n+1);let e=a[0];return a.map(v=>e=v*k+e*(1-k))}
function wil(a,n){const o=new Array(a.length).fill(null);let s=0;for(let i=0;i<a.length;i++){if(i<n-1)s+=a[i];else if(i===n-1){s+=a[i];o[i]=s/n}else o[i]=(o[i-1]*(n-1)+a[i])/n}return o}
function series(c){const n=c.length,cl=c.map(x=>x.c),tr=c.map((x,i)=>{const p=i?c[i-1].c:x.c;return Math.max(x.h-x.l,Math.abs(x.h-p),Math.abs(x.l-p))}),atr=wil(tr,P.atr);
 const pdm=[0],mdm=[0];for(let i=1;i<n;i++){const u=c[i].h-c[i-1].h,d=c[i-1].l-c[i].l;pdm.push(u>d&&u>0?u:0);mdm.push(d>u&&d>0?d:0)}
 const sT=wil(tr,14),sP=wil(pdm,14),sM=wil(mdm,14),dx=sT.map((t,i)=>{if(!t)return null;const p=100*sP[i]/t,m=100*sM[i]/t;return p+m?100*Math.abs(p-m)/(p+m):0}),f=dx.findIndex(v=>v!=null),adx=new Array(n).fill(null);if(f>=0)wil(dx.slice(f),14).forEach((v,j)=>{adx[f+j]=v});
 const rsi=new Array(n).fill(null);let ag=0,al=0;for(let i=1;i<n;i++){const d=cl[i]-cl[i-1],g=d>0?d:0,l=d<0?-d:0;if(i<=P.rsi){ag+=g/P.rsi;al+=l/P.rsi}else{ag=(ag*(P.rsi-1)+g)/P.rsi;al=(al*(P.rsi-1)+l)/P.rsi}if(i>=P.rsi)rsi[i]=al===0?100:100-100/(1+ag/al)}
 const bbM=[],bbU=[],bbL=[];for(let i=0;i<n;i++){if(i<P.bb-1){bbM.push(null);bbU.push(null);bbL.push(null);continue}let s=0;for(let j=i-P.bb+1;j<=i;j++)s+=cl[j];const m=s/P.bb;let v=0;for(let j=i-P.bb+1;j<=i;j++)v+=(cl[j]-m)**2;const sd=Math.sqrt(v/P.bb);bbM.push(m);bbU.push(m+P.bbK*sd);bbL.push(m-P.bbK*sd)}
 const pr=(k,fn,key)=>c.map((_,i)=>{if(i<k)return null;let r=c[i-k][key];for(let j=i-k+1;j<i;j++)r=fn(r,c[j][key]);return r});
 const atrR=atr.map((v,i)=>{if(v==null||i<60)return null;let s=0,m=0;for(let j=i-49;j<=i;j++)if(atr[j]!=null){s+=atr[j];m++}return m?v/(s/m):null});
 return{cl,atr,adx,rsi,e20:ema(cl,P.emaF),e200:ema(cl,P.emaS),bbM,bbU,bbL,dH20:pr(P.donIn,Math.max,'h'),dL20:pr(P.donIn,Math.min,'l'),dH10:pr(P.donOut,Math.max,'h'),dL10:pr(P.donOut,Math.min,'l'),atrR}}
const ok_=(...v)=>v.every(x=>x!=null);
const STR=[
{id:'ema_trend',name:'Tendencia EMA20/200 + ATR14',tf:'H4',stopK:P.stopTrend,trail:P.trail,
 doc:{entrada:'Con ADX >= 20 y EMA20 separada de la EMA200 por más de 0.5 ATR: compra al cierre de la vela que vuelve a cerrar sobre la EMA20 después de cerrar bajo ella (pullback), con precio sobre la EMA200. En bajista, al revés.',salida:'Cierre bajo la EMA200, o dos cierres seguidos bajo la EMA20. Además un stop móvil a 3 ATR del mejor cierre.',stop:'Inicial a 2 ATR14 de la entrada.',inval:'Si cierra del otro lado de la EMA200, la tendencia se invalidó.',nunca:'ADX < 20, EMAs planas o enredadas, o volatilidad más de 2 veces lo normal.'},
 ok:(I,i)=>ok_(I.adx[i],I.atr[i],I.atrR[i])&&I.adx[i]>=20&&Math.abs(I.e20[i]-I.e200[i])>.5*I.atr[i]&&I.atrR[i]<2,
 entry:(I,c,i)=>{const up=I.e20[i]>I.e200[i]&&c[i].c>I.e200[i]&&c[i-1].c<=I.e20[i-1]&&c[i].c>I.e20[i],dn=I.e20[i]<I.e200[i]&&c[i].c<I.e200[i]&&c[i-1].c>=I.e20[i-1]&&c[i].c<I.e20[i];return up?1:dn?-1:0},
 exit:(I,c,i,p)=>p.dir>0?(c[i].c<I.e200[i]||(c[i].c<I.e20[i]&&c[i-1].c<I.e20[i-1])):(c[i].c>I.e200[i]||(c[i].c>I.e20[i]&&c[i-1].c>I.e20[i-1])),
 watch:(I,c,i)=>I.e20[i]>I.e200[i]&&c[i].c>I.e200[i]&&c[i].c<I.e20[i]?'Pullback bajo la EMA20: vigila un cierre de vuelta sobre ella.':I.e20[i]<I.e200[i]&&c[i].c<I.e200[i]&&c[i].c>I.e20[i]?'Rebote sobre la EMA20 en tendencia bajista: vigila un cierre de vuelta bajo ella.':''},
{id:'donchian',name:'Ruptura Donchian 20/10',tf:'H4',stopK:P.stopTrend,
 doc:{entrada:'Compra si el cierre supera el máximo de las 20 velas anteriores y el precio está sobre la EMA200. Venta si cierra bajo el mínimo de las 20 anteriores y bajo la EMA200.',salida:'Compra: cierre bajo el mínimo de las 10 velas anteriores. Venta: cierre sobre el máximo de las 10 anteriores.',stop:'Inicial a 2 ATR14 de la entrada.',inval:'Cierre de vuelta dentro del canal de 20 velas poco después de romper.',nunca:'ADX < 15 (mercado muerto) o volatilidad más de 2 veces lo normal (caos).'},
 ok:(I,i)=>ok_(I.adx[i],I.atrR[i])&&I.adx[i]>=15&&I.atrR[i]>=.8&&I.atrR[i]<2,
 entry:(I,c,i)=>ok_(I.dH20[i],I.dL20[i])?(c[i].c>I.dH20[i]&&c[i].c>I.e200[i]?1:c[i].c<I.dL20[i]&&c[i].c<I.e200[i]?-1:0):0,
 exit:(I,c,i,p)=>p.dir>0?c[i].c<I.dL10[i]:c[i].c>I.dH10[i],
 watch:(I,c,i)=>ok_(I.dH20[i],I.dL20[i])&&c[i].c>I.dH20[i]*.995&&c[i].c<=I.dH20[i]?'Cerca del máximo de 20 velas: vigila una ruptura con cierre.':ok_(I.dL20[i])&&c[i].c<I.dL20[i]*1.005&&c[i].c>=I.dL20[i]?'Cerca del mínimo de 20 velas: vigila una ruptura bajista.':''},
{id:'range_revert',name:'Reversión Bollinger + RSI en rango',tf:'H4',stopK:P.stopRev,timeStop:P.timeRev,
 doc:{entrada:'Solo con ADX < 20 (rango): compra si cierra bajo la banda inferior de Bollinger(20,2) con RSI14 < 30; vende si cierra sobre la superior con RSI > 70.',salida:'Cierre de vuelta en la media de Bollinger (SMA20), o a las 12 velas si no llegó.',stop:'1.5 ATR14 más allá de la entrada.',inval:'Si el ADX sube de 25, el rango terminó y se sale.',nunca:'ADX >= 25: en tendencia comprar caídas es pelear contra el mercado.'},
 ok:(I,i)=>ok_(I.adx[i])&&I.adx[i]<20,
 entry:(I,c,i)=>ok_(I.bbL[i],I.rsi[i])?(c[i].c<I.bbL[i]&&I.rsi[i]<30?1:c[i].c>I.bbU[i]&&I.rsi[i]>70?-1:0):0,
 exit:(I,c,i,p)=>p.dir>0?c[i].c>=I.bbM[i]||(I.adx[i]!=null&&I.adx[i]>=25):c[i].c<=I.bbM[i]||(I.adx[i]!=null&&I.adx[i]>=25),
 watch:(I,c,i)=>ok_(I.adx[i])&&I.adx[i]>=25?'ADX >= 25: hay tendencia, esta estrategia se apaga.':''},
{id:'session_gold',name:'Ruptura de sesión (oro) - solo definida',tf:'H1',stopK:0,validated:false,
 doc:{entrada:'Rango de Asia (00:00-07:00 UTC). Entrar en la ruptura con cierre H1 del máximo o mínimo del rango durante 07:00-10:00 UTC.',salida:'Objetivo 1.5R o salida por tiempo a las 12:00 UTC.',stop:'En la mitad del rango de Asia.',inval:'Cierre H1 de vuelta dentro del rango.',nunca:'Si hay noticia de alto impacto, o en festivos y días de poca liquidez.'},
 ok:()=>false,entry:()=>0,exit:()=>false,watch:()=>'Aún no validada: necesita datos H1 y un backtest propio.'}];
function metrics(t){const n=t.length,w=t.filter(x=>x.r>0),l=t.filter(x=>x.r<0),sw=w.reduce((s,x)=>s+x.r,0),sl=-l.reduce((s,x)=>s+x.r,0);let eq=0,pk=0,dd=0;t.forEach(x=>{eq+=x.r;pk=Math.max(pk,eq);dd=Math.max(dd,pk-eq)});return{n,hit:n?+(w.length/n*100).toFixed(1):0,avgR:n?+(eq/n).toFixed(3):0,sumR:+eq.toFixed(2),pf:sl?+(sw/sl).toFixed(2):(sw?999:0),ddR:+dd.toFixed(2),netPct:+(eq*1).toFixed(1),ddPct:+(dd*1).toFixed(1),from:n?t[0].t:null,to:n?t[n-1].tx:null}}
function backtest(c,s,o){o=o||{};const cost=o.cost??.0008,shorts=o.shorts!==false,n=c.length;if(s.validated===false||n<260)return null;const I=series(c),tr=[];let pos=null,pend=null,pendExit=false;const split=Math.floor(n*.7);
 for(let k=210;k<n;k++){const bar=c[k];
  if(pos&&pendExit){tr.push(close(pos,bar.o,k,'regla'));pos=null;pendExit=false}
  if(!pos&&pend){const e=bar.o;pos={dir:pend.dir,entry:e,stop:e-pend.dir*pend.sd,sd:pend.sd,ei:k,t:bar.t,best:e,bars:0};pend=null}
  if(pos){const hit=pos.dir>0?bar.l<=pos.stop:bar.h>=pos.stop;if(hit){tr.push(close(pos,pos.dir>0?Math.min(pos.stop,bar.o):Math.max(pos.stop,bar.o),k,'stop'));pos=null}}
  if(k===n-1)break;
  if(pos){pos.bars++;pos.best=pos.dir>0?Math.max(pos.best,bar.c):Math.min(pos.best,bar.c);if(s.trail){const ts=pos.best-pos.dir*s.trail*(pos.sd/s.stopK);pos.stop=pos.dir>0?Math.max(pos.stop,ts):Math.min(pos.stop,ts)}if(s.exit(I,c,k,pos)||(s.timeStop&&pos.bars>=s.timeStop))pendExit=true}
  else if(!pend&&s.ok(I,k)&&I.atr[k]){const d=s.entry(I,c,k);if(d&&(d>0||shorts))pend={dir:d,sd:s.stopK*I.atr[k]}}}
 function close(p,x,k,why){const g=p.dir*(x-p.entry)-cost*p.entry;return{r:+(g/p.sd).toFixed(3),t:p.t,tx:c[k].t,ei:p.ei,why,dir:p.dir}}
 const dev=tr.filter(x=>x.ei<split),test=tr.filter(x=>x.ei>=split),sc=c[split];let bh=null;if(sc)bh=+((c[n-1].c/sc.c-1)*100).toFixed(1);
 return{id:s.id,dev:metrics(dev),test:metrics(test),all:metrics(tr),period:{from:c[0].t,to:c[n-1].t,bars:n,split:sc?sc.t:null},cost,shorts,buyHoldTestPct:bh,note:'Parametros = hipotesis. Costos supuestos. Resultado pasado no garantiza nada.'}}
function signalNow(c,s){if(s.validated===false)return{id:s.id,state:'none',applicable:false,why:[s.watch()],validated:false};const i=c.length-1;if(i<210)return{id:s.id,state:'none',applicable:false,why:['Pocas velas para calcular']};const I=series(c),ok=!!s.ok(I,i),d=s.entry(I,c,i),st=ok&&d?(d>0?'long':'short'):'none',atr=I.atr[i],sd=s.stopK*atr;
 return{id:s.id,state:st,applicable:ok,asOf:c[i].t,close:c[i].c,atr:+atr.toFixed(c[i].c<10?5:2),stop:d?+(c[i].c-d*sd).toFixed(c[i].c<10?5:2):null,stopDist:+sd.toFixed(c[i].c<10?5:2),adx:I.adx[i]!=null?+I.adx[i].toFixed(1):null,atrR:I.atrR[i]!=null?+I.atrR[i].toFixed(2):null,ema:I.e20[i]>I.e200[i]?'EMA20>EMA200':'EMA20<EMA200',why:[ok?'Condiciones de régimen cumplidas':'Régimen no apto: no operar',s.watch(I,c,i)].filter(Boolean)}}
function quality(c,tfMs,crypto,nowMs){const seen=new Set();let dups=0,gaps=0,gapRecent=0;const u=c.filter(x=>{if(seen.has(x.t)){dups++;return false}seen.add(x.t);return true}).sort((a,b)=>a.t-b.t);for(let i=1;i<u.length;i++){const d=u[i].t-u[i-1].t;if(d>1.5*tfMs&&(crypto||d>4*864e5)){gaps++;if(i>u.length-60)gapRecent++}}
 const last=u[u.length-1],ageMin=last?Math.round(((nowMs||Date.now())-(last.t+tfMs))/6e4):null;return{n:u.length,dups,gaps,gapRecent,ageMin,ok:u.length>=260&&gapRecent===0&&(ageMin==null?false:crypto?ageMin<tfMs/6e4+60:true)}}
function agg(c,ms){const m=new Map();c.forEach(x=>{const k=Math.floor(x.t/ms)*ms,b=m.get(k);if(!b)m.set(k,{t:k,o:x.o,h:x.h,l:x.l,c:x.c,v:x.v||0});else{b.h=Math.max(b.h,x.h);b.l=Math.min(b.l,x.l);b.c=x.c;b.v+=x.v||0}});return[...m.values()].sort((a,b)=>a.t-b.t)}
module.exports={P,series,STR,backtest,metrics,signalNow,quality,agg,ema};
