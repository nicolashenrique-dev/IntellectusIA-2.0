# 📱 Mobile Connectivity Debugging - Summary

## 🎯 Objetivo
Diagnosticar e resolver por que o app mobile não consegue conectar ao backend Vercel.

---

## ✅ Mudanças Implementadas

### **1. Backend (`backend/app.js`)**

✨ **Adicionado:** Endpoint de health check
```javascript
// GET /health - Sem autenticação necessária
{
  "status": "ok",
  "timestamp": "2024-...",
  "backend": "intelectusia-api-v2",
  "environment": "production"
}
```
**Propósito:** Testar conectividade básica sem complexidade de autenticação.

---

### **2. Mobile (`src/utils.js`)**

✨ **Nova função:** `testBackendConnectivity()`
```javascript
// Testa se o backend está acessível
// Logs detalhados da tentativa
// Retorna: { success, status, data } ou { success, error }
```

**Propósito:** Diagnóstico automático na inicialização do app.

---

### **3. Mobile Android Config (`app.json` + `network_security_config.xml`)**

✨ **Adicionado:** Suporte para cleartext traffic (HTTP local)
- Permite HTTP em localhost, 127.0.0.1, 10.0.2.2
- Requer HTTPS para domínios externos (Vercel)

**Propósito:** Facilitar testes com servidor local sem erros de segurança.

---

### **4. Mobile Logging - Telas Modificadas**

Todas adicionam logs detalhados com formato:
```
🔗 [ScreenName] URL base do servidor
📍 [ScreenName] URL completa
📤 [ScreenName] Payload enviado
✅ [ScreenName] Status HTTP
📦 [ScreenName] Resposta recebida
❌ [ScreenName] Erro (com detalhes)
```

**Telas modificadas:**
- ✅ `LoginScreen.js` - Login com teste de conectividade no startup
- ✅ `ForgotPasswordScreen.js` - Recuperação de senha
- ✅ `Principal.js` - Dashboard e inscrição em trilhas
- ✅ `RoadmapScreen.js` - Roadmap, vídeos, atualização de status

---

## 🧪 Como Testar

### **Passo 1: Preparar o Ambiente**

```bash
# Certifique-se que todas as mudanças estão salvas
# Backend está implantado em Vercel
# Mobile app foi recompilado
```

### **Passo 2: Testar Conectividade via curl (PC)**

```bash
# Testar health check
curl https://backend-c2g7ni26z-ornicolas-projects.vercel.app/health

# Testar login
curl -X POST https://backend-c2g7ni26z-ornicolas-projects.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Resultado esperado:** JSON response (mesmo que erro de credenciais)

### **Passo 3: Executar App Mobile**

```bash
cd mobile/IntelectusIA

# Android Emulator
npm run android

# iOS Simulator  
npm run ios

# Ou via Expo Go
expo start --android  # ou --ios
```

### **Passo 4: Observar Logs**

**No console (Expo):**
- Abra Expo Go
- Shake device
- Toque em "Logs"

**Busque por padrões:**

#### ✅ Sucesso esperado:
```
📱 [App Startup] Testing backend connectivity...
🧪 [Diagnostic] Testing backend connectivity...
🔗 Base URL: https://backend-c2g7ni26z...
📍 Testing endpoint: https://backend-c2g7ni26z.../health
✅ Status: 200
📦 Response: {status: "ok", timestamp: "...", ...}
✅ [App Startup] Backend is reachable!
```

#### ❌ Erro - Network Request Failed:
```
❌ Connectivity test failed: Network request failed
```
**Investigação:**
- Testar curl do PC - backend está respondendo?
- Verificar DNS no device - consegue resolver domínio?
- Verificar firewall/VPN do device

#### ❌ Erro - JSON Parse Error:
```
❌ [LoginScreen] Erro de conexão: json.parse error
```
**Investigação:**
- Backend retornou HTML ao invés de JSON
- Verificar logs do Vercel
- Pode ser erro 500 no backend

---

## 📊 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `backend/app.js` | ➕ Health check endpoint |
| `mobile/.../LoginScreen.js` | ➕ Connectivity test import + logs |
| `mobile/.../ForgotPasswordScreen.js` | ➕ Logs detalhados |
| `mobile/.../Principal.js` | ➕ Logs detalhados |
| `mobile/.../RoadmapScreen.js` | ➕ Logs detalhados |
| `mobile/.../utils.js` | ➕ `testBackendConnectivity()` function |
| `mobile/app.json` | ➕ Android cleartext config |
| `mobile/network_security_config.xml` | ✨ Novo arquivo |

---

## 🔍 Próximos Passos para Você

1. **Execute o app mobile** com as novas mudanças
2. **Tente fazer login** e observe os logs
3. **Compartilhe os logs** da console que aparecerem
4. Com base nos logs, conseguiremos identificar:
   - Se é problema de rede
   - Se é problema de DNS
   - Se é erro na resposta do backend
   - Se é validação de dados

---

## 💾 Arquivo de Diagnóstico

Veja também: [DIAGNOSTIC_MOBILE.md](DIAGNOSTIC_MOBILE.md)
- Guia detalhado de testes
- Possíveis causas e soluções
- Como testar com servidor local

---

## 🎓 O Que Aprendemos

✅ **Endpoint `/api/login` existe** e está correto
✅ **CORS está configurado** corretamente no backend
✅ **URL do backend está correta** no mobile
❓ **Causa real do erro** - precisa de logs para diagnosticar

**Dica:** Com os logs detalhados agora, conseguiremos apontar exatamente onde está o problema!

