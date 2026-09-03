import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * WEATHERGPT TRANSLATION SERVICE
 *
 * Localizes the complete deterministic WeatherGPT response.
 *
 * Important:
 * - Weather numbers are preserved.
 * - Risk scores are preserved.
 * - Percentages are preserved.
 * - Temperature values and units are preserved.
 * - Wind values and units are preserved.
 * - Location names are preserved.
 * - Activity names are preserved unless they have a known translation.
 * - Markdown formatting is preserved.
 */

export async function translateExplanationText(
  text: string,
  targetLang: SupportedLanguageCode
): Promise<string> {
  if (targetLang === 'en' || !text) {
    return text;
  }

  switch (targetLang) {
    case 'te':
      return translateTelugu(text);

    case 'hi':
      return translateHindi(text);

    case 'ta':
      return translateTamil(text);

    case 'kn':
      return translateKannada(text);

    case 'ml':
      return translateMalayalam(text);

    default:
      return text;
  }
}


/* ============================================================
   COMMON HELPERS
   ============================================================ */

function translateCondition(
  condition: string,
  lang: SupportedLanguageCode
): string {
  const value = condition.trim();
  const lower = value.toLowerCase();

  const translations: Record<
    SupportedLanguageCode,
    Record<string, string>
  > = {
    en: {},
    te: {
      'clear': 'ఆకాశం నిర్మలంగా ఉంది',
      'clear sky': 'ఆకాశం నిర్మలంగా ఉంది',
      'mainly clear': 'ఆకాశం ఎక్కువగా నిర్మలంగా ఉంది',
      'partly cloudy': 'పాక్షికంగా మేఘావృతం',
      'cloudy': 'మేఘావృతం',
      'overcast': 'పూర్తిగా మేఘావృతం',
      'rain': 'వర్షం',
      'light rain': 'తేలికపాటి వర్షం',
      'moderate rain': 'మోస్తరు వర్షం',
      'heavy rain': 'భారీ వర్షం',
      'thunderstorm': 'ఉరుములతో కూడిన వర్షం',
      'thunderstorm with rain': 'ఉరుములతో కూడిన వర్షం',
      'drizzle': 'చినుకులు',
      'fog': 'పొగమంచు',
      'mist': 'పొగమంచు'
    },
    hi: {
      'clear': 'आसमान साफ है',
      'clear sky': 'आसमान साफ है',
      'mainly clear': 'आसमान ज्यादातर साफ है',
      'partly cloudy': 'आंशिक रूप से बादल छाए हैं',
      'cloudy': 'बादल छाए हैं',
      'overcast': 'पूरी तरह बादल छाए हैं',
      'rain': 'बारिश',
      'light rain': 'हल्की बारिश',
      'moderate rain': 'मध्यम बारिश',
      'heavy rain': 'भारी बारिश',
      'thunderstorm': 'गरज के साथ बारिश',
      'thunderstorm with rain': 'गरज के साथ बारिश',
      'drizzle': 'बूंदाबांदी',
      'fog': 'कोहरा',
      'mist': 'धुंध'
    },
    ta: {
      'clear': 'வானம் தெளிவாக உள்ளது',
      'clear sky': 'வானம் தெளிவாக உள்ளது',
      'mainly clear': 'வானம் பெரும்பாலும் தெளிவாக உள்ளது',
      'partly cloudy': 'பகுதியளவில் மேகமூட்டமாக உள்ளது',
      'cloudy': 'மேகமூட்டமாக உள்ளது',
      'overcast': 'முழுவதும் மேகமூட்டமாக உள்ளது',
      'rain': 'மழை',
      'light rain': 'லேசான மழை',
      'moderate rain': 'மிதமான மழை',
      'heavy rain': 'கனமழை',
      'thunderstorm': 'இடியுடன் கூடிய மழை',
      'thunderstorm with rain': 'இடியுடன் கூடிய மழை',
      'drizzle': 'தூறல்',
      'fog': 'மூடுபனி',
      'mist': 'பனிமூட்டம்'
    },
    kn: {
      'clear': 'ಆಕಾಶವು ನಿರ್ಮಲವಾಗಿದೆ',
      'clear sky': 'ಆಕಾಶವು ನಿರ್ಮಲವಾಗಿದೆ',
      'mainly clear': 'ಆಕಾಶವು ಬಹುತೇಕ ನಿರ್ಮಲವಾಗಿದೆ',
      'partly cloudy': 'ಭಾಗಶಃ ಮೋಡ ಕವಿದಿದೆ',
      'cloudy': 'ಮೋಡ ಕವಿದಿದೆ',
      'overcast': 'ಸಂಪೂರ್ಣವಾಗಿ ಮೋಡ ಕವಿದಿದೆ',
      'rain': 'ಮಳೆ',
      'light rain': 'ಸಣ್ಣ ಮಳೆ',
      'moderate rain': 'ಮಧ್ಯಮ ಮಳೆ',
      'heavy rain': 'ಭಾರಿ ಮಳೆ',
      'thunderstorm': 'ಗುಡುಗು ಸಹಿತ ಮಳೆ',
      'thunderstorm with rain': 'ಗುಡುಗು ಸಹಿತ ಮಳೆ',
      'drizzle': 'ತುಂತುರು ಮಳೆ',
      'fog': 'ಮಂಜು',
      'mist': 'ಮಂಜು'
    },
    ml: {
      'clear': 'ആകാശം തെളിഞ്ഞിരിക്കുന്നു',
      'clear sky': 'ആകാശം തെളിഞ്ഞിരിക്കുന്നു',
      'mainly clear': 'ആകാശം കൂടുതലും തെളിഞ്ഞിരിക്കുന്നു',
      'partly cloudy': 'ഭാഗികമായി മേഘാവൃതമാണ്',
      'cloudy': 'മേഘാവൃതമാണ്',
      'overcast': 'പൂർണ്ണമായും മേഘാവൃതമാണ്',
      'rain': 'മഴ',
      'light rain': 'നേരിയ മഴ',
      'moderate rain': 'മിതമായ മഴ',
      'heavy rain': 'കനത്ത മഴ',
      'thunderstorm': 'ഇടിമിന്നലോടുകൂടിയ മഴ',
      'thunderstorm with rain': 'ഇടിമിന്നലോടുകൂടിയ മഴ',
      'drizzle': 'ചാറ്റൽമഴ',
      'fog': 'മൂടൽമഞ്ഞ്',
      'mist': 'മഞ്ഞ്'
    }
  };

  return translations[lang]?.[lower] || value;
}


/* ============================================================
   TELUGU
   ============================================================ */

