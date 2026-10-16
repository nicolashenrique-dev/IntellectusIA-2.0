import React from 'react';
import {NavigationContainer,DefaultTheme,DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {ThemeProvider,useTheme} from './src/contexts/ThemeContext';
import {AuthProvider,useAuth} from './src/contexts/AuthContext';
import {Screen,Busy,Notice,Button,useColors} from './src/components/ui/Kit';
import LoginScreen from './src/components/pages/LoginScreen';
import RegisterScreen from './src/components/pages/RegisterScreen';
import ForgotPasswordScreen from './src/components/pages/ForgotPasswordScreen';
import Principal from './src/components/pages/Principal';
import QuizScreen from './src/components/pages/QuizScreen';
import RoadmapScreen,{ProgressScreen} from './src/components/pages/RoadmapScreen';
import ProfileTab from './src/components/pages/ProfileTab';
const Stack=createNativeStackNavigator();
function Navigation(){
 const{user,loading,error,restore}=useAuth(),{isDarkMode}=useTheme(),c=useColors();
 const[skipRestore,setSkipRestore]=React.useState(false);
 if(loading)return <Screen><Busy label="Abrindo seu espaço…"/></Screen>;
 if(error&&!user&&!skipRestore)return <Screen><Notice error>{error}</Notice><Button title="Tentar restaurar minha sessão" onPress={restore}/><Button secondary title="Entrar com outra conta" onPress={()=>setSkipRestore(true)}/></Screen>;
 const base=isDarkMode?DarkTheme:DefaultTheme;
 return <><StatusBar style={isDarkMode?'light':'dark'}/><NavigationContainer theme={{...base,colors:{...base.colors,background:c.bg,card:c.card,text:c.text,primary:c.accent,border:c.border}}}><Stack.Navigator screenOptions={{headerShown:false,contentStyle:{backgroundColor:c.bg}}}>
 {user?<Stack.Group navigationKey={user.uid}><Stack.Screen name="Dashboard" component={Principal}/><Stack.Screen name="Quiz" component={QuizScreen}/><Stack.Screen name="Roadmap" component={RoadmapScreen}/><Stack.Screen name="Progress" component={ProgressScreen}/><Stack.Screen name="Profile" component={ProfileTab}/></Stack.Group>:<Stack.Group navigationKey="guest"><Stack.Screen name="Login" component={LoginScreen}/><Stack.Screen name="Register" component={RegisterScreen}/><Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/></Stack.Group>}
 </Stack.Navigator></NavigationContainer></>;
}
export default function App(){return <SafeAreaProvider><ThemeProvider><AuthProvider><Navigation/></AuthProvider></ThemeProvider></SafeAreaProvider>;}
