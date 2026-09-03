import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * TRANSLATION SERVICE FOR WEATHERGPT EXPLANATIONS
 *
 * Converts the deterministic English WeatherGPT explanation
 * into the selected Indian language.
 *
 * Important:
 * - Numerical weather values are preserved.
 * - Temperature units are preserved.
 * - Percentages are preserved.
 * - Risk scores are preserved.
 * - Location names are preserved.
 * - Markdown formatting is preserved where practical.
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
   TELUGU
   ============================================================ */

function translateTelugu(text: string): string {
  let result = text;

  /*
   * Decision / risk response
   */
  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\.\n\n/i,
    '**$2** లో **$1** కోసం ($3, $4), లెక్కించిన వాతావరణ ప్రమాద స్కోర్ **$5/100 ($6)**.\n\n'
  );

  result = result.replace(
    /\*\*WHY THIS RISK SCORE\?\*\*/gi,
    '**ఈ ప్రమాద స్కోర్ ఎందుకు?**'
  );

  result = result.replace(
    /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
    '⚠️ **అధికారిక హెచ్చరిక అమల్లో ఉంది:** **$1** అలర్ట్ ($2) **$3** కోసం అమల్లో ఉంది.\n'
  );

  result = result.replace(
    /💡 \*\*Recommendation:\*\* (.*)/gi,
    '💡 **సిఫార్సు:** $1'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '\n🕒 **మెరుగైన సమయ అవకాశం:** $1'
  );

  /*
   * Rain forecast
   */
  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
    '**$1** కోసం ($2, $3) అందుబాటులో ఉన్న ప్రత్యక్ష వాతావరణ అంచనా ప్రకారం, వర్షపాతం అవకాశం **$4%** మరియు అంచనా పరిస్థితులు *$5*. వర్షం నుంచి రక్షణ కోసం అవసరమైన సామగ్రిని వెంట తీసుకెళ్లడం మంచిది.'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Significant rainfall is not currently projected\./gi,
    '**$1** కోసం ($2, $3) అందుబాటులో ఉన్న ప్రత్యక్ష వాతావరణ అంచనా ప్రకారం, వర్షపాతం అవకాశం **$4%** మరియు అంచనా పరిస్థితులు *$5*. ప్రస్తుతం గణనీయమైన వర్షపాతం అంచనా లేదు.'
  );

  /*
   * Temperature
   */
  result = result.replace(
    /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
    '**$1** లో **$2** ($3) సమయంలో అంచనా ఉష్ణోగ్రత **$4°C** మరియు వాతావరణ పరిస్థితులు *$5*.'
  );

  /*
   * Weather alert
   */
  result = result.replace(
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 అలర్ట్** ప్రస్తుతం **$2** కోసం అమల్లో ఉంది ($3). అధికారిక గడువు వరకు ఇది చెల్లుబాటులో ఉంటుంది.'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ ప్రస్తుతం **$1** కోసం తీవ్రమైన వాతావరణ హెచ్చరికలు ఏవీ గుర్తించబడలేదు (GREEN స్థితి).'
  );

  /*
   * General weather
   */
  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** కోసం వాతావరణ అంచనా ($2, $3): ప్రస్తుతం ఉష్ణోగ్రత **$4°C**, పరిస్థితులు *$5*, వర్షం వచ్చే అవకాశం **$6%**, గాలి వేగం **$7 km/h**.'
  );

  return result;
}


/* ============================================================
   HINDI
   ============================================================ */

function translateHindi(text: string): string {
  let result = text;

  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\.\n\n/i,
    '**$2** में **$1** के लिए ($3, $4), गणना किया गया मौसम जोखिम स्कोर **$5/100 ($6)** है।\n\n'
  );

  result = result.replace(
    /\*\*WHY THIS RISK SCORE\?\*\*/gi,
    '**यह जोखिम स्कोर क्यों है?**'
  );

  result = result.replace(
    /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
    '⚠️ **आधिकारिक चेतावनी सक्रिय है:** **$1** अलर्ट ($2) **$3** के लिए प्रभावी है।\n'
  );

  result = result.replace(
    /💡 \*\*Recommendation:\*\* (.*)/gi,
    '💡 **सिफारिश:** $1'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '\n🕒 **बेहतर संभावित समय:** $1'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
    '**$1** के लिए ($2, $3) उपलब्ध लाइव मौसम पूर्वानुमान के अनुसार, वर्षा की संभावना **$4%** है और अपेक्षित मौसम *$5* है। बारिश से बचाव का सामान साथ रखना उचित रहेगा।'
  );

  result = result.replace(
    /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Significant rainfall is not currently projected\./gi,
    '**$1** के लिए ($2, $3) उपलब्ध लाइव मौसम पूर्वानुमान के अनुसार, वर्षा की संभावना **$4%** है और अपेक्षित मौसम *$5* है। फिलहाल भारी बारिश की संभावना नहीं है।'
  );

  result = result.replace(
    /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
    '**$1** में **$2** ($3) के दौरान अनुमानित तापमान **$4°C** है और मौसम की स्थिति *$5* रहने की उम्मीद है।'
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
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** के लिए मौसम पूर्वानुमान ($2, $3): वर्तमान तापमान **$4°C**, मौसम की स्थिति *$5*, बारिश की संभावना **$6%** और हवा की गति **$7 km/h** है।'
  );

  return result;
}


/* ============================================================
   TAMIL
   ============================================================ */

