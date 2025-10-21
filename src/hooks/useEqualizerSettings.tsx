import { useState, useEffect } from 'react';

interface EqualizerSettings {
  amplitude: number;
  cubeSpacing: number;
  cubeSideLength: number;
  gridCols: number;
  gridRows: number;
  cameraFov: number;
  cameraPosition: [number, number, number];
}

const DEFAULT_SETTINGS: EqualizerSettings = {
  amplitude: 1,
  cubeSpacing: 30,
  cubeSideLength: 0.03,
  gridCols: 160,
  gridRows: 160,
  cameraFov: 135,
  cameraPosition: [22, 22, 11]
};

const STORAGE_KEY = 'neon-beat-equalizer-settings';

/**
 * Custom hook to manage Equalizer component settings with localStorage persistence
 */
const useEqualizerSettings = () => {
  const [settings, setSettings] = useState<EqualizerSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Merge with defaults to ensure all properties exist
        const mergedSettings: EqualizerSettings = {
          amplitude: typeof parsed.amplitude === 'number' ? parsed.amplitude : DEFAULT_SETTINGS.amplitude,
          cubeSpacing: typeof parsed.cubeSpacing === 'number' ? parsed.cubeSpacing : DEFAULT_SETTINGS.cubeSpacing,
          cubeSideLength: typeof parsed.cubeSideLength === 'number' ? parsed.cubeSideLength : DEFAULT_SETTINGS.cubeSideLength,
          gridCols: typeof parsed.gridCols === 'number' ? parsed.gridCols : DEFAULT_SETTINGS.gridCols,
          gridRows: typeof parsed.gridRows === 'number' ? parsed.gridRows : DEFAULT_SETTINGS.gridRows,
          cameraFov: typeof parsed.cameraFov === 'number' ? parsed.cameraFov : DEFAULT_SETTINGS.cameraFov,
          cameraPosition: Array.isArray(parsed.cameraPosition) &&
            parsed.cameraPosition.length === 3 &&
            parsed.cameraPosition.every((val: unknown) => typeof val === 'number')
            ? parsed.cameraPosition as [number, number, number]
            : DEFAULT_SETTINGS.cameraPosition
        };

        setSettings(mergedSettings);
      }
    } catch (error) {
      console.warn('Failed to load equalizer settings from localStorage:', error);
      // Keep default settings on error
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save equalizer settings to localStorage:', error);
    }
  }, [settings]);

  // Update individual setting
  const updateSetting = <K extends keyof EqualizerSettings>(
    key: K,
    value: EqualizerSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSetting,
    resetToDefaults,
    // Convenience methods for common operations
    increaseAmplitude: () => updateSetting('amplitude', Math.min(settings.amplitude + 1, 50)),
    decreaseAmplitude: () => updateSetting('amplitude', Math.max(settings.amplitude - 1, 0)),
    adjustGridSize: (cols: number, rows: number) => {
      setSettings(prev => ({ ...prev, gridCols: cols, gridRows: rows }));
    },
    ...settings // Spread individual properties for convenience
  };
};

export default useEqualizerSettings;