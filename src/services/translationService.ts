import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * TRANSLATION SERVICE FOR WEATHERGPT EXPLANATIONS
 * Requirements 16, 17, 18, 19, 20 & 21: Translates user-facing prose into target language while
 * strictly preserving numerical telemetry (29°C, 70%), risk scores (68/100), timestamps, and IMD names.
 */

export async function translateExplanationText(
  text: string,
  targetLang: SupportedLanguageCode
): Promise<string> {
  if (targetLang === 'en' || !text) {
    return text;
  }

  return formatLocalizedProse(text, targetLang);
}

/**
 * Localized Prose Formatter
 */
function formatLocalizedProse(text: string, targetLang: SupportedLanguageCode): string {
  let result = text;

  if (targetLang === 'te') {
    result = result
      .replace(/For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g, '**$2** లో **$1** కొరకు')
      .replace(/the calculated weather risk is \*\*(.*?)\*\*/g, 'వాతావరణ ప్రమాద స్కోర్ **$1**')
      .replace(/There is a high chance of rain during your window/g, 'మీ సమయ వ్యవధిలో వర్షం పడే అవకాశం ఎక్కువగా ఉంది')
      .replace(/Moderate chance of precipitation expected/g, 'సాధారణ వర్షపాతం నమోదయ్యే అవకాశం ఉంది')
      .replace(/Precipitation risk is low/g, 'వర్షపాతం ప్రమాదం తక్కువగా ఉంది')
      .replace(/Winds are expected around/g, 'ఈదురు గాలుల వేగం దాదాపు')
      .replace(/Recommendation:/g, 'సిఫార్సు:')
      .replace(/Potentially Better Time Window:/g, 'మంచి సమయం అందుబాటులో ఉంది:')
      .replace(/Official Warning Active:/g, 'అధికారిక హెచ్చరిక సక్రియంగా ఉంది:')
      .replace(/Decision support only — weather conditions can change rapidly./g, 'వాతావరణ నిర్ణయ మద్దతు మాత్రమే — పరిస్థితులు మారవచ్చు.');
  } else if (targetLang === 'ta') {
    result = result
      .replace(/For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g, '**$2** ல் **$1** ಗாக')
      .replace(/the calculated weather risk is \*\*(.*?)\*\*/g, 'கணக்கிடப்பட்ட வானிலை அபாயம் **$1**')
      .replace(/There is a high chance of rain during your window/g, 'மழை பெய்ய அதிக வாய்ப்புள்ளது')
      .replace(/Precipitation risk is low/g, 'மழை அபாயம் குறைவாக உள்ளது')
      .replace(/Recommendation:/g, 'பரிந்துரை:')
      .replace(/Official Warning Active:/g, 'அதிகாரப்பூர்வ எச்சரிக்கை:')
      .replace(/Decision support only — weather conditions can change rapidly./g, 'வானிலை முடிவு உதவி மட்டுமே.');
  } else if (targetLang === 'hi') {
    result = result
      .replace(/For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g, '**$2** में **$1** के लिए')
      .replace(/the calculated weather risk is \*\*(.*?)\*\*/g, 'मौसम जोखिम स्कोर **$1** है')
      .replace(/There is a high chance of rain during your window/g, 'आपकी समय अवधि के दौरान बारिश की उच्च संभावना है')
      .replace(/Precipitation risk is low/g, 'बारिश का जोखिम कम है')
      .replace(/Recommendation:/g, 'सिफारिश:')
      .replace(/Official Warning Active:/g, 'आधिकारिक चेतावनी सक्रिय:')
      .replace(/Decision support only — weather conditions can change rapidly./g, 'केवल मौसम निर्णय सहायता — स्थितियां बदल सकती हैं।');
  } else if (targetLang === 'kn') {
    result = result
      .replace(/For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g, '**$2** ನಲ್ಲಿ **$1** ಗಾಗಿ')
      .replace(/the calculated weather risk is \*\*(.*?)\*\*/g, 'ಲೆಕ್ಕಹಾಕಿದ ಹವಾಮಾನ ಅಪಾಯ **$1**')
      .replace(/There is a high chance of rain during your window/g, 'ಮಳೆ ಬರುವ ಹೆಚ್ಚಿನ ಸಾಧ್ಯತೆಯಿದೆ')
      .replace(/Recommendation:/g, 'ಶಿಫಾರಸು:')
      .replace(/Official Warning Active:/g, 'ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯವಾಗಿದೆ:');
  } else if (targetLang === 'ml') {
    result = result
      .replace(/For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g, '**$2** ൽ **$1** നായി')
      .replace(/the calculated weather risk is \*\*(.*?)\*\*/g, 'കണക്കാക്കിയ കാലാവസ്ഥാ അപകടസാധ്യത **$1**')
      .replace(/There is a high chance of rain during your window/g, 'മഴ പെയ്യാൻ ഉയർന്ന സാധ്യതയുണ്ട്')
      .replace(/Recommendation:/g, 'ശുപാർശ:')
      .replace(/Official Warning Active:/g, 'ഔദ്യോഗിക മുന്നറിയിപ്പ് സജീവമാണ്:');
  }

  return result;
}
