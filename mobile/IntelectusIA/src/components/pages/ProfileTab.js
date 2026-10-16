import React,{useState} from 'react';
import {View,Switch} from 'react-native';
import {useAuth} from '../../contexts/AuthContext';
import {useTheme} from '../../contexts/ThemeContext';
import {resetPassword} from '../../services/session';
import {Screen,Back,Eyebrow,Heading,Copy,Card,Field,Button,Notice,useColors,s} from '../ui/Kit';
export default function ProfileTab({navigation}){
 const c=useColors(),auth=useAuth(),{isDarkMode,toggleDarkMode}=useTheme();
 const[name,setName]=useState(auth.user.displayName||''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 async function action(fn,success){if(busy)return;setBusy(true);setError('');setMessage('');try{await fn();setMessage(success);}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <Screen keyboard><Back navigation={navigation}/><Eyebrow>SEU ESPAÇO</Eyebrow><Heading>Minha conta.</Heading><Copy>Cuide dos seus dados e escolha como prefere estudar.</Copy><Notice error>{error}</Notice><Notice>{message}</Notice>
 <Card><Field label="Como podemos chamar você?" value={name} onChangeText={setName} autoComplete="name"/><Copy>{auth.user.email}</Copy><Button title="Salvar nome" busy={busy} disabled={!name.trim()} onPress={()=>action(()=>auth.updateName(name.trim()),'Seu nome foi atualizado.')}/></Card>
 <Card><View style={s.between}><View style={{flex:1}}><Eyebrow>APARÊNCIA</Eyebrow><Copy>Usar tema escuro</Copy></View><Switch accessibilityLabel="Usar tema escuro" value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{false:c.border,true:c.accent}}/></View></Card>
 <Card><Eyebrow>ACESSO À CONTA</Eyebrow><Copy>Para alterar sua senha, enviaremos as instruções ao e-mail da sua conta.</Copy><Button secondary title="Enviar recuperação de senha" busy={busy} onPress={()=>action(()=>resetPassword(auth.user.email),'Confira seu e-mail para redefinir a senha.')}/></Card>
 <Button secondary title="Sair da conta" icon="log-out" busy={busy} onPress={()=>action(auth.logout,'')}/><Copy style={{fontSize:12}}>Sem “Lembrar de mim”, sua sessão termina quando o aplicativo é encerrado. Sair da conta também remove a sessão salva.</Copy>
 </Screen>;
}
