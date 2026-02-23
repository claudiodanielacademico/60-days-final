import React, { createContext, useContext, useState, useCallback } from "react";

export type Language = "pt" | "en" | "es";

const translations = {
  // Bottom Nav
  "nav.journey": { pt: "Minha Jornada", en: "My Journey", es: "Mi Camino" },
  "nav.community": { pt: "Comunidade", en: "Community", es: "Comunidad" },
  "nav.prayers": { pt: "Orações", en: "Prayers", es: "Oraciones" },
  "nav.search": { pt: "Buscar", en: "Search", es: "Buscar" },
  "nav.messages": { pt: "Mensagens", en: "Messages", es: "Mensajes" },
  "nav.profile": { pt: "Perfil", en: "Profile", es: "Perfil" },

  // Auth
  "auth.title": { pt: "60 Passos Mais Perto", en: "60 Steps Closer", es: "60 Pasos Más Cerca" },
  "auth.subtitle": { pt: "Sua rotina para um relacionamento mais profundo com Jesus", en: "Your routine for a deeper relationship with Jesus", es: "Tu rutina para una relación más profunda con Jesús" },
  "auth.createAccount": { pt: "Criar Conta", en: "Create Account", es: "Crear Cuenta" },
  "auth.welcomeBack": { pt: "Bem-vindo de Volta", en: "Welcome Back", es: "Bienvenido" },
  "auth.startJourney": { pt: "Comece seus 60 passos diários", en: "Start your 60 daily steps", es: "Comienza tus 60 pasos diarios" },
  "auth.continueJourney": { pt: "Continue seus passos espirituais", en: "Continue your spiritual steps", es: "Continúa tus pasos espirituales" },
  "auth.displayName": { pt: "Nome de exibição", en: "Display name", es: "Nombre" },
  "auth.email": { pt: "Email", en: "Email", es: "Correo" },
  "auth.password": { pt: "Senha", en: "Password", es: "Contraseña" },
  "auth.signIn": { pt: "Entrar", en: "Sign In", es: "Iniciar Sesión" },
  "auth.hasAccount": { pt: "Já tem uma conta? Entre", en: "Already have an account? Sign in", es: "¿Ya tienes cuenta? Inicia sesión" },
  "auth.noAccount": { pt: "Não tem conta? Cadastre-se", en: "Don't have an account? Sign up", es: "¿No tienes cuenta? Regístrate" },
  "auth.orContinueWith": { pt: "Ou continue com", en: "Or continue with", es: "O continuar con" },
  "auth.google": { pt: "Google", en: "Google", es: "Google" },
  "auth.apple": { pt: "Apple", en: "Apple", es: "Apple" },
  "auth.magicLink": { pt: "Entrar via Link Mágico", en: "Sign in via Magic Link", es: "Entrar vía Link Mágico" },
  "auth.sendMagicLink": { pt: "Enviar Link Mágico", en: "Send Magic Link", es: "Enviar Link Mágico" },
  "auth.magicLinkSent": { pt: "Link Mágico enviado ao seu email!", en: "Magic Link sent to your email!", es: "¡Link Mágico enviado a tu email!" },
  "auth.rememberMe": { pt: "Lembrar de mim", en: "Remember me", es: "Recordarme" },

  // Journey
  "journey.title": { pt: "Meus Passos Diários", en: "My Daily Steps", es: "Mis Pasos Diarios" },
  "journey.dayOf": { pt: "Passo {0} de 60", en: "Step {0} of 60", es: "Paso {0} de 60" },
  "journey.back": { pt: "Voltar aos Passos", en: "Back to Steps", es: "Volver a los Pasos" },
  "journey.scripture": { pt: "Escritura", en: "Scripture", es: "Escritura" },
  "journey.reflection": { pt: "Reflexão", en: "Reflection", es: "Reflexión" },
  "journey.todayTask": { pt: "Tarefa do Passo", en: "Step Task", es: "Tarea del Paso" },
  "journey.markComplete": { pt: "Concluir Passo", en: "Complete Step", es: "Completar Paso" },
  "journey.completed": { pt: "Passo Concluído!", en: "Step Completed!", es: "¡Paso Completado!" },
  "journey.focusMessage": { pt: "Tire um momento. Reflita. Progrida.", en: "Take a moment. Reflect. Progress.", es: "Tómate un momento. Reflexiona. Progresa." },
  "journey.steps": { pt: "Passos", en: "Steps", es: "Pasos" },
  "journey.progress": { pt: "Progresso do Dia", en: "Day Progress", es: "Progreso del Día" },
  "journey.loading": { pt: "Carregando seus passos...", en: "Loading your steps...", es: "Cargando tus pasos..." },
  "journey.preparing": { pt: "O conteúdo devocional está sendo preparado.", en: "Devotional content is being prepared.", es: "El contenido devocional se está preparando." },
  "journey.checkBack": { pt: "Volte em breve!", en: "Check back soon!", es: "¡Vuelve pronto!" },
  "journey.dayCompleted": { pt: "Passos concluídos hoje! ✝️", en: "Steps completed today! ✝️", es: "¡Pasos completados hoy! ✝️" },
  "journey.keepWalking": { pt: "Continue caminhando com o Senhor.", en: "Keep walking with the Lord.", es: "Sigue caminando con el Señor." },
  "journey.openingPrayer": { pt: "Oração Inicial", en: "Opening Prayer", es: "Oración Inicial" },
  "journey.reading": { pt: "Leitura do Passo", en: "Step Reading", es: "Lectura del Paso" },
  "journey.practicalAction": { pt: "Ação Prática", en: "Practical Action", es: "Práctica" },

  // Community
  "community.title": { pt: "Comunidade", en: "Community", es: "Comunidad" },
  "community.post": { pt: "Publicar", en: "Post", es: "Publicar" },
  "community.placeholder": { pt: "Compartilhe o que está no seu coração...", en: "Share what's on your heart...", es: "Comparte lo que hay en tu corazón..." },
  "community.share": { pt: "Compartilhar", en: "Share", es: "Compartir" },
  "community.posting": { pt: "Publicando...", en: "Posting...", es: "Publicando..." },
  "community.noPosts": { pt: "Nenhuma publicação ainda. Seja o primeiro!", en: "No posts yet. Be the first to share!", es: "Sin publicaciones aún. ¡Sé el primero!" },

  // Prayers
  "prayers.title": { pt: "Corrente de Orações", en: "Prayer Chain", es: "Cadena de Oración" },
  "prayers.request": { pt: "Pedido", en: "Request", es: "Pedido" },
  "prayers.placeholder": { pt: "Compartilhe seu pedido de oração...", en: "Share your prayer request...", es: "Comparte tu petición de oración..." },
  "prayers.submit": { pt: "Enviar Pedido", en: "Submit Request", es: "Enviar Petición" },
  "prayers.submitting": { pt: "Enviando...", en: "Submitting...", es: "Enviando..." },
  "prayers.noPrayers": { pt: "Nenhum pedido de oração ainda.", en: "No prayer requests yet.", es: "Sin peticiones de oración aún." },
  "prayers.beFirst": { pt: "Seja o primeiro a compartilhar um pedido.", en: "Be the first to share a prayer request.", es: "Sé el primero en compartir una petición." },
  "prayers.joinPrayer": { pt: "Estou orando 🙏", en: "I'm praying 🙏", es: "Estoy orando 🙏" },
  "prayers.joined": { pt: "Orando com você 🙏", en: "Praying with you 🙏", es: "Orando contigo 🙏" },

  // Profile
  "profile.title": { pt: "Perfil", en: "Profile", es: "Perfil" },
  "profile.signOut": { pt: "Sair", en: "Sign Out", es: "Cerrar Sesión" },
  "profile.journeyProgress": { pt: "Progresso Diário", en: "Daily Progress", es: "Progreso Diario" },
  "profile.yourStats": { pt: "Suas Estatísticas", en: "Your Stats", es: "Tus Estadísticas" },
  "profile.days": { pt: "Passos", en: "Steps", es: "Pasos" },
  "profile.prayers": { pt: "Orações", en: "Prayers", es: "Oraciones" },
  "profile.posts": { pt: "Posts", en: "Posts", es: "Posts" },
  "profile.communityImpact": { pt: "Impacto na Comunidade", en: "Community Impact", es: "Impacto en la Comunidad" },
  "profile.prayersOffered": { pt: "Orações Oferecidas", en: "Prayers Offered", es: "Oraciones Ofrecidas" },
  "profile.stepsCompleted": { pt: "Concluídos Hoje", en: "Completed Today", es: "Completado Hoy" },
  "profile.followers": { pt: "Seguidores", en: "Followers", es: "Seguidores" },
  "profile.following": { pt: "Seguindo", en: "Following", es: "Siguiendo" },
  "profile.editProfile": { pt: "Editar Perfil", en: "Edit Profile", es: "Editar Perfil" },
  "profile.save": { pt: "Salvar", en: "Save", es: "Guardar" },
  "profile.saving": { pt: "Salvando...", en: "Saving...", es: "Guardando..." },
  "profile.bio": { pt: "Biografia", en: "Bio", es: "Biografía" },
  "profile.bioPlaceholder": { pt: "Conte um pouco sobre você...", en: "Tell us about yourself...", es: "Cuéntanos sobre ti..." },
  "profile.displayName": { pt: "Nome de Exibição", en: "Display Name", es: "Nombre" },
  "profile.changePhoto": { pt: "Alterar Foto", en: "Change Photo", es: "Cambiar Foto" },
  "profile.updated": { pt: "Perfil atualizado!", en: "Profile updated!", es: "¡Perfil actualizado!" },
  "profile.message": { pt: "Enviar Mensagem", en: "Send Message", es: "Enviar Mensaje" },
  "profile.stats": { pt: "Estatísticas", en: "Stats", es: "Estadísticas" },
  "profile.follow": { pt: "Seguir", en: "Follow", es: "Seguir" },
  "profile.unfollow": { pt: "Remover Seguindo", en: "Unfollow", es: "Deixar de Seguir" },

  // Search
  "search.title": { pt: "Buscar", en: "Search", es: "Buscar" },
  "search.placeholder": { pt: "Procure por pessoas ou posts...", en: "Search for people or posts...", es: "Buscar personas o publicaciones..." },
  "search.users": { pt: "Pessoas", en: "People", es: "Personas" },
  "search.posts": { pt: "Posts", en: "Posts", es: "Posts" },
  "search.prayers": { pt: "Orações", en: "Prayers", es: "Oraciones" },
  "search.all": { pt: "Todos", en: "All", es: "Todos" },
  "search.searching": { pt: "Buscando...", en: "Searching...", es: "Buscando..." },
  "search.noResults": { pt: "Nenhum resultado encontrado.", en: "No results found.", es: "No se encontraron resultados." },
  "search.smartSearch": { pt: "Busca Inteligente", en: "Smart Search", es: "Busqueda Inteligente" },

  // Messages
  "messages.title": { pt: "Mensagens", en: "Messages", es: "Mensajes" },
  "messages.placeholder": { pt: "Digite uma mensagem...", en: "Type a message...", es: "Escribe un mensaje..." },
  "messages.search": { pt: "Buscar conversas...", en: "Search conversations...", es: "Buscar conversaciones..." },
  "messages.online": { pt: "Online", en: "Online", es: "En línea" },
  "messages.seen": { pt: "Visto", en: "Seen", es: "Visto" },
  "messages.sent": { pt: "Enviado", en: "Sent", es: "Enviado" },
  "messages.today": { pt: "Hoje", en: "Today", es: "Hoy" },
  "messages.yesterday": { pt: "Ontem", en: "Yesterday", es: "Ayer" },
  "messages.noMessages": { pt: "Nenhuma mensagem ainda.", en: "No messages yet.", es: "Sin mensajes aún." },
  "messages.startConversation": { pt: "Começar uma conversa", en: "Start a conversation", es: "Iniciar una conversación" },

  // Private Prayers
  "prayers.myPrayers": { pt: "Minhas Orações", en: "My Prayers", es: "Mis Oraciones" },
  "prayers.noPersonalPrayers": { pt: "Você ainda não compartillhou pedidos de oração.", en: "You haven't shared any prayer requests yet.", es: "Aún no has compartido peticiones de oración." },

  // General
  "general.error": { pt: "Erro", en: "Error", es: "Error" },
  "general.loading": { pt: "Carregando...", en: "Loading...", es: "Cargando..." },
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, ...args: (string | number)[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "pt";
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    // Apply fade-out effect
    document.body.classList.add("language-switching");

    setTimeout(() => {
      setLanguage(lang);
      localStorage.setItem("app-language", lang);

      // Allow for render then fade-in
      setTimeout(() => {
        document.body.classList.remove("language-switching");
      }, 50);
    }, 150);
  }, []);

  const t = useCallback((key: TranslationKey, ...args: (string | number)[]): string => {
    const entry = translations[key];
    if (!entry) return key;
    let text: string = entry[language] || entry["en"] || key;
    args.forEach((arg, i) => {
      text = text.replace(`{${i}}`, String(arg));
    });
    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
