import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.builder': 'Builder',
      'nav.getTalkLink': 'Get iTalkLink',
      
      // Home Page
      'home.hero.title': 'Create a Free Digital Business Card Preview in 60 Seconds',
      'home.hero.subtitle': 'Perfect preview. Save as PNG. Share a link. Upgrade to a full smart card with iTalkLink.',
      'home.trustBadge.noSignup': 'No Sign-up',
      'home.trustBadge.noCreditCard': 'No Credit Card',
      'home.trustBadge.free': '100% Free',
      'home.cta.create': 'Create Your Card',
      'home.cta.whatIs': 'What is iTalkLink?',
      
      // Features
      'features.title': 'Why Choose Our Preview Tool?',
      'features.fast.title': 'Lightning Fast',
      'features.fast.desc': 'Create professional business card previews in under 60 seconds',
      'features.privacy.title': 'Privacy First',
      'features.privacy.desc': 'All data stays in your browser. We never store your information',
      'features.sharing.title': 'Easy Sharing',
      'features.sharing.desc': 'Export as PNG or share with a simple link',
      
      // Form Builder
      'form.title': 'Build Your Card',
      'form.basicInfo': 'Basic Information',
      'form.contactInfo': 'Contact Information',
      'form.socialMedia': 'Social Media',
      'form.branding': 'Branding',
      'form.media': 'Media',
      
      // Form Fields
      'field.fullName': 'Full Name',
      'field.title': 'Title/Role',
      'field.company': 'Company',
      'field.about': 'About (Short)',
      'field.phone': 'Phone',
      'field.email': 'Email',
      'field.website': 'Website',
      'field.location': 'Location',
      'field.brandColor': 'Brand Color',
      'field.template': 'Template',
      'field.profilePhoto': 'Profile Photo',
      'field.logo': 'Company Logo',
      
      // Actions
      'action.generateQR': 'Generate QR',
      'action.saveSettings': 'Save Settings',
      'action.downloadPNG': 'Download PNG',
      'action.shareLink': 'Share Link',
      'action.getFullCard': 'Get a Full Smart Card on iTalkLink →',
      
      // Messages
      'message.settingsSaved': 'Settings saved!',
      'message.qrGenerated': 'QR code generated!',
      'message.linkCopied': 'Share link copied to clipboard!',
      
      // Footer
      'footer.privacy': 'Your data lives in your browser. We do not upload files or store personal information.',
      'footer.poweredBy': 'Powered by iTalkLink',
    }
  },
  bn: {
    translation: {
      // Navigation
      'nav.home': 'হোম',
      'nav.builder': 'বিল্ডার',
      'nav.getTalkLink': 'আইটকলিংক পান',
      
      // Home Page
      'home.hero.title': '৬০ সেকেন্ডে বিনামূল্যে ডিজিটাল ব্যবসায়িক কার্ড প্রিভিউ তৈরি করুন',
      'home.hero.subtitle': 'নিখুঁত প্রিভিউ। PNG হিসেবে সেভ করুন। লিংক শেয়ার করুন। আইটকলিংকের সাথে সম্পূর্ণ স্মার্ট কার্ডে আপগ্রেড করুন।',
      'home.trustBadge.noSignup': 'সাইন-আপ নেই',
      'home.trustBadge.noCreditCard': 'ক্রেডিট কার্ড নেই',
      'home.trustBadge.free': '১০০% বিনামূল্যে',
      'home.cta.create': 'আপনার কার্ড তৈরি করুন',
      'home.cta.whatIs': 'আইটকলিংক কী?',
      
      // Features
      'features.title': 'কেন আমাদের প্রিভিউ টুল বেছে নেবেন?',
      'features.fast.title': 'অতি দ্রুত',
      'features.fast.desc': '৬০ সেকেন্ডের কম সময়ে পেশাদার ব্যবসায়িক কার্ড প্রিভিউ তৈরি করুন',
      'features.privacy.title': 'গোপনীয়তা প্রথম',
      'features.privacy.desc': 'সমস্ত ডেটা আপনার ব্রাউজারে থাকে। আমরা কখনো আপনার তথ্য সংরক্ষণ করি না',
      'features.sharing.title': 'সহজ শেয়ারিং',
      'features.sharing.desc': 'PNG হিসেবে এক্সপোর্ট করুন বা সহজ লিংক দিয়ে শেয়ার করুন',
      
      // Form Builder
      'form.title': 'আপনার কার্ড তৈরি করুন',
      'form.basicInfo': 'মৌলিক তথ্য',
      'form.contactInfo': 'যোগাযোগের তথ্য',
      'form.socialMedia': 'সোশ্যাল মিডিয়া',
      'form.branding': 'ব্র্যান্ডিং',
      'form.media': 'মিডিয়া',
      
      // Form Fields
      'field.fullName': 'পূর্ণ নাম',
      'field.title': 'পদবি/ভূমিকা',
      'field.company': 'কোম্পানি',
      'field.about': 'সম্পর্কে (সংক্ষিপ্ত)',
      'field.phone': 'ফোন',
      'field.email': 'ইমেইল',
      'field.website': 'ওয়েবসাইট',
      'field.location': 'অবস্থান',
      'field.brandColor': 'ব্র্যান্ড রং',
      'field.template': 'টেমপ্লেট',
      'field.profilePhoto': 'প্রোফাইল ছবি',
      'field.logo': 'কোম্পানির লোগো',
      
      // Actions
      'action.generateQR': 'QR তৈরি করুন',
      'action.saveSettings': 'সেটিংস সেভ করুন',
      'action.downloadPNG': 'PNG ডাউনলোড করুন',
      'action.shareLink': 'লিংক শেয়ার করুন',
      'action.getFullCard': 'আইটকলিংকে সম্পূর্ণ স্মার্ট কার্ড পান →',
      
      // Messages
      'message.settingsSaved': 'সেটিংস সেভ হয়েছে!',
      'message.qrGenerated': 'QR কোড তৈরি হয়েছে!',
      'message.linkCopied': 'শেয়ার লিংক ক্লিপবোর্ডে কপি হয়েছে!',
      
      // Footer
      'footer.privacy': 'আপনার ডেটা আপনার ব্রাউজারে থাকে। আমরা ফাইল আপলোড করি না বা ব্যক্তিগত তথ্য সংরক্ষণ করি না।',
      'footer.poweredBy': 'আইটকলিংক দ্বারা চালিত',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