function translateTelugu(text: string): string {
  let result = text;

  // Main decision sentence
  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
    '**$2** లో **$1** కోసం ($3, $4), లెక్కించిన వాతావరణ ప్రమాద స్కోర్ **$5/100 ($6)**.'
  );

  // Risk heading
  result = result.replace(
    /\*\*WHY THIS RISK SCORE\?\*\*/gi,
    '**ఈ ప్రమాద స్కోర్ ఎందుకు?**'
  );

  // Rain factor
  result = result.replace(
    /🌧 Heavy rain \/ precipitation risk \((\d+)%\) -> \+(\d+)/gi,
    '🌧 భారీ వర్షం / వర్షపాతం ప్రమాదం ($1%) → +$2'
  );

  // Thunder factor
  result = result.replace(
    /⚡ Lightning \/ Thunderstorm warning \((.*?)\) -> \+(\d+)/gi,
    '⚡ మెరుపులు / ఉరుములతో కూడిన వర్షం హెచ్చరిక ($1) → +$2'
  );

  // Wind factor
  result = result.replace(
    /💨 Strong wind \(([\d.]+) km\/h\) -> \+(\d+)/gi,
    '💨 బలమైన గాలులు ($1 km/h) → +$2'
  );

  // Temperature factor
  result = result.replace(
    /🌡 High temperature \(([\d.]+)°C, feels ([\d.]+)°C\) -> \+(\d+)/gi,
    '🌡 అధిక ఉష్ణోగ్రత ($1°C, అనుభూతి $2°C) → +$3'
  );

  // Warning factor
  result = result.replace(
    /⚠️ Active weather warning \((.*?)\) -> \+(\d+)/gi,
    '⚠️ క్రియాశీల వాతావరణ హెచ్చరిక ($1) → +$2'
  );

  // Recommendation
  result = result.replace(
    /💡 \*\*Recommendation:\*\*/gi,
    '💡 **సిఫార్సు:**'
  );

  result = result.replace(
    /Official weather warning \((.*?)\) active for your selected location\. Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'మీరు ఎంచుకున్న ప్రాంతంలో అధికారిక వాతావరణ హెచ్చరిక ($1) అమల్లో ఉంది. తీవ్రమైన వాతావరణ ప్రమాదం కారణంగా ఎంచుకున్న సమయంలో బహిరంగ కార్యకలాపం చేయడం సిఫార్సు చేయబడదు.'
  );

  result = result.replace(
    /Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'తీవ్రమైన వాతావరణ ప్రమాదం కారణంగా ఎంచుకున్న సమయంలో బహిరంగ కార్యకలాపం చేయడం సిఫార్సు చేయబడదు.'
  );

  result = result.replace(
    /Consider postponing the activity or choosing another time\./gi,
    'కార్యకలాపాన్ని వాయిదా వేయడం లేదా మరొక సమయాన్ని ఎంచుకోవడం మంచిది.'
  );

  result = result.replace(
    /Conditions are generally manageable, but monitor the weather before starting\./gi,
    'పరిస్థితులు సాధారణంగా అనుకూలంగా ఉన్నాయి, అయితే ప్రారంభించే ముందు వాతావరణాన్ని గమనించండి.'
  );

  result = result.replace(
    /Conditions appear favorable for this activity during the selected period\./gi,
    'ఎంచుకున్న సమయంలో ఈ కార్యకలాపానికి వాతావరణ పరిస్థితులు అనుకూలంగా కనిపిస్తున్నాయి.'
  );

  result = result.replace(
    /Calculated risk score of (\d+)\/100 indicates significant potential weather disruption\./gi,
    'లెక్కించిన ప్రమాద స్కోర్ $1/100 కావడంతో వాతావరణం వల్ల గణనీయమైన అంతరాయం కలిగే అవకాశం ఉంది.'
  );

  result = result.replace(
    /Extreme weather factors present dangerous conditions for (.*?)\./gi,
    '$1 కోసం తీవ్రమైన వాతావరణ పరిస్థితులు ప్రమాదకర పరిస్థితులను సృష్టిస్తున్నాయి.'
  );

  result = result.replace(
    /Moderate precipitation, wind, or thermal factors observed\./gi,
    'మోస్తరు వర్షపాతం, గాలి లేదా ఉష్ణోగ్రతకు సంబంధించిన ప్రభావాలు కనిపిస్తున్నాయి.'
  );

  result = result.replace(
    /Weather forecast projects clear, safe conditions\./gi,
    'వాతావరణ అంచనా ప్రకారం పరిస్థితులు స్పష్టంగా మరియు సురక్షితంగా ఉండే అవకాశం ఉంది.'
  );

  result = result.replace(
    /Official weather alerts take precedence in risk calculation\./gi,
    'ప్రమాద గణనలో అధికారిక వాతావరణ హెచ్చరికలకు అత్యధిక ప్రాధాన్యత ఇవ్వబడుతుంది.'
  );

  result = result.replace(
    /Decision support only — weather conditions can change rapidly\./gi,
    'ఇది వాతావరణ నిర్ణయ సహాయం మాత్రమే — వాతావరణ పరిస్థితులు వేగంగా మారవచ్చు.'
  );

  result = result.replace(
    /Always follow official weather warnings and local authority guidance\./gi,
    'ఎల్లప్పుడూ అధికారిక వాతావరణ హెచ్చరికలు మరియు స్థానిక అధికారుల సూచనలను పాటించండి.'
  );

  // Better time window
  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '🕒 **మరింత అనుకూలమైన సమయం:** $1'
  );

  result = result.replace(
    /Potentially lower weather risk \((\d+)\/100 vs (\d+)\/100\) based on available forecast data\./gi,
    'అందుబాటులో ఉన్న వాతావరణ అంచనా ప్రకారం తక్కువ వాతావరణ ప్రమాదం ఉన్న సమయం ($1/100, ప్రస్తుతం $2/100తో పోలిస్తే).'
  );

  // Official warning
  result = result.replace(
    /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
    '⚠️ **అధికారిక హెచ్చరిక అమల్లో ఉంది:** **$1** అలర్ట్ ($2) **$3** కోసం అమల్లో ఉంది.\n'
  );

  result = result.replace(
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 అలర్ట్** ప్రస్తుతం **$2** కోసం అమల్లో ఉంది ($3). అధికారిక గడువు వరకు ఇది చెల్లుబాటులో ఉంటుంది.'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ ప్రస్తుతం **$1** కోసం తీవ్రమైన వాతావరణ హెచ్చరికలు ఏవీ గుర్తించబడలేదు (GREEN స్థితి).'
  );

  // Rain forecast
  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
    '**$1** కోసం ($2, $3) అందుబాటులో ఉన్న ప్రత్యక్ష వాతావరణ అంచనా ప్రకారం, వర్షపాతం అవకాశం **$4%** మరియు అంచనా పరిస్థితులు *$5*. వర్షం నుంచి రక్షణ కోసం అవసరమైన వస్తువులను వెంట తీసుకెళ్లడం మంచిది.'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Significant rainfall is not currently projected\./gi,
    '**$1** కోసం ($2, $3) అందుబాటులో ఉన్న ప్రత్యక్ష వాతావరణ అంచనా ప్రకారం, వర్షపాతం అవకాశం **$4%** మరియు అంచనా పరిస్థితులు *$5*. ప్రస్తుతం గణనీయమైన వర్షపాతం అంచనా లేదు.'
  );

  // Temperature
  result = result.replace(
    /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
    '**$1** లో **$2** ($3) సమయంలో అంచనా ఉష్ణోగ్రత **$4°C** మరియు వాతావరణ పరిస్థితులు *$5*.'
  );

  // General weather
  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** కోసం వాతావరణ అంచనా ($2, $3): ప్రస్తుతం ఉష్ణోగ్రత **$4°C**, పరిస్థితులు *$5*, వర్షం వచ్చే అవకాశం **$6%**, గాలి వేగం **$7 km/h**.'
  );

  // Follow-up questions
  result = result.replace(
    /What about morning\?/gi,
    'ఉదయం సమయంలో ఎలా ఉంటుంది?'
  );

  result = result.replace(
    /What about evening\?/gi,
    'సాయంత్రం సమయంలో ఎలా ఉంటుంది?'
  );

  result = result.replace(
    /How was this risk score calculated\?/gi,
    'ఈ ప్రమాద స్కోర్ ఎలా లెక్కించబడింది?'
  );

  result = result.replace(
    /Show me a better time window/gi,
    'మరింత అనుకూలమైన సమయాన్ని చూపించండి'
  );

  result = result.replace(
    /What about rainfall\?/gi,
    'వర్షపాతం గురించి ఏమిటి?'
  );

  result = result.replace(
    /Will it rain tomorrow\?/gi,
    'రేపు వర్షం పడుతుందా?'
  );

  result = result.replace(
    /Are there any warnings in my area\?/gi,
    'నా ప్రాంతంలో ఏమైనా హెచ్చరికలు ఉన్నాయా?'
  );

  return result;
}


