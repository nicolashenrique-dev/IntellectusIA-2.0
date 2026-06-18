import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const darkStyles = StyleSheet.create({
    // ==========================================
    // 1. ESTRUTURA GLOBAL E DASHBOARD (Responsivo: Azul e Roxo)
    // ==========================================
    container: {
        flex: 1,
        backgroundColor: '#0a0f1d', // Fundo Dark Mode Premium para o Dashboard
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#0a0f1d',
    },
    mainContent: {
        flexGrow: 1,
        paddingHorizontal: width * 0.05,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 110, // Garante que o conteúdo não suma sob a TabBar
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 15,
    },

    // ==========================================
    // CORREÇÃO: ELEMENTOS DE TEXTO DA HOME (Dashboard)
    // ==========================================
    greetingTitle: {
        fontSize: 28,          // Reduzido para não quebrar a palavra "Estudante" ou o nome
        fontWeight: '800',
        color: '#FFFFFF',      // Mudado para Branco para contrastar com o fundo escuro do seu app
        letterSpacing: -0.5,
    },
    greetingSubtitle: {
        fontSize: 14,
        color: '#94a3b8',      // Um cinza claro elegante para o subtítulo sobre o fundo escuro
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 24,          // Ajustado de 32+ para 24 para a frase "Sua Trilha Atual" caber perfeitamente
        fontWeight: '800',
        color: '#FFFFFF',      // Mudado para Branco para alinhar com o tema dark da sua home
        marginTop: 20,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#94a3b8',      // Ajustado para manter a leitura limpa
        lineHeight: 18,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 4,
    },

    // ==========================================
    // 3. CARDS DO DASHBOARD (Fluido, Azul e Roxo)
    // ==========================================
    screenAccentTop: {
        width: '100%',
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    heroCard: {
        backgroundColor: '#1e293b',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    heroEyebrow: {
        fontSize: 11,
        fontWeight: '700',
        color: '#3b82f6', // Azul de Destaque
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    logoutButton: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    logoutButtonText: {
        color: '#6366f1', // Roxo Elétrico
        fontSize: 13,
        fontWeight: '700',
    },

    // ==========================================
    // 4. TRILHAS E DESTAQUES (Dashboard)
    // ==========================================
    roadmapCard: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    roadmapCardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    roadmapBadge: {
        color: '#6366f1', // Roxo
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    roadmapProgressBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: '700',
    },
    roadmapTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    roadmapSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 20,
        marginTop: 6,
        marginBottom: 16,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#334155',
        borderRadius: 99,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6366f1', // Roxo
        borderRadius: 99,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    progressText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '700',
    },
    highlightCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    highlightTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
    },
    highlightTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    highlightLevel: {
        fontSize: 12,
        color: '#3b82f6', // Azul
        fontWeight: '700',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    highlightDescription: {
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 20,
        marginBottom: 14,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagChipText: {
        fontSize: 12,
        color: '#cbd5e1',
        fontWeight: '600',
    },

    // ==========================================
    // 5. RESTAURADO: COMPONENTES DA TELA DE LOGIN ORIGINAL (Base Branca)
    // ==========================================
    loginContainer: {
        flex: 1,
        backgroundColor: '#5849ff', // Preserva o fundo roxo original da tela de login
    },
    loginFormArea: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Mantém o card branco original intocado
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: height * 0.15,
        padding: 30,
        paddingTop: 45,
        minHeight: height * 0.85,
    },
    titleGradient: {
        fontSize: 36,
        fontWeight: '800',
        color: '#5849ff',
        marginBottom: 10,
        letterSpacing: -0.8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 15,
        marginBottom: 35,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 22,
    },
    label: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 18,
        height: 64,
        paddingHorizontal: 18,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#1e293b',
        fontSize: 16,
    },
    passwordToggle: {
        padding: 12,
    },
    button: {
        height: 56,
        backgroundColor: '#5849ff',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#5849ff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 28,
    },
    forgotPasswordText: {
        color: '#5849ff',
        fontSize: 14,
        fontWeight: '700',
    },
    registerText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 40,
    },
    registerLink: {
        color: '#5849ff',
        fontWeight: '800',
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '600',
        textAlign: 'center',
    },

    // ==========================================
    // 6. ADICIONAL: LOGIN SUBSISTEMA FACEBOOK (Opcional)
    // ==========================================
    fbContainer: { flex: 1 },
    fbContentArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', paddingTop: 40, paddingBottom: 24 },
    fbHeaderArea: { alignItems: 'center', marginBottom: 24 },
    fbTitle: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.2 },
    fbSubtitle: { fontSize: 15, color: '#cbd5e1', textAlign: 'center', marginTop: 10, fontWeight: '500', lineHeight: 22, paddingHorizontal: 16 },
    fbFormCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
    fbInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#dddfe2', borderRadius: 8, height: 52, paddingHorizontal: 14, marginBottom: 12 },
    fbInput: { flex: 1, height: '100%', color: '#1c1e21', fontSize: 16 },
    fbPasswordToggle: { paddingLeft: 10 },
    fbLoginButton: { height: 48, backgroundColor: '#5849ff', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
    fbLoginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    fbForgotPassword: { alignSelf: 'center', marginTop: 16 },
    fbForgotPasswordText: { color: '#5849ff', fontSize: 14, fontWeight: '500' },
    fbFooterArea: { alignItems: 'center', marginTop: 32 },
    fbRegisterButton: { width: 'auto', minWidth: 180, height: 44, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10b981', paddingHorizontal: 16, marginBottom: 35, shadowColor: '#10b981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
    fbRegisterButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    fbSchoolFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.12)', width: '100%', paddingTop: 16, alignItems: 'center' },
    fbSchoolText: { fontSize: 11, color: '#94a3b8', fontWeight: '500', lineHeight: 16, textAlign: 'center' },

    // ==========================================
    // 7. PROFILE TAB
    // ==========================================
    profileContainer: {
        flex: 1,
        paddingVertical: 20,
    },
    profileAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6366f1',
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        width: '100%',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    statCardPrimary: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: '#6366f1',
    },
    statLabel: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    statValue: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: '800',
    },
    moduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    moduleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    moduleTitle: {
        flex: 1,
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: '600',
    },

    // ==========================================
    // 8. BARRA DE NAVEGAÇÃO INFERIOR FIXADA (Bottom Nav)
    // ==========================================
    bottomTabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 76,
        backgroundColor: '#070a13', // Deep Blue escuro isolado do resto da tela
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        paddingBottom: Platform.OS === 'ios' ? 18 : 0,
        zIndex: 999, // Força a barra a ficar por cima sem quebras
    },
    bottomTabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%',
    },
    bottomTabIcon: {
        fontSize: 22,
        color: '#64748b',
    },
    bottomTabIconActive: {
        color: '#6366f1', // Ativo ganha brilho Roxo
    },
    bottomTabText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 4,
    },
    bottomTabTextActive: {
        color: '#6366f1',
        fontWeight: '700',
    },
    emptyStateCard: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#334155',
        marginTop: 10,
        width: '100%',
    },
    emptyStateTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyStateButton: {
        backgroundColor: '#5849ff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#5849ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    emptyStateButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    emptyListCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#1e293b',
        width: '100%',
    },
    emptyListTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptyListText: {
        color: '#64748b',
        fontSize: 13,
        textAlign: 'center',
    },
});


