import { LocationSearchResult } from './weatherProviders/openMeteoProvider';
import { getWeatherContext } from './weatherService';
import { getAlertsForLocation } from './alertService';
import { ACTIVITIES_CONFIG, classifyActivityText, ActivityConfig, ActivityId } from '../config/activityConfig';
import { calculateActivityRisk, RiskFactorBreakdown, RiskCalculationOutput } from '../config/riskRules';
import { WeatherContext, WeatherIntent, TimeReference } from '../types/chatContext';
import { AlertContext, AlertSeverity } from '../types/alert';

export interface DecisionResult {
  id: string;
  activity: ActivityConfig;
  customActivityName?: string;
  location: LocationSearchResult;
  dateStr: string; // "Today", "Tomorrow", "2026-09-01"
  timeRange: string; // "Morning (6 AM - 12 PM)", "5:00 PM"
  timePeriodKey: 'morning' | 'afternoon' | 'evening' | 'night' | 'now';
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE';
  factors: RiskFactorBreakdown[];
  recommendation: string;
  explanation: string;
  limitations: string[];
  warningOverrideActive: boolean;
  warningDetails?: string;
  alternativeTimeWindow?: {
    timeRange: string;
    riskScore: number;
    riskLevel: string;
    explanation: string;
  };
  calculatedAt: string;
  weatherDataTimestamp: string;
  warningDataTimestamp: string;
  isStaleData?: boolean;
}

export interface TimeComparisonResult {
  activity: ActivityConfig;
  location: LocationSearchResult;
  dateStr: string;
  periodA: {
    label: string;
    riskScore: number;
    riskLevel: string;
    rainProb: number;
    temp: number;
    windSpeed: number;
  };
  periodB: {
    label: string;
    riskScore: number;
    riskLevel: string;
    rainProb: number;
    temp: number;
    windSpeed: number;
  };
  recommendation: string;
}

/**
 * CORE DECISION ANALYSIS ENGINE
 */
export async function analyzeWeatherDecision(
  activityInput: ActivityId | string,
  location?: LocationSearchResult,
  dateStr: string = 'Today',
  timeInput: string = 'Afternoon'
): Promise<DecisionResult> {
  // 1. Resolve Activity Configuration
  let activity: ActivityConfig;
  let customActivityName: string | undefined = undefined;

  if (typeof activityInput === 'string' && ACTIVITIES_CONFIG[activityInput as ActivityId]) {
    activity = ACTIVITIES_CONFIG[activityInput as ActivityId];
  } else if (typeof activityInput === 'string') {
    activity = classifyActivityText(activityInput);
    customActivityName = activityInput;
  } else {
    activity = ACTIVITIES_CONFIG.cricket;
  }

  // 2. Resolve Weather Context & Alert Context for Target Location
  const weatherCtx: WeatherContext = await getWeatherContext(location, 'GENERAL_WEATHER', dateStr);
  console.log("7. WEATHER DATA RECEIVED", weatherCtx);

  const targetLoc: LocationSearchResult = location || {
    id: Date.now(),
    name: weatherCtx.location.name,
    latitude: weatherCtx.location.latitude,
    longitude: weatherCtx.location.longitude,
    country: weatherCtx.location.country || 'India',
    admin1: weatherCtx.location.admin1 || '',
    timezone: 'Asia/Kolkata'
  };

  const alertCtx: AlertContext = await getAlertsForLocation(targetLoc);

  // 3. Extract Target Weather Telemetry for selected date & time period
  const telemetry = extractPeriodTelemetry(weatherCtx, dateStr, timeInput);

  if (telemetry.unavailable) {
    throw new Error('Insufficient weather data to calculate this assessment for the requested date/time.');
  }

  // 4. Calculate Deterministic Activity Risk
  const activeWarning = alertCtx.activeAlerts.find((a) => a.severity !== 'GREEN');

  console.log("8. CALLING calculateActivityRisk", {
    activity: activity.name,
    weatherData: telemetry,
    warnings: activeWarning
  });

  const riskResult: RiskCalculationOutput = calculateActivityRisk(
    activity,
    telemetry.rainProb,
    telemetry.windSpeed,
    telemetry.temp,
    telemetry.feelsLike,
    telemetry.condition,
    activeWarning?.severity,
    activeWarning?.title
  );

  console.log("9. RISK RESULT", riskResult);

  // 5. Requirement 15: Potentially Better Time Window Suggestion
  let alternativeTimeWindow: DecisionResult['alternativeTimeWindow'] = undefined;

  if (riskResult.riskScore > 40) {
    const alternative = findBetterTimeWindow(activity, weatherCtx, dateStr, timeInput, activeWarning);
    if (alternative && alternative.riskScore < riskResult.riskScore - 12) {
      alternativeTimeWindow = {
        timeRange: alternative.label,
        riskScore: alternative.riskScore,
        riskLevel: alternative.riskLevel,
        explanation: `Potentially lower weather risk (${alternative.riskScore}/100 vs ${riskResult.riskScore}/100) based on available forecast data.`
      };
    }
  }

  return {
    id: `decision-${Date.now()}`,
    activity,
    customActivityName,
    location: targetLoc,
    dateStr,
    timeRange: telemetry.label,
    timePeriodKey: telemetry.periodKey,
    riskScore: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    factors: riskResult.factors,
    recommendation: riskResult.recommendation,
    explanation: riskResult.explanation,
    limitations: [
      'Decision support only — weather conditions can change rapidly.',
      'Always follow official weather warnings and local authority guidance.'
    ],
    warningOverrideActive: riskResult.warningOverrideActive,
    warningDetails: riskResult.warningDetails,
    alternativeTimeWindow,
    calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    weatherDataTimestamp: weatherCtx.retrievedAt,
    warningDataTimestamp: alertCtx.retrievedAt,
    isStaleData: weatherCtx.isCached
  };
}