/* ============================================================
   HINDI
   ============================================================ */

function translateHindi(text: string): string {
  let result = text;

  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
    '**$2** में **$1** के लिए ($3, $4), गणना किया गया मौसम जोखिम स्कोर **$5/100 ($6)** है।'
  );

  result = result.replace(
    /\*\*WHY THIS RISK SCORE\?\*\*/gi,
    '**यह जोखिम स्कोर क्यों है?**'
  );

  result = result.replace(
    /🌧 Heavy rain \/ precipitation risk \((\d+)%\) -> \+(\d+)/gi,
    '🌧 भारी बारिश / वर्षा का जोखिम ($1%) → +$2'
  );

  result = result.replace(
    /⚡ Lightning \/ Thunderstorm warning \((.*?)\) -> \+(\d+)/gi,
    '⚡ बिजली / गरज के साथ बारिश की चेतावनी ($1) → +$2'
  );

  result = result.replace(
    /💨 Strong wind \(([\d.]+) km\/h\) -> \+(\d+)/gi,
    '💨 तेज़ हवा ($1 km/h) → +$2'
  );

  result = result.replace(
    /🌡 High temperature \(([\d.]+)°C, feels ([\d.]+)°C\) -> \+(\d+)/gi,
    '🌡 अधिक तापमान ($1°C, महसूस $2°C) → +$3'
  );

  result = result.replace(
    /⚠️ Active weather warning \((.*?)\) -> \+(\d+)/gi,
    '⚠️ सक्रिय मौसम चेतावनी ($1) → +$2'
  );

  result = result.replace(
    /💡 \*\*Recommendation:\*\*/gi,
    '💡 **सिफारिश:**'
  );

  result = result.replace(
    /Official weather warning \((.*?)\) active for your selected location\. Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'आपके चुने हुए स्थान पर आधिकारिक मौसम चेतावनी ($1) सक्रिय है। गंभीर मौसम जोखिम के कारण चुने गए समय में बाहरी गतिविधि की सलाह नहीं दी जाती है।'
  );

  result = result.replace(
    /Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'गंभीर मौसम जोखिम के कारण चुने गए समय में बाहरी गतिविधि की सलाह नहीं दी जाती है।'
  );

  result = result.replace(
    /Consider postponing the activity or choosing another time\./gi,
    'गतिविधि को स्थगित करने या कोई दूसरा समय चुनने पर विचार करें।'
  );

  result = result.replace(
    /Conditions are generally manageable, but monitor the weather before starting\./gi,
    'परिस्थितियां सामान्य रूप से संभालने योग्य हैं, लेकिन शुरू करने से पहले मौसम पर नज़र रखें।'
  );

  result = result.replace(
    /Conditions appear favorable for this activity during the selected period\./gi,
    'चुने गए समय में इस गतिविधि के लिए मौसम की परिस्थितियां अनुकूल दिखाई देती हैं।'
  );

  result = result.replace(
    /Calculated risk score of (\d+)\/100 indicates significant potential weather disruption\./gi,
    'गणना किया गया जोखिम स्कोर $1/100 मौसम के कारण महत्वपूर्ण व्यवधान की संभावना दर्शाता है।'
  );

  result = result.replace(
    /Extreme weather factors present dangerous conditions for (.*?)\./gi,
    '$1 के लिए गंभीर मौसम कारक खतरनाक परिस्थितियां पैदा कर रहे हैं।'
  );

  result = result.replace(
    /Moderate precipitation, wind, or thermal factors observed\./gi,
    'मध्यम वर्षा, हवा या तापमान से संबंधित प्रभाव देखे गए हैं।'
  );

  result = result.replace(
    /Weather forecast projects clear, safe conditions\./gi,
    'मौसम पूर्वानुमान साफ और सुरक्षित परिस्थितियों का संकेत देता है।'
  );

  result = result.replace(
    /Official weather alerts take precedence in risk calculation\./gi,
    'जोखिम की गणना में आधिकारिक मौसम चेतावनियों को सर्वोच्च प्राथमिकता दी जाती है।'
  );

  result = result.replace(
    /Decision support only — weather conditions can change rapidly\./gi,
    'यह केवल मौसम संबंधी निर्णय सहायता है — मौसम की परिस्थितियां तेजी से बदल सकती हैं।'
  );

  result = result.replace(
    /Always follow official weather warnings and local authority guidance\./gi,
    'हमेशा आधिकारिक मौसम चेतावनियों और स्थानीय अधिकारियों के निर्देशों का पालन करें।'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '🕒 **बेहतर संभावित समय:** $1'
  );

  result = result.replace(
    /Potentially lower weather risk \((\d+)\/100 vs (\d+)\/100\) based on available forecast data\./gi,
    'उपलब्ध मौसम पूर्वानुमान के अनुसार कम मौसम जोखिम वाला समय ($1/100, वर्तमान $2/100 की तुलना में)।'
  );

  result = result.replace(
    /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
    '⚠️ **आधिकारिक चेतावनी सक्रिय है:** **$1** अलर्ट ($2) **$3** के लिए प्रभावी है।\n'
  );

  result = result.replace(
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 अलर्ट** वर्तमान में **$2** के लिए सक्रिय है ($3)। यह आधिकारिक समाप्ति समय तक मान्य रहेगा।'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ इस समय **$1** के लिए कोई सक्रिय गंभीर मौसम चेतावनी नहीं मिली है (GREEN स्थिति)।'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
    '**$1** के लिए ($2, $3) उपलब्ध लाइव मौसम पूर्वानुमान के अनुसार, वर्षा की संभावना **$4%** है और अपेक्षित मौसम *$5* है। बारिश से बचाव का सामान साथ रखना उचित रहेगा।'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Significant rainfall is not currently projected\./gi,
    '**$1** के लिए ($2, $3) उपलब्ध लाइव मौसम पूर्वानुमान के अनुसार, वर्षा की संभावना **$4%** है और अपेक्षित मौसम *$5* है। फिलहाल महत्वपूर्ण बारिश की संभावना नहीं है।'
  );

  result = result.replace(
    /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
    '**$1** में **$2** ($3) के दौरान अनुमानित तापमान **$4°C** है और मौसम की स्थिति *$5* रहने की उम्मीद है।'
  );

  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** के लिए मौसम पूर्वानुमान ($2, $3): वर्तमान तापमान **$4°C**, मौसम की स्थिति *$5*, बारिश की संभावना **$6%** और हवा की गति **$7 km/h** है।'
  );

  result = result.replace(/What about morning\?/gi, 'सुबह के समय कैसा रहेगा?');
  result = result.replace(/What about evening\?/gi, 'शाम के समय कैसा रहेगा?');
  result = result.replace(/How was this risk score calculated\?/gi, 'यह जोखिम स्कोर कैसे निकाला गया?');
  result = result.replace(/Show me a better time window/gi, 'मुझे बेहतर समय बताएं');
  result = result.replace(/What about rainfall\?/gi, 'बारिश के बारे में क्या?');
  result = result.replace(/Will it rain tomorrow\?/gi, 'क्या कल बारिश होगी?');
  result = result.replace(/Are there any warnings in my area\?/gi, 'क्या मेरे क्षेत्र में कोई चेतावनी है?');

  return result;
}