function translateTamil(text: string): string {
  let result = text;

  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\.\n\n/i,
    '**$2** பகுதியில் **$1** நடவடிக்கைக்காக ($3, $4), கணக்கிடப்பட்ட வானிலை அபாய மதிப்பெண் **$5/100 ($6)** ஆகும்.\n\n'
  );

  result = result.replace(
    /\*\*WHY THIS RISK SCORE\?\*\*/gi,
    '**இந்த அபாய மதிப்பெண் ஏன்?**'
  );

  result = result.replace(
    /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
    '⚠️ **அதிகாரப்பூர்வ எச்சரிக்கை செயலில் உள்ளது:** **$1** எச்சரிக்கை ($2) **$3** பகுதிக்கு அமலில் உள்ளது.\n'
  );

  result = result.replace(
    /💡 \*\*Recommendation:\*\* (.*)/gi,
    '💡 **பரிந்துரை:** $1'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '\n🕒 **சிறந்த நேர வாய்ப்பு:** $1'
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
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 எச்சரிக்கை** தற்போது **$2** பகுதியில் செயல்பாட்டில் உள்ளது ($3). அதிகாரப்பூர்வ காலாவதி நேரம் வரை இது செல்லுபடியாகும்.'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ தற்போது **$1** பகுதிக்கு கடுமையான வானிலை எச்சரிக்கைகள் எதுவும் இல்லை (GREEN நிலை).'
  );

  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** வானிலை முன்னறிவிப்பு ($2, $3): தற்போதைய வெப்பநிலை **$4°C**, வானிலை *$5*, மழைக்கான வாய்ப்பு **$6%**, காற்றின் வேகம் **$7 km/h**.'
  );

  return result;
}


/* ============================================================
   KANNADA
   ============================================================ */

function translateKannada(text: string): string {
  let result = text;

  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\.\n\n/i,
    '**$2** ನಲ್ಲಿ **$1** ಚಟುವಟಿಕೆಗೆ ($3, $4), ಲೆಕ್ಕಹಾಕಿದ ಹವಾಮಾನ ಅಪಾಯದ ಸ್ಕೋರ್ **$5/100 ($6)** ಆಗಿದೆ.\n\n'
  );

  result = result.replace(
    /\*\*WHY THIS RISK SCORE\?\*\*/gi,
    '**ಈ ಅಪಾಯದ ಸ್ಕೋರ್ ಏಕೆ?**'
  );

  result = result.replace(
    /💡 \*\*Recommendation:\*\* (.*)/gi,
    '💡 **ಶಿಫಾರಸು:** $1'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '\n🕒 **ಉತ್ತಮ ಸಮಯದ ಸಾಧ್ಯತೆ:** $1'
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
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 ಎಚ್ಚರಿಕೆ** ಪ್ರಸ್ತುತ **$2** ನಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದೆ ($3). ಅಧಿಕೃತ ಅವಧಿ ಮುಗಿಯುವವರೆಗೆ ಇದು ಮಾನ್ಯವಾಗಿರುತ್ತದೆ.'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ ಪ್ರಸ್ತುತ **$1** ನಲ್ಲಿ ಯಾವುದೇ ಸಕ್ರಿಯ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ (GREEN ಸ್ಥಿತಿ).'
  );

  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ($2, $3): ಪ್ರಸ್ತುತ ತಾಪಮಾನ **$4°C**, ಪರಿಸ್ಥಿತಿ *$5*, ಮಳೆಯ ಸಾಧ್ಯತೆ **$6%**, ಗಾಳಿಯ ವೇಗ **$7 km/h**.'
  );

  return result;
}


/* ============================================================
   MALAYALAM
   ============================================================ */

function translateMalayalam(text: string): string {
  let result = text;

  result = result.replace(
    /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\.\n\n/i,
    '**$2** ൽ **$1** എന്ന പ്രവർത്തനത്തിന് ($3, $4), കണക്കാക്കിയ കാലാവസ്ഥാ അപകടസാധ്യത **$5/100 ($6)** ആണ്.\n\n'
  );

  result = result.replace(
    /\*\*WHY THIS RISK SCORE\?\*\*/gi,
    '**ഈ അപകടസാധ്യതാ സ്കോർ എന്തുകൊണ്ട്?**'
  );

  result = result.replace(
    /💡 \*\*Recommendation:\*\* (.*)/gi,
    '💡 **ശുപാർശ:** $1'
  );

  result = result.replace(
    /🕒 \*\*Potentially Better Time Window:\*\* (.*)/gi,
    '\n🕒 **കൂടുതൽ അനുയോജ്യമായ സമയം:** $1'
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
    /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
    '⚠️ **$1 മുന്നറിയിപ്പ്** നിലവിൽ **$2** ൽ സജീവമാണ് ($3). ഔദ്യോഗിക കാലാവധി വരെ ഇത് സാധുവായിരിക്കും.'
  );

  result = result.replace(
    /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
    '✓ നിലവിൽ **$1** ൽ സജീവമായ ഗുരുതര കാലാവസ്ഥാ മുന്നറിയിപ്പുകളൊന്നും കണ്ടെത്തിയിട്ടില്ല (GREEN നില).'
  );

  result = result.replace(
    /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
    '**$1** കാലാവസ്ഥാ പ്രവചനം ($2, $3): നിലവിലെ താപനില **$4°C**, കാലാവസ്ഥ *$5*, മഴയ്ക്കുള്ള സാധ്യത **$6%**, കാറ്റിന്റെ വേഗത **$7 km/h**.'
  );

  return result;
}
