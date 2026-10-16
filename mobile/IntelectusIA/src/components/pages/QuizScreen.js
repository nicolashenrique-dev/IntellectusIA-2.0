import React,{useState,useRef} from 'react';
import { View,Text,Pressable } from 'react-native';
import {Feather} from '@expo/vector-icons';
import {useAuth} from '../../contexts/AuthContext';
import {api} from '../../services/api';
import {Screen,Back,Eyebrow,Heading,Copy,Card,Button,Notice,Busy,useColors,s} from '../ui/Kit';
export const questions=[
 {title:'O que desperta sua curiosidade?',sub:'Escolha uma área para explorar. Você pode mudar depois.',key:'interestCode',options:[['TI','Tecnologia e programação','code'],['DESIGN','Design de produto e UX','pen-tool'],['MARKETING','Negócios e marketing','bar-chart-2'],['DATA','Ciência de dados','database']]},
 {title:'Quanto você já conhece?',sub:'Vamos encontrar o ponto de partida certo para você.',key:'experienceCode',options:[['BEGINNER','Estou começando do zero','sunrise'],['INTERMEDIATE','Já conheço os fundamentos','layers'],['ADVANCED','Quero me aprofundar','award']]},
 {title:'O que você quer conquistar?',sub:'Seu objetivo orienta as atividades da sua trilha.',key:'goalCode',options:[['JOB','Meu primeiro emprego','briefcase'],['TRANSITION','Uma transição de carreira','repeat'],['SPECIALIZATION','Especialização na área','target']]}
];
export default function QuizScreen({navigation}){
 const c=useColors(),{user}=useAuth();const[step,setStep]=useState(0),[answers,setAnswers]=useState({}),[busy,setBusy]=useState(false),[error,setError]=useState('');const submitting=useRef(false);
 async function generate(profile){if(submitting.current)return;submitting.current=true;setBusy(true);setError('');try{await api('/trilhas/gerar',{method:'POST',body:{uid:user.uid,profile}});navigation.replace('Roadmap');}catch(e){setError(e.message);}finally{submitting.current=false;setBusy(false);}}
 function choose(value){const updated={...answers,[questions[step].key]:value};setAnswers(updated);setError('');if(step<2)setStep(step+1);else generate(updated);}
 if(busy)return <Screen><Busy label="Organizando os assuntos da sua trilha…"/><Copy>Estamos considerando seus interesses, seu nível e seu objetivo.</Copy></Screen>;
 return <Screen><Back navigation={navigation}/><View><Eyebrow>PASSO {step+1} DE 3</Eyebrow><View style={[s.row,{marginTop:20}]}>{questions.map((q,i)=><View key={q.key} style={{flex:1,height:4,borderRadius:2,backgroundColor:i<=step?c.accent:c.border}}/>)}</View><Heading>{questions[step].title}</Heading><Copy>{questions[step].sub}</Copy></View>
 {questions[step].options.map(([value,label,icon])=><Pressable key={value} accessibilityRole="button" onPress={()=>choose(value)}><Card><View style={s.row}><Feather name={icon} size={24} color={c.accent}/><Text style={{flex:1,color:c.text,fontSize:16,lineHeight:23}}>{label}</Text><Feather name="arrow-right" size={18} color={c.muted}/></View></Card></Pressable>)}<Notice error>{error}</Notice>{error&&<Button title="Tentar novamente" onPress={()=>generate(answers)}/>}{step>0&&<Button secondary title="Rever resposta anterior" onPress={()=>{setError('');setStep(step-1);}}/>}</Screen>;
}