/* ============================================================
   TAMIL
   ============================================================ */

function translateTamil(text: string): string {
  let result = text;

  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
    '**$2** பகுதியில் **$1** நடவடிக்கைக்காக ($3, $4), கணக்கிடப்பட்ட வானிலை அபாய மதிப்பெண் **$5/100 ($6)** ஆகும்.'
  );

  result = result.replace(/\*\*WHY THIS RISK SCORE\?\*\*/gi, '**இந்த அபாய மதிப்பெண் ஏன்?**');

  result = result.replace(
    /🌧 Heavy rain \/ precipitation risk \((\d+)%\) -> \+(\d+)/gi,
    '🌧 கனமழை / மழைப்பொழிவு அபாயம் ($1%) → +$2'
  );

  result = result.replace(
    /⚡ Lightning \/ Thunderstorm warning \((.*?)\) -> \+(\d+)/gi,
    '⚡ மின்னல் / இடியுடன் கூடிய மழை எச்சரிக்கை ($1) → +$2'
  );

  result = result.replace(
    /💨 Strong wind \(([\d.]+) km\/h\) -> \+(\d+)/gi,
    '💨 பலத்த காற்று ($1 km/h) → +$2'
  );

  result = result.replace(
    /🌡 High temperature \(([\d.]+)°C, feels ([\d.]+)°C\) -> \+(\d+)/gi,
    '🌡 அதிக வெப்பநிலை ($1°C, உணரப்படும் வெப்பநிலை $2°C) → +$3'
  );

  result = result.replace(
    /⚠️ Active weather warning \((.*?)\) -> \+(\d+)/gi,
    '⚠️ செயலில் உள்ள வானிலை எச்சரிக்கை ($1) → +$2'
  );

  result = result.replace(/💡 \*\*Recommendation:\*\*/gi, '💡 **பரிந்துரை:**');

  result = result.replace(
    /Official weather warning \((.*?)\) active for your selected location\. Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'நீங்கள் தேர்ந்தெடுத்த பகுதியில் அதிகாரப்பூர்வ வானிலை எச்சரிக்கை ($1) அமலில் உள்ளது. கடுமையான வானிலை அபாயம் காரணமாக தேர்ந்தெடுத்த நேரத்தில் வெளிப்புற நடவடிக்கை பரிந்துரைக்கப்படவில்லை.'
  );

  result = result.replace(
    /Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'கடுமையான வானிலை அபாயம் காரணமாக தேர்ந்தெடுத்த நேரத்தில் வெளிப்புற நடவடிக்கை பரிந்துரைக்கப்படவில்லை.'
  );

  result = result.replace(
    /Consider postponing the activity or choosing another time\./gi,
    'நடவடிக்கையை ஒத்திவைக்கவும் அல்லது வேறு நேரத்தைத் தேர்ந்தெடுக்கவும்.'
  );

  result = result.replace(
    /Conditions are generally manageable, but monitor the weather before starting\./gi,
    'நிலைமைகள் பொதுவாக சமாளிக்கக்கூடியவை, ஆனால் தொடங்குவதற்கு முன் வானிலையை கண்காணிக்கவும்.'
  );

  result = result.replace(
    /Conditions appear favorable for this activity during the selected period\./gi,
    'தேர்ந்தெடுத்த நேரத்தில் இந்த நடவடிக்கைக்கு வானிலை நிலைமைகள் சாதகமாகத் தெரிகின்றன.'
  );

  result = result.replace(
    /Calculated risk score of (\d+)\/100 indicates significant potential weather disruption\./gi,
    'கணக்கிடப்பட்ட அபாய மதிப்பெண் $1/100 என்பதால் வானிலை காரணமாக குறிப்பிடத்தக்க இடையூறு ஏற்பட வாய்ப்புள்ளது.'
  );

  result = result.replace(
    /Extreme weather factors present dangerous conditions for (.*?)\./gi,
    '$1 நடவடிக்கைக்கு கடுமையான வானிலை காரணிகள் ஆபத்தான நிலைமைகளை உருவாக்குகின்றன.'
  );

  result = result.replace(
    /Moderate precipitation, wind, or thermal factors observed\./gi,
    'மிதமான மழைப்பொழிவு, காற்று அல்லது வெப்பநிலை தொடர்பான தாக்கங்கள் காணப்படுகின்றன.'
  );

  result = result.replace(
    /Weather forecast projects clear, safe conditions\./gi,
    'வானிலை முன்னறிவிப்பு தெளிவான மற்றும் பாதுகாப்பான நிலைமைகளை காட்டுகிறது.'
  );

  result = result.replace(
    /Official weather alerts take precedence in risk calculation\./gi,
    'அபாயக் கணக்கீட்டில் அதிகாரப்பூர்வ வானிலை எச்சரிக்கைகளுக்கு முன்னுரிமை அளிக்கப்படுகிறது.'
  );

  result = result.replace(
    /Decision support only — weather conditions can change rapidly\./gi,
    'இது வானிலை முடிவு உதவிக்காக மட்டுமே — வானிலை நிலைமைகள் வேகமாக மாறக்கூடும்.'
  );

  result = result.replace(
    /Always follow official weather warnings and local authority guidance\./gi,
    'எப்போதும் அதிகாரப்பூர்வ வானிலை எச்சரிக்கைகள் மற்றும் உள்ளூர் அதிகாரிகளின் வழிகாட்டுதல்களைப் பின்பற்றவும்.'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '🕒 **சிறந்த நேர வாய்ப்பு:** $1'
  );

  result = result.replace(
    /Potentially lower weather risk \((\d+)\/100 vs (\d+)\/100\) based on available forecast data\./gi,
    'கிடைக்கும் வானிலை முன்னறிவிப்பின்படி குறைந்த வானிலை அபாயம் உள்ள நேரம் ($1/100, தற்போதைய $2/100 உடன் ஒப்பிடுகையில்).'
  );

  result = result.replace(
    /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
    '⚠️ **அதிகாரப்பூர்வ எச்சரிக்கை செயலில் உள்ளது:** **$1** எச்சரிக்கை ($2) **$3** பகுதியில் அமலில் உள்ளது.\n'
  );

  result = result.replace(
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 எச்சரிக்கை** தற்போது **$2** பகுதியில் செயல்பாட்டில் உள்ளது ($3). அதிகாரப்பூர்வ காலாவதி நேரம் வரை இது செல்லுபடியாகும்.'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ தற்போது **$1** பகுதிக்கு கடுமையான வானிலை எச்சரிக்கைகள் எதுவும் இல்லை (GREEN நிலை).'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
    '**$1** பகுதிக்கான ($2, $3) நேரடி வானிலை முன்னறிவிப்பின்படி, மழைக்கான வாய்ப்பு **$4%** மற்றும் எதிர்பார்க்கப்படும் வானிலை *$5*. மழையிலிருந்து பாதுகாப்புக்கான பொருட்களை எடுத்துச் செல்வது நல்லது.'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Significant rainfall is not currently projected\./gi,
    '**$1** பகுதிக்கான ($2, $3) நேரடி வானிலை முன்னறிவிப்பின்படி, மழைக்கான வாய்ப்பு **$4%** மற்றும் எதிர்பார்க்கப்படும் வானிலை *$5*. தற்போது குறிப்பிடத்தக்க மழைப்பொழிவு எதிர்பார்க்கப்படவில்லை.'
  );

  result = result.replace(
    /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
    '**$1** பகுதியில் **$2** ($3) நேரத்தில் எதிர்பார்க்கப்படும் வெப்பநிலை **$4°C**, மேலும் வானிலை *$5* ஆக இருக்கும்.'
  );

  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** வானிலை முன்னறிவிப்பு ($2, $3): தற்போதைய வெப்பநிலை **$4°C**, வானிலை *$5*, மழைக்கான வாய்ப்பு **$6%**, காற்றின் வேகம் **$7 km/h**.'
  );

  result = result.replace(/What about morning\?/gi, 'காலையில் எப்படி இருக்கும்?');
  result = result.replace(/What about evening\?/gi, 'மாலையில் எப்படி இருக்கும்?');
  result = result.replace(/How was this risk score calculated\?/gi, 'இந்த அபாய மதிப்பெண் எப்படி கணக்கிடப்பட்டது?');
  result = result.replace(/Show me a better time window/gi, 'சிறந்த நேரத்தை காட்டுங்கள்');
  result = result.replace(/What about rainfall\?/gi, 'மழைப்பொழிவு பற்றி என்ன?');
  result = result.replace(/Will it rain tomorrow\?/gi, 'நாளை மழை பெய்யுமா?');
  result = result.replace(/Are there any warnings in my area\?/gi, 'என் பகுதியில் ஏதேனும் எச்சரிக்கைகள் உள்ளனவா?');

  return result;
}


