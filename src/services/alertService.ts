/**
 * Weather Alert Intelligence Service
 * Requirement 3: Separate service managing severe weather warnings and location matching.
 * Architecture: alertService -> alertProvider -> official / demo warning data.
 */

import { LocationSearchResult } from './weatherProviders/openMeteoProvider';
import { WeatherAlert, AlertContext, AlertSeverity } from '../types/alert';
import { AlertProvider } from './alertProviders/alertProviderInterface';
import { DemoAlertProvider } from './alertProviders/demoAlertProvider';
import { ImdAlertProvider } from './alertProviders/imdAlertProvider';
import { config } from '../config/env';

const STORAGE_KEY_ALERTS_CACHE = 'weathergpt_cached_alerts';

// Select Alert Provider based on configuration (default: demo)
function getActiveAlertProvider(): AlertProvider {
  const providerType = (config.alertProvider || 'demo').toLowerCase();
  if (providerType === 'imd') {
    return new ImdAlertProvider();
  }
  return new DemoAlertProvider();
}

let activeAlertContext: AlertContext | null = null;
const alertSubscribers: Array<(context: AlertContext) => void> = [];

export function getActiveAlertContext(): AlertContext | null {
  return activeAlertContext;
}

/**
 * Requirement 7 & 15: Retrieve & Prioritize Weather Warnings for Location
 */
export async function getAlertsForLocation(location: LocationSearchResult): Promise<AlertContext> {
  const provider = getActiveAlertProvider();

  try {
    const rawAlerts: WeatherAlert[] = await provider.getAlertsForLocation(location);

    // Prioritize by Severity (RED > ORANGE > YELLOW > GREEN) and status (ACTIVE > UPCOMING > EXPIRED)
    const sortedAlerts = sortAlertsByPriority(rawAlerts);

    const activeAlerts = sortedAlerts.filter((a) => a.severity !== 'GREEN' && (a.status === 'ACTIVE' || !a.status));
    const upcomingAlerts = sortedAlerts.filter((a) => a.status === 'UPCOMING');
    const expiredAlerts = sortedAlerts.filter((a) => a.status === 'EXPIRED');

    const highestSeverity: AlertSeverity = activeAlerts.length > 0
      ? activeAlerts[0].severity
      : (sortedAlerts[0]?.severity || 'GREEN');

    const alertContext: AlertContext = {
      location,
      activeAlerts: activeAlerts.length > 0 ? activeAlerts : (sortedAlerts.length > 0 ? sortedAlerts : []),
      upcomingAlerts,
      expiredAlerts,
      highestSeverity,
      provider: provider.name,
      isDemo: provider.isDemo,
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Store in localStorage cache
    localStorage.setItem(
      STORAGE_KEY_ALERTS_CACHE,
      JSON.stringify({
        alertContext,
        savedAt: new Date().toISOString()
      })
    );

    activeAlertContext = alertContext;
    notifySubscribers(alertContext);
    return alertContext;

  } catch (error) {
    console.warn('[AlertService] Failed to retrieve live alert telemetry. Checking cache...', error);
    const cached = localStorage.getItem(STORAGE_KEY_ALERTS_CACHE);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        activeAlertContext = parsed.alertContext;
        return parsed.alertContext;
      } catch (e) {
        console.error('Failed to parse cached alerts:', e);
      }
    }

    // Default Fallback Error Context when Alert API fails (Requirement 16)
    const errorContext: AlertContext = {
      location,
      activeAlerts: [],
      upcomingAlerts: [],
      expiredAlerts: [],
      highestSeverity: 'GREEN',
      provider: provider.name,
      isDemo: provider.isDemo,
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasFailed: true,
      errorMessage: 'Weather warning information is currently unavailable.'
    };
    activeAlertContext = errorContext;
    return errorContext;
  }
}

/**
 * Requirement 22: Refresh Alerts
 */
export async function refreshAlerts(location: LocationSearchResult): Promise<AlertContext> {
  return await getAlertsForLocation(location);
}

/**
 * Requirement 19: Alert Notification Preparation / Subscription
 */
export function subscribeToAlerts(location: LocationSearchResult, callback: (ctx: AlertContext) => void): () => void {
  alertSubscribers.push(callback);
  // Initial fire
  getAlertsForLocation(location).then(callback).catch(console.error);

  return () => {
    const idx = alertSubscribers.indexOf(callback);
    if (idx >= 0) alertSubscribers.splice(idx, 1);
  };
}

function notifySubscribers(context: AlertContext) {
  alertSubscribers.forEach((cb) => cb(context));
}

/**
 * Sort alerts by RED -> ORANGE -> YELLOW -> GREEN
 */
function sortAlertsByPriority(alerts: WeatherAlert[]): WeatherAlert[] {
  const severityRank: Record<AlertSeverity, number> = {
    RED: 1,
    ORANGE: 2,
    YELLOW: 3,
    GREEN: 4
  };

  return [...alerts].sort((a, b) => {
    const rankDiff = (severityRank[a.severity] || 5) - (severityRank[b.severity] || 5);
    if (rankDiff !== 0) return rankDiff;

    // Secondary sort: Active > Upcoming > Expired
    const statusRank: Record<string, number> = { ACTIVE: 1, UPCOMING: 2, EXPIRED: 3 };
    return (statusRank[a.status] || 2) - (statusRank[b.status] || 2);
  });
}

/**
 * Backward compatibility wrapper
 */
export async function fetchActiveAlerts(location?: LocationSearchResult): Promise<WeatherAlert[]> {
  const loc = location || {
    id: 1,
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata'
  };

  const context = await getAlertsForLocation(loc);
  return context.activeAlerts;
}
