import { Storage } from "@plasmohq/storage";
import { Settings, defaultSettings } from "../types/settings";

const storage = new Storage({ area: "local" });
const SETTINGS_KEY = "settings";

/**
 * Gets the current settings from storage
 */
export async function getSettings(): Promise<Settings> {
  try {
    const settings = await storage.get<Settings>(SETTINGS_KEY);
    if (!settings) {
      return { ...defaultSettings };
    }
    return { ...defaultSettings, ...settings };
  } catch (error) {
    console.error("Error getting settings:", error);
    return { ...defaultSettings };
  }
}

/**
 * Saves settings to storage
 */
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await storage.set(SETTINGS_KEY, settings);
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

/**
 * Gets a specific setting value
 */
export async function getSetting<K extends keyof Settings>(
  key: K
): Promise<Settings[K]> {
  const settings = await getSettings();
  return settings[key];
}

/**
 * Updates a single setting
 */
export async function updateSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  const settings = await getSettings();
  settings[key] = value;
  await saveSettings(settings);
}
