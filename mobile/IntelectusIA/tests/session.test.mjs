import test from 'node:test';
import assert from 'node:assert/strict';
import {createSessionStore} from '../src/services/sessionCore.mjs';
function storage(){let value=null;return{get:async()=>value,set:async v=>{value=v;},clear:async()=>{value=null;}};}
const account={user:{uid:'user-a'},idToken:'short-lived',refreshToken:'refresh-a'};
test('sem lembrar, nenhum token persiste após reiniciar o app',async()=>{const disk=storage(),s=createSessionStore(disk);await s.establish(account,false);assert.equal(s.current().user.uid,'user-a');assert.equal(await disk.get(),null);assert.equal(await createSessionStore(disk).restore(()=>{throw Error('não deve validar');}),null);});
test('lembrar salva somente credencial de renovação e valida antes de restaurar',async()=>{const disk=storage(),s=createSessionStore(disk);await s.establish(account,true);assert.equal(await disk.get(),'refresh-a');let validated=false;const fresh=createSessionStore(disk);assert.equal(fresh.current(),null);await fresh.restore(async token=>{assert.equal(token,'refresh-a');validated=true;return account;});assert.equal(validated,true);assert.equal(fresh.current().user.uid,'user-a');});
test('desmarcar lembrar apaga sessão persistente anterior',async()=>{const disk=storage(),s=createSessionStore(disk);await s.establish(account,true);await s.establish(account,false);assert.equal(await disk.get(),null);});
test('sair limpa memória, disco e impede renovação pendente de recriar a sessão',async()=>{const disk=storage(),s=createSessionStore(disk);await s.establish(account,true);const version=s.revision();await s.clear();assert.equal(await s.renew(account,version),false);assert.equal(s.current(),null);assert.equal(await disk.get(),null);});
test('credencial inválida é removida; falha de rede permite nova tentativa',async()=>{const disk=storage(),s=createSessionStore(disk);await s.establish(account,true);await assert.rejects(createSessionStore(disk).restore(async()=>{throw Error('offline');}));assert.equal(await disk.get(),'refresh-a');await assert.rejects(createSessionStore(disk).restore(async()=>{const e=Error('expired');e.invalidSession=true;throw e;}));assert.equal(await disk.get(),null);});
test('logout vence uma gravação de renovação já em andamento',async()=>{
 let value=null,release;const disk={get:async()=>value,set:async v=>{if(v==='pending')await new Promise(r=>{release=r;});value=v;},clear:async()=>{value=null;}};
 const s=createSessionStore(disk);await s.establish(account,true);
 const pending=s.renew({...account,refreshToken:'pending'},s.revision());
 await new Promise(r=>setTimeout(r,0));
 const ended=s.clear();release();await Promise.all([pending,ended]);
 assert.equal(await disk.get(),null);assert.equal(s.current(),null);
});
