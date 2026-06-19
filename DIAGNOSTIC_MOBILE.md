# 🔍 Guia de Diagnóstico - Conexão Mobile 

## ✅ O que foi feito

### 1. **Logging Detalhado Adicionado**
Todos os fetch calls no mobile agora incluem console.log com:
- 🔗 URL base do servidor
- 📍 URL completa da requisição
- 📤 Payload enviado (se aplicável)
- ✅ Status HTTP da resposta
- 📦 Dados recebidos

**Telas modificadas:**
- `LoginScreen.js` - login
- `ForgotPasswordScreen.js` - recuperação de senha
- `Principal.js` - dashboard e inscrição em trilhas
- `RoadmapScreen.js` - roadmap, vídeos e atualização de status

### 2. **Configuração de Rede Android**
- Adicionado `usesCleartextTraffic: true` ao `app.json`
- Criado arquivo `network_security_config.xml` para permitir:
  - Cleartext em localhost, 127.0.0.1 e 10.0.2.2 (emulador)
  - HTTPS obrigatório para outros domínios

---

## 🧪 Etapas de Teste/Diagnóstico

### **PASSO 1: Testar conectividade básica com o backend**

**Opção A - Via curl (do seu PC):**
```bash
# Testar se o backend está respondendo
curl -X POST https://backend-ten-ecru-93.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Resultado esperado:** Mesmo que erro de credenciais, deve receber uma resposta JSON com `success: false` ou mensagem de erro.

---

### **PASSO 2: Verificar logs no backend**

1. Abra https://backend-ten-ecru-93.vercel.app/api-docs (Swagger)
2. Tente fazer login pelo Swagger UI
3. Verifique se funciona no frontend da web

---

### **PASSO 3: Executar app mobile e observar console**

**No emulador Android:**
```bash
cd mobile/IntelectusIA
npm run android  # ou: expo start --android
```

**No simulador iOS:**
```bash
npm run ios  # ou: expo start --ios
```

**Visualizar logs:**
- Expo Go: Shake device → Logs
- Android Studio Logcat: `adb logcat | grep RNConsoleLog`
- iOS: Xcode console

---

### **PASSO 4: Analisar logs para identificar o problema**

**Busque por padrões nos logs:**

#### ✅ Se você vê:
```
🔗 [LoginScreen] Tentando conectar a: https://backend-c2g7ni26z...
📍 URL completa: https://backend-c2g7ni26z.../api/login
✅ [LoginScreen] Status da resposta: 200
📦 [LoginScreen] Dados recebidos: {success: true, ...}
```
→ **Conexão OK!** Verifique a lógica de autenticação.

---

#### ❌ Se você ve:
```
🔗 [LoginScreen] Tentando conectar a: https://backend-c2g7ni26z...
❌ [LoginScreen] Erro de conexão: Network request failed
   Detalhes: Network request failed
```

**Possíveis causas:**
1. **HTTPS/Certificado**: Problema de certificado SSL
   - Solução: Usar HTTP local para testar
   
2. **DNS**: Não consegue resolver o domínio
   - Solução: Testar com IP direto (se em rede local)
   
3. **Firewall/VPN**: Bloqueando conexão com Vercel
   - Solução: Desabilitar VPN, testar em rede diferente

4. **Android cleartext**: Requer HTTP, mas está usando HTTPS
   - Solução: Configuração já feita no `app.json`

---

#### ❌ Se você vê:
```
🔗 [LoginScreen] Tentando conectar a: https://backend-c2g7ni26z...
❌ [LoginScreen] Erro de conexão: json.parse error
   Detalhes: Unexpected end of JSON input
```

**Causa:** Backend não retornou JSON válido
- Solução: Verificar logs do backend, pode estar erro 500

---

#### ❌ Se você vê:
```
🔗 [LoginScreen] Tentando conectar a: undefined
```

**Causa:** `getBaseUrl()` está retornando `undefined`
- Verificar: `mobile/IntelectusIA/src/utils.js`
- Deveria estar: `https://backend-c2g7ni26z...`

---

## 🔧 Alternativa: Testar com servidor local

Se o Vercel tiver problemas, você pode usar seu PC como servidor:

1. **Pegar IP do seu PC:**
   - Windows: `ipconfig` (procure IPv4)
   - Linux/Mac: `ifconfig`

2. **Atualizar `utils.js`:**
   ```javascript
   export const getBaseUrl = () => {
     // Para emulador Android: 10.0.2.2 = PC localhost
     // Para device real: use IP do PC (ex: 192.168.x.x)
     return 'http://10.0.2.2:5000';  // assumindo backend local na porta 5000
   };
   ```

3. **Rodar backend localmente:**
   ```bash
   cd backend
   npm start
   ```

---

## 📋 Checklist de Diagnóstico

- [ ] Backend em Vercel está respondendo via curl?
- [ ] Frontend web consegue fazer login?
- [ ] App mobile consegue fazer fetch do `/api/health`?
- [ ] Logs mostram URL correcta?
- [ ] Status HTTP é 200 ou há erro de rede antes?
- [ ] JSON da resposta é válido?
- [ ] Credenciais de teste estão corretas?
- [ ] Rede do device/emulador está funcionando?

---

## 📞 Próximos Passos

1. **Execute o app mobile** e tente fazer login
2. **Compartilhe os logs** que aparecerem no console
3. **Descreva a mensagem de erro** exata que aparece na tela
4. Com isso, consigo identificar exatamente onde está o problema!

---

## 💡 Dicas Úteis

- **Limpar cache do Expo:** `expo start -c`
- **Resetar node_modules:** `rm -rf node_modules && npm install`
- **Testar com seu email real:** Crie uma conta de teste primeiro via frontend web

