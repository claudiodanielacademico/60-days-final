import React, { createContext, useContext, useState, useCallback } from "react";

export type Language = "pt" | "en" | "es";

const translations = {
  // Bottom Nav
  "nav.journey": { pt: "Minha Jornada", en: "My Journey", es: "Mi Camino" },
  "nav.community": { pt: "Comunidade", en: "Community", es: "Comunidad" },
  "nav.prayers": { pt: "Orações", en: "Prayers", es: "Oraciones" },
  "nav.profile": { pt: "Perfil", en: "Profile", es: "Perfil" },

  // Auth
  "auth.title": { pt: "60 Dias Mais Perto", en: "60 Days Closer", es: "60 Días Más Cerca" },
  "auth.subtitle": { pt: "Sua jornada para um relacionamento mais profundo com Jesus", en: "Your journey to a deeper relationship with Jesus", es: "Tu camino hacia una relación más profunda con Jesús" },
  "auth.createAccount": { pt: "Criar Conta", en: "Create Account", es: "Crear Cuenta" },
  "auth.welcomeBack": { pt: "Bem-vindo de Volta", en: "Welcome Back", es: "Bienvenido" },
  "auth.startJourney": { pt: "Comece sua jornada de 60 dias", en: "Start your 60-day journey today", es: "Comienza tu camino de 60 días" },
  "auth.continueJourney": { pt: "Continue sua jornada espiritual", en: "Continue your spiritual journey", es: "Continúa tu camino espiritual" },
  "auth.displayName": { pt: "Nome de exibição", en: "Display name", es: "Nombre" },
  "auth.email": { pt: "Email", en: "Email", es: "Correo" },
  "auth.password": { pt: "Senha", en: "Password", es: "Contraseña" },
  "auth.signIn": { pt: "Entrar", en: "Sign In", es: "Iniciar Sesión" },
  "auth.hasAccount": { pt: "Já tem uma conta? Entre", en: "Already have an account? Sign in", es: "¿Ya tienes cuenta? Inicia sesión" },
  "auth.noAccount": { pt: "Não tem conta? Cadastre-se", en: "Don't have an account? Sign up", es: "¿No tienes cuenta? Regístrate" },

  // Journey
  "journey.title": { pt: "Minha Jornada", en: "My Journey", es: "Mi Camino" },
  "journey.dayOf": { pt: "Dia {0} de 60", en: "Day {0} of 60", es: "Día {0} de 60" },
  "journey.back": { pt: "Voltar à Jornada", en: "Back to Journey", es: "Volver al Camino" },
  "journey.scripture": { pt: "Escritura", en: "Scripture", es: "Escritura" },
  "journey.reflection": { pt: "Reflexão", en: "Reflection", es: "Reflexión" },
  "journey.todayTask": { pt: "Tarefa de Hoje", en: "Today's Task", es: "Tarea de Hoy" },
  "journey.markComplete": { pt: "Marcar como Concluído", en: "Mark as Complete", es: "Marcar como Completado" },
  "journey.completed": { pt: "✓ Concluído", en: "✓ Completed", es: "✓ Completado" },
  "journey.loading": { pt: "Carregando sua jornada...", en: "Loading your journey...", es: "Cargando tu camino..." },
  "journey.preparing": { pt: "O conteúdo devocional está sendo preparado.", en: "Devotional content is being prepared.", es: "El contenido devocional se está preparando." },
  "journey.checkBack": { pt: "Volte em breve!", en: "Check back soon!", es: "¡Vuelve pronto!" },
  "journey.dayCompleted": { pt: "Dia concluído! ✝️", en: "Day completed! ✝️", es: "¡Día completado! ✝️" },
  "journey.keepWalking": { pt: "Continue caminhando com o Senhor.", en: "Keep walking with the Lord.", es: "Sigue caminando con el Señor." },

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
  "profile.journeyProgress": { pt: "Progresso da Jornada", en: "Journey Progress", es: "Progreso del Camino" },
  "profile.yourStats": { pt: "Suas Estatísticas", en: "Your Stats", es: "Tus Estadísticas" },
  "profile.days": { pt: "Dias", en: "Days", es: "Días" },
  "profile.prayers": { pt: "Orações", en: "Prayers", es: "Oraciones" },
  "profile.posts": { pt: "Posts", en: "Posts", es: "Posts" },
  "profile.communityImpact": { pt: "Impacto na Comunidade", en: "Community Impact", es: "Impacto en la Comunidad" },
  "profile.prayersOffered": { pt: "Orações Oferecidas", en: "Prayers Offered", es: "Oraciones Ofrecidas" },
  "profile.stepsCompleted": { pt: "Passos Concluídos", en: "Steps Completed", es: "Pasos Completados" },
  "profile.editProfile": { pt: "Editar Perfil", en: "Edit Profile", es: "Editar Perfil" },
  "profile.save": { pt: "Salvar", en: "Save", es: "Guardar" },
  "profile.saving": { pt: "Salvando...", en: "Saving...", es: "Guardando..." },
  "profile.bio": { pt: "Biografia", en: "Bio", es: "Biografía" },
  "profile.bioPlaceholder": { pt: "Conte um pouco sobre você...", en: "Tell us about yourself...", es: "Cuéntanos sobre ti..." },
  "profile.displayName": { pt: "Nome de Exibição", en: "Display Name", es: "Nombre" },
  "profile.changePhoto": { pt: "Alterar Foto", en: "Change Photo", es: "Cambiar Foto" },
  "profile.updated": { pt: "Perfil atualizado!", en: "Profile updated!", es: "¡Perfil actualizado!" },

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
    setLanguage(lang);
    localStorage.setItem("app-language", lang);
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