/**
 * Requirement 16: Compare Two Time Periods Side by Side
 */
export async function compareTimePeriods(
  activityInput: ActivityId | string,
  location: LocationSearchResult,
  dateStr: string,
  periodA: string,
  periodB: string
): Promise<TimeComparisonResult> {
  const resultA = await analyzeWeatherDecision(activityInput, location, dateStr, periodA);
  const resultB = await analyzeWeatherDecision(activityInput, location, dateStr, periodB);

  const telemetryA = extractPeriodTelemetry(await getWeatherContext(location, 'GENERAL_WEATHER', dateStr), dateStr, periodA);
  const telemetryB = extractPeriodTelemetry(await getWeatherContext(location, 'GENERAL_WEATHER', dateStr), dateStr, periodB);

  const isALower = resultA.riskScore < resultB.riskScore;
  const winnerPeriod = isALower ? resultA.timeRange : resultB.timeRange;
  const winnerScore = isALower ? resultA.riskScore : resultB.riskScore;

  return {
    activity: resultA.activity,
    location,
    dateStr,
    periodA: {
      label: resultA.timeRange,
      riskScore: resultA.riskScore,
      riskLevel: resultA.riskLevel,
      rainProb: telemetryA.rainProb,
      temp: telemetryA.temp,
      windSpeed: telemetryA.windSpeed
    },
    periodB: {
      label: resultB.timeRange,
      riskScore: resultB.riskScore,
      riskLevel: resultB.riskLevel,
      rainProb: telemetryB.rainProb,
      temp: telemetryB.temp,
      windSpeed: telemetryB.windSpeed
    },
    recommendation: `${winnerPeriod} has a lower calculated weather risk (${winnerScore}/100) based on the available forecast.`
  };
}

/**
 * Helper: Extracts target telemetry for selected date & time
 */
function extractPeriodTelemetry(
  context: WeatherContext,
  dateStr: string,
  timeInput: string
) {
  const current = context.current;
  const hourly = context.hourly || [];
  const daily = context.daily || [];

  if (!current) {
    return { unavailable: true, rainProb: 0, temp: 0, feelsLike: 0, windSpeed: 0, condition: '', label: '', periodKey: 'now' as const };
  }

  const timeLower = timeInput.toLowerCase();
  const isTomorrow = dateStr.toLowerCase().includes('tomorrow');

  let targetHourly = isTomorrow && hourly.length >= 24 ? hourly.slice(24, 48) : hourly.slice(0, 24);
  let label = `${dateStr}, ${timeInput}`;
  let periodKey: 'morning' | 'afternoon' | 'evening' | 'night' | 'now' = 'afternoon';

  if (timeLower.includes('morning')) {
    targetHourly = targetHourly.slice(6, 12);
    label = `${dateStr} Morning (6 AM – 12 PM)`;
    periodKey = 'morning';
  } else if (timeLower.includes('afternoon')) {
    targetHourly = targetHourly.slice(12, 17);
    label = `${dateStr} Afternoon (12 PM – 5 PM)`;
    periodKey = 'afternoon';
  } else if (timeLower.includes('evening') || timeLower.includes('night')) {
    targetHourly = targetHourly.slice(17, 23);
    label = `${dateStr} Evening (5 PM – 11 PM)`;
    periodKey = 'evening';
  } else {
    periodKey = 'now';
  }

  const rainProb = targetHourly.length > 0
    ? Math.max(...targetHourly.map((h) => h.precipitationProbability))
    : (isTomorrow ? (daily[1]?.rainProbability ?? current.precipitation) : current.precipitation);

  const temp = targetHourly.length > 0
    ? Math.round(targetHourly.reduce((acc, h) => acc + h.temp, 0) / targetHourly.length)
    : (isTomorrow ? (daily[1]?.high ?? current.temperature) : current.temperature);

  const windSpeed = targetHourly.length > 0
    ? Math.max(...targetHourly.map((h) => h.windSpeed))
    : current.windSpeed;

  const condition = targetHourly[0]?.conditionCode || current.weatherCondition;

  return {
    unavailable: false,
    rainProb,
    temp,
    feelsLike: temp + (current.feelsLike - current.temperature),
    windSpeed,
    condition,
    label,
    periodKey
  };
}

/**
 * Helper: Finds alternative time window on same day with lower risk
 */
function findBetterTimeWindow(
  activity: ActivityConfig,
  context: WeatherContext,
  dateStr: string,
  currentTimeInput: string,
  warning?: { severity: AlertSeverity; title: string }
) {
  const candidatePeriods = ['Morning', 'Afternoon', 'Evening', 'Night'];

  let bestCandidate: { label: string; riskScore: number; riskLevel: string } | null = null;
  let lowestScore = 999;

  for (const period of candidatePeriods) {
    if (period.toLowerCase() === currentTimeInput.toLowerCase()) continue;

    const telem = extractPeriodTelemetry(context, dateStr, period);
    const risk = calculateActivityRisk(
      activity,
      telem.rainProb,
      telem.windSpeed,
      telem.temp,
      telem.feelsLike,
      telem.condition,
      warning?.severity,
      warning?.title
    );

    if (risk.riskScore < lowestScore) {
      lowestScore = risk.riskScore;
      bestCandidate = {
        label: telem.label,
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel
      };
    }
  }

  return bestCandidate;
}
