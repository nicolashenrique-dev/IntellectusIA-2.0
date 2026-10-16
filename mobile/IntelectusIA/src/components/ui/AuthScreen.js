import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { resetPassword } from '../../services/session';
import { Screen, Brand, Eyebrow, Heading, Copy, Card, Field, Button, Notice, useColors, s } from './Kit';
export default function AuthScreen({ navigation, mode = 'login' }) {
  const c = useColors(); const auth = useAuth();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('');
  const [remember,setRemember]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [message,setMessage]=useState('');
  const register=mode==='register', reset=mode==='reset';
  async function submit() {
    setError(''); setMessage('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Informe um e-mail válido.'); return; }
    if (!reset && (!password || (register && password.length<6))) { setError('Use uma senha com pelo menos 6 caracteres.'); return; }
    if (register && !name.trim()) { setError('Informe como podemos chamar você.'); return; }
    setBusy(true);
    try {
      if (reset) { await resetPassword(email); setMessage('Se houver uma conta com esse e-mail, você receberá as instruções para redefinir a senha.'); }
      else if (register) await auth.register(name,email,password);
      else await auth.login(email,password,remember);
    } catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  return <Screen keyboard><Brand/><View style={{ marginTop:18 }}><Eyebrow>{register ? 'SEU PRIMEIRO PASSO' : reset ? 'VAMOS AJUDAR VOCÊ' : 'BOM TER VOCÊ POR AQUI'}</Eyebrow><Heading>{register ? 'Abra espaço para novas possibilidades.' : reset ? 'Recupere seu acesso.' : 'Seu próximo passo começa aqui.'}</Heading><Copy>{register ? 'Crie sua conta e encontre uma trilha que faça sentido para você.' : reset ? 'Informe seu e-mail para receber as instruções.' : 'Entre para continuar seus estudos. No seu tempo, na sua direção.'}</Copy></View>
    <View style={{gap:18}}><Notice error>{error}</Notice><Notice>{message}</Notice>
      {register && <Field label="Como podemos chamar você?" value={name} onChangeText={setName} autoComplete="name" placeholder="Seu nome"/>}
      <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="voce@exemplo.com"/>
      {!reset && <Field label="Senha" password value={password} onChangeText={setPassword} autoComplete={register ? 'new-password' : 'current-password'} placeholder={register ? 'Pelo menos 6 caracteres' : 'Sua senha'}/>}
      {!register && !reset && <><Pressable accessibilityRole="checkbox" accessibilityState={{checked:remember}} onPress={() => setRemember(!remember)} style={[s.row,{minHeight:44}]}><Feather name={remember ? 'check-square' : 'square'} size={22} color={c.accent}/><Text style={{color:c.muted,fontSize:13}}>Lembrar de mim neste dispositivo</Text></Pressable><Pressable accessibilityRole="button" onPress={() => navigation.navigate('ForgotPassword')} style={{minHeight:40,justifyContent:'center'}}><Text style={{color:c.accent,fontSize:13}}>Esqueceu a senha?</Text></Pressable></>}
      <Button title={register ? 'Começar minha jornada' : reset ? 'Enviar instruções' : 'Entrar na minha conta'} icon="arrow-right" busy={busy} onPress={submit}/>
      <Button secondary title={register || reset ? 'Já tenho uma conta' : 'Criar uma conta'} onPress={() => navigation.navigate(register || reset ? 'Login' : 'Register')}/>
    </View>
    {!register && !reset && <Card style={{backgroundColor:c.soft,marginTop:8}}><Eyebrow>APRENDER ABRE CAMINHOS</Eyebrow><Copy>Você não precisa ter todas as respostas. Só precisa de um lugar para começar.</Copy></Card>}
  </Screen>;
}
