import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const inline = p => fs.readFileSync(p,'utf8').match(/<script is:inline(?: define:vars=\{\{ gaId \}\})?>([\s\S]*?)<\/script>/)[1];
const runtime=inline('src/layouts/BaseLayout.astro'), ui=inline('src/pages/pengaturan-cookie.astro');
const key='menara-cookie-consent';
function setup({localFail=false,sessionFail=false,initial=true,readFail=false,sessionReadFail=false,removeFail=false,shared}={}) {
 const local=shared||new Map(initial?[[key,JSON.stringify({analytics:true})]]:[]), session=new Map(), appended=[], elements={};
 const storage=(map,fail,isSession=false)=>({getItem:k=>{if(readFail||(isSession&&sessionReadFail))throw Error("read blocked");return map.get(k)||null},setItem(k,v){if(fail)throw Error('blocked');map.set(k,v)},removeItem(k){if(fail||(isSession&&removeFail))throw Error('blocked');map.delete(k)}});
 const listeners={};const c={gaId:'G-HXM22WWPKP',Event:class{constructor(type){this.type=type}},addEventListener:(type,fn)=>(listeners[type]||=[]).push(fn),dispatchEvent:event=>(listeners[event.type]||[]).forEach(fn=>fn(event)),localStorage:storage(local,localFail),sessionStorage:storage(session,sessionFail,true),document:{head:{appendChild:s=>appended.push(s)},createElement:()=>({}),getElementById:id=>elements[id] ||= {checked:false,textContent:'',addEventListener(e,f){this[e]=f}}},Date};c.window=c;vm.createContext(c);vm.runInContext(runtime,c);vm.runInContext(ui,c);return {c,local,session,appended,elements};
}
for(const options of [{},{localFail:true},{localFail:true,sessionFail:true}]) {
 const x=setup(options);assert.equal(x.appended.length,1);x.elements['reject'].click();assert.equal(x.c['ga-disable-G-HXM22WWPKP'],true);assert.equal(x.c.readMenaraConsent().analytics,false);assert.equal(x.elements['analytics'].checked,false);
 const command=x.c.dataLayer.at(-1);assert.equal(command[0],'consent');assert.equal(command[2].analytics_storage,'denied');
 vm.runInContext(runtime,x.c);assert.equal(x.appended.length,1);assert.equal(x.c.readMenaraConsent().analytics,false);
 if(options.localFail&&!options.sessionFail) {delete x.c.setMenaraAnalytics;vm.runInContext(runtime,x.c);assert.equal(x.c.readMenaraConsent().analytics,false);assert.equal(x.appended.length,1);}
 x.elements['analytics'].checked=true;x.elements['save'].click();assert.equal(x.c['ga-disable-G-HXM22WWPKP'],false);assert.equal(x.c.dataLayer.at(-1)[2].analytics_storage,'granted');
 // Same loaded document regrant must not add a loader.
 assert.equal(x.appended.length,1);
}
const first=setup({initial:false});assert.equal(first.appended.length,0);first.elements['analytics'].checked=true;first.elements['save'].click();assert.equal(first.appended.length,1);
console.log('Consent VM passed: stored grant, immediate withdrawal, old grant readable/local write blocked, both storage writes blocked, session veto on navigation runtime, re-entry, allow-deny-allow and one loader.');

const blockedRead=setup({readFail:true});assert.equal(blockedRead.appended.length,0);blockedRead.elements['reject'].click();assert.equal(blockedRead.c['ga-disable-G-HXM22WWPKP'],true);
const bad=setup({initial:false});bad.local.set(key,'{bad');delete bad.c.setMenaraAnalytics;vm.runInContext(runtime,bad.c);assert.equal(bad.appended.length,0);
console.log('Additional fail-closed checks passed: both storage reads blocked and malformed stored preferences.');

const unreadable=setup({sessionReadFail:true});assert.equal(unreadable.appended.length,0);assert.equal(unreadable.c['ga-disable-G-HXM22WWPKP'],true);
const retained=setup({removeFail:true});retained.elements['reject'].click();retained.elements['analytics'].checked=true;retained.elements['save'].click();assert.equal(retained.c['ga-disable-G-HXM22WWPKP'],true);assert.equal(JSON.parse(retained.local.get(key)).analytics,false);assert.equal(retained.elements['analytics'].checked,false);
const shared=new Map([[key,JSON.stringify({analytics:true})]]),tabA=setup({shared}),tabB=setup({shared});tabB.elements['reject'].click();tabA.c.dispatchEvent({type:'storage',key,newValue:shared.get(key)});assert.equal(tabA.c['ga-disable-G-HXM22WWPKP'],true);assert.equal(tabA.c.readMenaraConsent().analytics,false);assert.equal(tabA.elements['analytics'].checked,false);assert.equal(tabA.c.dataLayer.at(-1)[2].analytics_storage,'denied');
shared.set(key,JSON.stringify({analytics:true}));tabA.c.dispatchEvent({type:'storage',key,newValue:shared.get(key)});assert.equal(tabA.c.readMenaraConsent().analytics,false);assert.equal(tabA.appended.length,1);
console.log('Follow-up exact-inline-source fixtures passed: unreadable session veto + readable local grant failclosed; failed veto removal cannot share new grant; independent tabs shared local storage denial event revokes runtime and UI; later external grant cannot undo document veto.');
