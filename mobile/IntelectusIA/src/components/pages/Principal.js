import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { showConfirm } from '../../utils';
import { Screen, Brand, Eyebrow, Heading, Copy, Card, Button, Notice, Busy, useColors, s } from '../ui/Kit';
export default function Principal({ navigation }) {
  const c=useColors(); const {user}=useAuth();
  const [roadmap,setRoadmap]=useState(null),[highlights,setHighlights]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[catalogError,setCatalogError]=useState(''),[enrolling,setEnrolling]=useState(false);
  const load=useCallback(async () => {
    setLoading(true);setError('');setCatalogError('');
    const results=await Promise.allSettled([api(`/trilhas/usuario/${user.uid}`).catch(e => { if(e.status===404)return {roadmap:null};throw e; }),api('/itens/destaques')]);
    if(results[0].status==='fulfilled')setRoadmap(results[0].value.roadmap);else setError(results[0].reason.message);
    if(results[1].status==='fulfilled')setHighlights(results[1].value.destaques||[]);else setCatalogError('As sugestões estão indisponíveis agora.');
    setLoading(false);
  },[user.uid]);
  useFocusEffect(useCallback(() => { load(); },[load]));
  async function enroll(name) {
    if(enrolling)return;setEnrolling(true);setError('');
    try { await api('/trilhas/inscrever',{method:'POST',body:{uid:user.uid,trilhaName:name}});navigation.navigate('Roadmap'); }
    catch(e){setError(e.message);}finally{setEnrolling(false);}
  }
  const choose=name => roadmap ? showConfirm('Começar outra trilha?',`“${name}” substituirá sua trilha atual.`,() => enroll(name)) : enroll(name);
  const nodes=roadmap?.nodes||[], done=nodes.filter(n=>n.status==='completed').length, pct=nodes.length?Math.round(done/nodes.length*100):0;
  const isFullDone=nodes.length>0&&done===nodes.length, userPoints=(done*100)+(isFullDone?200:0);
  return <Screen refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={c.accent}/>}>
    <View style={s.between}><Brand/><Pressable accessibilityRole="button" accessibilityLabel="Minha conta e configurações" onPress={()=>navigation.navigate('Profile')} style={{padding:12}}><Feather name="user" size={23} color={c.accent}/></Pressable></View>
    <View><Eyebrow>CADA DESCOBERTA CONTA</Eyebrow><Heading>Olá, {user.displayName?.split(' ')[0]||'estudante'}.</Heading><Copy>Vamos dar mais um passo no seu caminho?</Copy></View>
    <Notice error>{error}</Notice>{error ? <Button secondary title="Tentar novamente" onPress={load}/> : loading ? <Busy/> : <>
      <Card style={{backgroundColor:c.soft,padding:24}}><Eyebrow>{roadmap?'SEU PRÓXIMO PASSO':'UM COMEÇO COM DIREÇÃO'}</Eyebrow><Heading small>{roadmap?.title||'Você não precisa decidir tudo hoje.'}</Heading><Copy>{roadmap?'Seu futuro se constrói um assunto de cada vez. Continue no seu ritmo.':'Conheça seus interesses e encontre uma trilha de estudos para começar.'}</Copy><Button title={roadmap?'Continuar meus estudos':'Encontrar meu caminho'} icon="arrow-right" onPress={()=>navigation.navigate(roadmap?'Roadmap':'Quiz')}/></Card>
      <View style={{flexDirection:'row',gap:12}}><Card style={{flex:1}}><Eyebrow>PROGRESSO</Eyebrow><Text style={{fontSize:32,color:c.text}}>{pct}%</Text><Copy>{done} de {nodes.length} módulos</Copy></Card><Card style={{flex:1}}><Eyebrow>PONTUAÇÃO</Eyebrow><Text style={{fontSize:32,color:c.accent}}>{userPoints}</Text><Copy>pontos acumulados</Copy></Card></View>
      <Button secondary title="Ver meu progresso" icon="trending-up" onPress={()=>navigation.navigate('Progress')}/>
    </>}
    <View><Eyebrow>EXPLORE POSSIBILIDADES</Eyebrow><Heading small>Um novo interesse pode começar aqui.</Heading></View><Notice>{catalogError}</Notice>
    {highlights.map((item,i)=><Pressable key={item.id||item.name} accessibilityRole="button" disabled={enrolling} accessibilityLabel={`Conhecer ${item.name}`} onPress={()=>choose(item.name)}><Card><View style={s.between}><Text style={{fontSize:22,color:c.tint}}>0{i+1}</Text><Feather name="arrow-up-right" size={23} color={c.accent}/></View><Text style={{color:c.text,fontSize:18,fontWeight:'500'}}>{item.name}</Text><Copy>{(item.tags||[]).join(' · ')}</Copy></Card></Pressable>)}
    {enrolling&&<Busy label="Preparando sua trilha…"/>}<Button secondary title="Criar uma trilha a partir do meu perfil" icon="plus" onPress={()=>navigation.navigate('Quiz')}/><Copy style={{textAlign:'center',fontSize:11}}>Intellectus · Aprender abre caminhos.</Copy>
  </Screen>;
}
