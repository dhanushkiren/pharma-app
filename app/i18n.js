import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      home: "Home",
      product: "Products",
      cart: "Cart",
      partner: "Partners",
      profiles: "Profile",
      select_language: "Select Your Language",
      prescription_upload: "Prescription Upload",

      upload_title: "Upload prescriptions",
      upload_subtitle: "and let us arrange your medicines for you",
      upload_button: "Upload prescription",
      upload_description:
        "All uploads are encrypted & visible only to our pharmacists.\nAny prescription you upload is validated before processing the order.",
      upload_valid_guide_link: "What is a valid prescription?",

      valid_guide_title: "Valid prescription guide",
      valid_guide_heading: "What is a valid prescription?",
      valid_guide_description:
        "A valid prescription should contain doctor, patient, medicine details & the doctor's signature.",
      valid_guide_okay: "Okay, I understand",

      browse_products: "Browse Products",

      home_carousel: {
        slide1_title: "15-Minute Medicine Delivery",
        slide1_sub: "Your health can't wait. We deliver fast, every time.",
        slide2_title: "Your Health Is Our Priority",
        slide2_sub: "We partner with trusted medical stores to serve you better.",
        slide3_title: "200+ Verified Medical Stores Near You",
        slide3_sub: "So you never run out of essential medicines.",
        slide4_title: "Helping Your Family Stay Healthy",
        slide4_sub: "Safe, reliable, and fast delivery for elders and children.",
        slide5_title: "We Deliver Care, Not Just Medicines",
        slide5_sub: "Because someone at home is waiting for you to stay healthy."
      },

      profile: {
        settings: "Settings",
        user: "User",
        edit_account: "Edit Account",
        edit_profile: "Edit Profile",
        change_password: "Change Password",
        my_prescriptions: "My Prescriptions",
        change_language: "Change Language",
        change_theme: "Change Theme",
        logout: "Logout",
        login: "Login",
        signup: "Sign Up",
      },

      edit_profile: {
        title: "Edit Profile",
        username: "Username",
        email: "Email",
        mobile: "Mobile Number",
        address: "Address",
        username_placeholder: "Enter your username",
        email_placeholder: "Enter your email",
        mobile_placeholder: "Enter your mobile number",
        address_placeholder: "Enter your address",
        cancel: "Cancel",
        save: "Save Changes",
        success: "Success",
        success_message: "Profile updated successfully",
        error: "Error",
        error_message: "Failed to update profile. Please try again.",
        validation: {
          username_required: "Username is required",
          username_min: "Username must be at least 3 characters",
          email_required: "Email is required",
          email_invalid: "Invalid email format",
          mobile_required: "Mobile number is required",
          mobile_invalid: "Mobile must be 10-15 digits",
        },
      },
    },
  },

  hi: {
    translation: {
      home: "होम",
      product: "उत्पाद",
      cart: "कार्ट",
      partner: "साझेदार",
      profiles: "प्रोफ़ाइल",
      select_language: "अपनी भाषा चुनें",
      prescription_upload: "प्रिस्क्रिप्शन अपलोड",
      browse_products: "उत्पाद देखें",

      upload_title: "प्रिस्क्रिप्शन अपलोड करें",
      upload_subtitle: "और हम आपके लिए दवाइयों की व्यवस्था करेंगे",
      upload_button: "प्रिस्क्रिप्शन अपलोड करें",
      upload_description:
        "सभी अपलोड एन्क्रिप्टेड होते हैं और केवल हमारे फार्मासिस्ट को दिखाई देते हैं।\nआप द्वारा अपलोड किया गया कोई भी प्रिस्क्रिप्शन ऑर्डर प्रोसेस करने से पहले सत्यापित किया जाता है।",
      upload_valid_guide_link: "मान्य प्रिस्क्रिप्शन क्या होता है?",

      valid_guide_title: "मान्य प्रिस्क्रिप्शन गाइड",
      valid_guide_heading: "मान्य प्रिस्क्रिप्शन क्या होता है?",
      valid_guide_description:
        "एक मान्य प्रिस्क्रिप्शन में डॉक्टर, मरीज, दवा विवरण और डॉक्टर के हस्ताक्षर होने चाहिए।",
      valid_guide_okay: "ठीक है, मुझे समझ आ गया",

      home_carousel: {
        slide1_title: "15-मिनट में दवा डिलीवरी",
        slide1_sub: "आपका स्वास्थ्य इंतज़ार नहीं कर सकता। हम तेज़ डिलीवरी करते हैं।",
        slide2_title: "आपका स्वास्थ्य हमारी प्राथमिकता है",
        slide2_sub: "हम भरोसेमंद मेडिकल स्टोर्स के साथ काम करते हैं।",
        slide3_title: "आपके आसपास 200+ प्रमाणित मेडिकल स्टोर्स",
        slide3_sub: "ताकि आपकी ज़रूरी दवाइयाँ कभी खत्म न हों।",
        slide4_title: "आपके परिवार को स्वस्थ रखने में मदद",
        slide4_sub: "बच्चों और बुजुर्गों के लिए सुरक्षित और तेज़ सेवा।",
        slide5_title: "हम सिर्फ दवाइयाँ नहीं, देखभाल पहुंचाते हैं",
        slide5_sub: "क्योंकि घर पर कोई आपकी सेहत का इंतज़ार कर रहा है।"
      },

      profile: {
        settings: "सेटिंग्स",
        user: "उपयोगकर्ता",
        edit_account: "खाता संपादित करें",
        edit_profile: "प्रोफ़ाइल संपादित करें",
        change_password: "पासवर्ड बदलें",
        my_prescriptions: "मेरे प्रिस्क्रिप्शन",
        change_language: "भाषा बदलें",
        change_theme: "थीम बदलें",
        logout: "लॉगआउट",
        login: "लॉगिन",
        signup: "साइन अप",
      },

      edit_profile: {
        title: "प्रोफ़ाइल संपादित करें",
        username: "उपयोगकर्ता नाम",
        email: "ईमेल",
        mobile: "मोबाइल नंबर",
        address: "पता",
        username_placeholder: "अपना उपयोगकर्ता नाम दर्ज करें",
        email_placeholder: "अपना ईमेल दर्ज करें",
        mobile_placeholder: "अपना मोबाइल नंबर दर्ज करें",
        address_placeholder: "अपना पता दर्ज करें",
        cancel: "रद्द करें",
        save: "परिवर्तन सहेजें",
        success: "सफलता",
        success_message: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई",
        error: "त्रुटि",
        error_message: "प्रोफ़ाइल अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
        validation: {
          username_required: "उपयोगकर्ता नाम आवश्यक है",
          username_min: "उपयोगकर्ता नाम कम से कम 3 अक्षर का होना चाहिए",
          email_required: "ईमेल आवश्यक है",
          email_invalid: "अमान्य ईमेल प्रारूप",
          mobile_required: "मोबाइल नंबर आवश्यक है",
          mobile_invalid: "मोबाइल 10-15 अंकों का होना चाहिए",
        },
      },
    },
  },

  kn: {
    translation: {
      home: "ಮನೆ",
      product: "ಉತ್ಪನ್ನಗಳು",
      cart: "ಕಾರ್ಟ್",
      partner: "ಭಾಗಸ್ಪಂದಿಗಳು",
      profiles: "ಪ್ರೊಫೈಲ್",
      select_language: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      prescription_upload: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್",
      browse_products: "ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ",

      upload_title: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      upload_subtitle: "ನಾವು ನಿಮ್ಮಿಗಾಗಿ ಔಷಧಿಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತೇವೆ",
      upload_button: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      upload_description:
        "ಎಲ್ಲಾ ಅಪ್‌ಲೋಡ್‌ಗಳು ಎನ್ಕ್ರಿಪ್ಟ್ ಆಗಿದ್ದು, ನಮ್ಮ ಫಾರ್ಮಸಿಸ್ಟ್‌ಗಳಿಗೆ ಮಾತ್ರ ಗೋಚರಿಸುತ್ತವೆ.\nನೀವು ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಯಾವುದೇ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅನ್ನು ಆರ್ಡರ್ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಮುನ್ನ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.",
      upload_valid_guide_link: "ಮಾನ್ಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಎಂದರೆ ಏನು?",

      valid_guide_title: "ಮಾನ್ಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮಾರ್ಗದರ್ಶಿ",
      valid_guide_heading: "ಮಾನ್ಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಎಂದರೆ ಏನು?",
      valid_guide_description:
        "ಮಾನ್ಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ನಲ್ಲಿ ವೈದ್ಯರು, ರೋಗಿ, ಔಷಧ ವಿವರಗಳು ಹಾಗೂ ವೈದ್ಯರ ಸಹಿ ಇರಬೇಕು.",
      valid_guide_okay: "ಸರಿ, ನನಗೆ ಅರ್ಥವಾಯಿತು",

      home_carousel: {
        slide1_title: "15 ನಿಮಿಷಗಳಲ್ಲಿ ಔಷಧಿ ಡಿಲಿವರಿ",
        slide1_sub: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಕಾದುಕುಳಿಯುವುದಿಲ್ಲ. ನಾವು ವೇಗವಾಗಿ ತಲುಪಿಸುತ್ತೇವೆ.",
        slide2_title: "ನಿಮ್ಮ ಆರೋಗ್ಯ ನಮ್ಮ ಪ್ರಾಥಮ್ಯ",
        slide2_sub: "ನಾವು ವಿಶ್ವಾಸಾರ್ಹ ಮೆಡಿಕಲ್ ಸ್ಟೋರ್‌ಗಳೊಂದಿಗೆ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ.",
        slide3_title: "ನಿಮ್ಮ ಬಳಿ 200+ ದೃಢೀಕೃತ ಮೆಡಿಕಲ್ ಸ್ಟೋರ್‌ಗಳು",
        slide3_sub: "ಅಗತ್ಯ ಔಷಧಿಗಳು ಯಾವಾಗಲೂ ಲಭ್ಯವಾಗಲು.",
        slide4_title: "ನಿಮ್ಮ ಕುಟುಂಬದ ಆರೋಗ್ಯಕ್ಕೆ ಬೆಂಬಲ",
        slide4_sub: "ಮಕ್ಕಳು ಮತ್ತು ವಯೋವೃದ್ಧರಿಗೆ ಸುರಕ್ಷಿತ ಮತ್ತು ವೇಗದ ಸೇವೆ.",
        slide5_title: "ನಾವು ಔಷಧಿ ಮಾತ್ರವಲ್ಲ, ಕಾಳಜಿಯನ್ನೂ ತಲುಪಿಸುತ್ತೇವೆ",
        slide5_sub: "ಯಾಕೆಂದರೆ ಮನೆಯಲ್ಲೊಬ್ಬರು ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದ್ದಾರೆ."
      },

      profile: {
        settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        user: "ಬಳಕೆದಾರ",
        edit_account: "ಖಾತೆಯನ್ನು ಸಂಪಾದಿಸಿ",
        edit_profile: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
        change_password: "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ",
        my_prescriptions: "ನನ್ನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು",
        change_language: "ಭಾಷೆ ಬದಲಿಸಿ",
        change_theme: "ಥೀಮ್ ಬದಲಿಸಿ",
        logout: "ಲಾಗ್ಔಟ್",
        login: "ಲಾಗಿನ್",
        signup: "ಸೈನ್ ಅಪ್",
      },

      edit_profile: {
        title: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
        username: "ಬಳಕೆದಾರ ಹೆಸರು",
        email: "ಇಮೇಲ್",
        mobile: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
        address: "ವಿಳಾಸ",
        username_placeholder: "ನಿಮ್ಮ ಬಳಕೆದಾರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
        email_placeholder: "ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ",
        mobile_placeholder: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
        address_placeholder: "ನಿಮ್ಮ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ",
        cancel: "ರದ್ದುಗೊಳಿಸಿ",
        save: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
        success: "ಯಶಸ್ಸು",
        success_message: "ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ",
        error: "ದೋಷ",
        error_message: "ಪ್ರೊಫೈಲ್ ಅನ್ನು ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        validation: {
          username_required: "ಬಳಕೆದಾರ ಹೆಸರು ಅಗತ್ಯವಿದೆ",
          username_min: "ಬಳಕೆದಾರ ಹೆಸರು ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳು ಇರಬೇಕು",
          email_required: "ಇಮೇಲ್ ಅಗತ್ಯವಿದೆ",
          email_invalid: "ಅಮಾನ್ಯ ಇಮೇಲ್ ಫಾರ್ಮ್ಯಾಟ್",
          mobile_required: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿದೆ",
          mobile_invalid: "ಮೊಬೈಲ್ 10-15 ಅಂಕಿಗಳಾಗಿರಬೇಕು",
        },
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Load saved language from AsyncStorage on app start
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    if (savedLanguage && resources[savedLanguage]) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (err) {
    console.error('Error initializing language:', err);
  }
};

// Initialize on import
initializeLanguage();

export default i18n;