/* ============================================================
   KANNADA
   ============================================================ */

function translateKannada(text: string): string {
  let result = text;

  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
    '**$2** ನಲ್ಲಿ **$1** ಚಟುವಟಿಕೆಗೆ ($3, $4), ಲೆಕ್ಕಹಾಕಿದ ಹವಾಮಾನ ಅಪಾಯದ ಸ್ಕೋರ್ **$5/100 ($6)** ಆಗಿದೆ.'
  );

  result = result.replace(/\*\*WHY THIS RISK SCORE\?\*\*/gi, '**ಈ ಅಪಾಯದ ಸ್ಕೋರ್ ಏಕೆ?**');

  result = result.replace(
    /🌧 Heavy rain \/ precipitation risk \((\d+)%\) -> \+(\d+)/gi,
    '🌧 ಭಾರಿ ಮಳೆ / ಮಳೆಯ ಅಪಾಯ ($1%) → +$2'
  );

  result = result.replace(
    /⚡ Lightning \/ Thunderstorm warning \((.*?)\) -> \+(\d+)/gi,
    '⚡ ಮಿಂಚು / ಗುಡುಗು ಸಹಿತ ಮಳೆಯ ಎಚ್ಚರಿಕೆ ($1) → +$2'
  );

  result = result.replace(
    /💨 Strong wind \(([\d.]+) km\/h\) -> \+(\d+)/gi,
    '💨 ಬಲವಾದ ಗಾಳಿ ($1 km/h) → +$2'
  );

  result = result.replace(
    /🌡 High temperature \(([\d.]+)°C, feels ([\d.]+)°C\) -> \+(\d+)/gi,
    '🌡 ಹೆಚ್ಚಿನ ತಾಪಮಾನ ($1°C, ಅನುಭವವಾಗುವ ತಾಪಮಾನ $2°C) → +$3'
  );

  result = result.replace(
    /⚠️ Active weather warning \((.*?)\) -> \+(\d+)/gi,
    '⚠️ ಸಕ್ರಿಯ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ($1) → +$2'
  );

  result = result.replace(/💡 \*\*Recommendation:\*\*/gi, '💡 **ಶಿಫಾರಸು:**');

  result = result.replace(
    /Official weather warning \((.*?)\) active for your selected location\. Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಸ್ಥಳದಲ್ಲಿ ಅಧಿಕೃತ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ($1) ಸಕ್ರಿಯವಾಗಿದೆ. ಗಂಭೀರ ಹವಾಮಾನ ಅಪಾಯದ ಕಾರಣ ಆಯ್ಕೆ ಮಾಡಿದ ಸಮಯದಲ್ಲಿ ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗುವುದಿಲ್ಲ.'
  );

  result = result.replace(
    /Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'ಗಂಭೀರ ಹವಾಮಾನ ಅಪಾಯದ ಕಾರಣ ಆಯ್ಕೆ ಮಾಡಿದ ಸಮಯದಲ್ಲಿ ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗುವುದಿಲ್ಲ.'
  );

  result = result.replace(
    /Consider postponing the activity or choosing another time\./gi,
    'ಚಟುವಟಿಕೆಯನ್ನು ಮುಂದೂಡುವುದು ಅಥವಾ ಬೇರೆ ಸಮಯವನ್ನು ಆಯ್ಕೆ ಮಾಡುವುದು ಉತ್ತಮ.'
  );

  result = result.replace(
    /Conditions are generally manageable, but monitor the weather before starting\./gi,
    'ಪರಿಸ್ಥಿತಿಗಳು ಸಾಮಾನ್ಯವಾಗಿ ನಿರ್ವಹಿಸಬಹುದಾಗಿವೆ, ಆದರೆ ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ಹವಾಮಾನವನ್ನು ಗಮನಿಸಿ.'
  );

  result = result.replace(
    /Conditions appear favorable for this activity during the selected period\./gi,
    'ಆಯ್ಕೆ ಮಾಡಿದ ಸಮಯದಲ್ಲಿ ಈ ಚಟುವಟಿಕೆಗೆ ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳು ಅನುಕೂಲಕರವಾಗಿ ಕಾಣುತ್ತಿವೆ.'
  );

  result = result.replace(
    /Calculated risk score of (\d+)\/100 indicates significant potential weather disruption\./gi,
    'ಲೆಕ್ಕಹಾಕಿದ ಅಪಾಯದ ಸ್ಕೋರ್ $1/100 ಹವಾಮಾನದಿಂದ ಗಮನಾರ್ಹ ಅಡಚಣೆ ಉಂಟಾಗುವ ಸಾಧ್ಯತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.'
  );

  result = result.replace(
    /Extreme weather factors present dangerous conditions for (.*?)\./gi,
    '$1 ಚಟುವಟಿಕೆಗೆ ತೀವ್ರ ಹವಾಮಾನ ಅಂಶಗಳು ಅಪಾಯಕಾರಿ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಉಂಟುಮಾಡುತ್ತಿವೆ.'
  );

  result = result.replace(
    /Moderate precipitation, wind, or thermal factors observed\./gi,
    'ಮಧ್ಯಮ ಮಳೆ, ಗಾಳಿ ಅಥವಾ ತಾಪಮಾನಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಪರಿಣಾಮಗಳು ಕಂಡುಬಂದಿವೆ.'
  );

  result = result.replace(
    /Weather forecast projects clear, safe conditions\./gi,
    'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ ಪರಿಸ್ಥಿತಿಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿರುತ್ತವೆ.'
  );

  result = result.replace(
    /Official weather alerts take precedence in risk calculation\./gi,
    'ಅಪಾಯದ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ಅಧಿಕೃತ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳಿಗೆ ಹೆಚ್ಚಿನ ಆದ್ಯತೆ ನೀಡಲಾಗುತ್ತದೆ.'
  );

  result = result.replace(
    /Decision support only — weather conditions can change rapidly\./gi,
    'ಇದು ಹವಾಮಾನ ನಿರ್ಧಾರ ಸಹಾಯಕ್ಕಾಗಿ ಮಾತ್ರ — ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿಗಳು ವೇಗವಾಗಿ ಬದಲಾಗಬಹುದು.'
  );

  result = result.replace(
    /Always follow official weather warnings and local authority guidance\./gi,
    'ಯಾವಾಗಲೂ ಅಧಿಕೃತ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳ ಮಾರ್ಗದರ್ಶನವನ್ನು ಅನುಸರಿಸಿ.'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '🕒 **ಉತ್ತಮ ಸಮಯದ ಸಾಧ್ಯತೆ:** $1'
  );

  result = result.replace(
    /Potentially lower weather risk \((\d+)\/100 vs (\d+)\/100\) based on available forecast data\./gi,
    'ಲಭ್ಯವಿರುವ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ ಕಡಿಮೆ ಹವಾಮಾನ ಅಪಾಯವಿರುವ ಸಮಯ ($1/100, ಪ್ರಸ್ತುತ $2/100ಕ್ಕೆ ಹೋಲಿಸಿದರೆ).'
  );

  result = result.replace(
    /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
    '⚠️ **ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯವಾಗಿದೆ:** **$1** ಅಲರ್ಟ್ ($2) **$3** ಗಾಗಿ ಜಾರಿಯಲ್ಲಿದೆ.\n'
  );

  result = result.replace(
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 ಅಲರ್ಟ್** ಪ್ರಸ್ತುತ **$2** ನಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದೆ ($3). ಅಧಿಕೃತ ಅವಧಿ ಮುಗಿಯುವವರೆಗೆ ಇದು ಮಾನ್ಯವಾಗಿರುತ್ತದೆ.'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ ಪ್ರಸ್ತುತ **$1** ನಲ್ಲಿ ಯಾವುದೇ ಸಕ್ರಿಯ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ (GREEN ಸ್ಥಿತಿ).'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
    '**$1** ಗಾಗಿ ($2, $3) ಲಭ್ಯವಿರುವ ನೇರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ, ಮಳೆಯ ಸಾಧ್ಯತೆ **$4%** ಮತ್ತು ನಿರೀಕ್ಷಿತ ಪರಿಸ್ಥಿತಿ *$5*. ಮಳೆಯಿಂದ ರಕ್ಷಣೆಗಾಗಿ ಅಗತ್ಯ ವಸ್ತುಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಹೋಗುವುದು ಸೂಕ್ತ.'
  );

  result = result.replace(
    /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
    '**$1** ನಲ್ಲಿ **$2** ($3) ಸಮಯದಲ್ಲಿ ನಿರೀಕ್ಷಿತ ತಾಪಮಾನ **$4°C** ಮತ್ತು ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿ *$5* ಆಗಿರುತ್ತದೆ.'
  );

  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ($2, $3): ಪ್ರಸ್ತುತ ತಾಪಮಾನ **$4°C**, ಪರಿಸ್ಥಿತಿ *$5*, ಮಳೆಯ ಸಾಧ್ಯತೆ **$6%**, ಗಾಳಿಯ ವೇಗ **$7 km/h**.'
  );

  result = result.replace(/What about morning\?/gi, 'ಬೆಳಿಗ್ಗೆ ಹೇಗಿರುತ್ತದೆ?');
  result = result.replace(/What about evening\?/gi, 'ಸಂಜೆ ಹೇಗಿರುತ್ತದೆ?');
  result = result.replace(/How was this risk score calculated\?/gi, 'ಈ ಅಪಾಯದ ಸ್ಕೋರ್ ಅನ್ನು ಹೇಗೆ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ?');
  result = result.replace(/Show me a better time window/gi, 'ಉತ್ತಮ ಸಮಯವನ್ನು ತೋರಿಸಿ');
  result = result.replace(/What about rainfall\?/gi, 'ಮಳೆಯ ಬಗ್ಗೆ ಏನು?');
  result = result.replace(/Will it rain tomorrow\?/gi, 'ನಾಳೆ ಮಳೆಯಾಗುತ್ತದೆಯೇ?');
  result = result.replace(/Are there any warnings in my area\?/gi, 'ನನ್ನ ಪ್ರದೇಶದಲ್ಲಿ ಯಾವುದೇ ಎಚ್ಚರಿಕೆಗಳಿವೆಯೇ?');

  return result;
}


