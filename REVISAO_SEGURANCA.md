# Revisão de código e segurança

Revisão sobre o código atual, preservando as alterações anteriores e os estilos das telas.

## Correções

- Tokens internos e Firebase sempre têm a assinatura verificada. Removidos payloads sem verificação, chave JWT fixa e contas com senhas padrão.
- Perfis e pontos exigem o proprietário da conta. Listagem de usuários exige claim administrativa verificada e não retorna hashes de senha.
- Cadastro gera UID no servidor, rejeita duplicações e usa transação no Firestore para impedir sobrescrita de contas.
- Removidas rotas e botão públicos que apagavam trilhas e ranking.
- Recuperação nas telas continua pelo Firebase Auth. Endpoints antigos, que não efetuavam recuperação, retornam 501 e deixam de anunciar sucesso falso.
- Limites de requisições e tentativas de login, corpos limitados e erros sem detalhes internos.
- Corrigida busca por ID de trilha, conclusão fora de ordem e bônus repetido. Ranking usa pontuação da trilha atual e não publica e-mails.
- Falha ao salvar progresso no Firestore retorna erro em vez de anunciar sucesso com armazenamento local.
- Regras do Firestore impedem modificar diretamente credenciais, privilégios, pontos e trilhas.
- Removidos imports, estado duplicado de áudio, diagnóstico e dependências sem uso. Backend usa Node em modo watch e Firebase Admin modular, exigindo Node 22 ou superior.
- Mobile exige HTTPS para a API em produção e bloqueia gravação de áudio. Removido certificado fictício e vencido da configuração de rede. Música preservada.
- Removida inicialização Firestore sem uso no frontend. Bundle principal caiu de aproximadamente 754 kB para 421 kB, mantendo os estilos.

## Verificação

- Backend: 18 testes aprovados, incluindo rotas HTTP e regressões de segurança.
- Mobile: 6 testes de sessão aprovados.
- Frontend: build Vite aprovado.
- Mobile: exportação web com Metro aprovada. Não houve execução em dispositivo Android/iOS.
- Auditoria npm: backend e frontend com zero alertas. Mobile passou de 67 para 28 alertas: 23 altos e 5 moderados, sem críticos.

## Pendências e limites

- Publicar firestore.rules no Firebase para aplicar as restrições ao ambiente remoto. Não foram alterados IAM, permissões externas ou produção.
- Os alertas restantes do mobile envolvem braces, node-forge, sprintf-js e image-size e suas cadeias no Expo, Metro e Jest. As versões publicadas mais recentes de braces, node-forge e sprintf-js consultadas ainda eram afetadas. A versão corrigida de image-size muda a leitura por caminho que o Metro atual utiliza; não foi imposta por override, pois quebraria a integração. A correção integral depende de atualizações compatíveis dessas ferramentas.
- O limitador de requisições é por processo. Múltiplas instâncias exigem limite compartilhado na infraestrutura.
- Firestore real, entrega de e-mails, regras no emulador e manifesto Android precisam de validação no ambiente de publicação.
- Tokens locais de desenvolvimento expiram ao reiniciar o backend. Login interno em produção exige JWT_SECRET exclusiva com pelo menos 32 bytes. O login Firebase continua disponível.
- Zero alertas npm não garante ausência de todas as vulnerabilidades.


## Referências consultadas

- [Regras de campos no Firebase](https://firebase.google.com/docs/firestore/security/rules-fields)
- [Notas de versão do Firebase Admin](https://firebase.google.com/support/release-notes/admin/node)
- [Documentação do Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
