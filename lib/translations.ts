// IGUDAR Multilingual Support

export type Language = 'en' | 'ar' | 'fr';

export interface Translations {
  // Authentication
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  forgotPassword: string;
  resetPassword: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  
  // Validation Messages
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMinLength: string;
  passwordsNotMatch: string;
  fullNameRequired: string;
  fullNameMinLength: string;
  
  // Success Messages
  signUpSuccess: string;
  signInSuccess: string;
  signOutSuccess: string;
  passwordResetSent: string;
  
  // Error Messages
  signUpError: string;
  signInError: string;
  signOutError: string;
  genericError: string;
  
  // Loading States
  signingIn: string;
  signingUp: string;
  signingOut: string;
  
  // Common
  loading: string;
  submit: string;
  cancel: string;
  continue: string;
  backToLogin: string;
  
  // Platform
  platformName: string;
  platformTagline: string;
  welcomeBack: string;
  joinPlatform: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Authentication
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Validation Messages
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 8 characters',
    passwordsNotMatch: 'Passwords do not match',
    fullNameRequired: 'Full name is required',
    fullNameMinLength: 'Full name must be at least 2 characters',
    
    // Success Messages
    signUpSuccess: 'Account created successfully! Please check your email.',
    signInSuccess: 'Welcome back!',
    signOutSuccess: 'Signed out successfully',
    passwordResetSent: 'Password reset email sent',
    
    // Error Messages
    signUpError: 'Failed to create account. Please try again.',
    signInError: 'Invalid email or password. Please try again.',
    signOutError: 'Failed to sign out. Please try again.',
    genericError: 'Something went wrong. Please try again.',
    
    // Loading States
    signingIn: 'Signing in...',
    signingUp: 'Creating account...',
    signingOut: 'Signing out...',
    
    // Common
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    continue: 'Continue',
    backToLogin: 'Back to Login',
    
    // Platform
    platformName: 'IGUDAR',
    platformTagline: 'Moroccan Real Estate Investment Platform',
    welcomeBack: 'Welcome back to IGUDAR',
    joinPlatform: 'Join IGUDAR today',
  },
  
  ar: {
    // Authentication
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    signOut: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    fullName: 'الاسم الكامل',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    createAccount: 'إنشاء حساب',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    
    // Validation Messages
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordMinLength: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    passwordsNotMatch: 'كلمات المرور غير متطابقة',
    fullNameRequired: 'الاسم الكامل مطلوب',
    fullNameMinLength: 'يجب أن يكون الاسم الكامل حرفين على الأقل',
    
    // Success Messages
    signUpSuccess: 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني.',
    signInSuccess: 'مرحباً بعودتك!',
    signOutSuccess: 'تم تسجيل الخروج بنجاح',
    passwordResetSent: 'تم إرسال رسالة إعادة تعيين كلمة المرور',
    
    // Error Messages
    signUpError: 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.',
    signInError: 'بريد إلكتروني أو كلمة مرور غير صحيحة. يرجى المحاولة مرة أخرى.',
    signOutError: 'فشل في تسجيل الخروج. يرجى المحاولة مرة أخرى.',
    genericError: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    
    // Loading States
    signingIn: 'جاري تسجيل الدخول...',
    signingUp: 'جاري إنشاء الحساب...',
    signingOut: 'جاري تسجيل الخروج...',
    
    // Common
    loading: 'جاري التحميل...',
    submit: 'إرسال',
    cancel: 'إلغاء',
    continue: 'متابعة',
    backToLogin: 'العودة لتسجيل الدخول',
    
    // Platform
    platformName: 'إيكودار',
    platformTagline: 'منصة الاستثمار العقاري المغربية',
    welcomeBack: 'مرحباً بعودتك إلى إيكودار',
    joinPlatform: 'انضم إلى إيكودار اليوم',
  },
  
  fr: {
    // Authentication
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    signOut: 'Se déconnecter',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    fullName: 'Nom complet',
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser le mot de passe',
    createAccount: 'Créer un compte',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    dontHaveAccount: "Vous n'avez pas de compte ?",
    
    // Validation Messages
    emailRequired: 'Email requis',
    emailInvalid: 'Veuillez saisir une adresse email valide',
    passwordRequired: 'Mot de passe requis',
    passwordMinLength: 'Le mot de passe doit contenir au moins 8 caractères',
    passwordsNotMatch: 'Les mots de passe ne correspondent pas',
    fullNameRequired: 'Nom complet requis',
    fullNameMinLength: 'Le nom complet doit contenir au moins 2 caractères',
    
    // Success Messages
    signUpSuccess: 'Compte créé avec succès ! Veuillez vérifier votre email.',
    signInSuccess: 'Bon retour !',
    signOutSuccess: 'Déconnexion réussie',
    passwordResetSent: 'Email de réinitialisation envoyé',
    
    // Error Messages
    signUpError: 'Échec de création du compte. Veuillez réessayer.',
    signInError: 'Email ou mot de passe invalide. Veuillez réessayer.',
    signOutError: 'Échec de déconnexion. Veuillez réessayer.',
    genericError: "Quelque chose s'est mal passé. Veuillez réessayer.",
    
    // Loading States
    signingIn: 'Connexion en cours...',
    signingUp: 'Création du compte...',
    signingOut: 'Déconnexion en cours...',
    
    // Common
    loading: 'Chargement...',
    submit: 'Soumettre',
    cancel: 'Annuler',
    continue: 'Continuer',
    backToLogin: 'Retour à la connexion',
    
    // Platform
    platformName: 'IGUDAR',
    platformTagline: "Plateforme d'investissement immobilier marocaine",
    welcomeBack: 'Bon retour sur IGUDAR',
    joinPlatform: 'Rejoignez IGUDAR aujourd\'hui',
  },
};

export const getTranslation = (language: Language): Translations => {
  return translations[language] || translations.en;
};