/* ============================================================
   MALAYALAM
   ============================================================ */

function translateMalayalam(text: string): string {
  let result = text;

  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
    '**$2** ൽ **$1** എന്ന പ്രവർത്തനത്തിന് ($3, $4), കണക്കാക്കിയ കാലാവസ്ഥാ അപകടസാധ്യത **$5/100 ($6)** ആണ്.'
  );

  result = result.replace(/\*\*WHY THIS RISK SCORE\?\*\*/gi, '**ഈ അപകടസാധ്യതാ സ്കോർ എന്തുകൊണ്ട്?**');

  result = result.replace(
    /🌧 Heavy rain \/ precipitation risk \((\d+)%\) -> \+(\d+)/gi,
    '🌧 കനത്ത മഴ / മഴയുടെ അപകടസാധ്യത ($1%) → +$2'
  );

  result = result.replace(
    /⚡ Lightning \/ Thunderstorm warning \((.*?)\) -> \+(\d+)/gi,
    '⚡ മിന്നൽ / ഇടിമിന്നലോടുകൂടിയ മഴ മുന്നറിയിപ്പ് ($1) → +$2'
  );

  result = result.replace(
    /💨 Strong wind \(([\d.]+) km\/h\) -> \+(\d+)/gi,
    '💨 ശക്തമായ കാറ്റ് ($1 km/h) → +$2'
  );

  result = result.replace(
    /🌡 High temperature \(([\d.]+)°C, feels ([\d.]+)°C\) -> \+(\d+)/gi,
    '🌡 ഉയർന്ന താപനില ($1°C, അനുഭവപ്പെടുന്നത് $2°C) → +$3'
  );

  result = result.replace(
    /⚠️ Active weather warning \((.*?)\) -> \+(\d+)/gi,
    '⚠️ സജീവമായ കാലാവസ്ഥാ മുന്നറിയിപ്പ് ($1) → +$2'
  );

  result = result.replace(/💡 \*\*Recommendation:\*\*/gi, '💡 **ശുപാർശ:**');

  result = result.replace(
    /Official weather warning \((.*?)\) active for your selected location\. Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'നിങ്ങൾ തിരഞ്ഞെടുത്ത സ്ഥലത്ത് ഔദ്യോഗിക കാലാവസ്ഥാ മുന്നറിയിപ്പ് ($1) സജീവമാണ്. ഗുരുതരമായ കാലാവസ്ഥാ അപകടസാധ്യത കാരണം തിരഞ്ഞെടുത്ത സമയത്ത് പുറത്തുള്ള പ്രവർത്തനം ശുപാർശ ചെയ്യുന്നില്ല.'
  );

  result = result.replace(
    /Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
    'ഗുരുതരമായ കാലാവസ്ഥാ അപകടസാധ്യത കാരണം തിരഞ്ഞെടുത്ത സമയത്ത് പുറത്തുള്ള പ്രവർത്തനം ശുപാർശ ചെയ്യുന്നില്ല.'
  );

  result = result.replace(
    /Consider postponing the activity or choosing another time\./gi,
    'പ്രവർത്തനം മാറ്റിവയ്ക്കുകയോ മറ്റൊരു സമയം തിരഞ്ഞെടുക്കുകയോ ചെയ്യുന്നത് നല്ലതാണ്.'
  );

  result = result.replace(
    /Conditions are generally manageable, but monitor the weather before starting\./gi,
    'സാഹചര്യങ്ങൾ പൊതുവെ നിയന്ത്രിക്കാവുന്നതാണ്, എന്നാൽ ആരംഭിക്കുന്നതിന് മുമ്പ് കാലാവസ്ഥ ശ്രദ്ധിക്കുക.'
  );

  result = result.replace(
    /Conditions appear favorable for this activity during the selected period\./gi,
    'തിരഞ്ഞെടുത്ത സമയത്ത് ഈ പ്രവർത്തനത്തിന് കാലാവസ്ഥാ സാഹചര്യങ്ങൾ അനുകൂലമാണെന്ന് തോന്നുന്നു.'
  );

  result = result.replace(
    /Calculated risk score of (\d+)\/100 indicates significant potential weather disruption\./gi,
    'കണക്കാക്കിയ അപകടസാധ്യതാ സ്കോർ $1/100 കാലാവസ്ഥ കാരണം കാര്യമായ തടസ്സം ഉണ്ടാകാനുള്ള സാധ്യത സൂചിപ്പിക്കുന്നു.'
  );

  result = result.replace(
    /Extreme weather factors present dangerous conditions for (.*?)\./gi,
    '$1 എന്ന പ്രവർത്തനത്തിന് തീവ്രമായ കാലാവസ്ഥാ ഘടകങ്ങൾ അപകടകരമായ സാഹചര്യങ്ങൾ സൃഷ്ടിക്കുന്നു.'
  );

  result = result.replace(
    /Moderate precipitation, wind, or thermal factors observed\./gi,
    'മിതമായ മഴ, കാറ്റ് അല്ലെങ്കിൽ താപനിലയുമായി ബന്ധപ്പെട്ട ഘടകങ്ങൾ കാണപ്പെടുന്നു.'
  );

  result = result.replace(
    /Weather forecast projects clear, safe conditions\./gi,
    'കാലാവസ്ഥാ പ്രവചനം തെളിഞ്ഞതും സുരക്ഷിതവുമായ സാഹചര്യങ്ങളാണ് സൂചിപ്പിക്കുന്നത്.'
  );

  result = result.replace(
    /Official weather alerts take precedence in risk calculation\./gi,
    'അപകടസാധ്യത കണക്കാക്കുമ്പോൾ ഔദ്യോഗിക കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾക്ക് മുൻഗണന നൽകുന്നു.'
  );

  result = result.replace(
    /Decision support only — weather conditions can change rapidly\./gi,
    'ഇത് കാലാവസ്ഥാ തീരുമാന സഹായത്തിനായി മാത്രമാണ് — കാലാവസ്ഥാ സാഹചര്യങ്ങൾ വേഗത്തിൽ മാറാം.'
  );

  result = result.replace(
    /Always follow official weather warnings and local authority guidance\./gi,
    'ഔദ്യോഗിക കാലാവസ്ഥാ മുന്നറിയിപ്പുകളും പ്രാദേശിക അധികാരികളുടെ നിർദ്ദേശങ്ങളും എപ്പോഴും പാലിക്കുക.'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '🕒 **കൂടുതൽ അനുയോജ്യമായ സമയം:** $1'
  );

  result = result.replace(
    /Potentially lower weather risk \((\d+)\/100 vs (\d+)\/100\) based on available forecast data\./gi,
    'ലഭ്യമായ കാലാവസ്ഥാ പ്രവചനമനുസരിച്ച് കുറഞ്ഞ കാലാവസ്ഥാ അപകടസാധ്യതയുള്ള സമയം ($1/100, നിലവിലെ $2/100 നെ അപേക്ഷിച്ച്).'
  );

  result = result.replace(
    /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
    '⚠️ **ഔദ്യോഗിക മുന്നറിയിപ്പ് സജീവമാണ്:** **$1** അലർട്ട് ($2) **$3** ൽ നിലവിലുണ്ട്.\n'
  );

  result = result.replace(
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 അലർട്ട്** നിലവിൽ **$2** ൽ സജീവമാണ് ($3). ഔദ്യോഗിക കാലാവധി വരെ ഇത് സാധുവായിരിക്കും.'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ നിലവിൽ **$1** ൽ സജീവമായ ഗുരുതര കാലാവസ്ഥാ മുന്നറിയിപ്പുകളൊന്നും കണ്ടെത്തിയിട്ടില്ല (GREEN നില).'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
    '**$1** എന്ന സ്ഥലത്തേക്കുള്ള ($2, $3) തത്സമയ കാലാവസ്ഥാ പ്രവചനമനുസരിച്ച്, മഴയ്ക്കുള്ള സാധ്യത **$4%** ആണ്, പ്രതീക്ഷിക്കുന്ന കാലാവസ്ഥ *$5* ആണ്. മഴയിൽ നിന്ന് സംരക്ഷിക്കാനുള്ള സാധനങ്ങൾ കൂടെ കരുതുന്നത് ഉചിതമാണ്.'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Significant rainfall is not currently projected\./gi,
    '**$1** എന്ന സ്ഥലത്തേക്കുള്ള ($2, $3) തത്സമയ കാലാവസ്ഥാ പ്രവചനമനുസരിച്ച്, മഴയ്ക്കുള്ള സാധ്യത **$4%** ആണ്, പ്രതീക്ഷിക്കുന്ന കാലാവസ്ഥ *$5* ആണ്. നിലവിൽ കാര്യമായ മഴ പ്രതീക്ഷിക്കുന്നില്ല.'
  );

  result = result.replace(
    /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
    '**$1** ൽ **$2** ($3) സമയത്തെ പ്രതീക്ഷിക്കുന്ന താപനില **$4°C** ആണ്, കാലാവസ്ഥ *$5* ആയിരിക്കും.'
  );

  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** കാലാവസ്ഥാ പ്രവചനം ($2, $3): നിലവിലെ താപനില **$4°C**, കാലാവസ്ഥ *$5*, മഴയ്ക്കുള്ള സാധ്യത **$6%**, കാറ്റിന്റെ വേഗത **$7 km/h**.'
  );

  result = result.replace(/What about morning\?/gi, 'രാവിലെ എങ്ങനെ ആയിരിക്കും?');
  result = result.replace(/What about evening\?/gi, 'വൈകുന്നേരം എങ്ങനെ ആയിരിക്കും?');
  result = result.replace(/How was this risk score calculated\?/gi, 'ഈ അപകടസാധ്യതാ സ്കോർ എങ്ങനെയാണ് കണക്കാക്കിയത്?');
  result = result.replace(/Show me a better time window/gi, 'കൂടുതൽ അനുയോജ്യമായ സമയം കാണിക്കുക');
  result = result.replace(/What about rainfall\?/gi, 'മഴയെക്കുറിച്ച് എന്താണ് പറയുന്നത്?');
  result = result.replace(/Will it rain tomorrow\?/gi, 'നാളെ മഴ പെയ്യുമോ?');
  result = result.replace(/Are there any warnings in my area\?/gi, 'എന്റെ പ്രദേശത്ത് എന്തെങ്കിലും മുന്നറിയിപ്പുകളുണ്ടോ?');

  return result;
}