export const lightStyles = StyleSheet.create({
    // ==========================================
    // 1. ESTRUTURA GLOBAL E DASHBOARD (Responsivo: Azul e Roxo)
    // ==========================================
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // Fundo Dark Mode Premium para o Dashboard
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    mainContent: {
        flexGrow: 1,
        paddingHorizontal: width * 0.05,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 110, // Garante que o conteúdo não suma sob a TabBar
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 15,
    },

    // ==========================================
    // CORREÇÃO: ELEMENTOS DE TEXTO DA HOME (Dashboard)
    // ==========================================
    greetingTitle: {
        fontSize: 28,          // Reduzido para não quebrar a palavra "Estudante" ou o nome
        fontWeight: '800',
        color: '#FFFFFF',      // Mudado para Branco para contrastar com o fundo escuro do seu app
        letterSpacing: -0.5,
    },
    greetingSubtitle: {
        fontSize: 14,
        color: '#475569',      // Um cinza claro elegante para o subtítulo sobre o fundo escuro
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 24,          // Ajustado de 32+ para 24 para a frase "Sua Trilha Atual" caber perfeitamente
        fontWeight: '800',
        color: '#FFFFFF',      // Mudado para Branco para alinhar com o tema dark da sua home
        marginTop: 20,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#475569',      // Ajustado para manter a leitura limpa
        lineHeight: 18,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 4,
    },

    // ==========================================
    // 3. CARDS DO DASHBOARD (Fluido, Azul e Roxo)
    // ==========================================
    screenAccentTop: {
        width: '100%',
        backgroundColor: '#111827',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    heroCard: {
        backgroundColor: '#e2e8f0',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    heroEyebrow: {
        fontSize: 11,
        fontWeight: '700',
        color: '#3b82f6', // Azul de Destaque
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    logoutButton: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    logoutButtonText: {
        color: '#4f46e5', // Roxo Elétrico
        fontSize: 13,
        fontWeight: '700',
    },

    // ==========================================
    // 4. TRILHAS E DESTAQUES (Dashboard)
    // ==========================================
    roadmapCard: {
        backgroundColor: '#e2e8f0',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    roadmapCardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    roadmapBadge: {
        color: '#4f46e5', // Roxo
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    roadmapProgressBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#059669',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: '700',
    },
    roadmapTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    roadmapSubtitle: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginTop: 6,
        marginBottom: 16,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#334155',
        borderRadius: 99,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4f46e5', // Roxo
        borderRadius: 99,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    progressText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '700',
    },
    highlightCard: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    highlightTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
    },
    highlightTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    highlightLevel: {
        fontSize: 12,
        color: '#3b82f6', // Azul
        fontWeight: '700',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    highlightDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 14,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagChipText: {
        fontSize: 12,
        color: '#334155',
        fontWeight: '600',
    },

    // ==========================================
    // 5. RESTAURADO: COMPONENTES DA TELA DE LOGIN ORIGINAL (Base Branca)
    // ==========================================
    loginContainer: {
        flex: 1,
        backgroundColor: '#5849ff', // Preserva o fundo roxo original da tela de login
    },
    loginFormArea: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Mantém o card branco original intocado
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: height * 0.15,
        padding: 30,
        paddingTop: 45,
        minHeight: height * 0.85,
    },
    titleGradient: {
        fontSize: 36,
        fontWeight: '800',
        color: '#5849ff',
        marginBottom: 10,
        letterSpacing: -0.8,
        textAlign: 'center',
    },
    subtitle: {
        color: '#475569',
        fontSize: 15,
        marginBottom: 35,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 22,
    },
    label: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 18,
        height: 64,
        paddingHorizontal: 18,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#e2e8f0',
        fontSize: 16,
    },
    passwordToggle: {
        padding: 12,
    },
    button: {
        height: 56,
        backgroundColor: '#5849ff',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#5849ff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 28,
    },
    forgotPasswordText: {
        color: '#5849ff',
        fontSize: 14,
        fontWeight: '700',
    },
    registerText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 40,
    },
    registerLink: {
        color: '#5849ff',
        fontWeight: '800',
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '600',
        textAlign: 'center',
    },

    // ==========================================
    // 6. ADICIONAL: LOGIN SUBSISTEMA FACEBOOK (Opcional)
    // ==========================================
    fbContainer: { flex: 1 },
    fbContentArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', paddingTop: 40, paddingBottom: 24 },
    fbHeaderArea: { alignItems: 'center', marginBottom: 24 },
    fbTitle: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.2 },
    fbSubtitle: { fontSize: 15, color: '#334155', textAlign: 'center', marginTop: 10, fontWeight: '500', lineHeight: 22, paddingHorizontal: 16 },
    fbFormCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
    fbInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#dddfe2', borderRadius: 8, height: 52, paddingHorizontal: 14, marginBottom: 12 },
    fbInput: { flex: 1, height: '100%', color: '#1c1e21', fontSize: 16 },
    fbPasswordToggle: { paddingLeft: 10 },
    fbLoginButton: { height: 48, backgroundColor: '#5849ff', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
    fbLoginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    fbForgotPassword: { alignSelf: 'center', marginTop: 16 },
    fbForgotPasswordText: { color: '#5849ff', fontSize: 14, fontWeight: '500' },
    fbFooterArea: { alignItems: 'center', marginTop: 32 },
    fbRegisterButton: { width: 'auto', minWidth: 180, height: 44, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 16, marginBottom: 35, shadowColor: '#059669', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
    fbRegisterButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    fbSchoolFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.12)', width: '100%', paddingTop: 16, alignItems: 'center' },
    fbSchoolText: { fontSize: 11, color: '#475569', fontWeight: '500', lineHeight: 16, textAlign: 'center' },

    // ==========================================
    // 7. PROFILE TAB
    // ==========================================
    profileContainer: {
        flex: 1,
        paddingVertical: 20,
    },
    profileAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4f46e5',
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        width: '100%',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#e2e8f0',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    statCardPrimary: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: '#4f46e5',
    },
    statLabel: {
        color: '#475569',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    statValue: {
        color: '#0f172a',
        fontSize: 28,
        fontWeight: '800',
    },
    moduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e2e8f0',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    moduleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    moduleTitle: {
        flex: 1,
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: '600',
    },

    // ==========================================
    // 8. BARRA DE NAVEGAÇÃO INFERIOR FIXADA (Bottom Nav)
    // ==========================================
    bottomTabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 76,
        backgroundColor: '#070a13', // Deep Blue escuro isolado do resto da tela
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingBottom: Platform.OS === 'ios' ? 18 : 0,
        zIndex: 999, // Força a barra a ficar por cima sem quebras
    },
    bottomTabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%',
    },
    bottomTabIcon: {
        fontSize: 22,
        color: '#64748b',
    },
    bottomTabIconActive: {
        color: '#4f46e5', // Ativo ganha brilho Roxo
    },
    bottomTabText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 4,
    },
    bottomTabTextActive: {
        color: '#4f46e5',
        fontWeight: '700',
    },
    emptyStateCard: {
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        marginTop: 10,
        width: '100%',
    },
    emptyStateTitle: {
        color: '#0f172a',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        color: '#475569',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyStateButton: {
        backgroundColor: '#5849ff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#5849ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    emptyStateButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    emptyListCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        width: '100%',
    },
    emptyListTitle: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptyListText: {
        color: '#64748b',
        fontSize: 13,
        textAlign: 'center',
    },
});
