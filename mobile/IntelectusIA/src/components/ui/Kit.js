import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
export const light = { bg: '#f7f8f5', card: '#ffffff', text: '#243b31', muted: '#627268', border: '#dde5d9', accent: '#2c624a', soft: '#e9eee1', tint: '#527b58', error: '#a3392f' };
const dark = { bg: '#151e1a', card: '#1d2a22', text: '#edf1e9', muted: '#b0c1b5', border: '#35493b', accent: '#91c6a8', soft: '#283d2b', tint: '#a8cda4', error: '#f6a9a0' };
export const useColors = () => useTheme().isDarkMode ? dark : light;
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
export function Screen({ children, refreshControl, keyboard = false, scroll = true }) {
  const c = useColors();
  const content = scroll ? <ScrollView keyboardShouldPersistTaps="handled" refreshControl={refreshControl} contentContainerStyle={s.content}>{children}</ScrollView> : children;
  return <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top','left','right','bottom']}>
    {keyboard ? <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{content}</KeyboardAvoidingView> : content}
  </SafeAreaView>;
}
export function Brand() { const c = useColors(); return <View style={s.row}><Feather name="book-open" size={24} color={c.accent}/><Text style={{ color: c.text, fontSize: 25, letterSpacing: -1, fontWeight: '600' }}>intellectus.</Text></View>; }
export function Eyebrow({ children }) { const c = useColors(); return <Text style={[s.eyebrow,{ color: c.muted }]}>{children}</Text>; }
export function Heading({ children, small = false }) { const c = useColors(); return <Text accessibilityRole="header" style={{ fontFamily: serif, fontSize: small ? 26 : 35, lineHeight: small ? 33 : 42, color: c.text, marginVertical: 12 }}>{children}</Text>; }
export function Copy({ children, style }) { const c = useColors(); return <Text style={[{ color: c.muted, fontSize: 14, lineHeight: 23 },style]}>{children}</Text>; }
export function Card({ children, style }) { const c = useColors(); return <View style={[s.card,{ backgroundColor: c.card, borderColor: c.border },style]}>{children}</View>; }
export function Button({ title, onPress, icon, busy, disabled, secondary = false, style }) {
  const c = useColors(); const fg = secondary ? c.accent : (c === light ? '#fff' : '#15231a');
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy }} disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [s.button,{ backgroundColor: secondary ? c.card : c.accent, borderColor: secondary ? c.border : c.accent, opacity: disabled || busy ? .6 : pressed ? .8 : 1 },style]}>{busy ? <ActivityIndicator color={fg}/> : <><Text style={{ color: fg, fontSize: 14, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>{title}</Text>{icon && <Feather name={icon} size={18} color={fg}/>}</>}</Pressable>;
}
export function Field({ label, password = false, ...props }) {
  const c = useColors(); const [visible,setVisible] = React.useState(false);
  return <View style={{ gap: 8 }}><Text style={{ color: c.text, fontSize: 13, fontWeight: '500' }}>{label}</Text><View style={{ position: 'relative' }}><TextInput accessibilityLabel={label} placeholderTextColor={c.muted} secureTextEntry={password && !visible} autoCapitalize={password ? 'none' : props.autoCapitalize} style={[s.input,{ borderColor: c.border, color: c.text, backgroundColor: c.card, paddingRight: password ? 52 : 14 }]} {...props}/>{password && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible(!visible)} style={{ position:'absolute',right:0,top:0,width:48,height:50,alignItems:'center',justifyContent:'center' }}><Feather name={visible ? 'eye-off' : 'eye'} size={19} color={c.muted}/></Pressable>}</View></View>;
}
export function Notice({ children, error = false }) { const c=useColors(); if (!children) return null; return <View accessibilityRole="alert" style={[s.card,{ backgroundColor:c.soft,borderColor:c.border,padding:14 }]}><Text style={{ color:error ? c.error : c.text,fontSize:13,lineHeight:21 }}>{children}</Text></View>; }
export function Back({ navigation, title = 'Voltar' }) { const c=useColors(); return <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={[s.row,{ minHeight:44,alignSelf:'flex-start' }]}><Feather name="arrow-left" size={19} color={c.accent}/><Text style={{ color:c.accent,fontSize:13 }}>{title}</Text></Pressable>; }
export function Busy({ label='Carregando…' }) { const c=useColors(); return <View style={{ padding:40,gap:16,alignItems:'center' }}><ActivityIndicator color={c.accent}/><Copy>{label}</Copy></View>; }
export const s=StyleSheet.create({content:{ flexGrow:1,padding:24,gap:20,width:'100%',maxWidth:720,alignSelf:'center' },row:{flexDirection:'row',alignItems:'center',gap:10},card:{borderWidth:1,borderRadius:12,padding:20,gap:14},eyebrow:{fontSize:10,fontWeight:'600',letterSpacing:1.6},button:{minHeight:48,padding:14,borderRadius:7,borderWidth:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12},input:{borderWidth:1,borderRadius:7,minHeight:50,padding:14,fontSize:15},between:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:14}});
