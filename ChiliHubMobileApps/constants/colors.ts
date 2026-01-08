// ChiliHub Color Theme
// Based on the UI design reference

export const Colors = {
    // Primary Colors
    primary: '#4CAF50',
    primaryDark: '#2E7D32',
    primaryLight: '#81C784',
    white: '#FAFAFA',
    green_apple: '#4CAF50',

    // Status Colors
    normal: '#4CAF50',    // Green - status normal
    warning: '#FFC107',   // Yellow - status warning
    critical: '#F44336',  // Red - status critical

    // Status Badges
    statusNormalBg: '#E8F5E9',
    statusWarningBg: '#FFF8E1',
    statusCriticalBg: '#FFEBEE',

    // Sensor Card Colors (gradient start colors)
    sensorPh: '#FF9800',      // Orange for pH
    sensorHumidity: '#00BCD4', // Cyan for humidity
    sensorTemp: '#4CAF50',     // Green for temperature
    sensorLight: '#FFC107',    // Yellow for light
    sensorSoil: '#795548',     // Brown for soil

    // Text Colors
    textPrimary: '#212121',
    textSecondary: '#757575',
    textMuted: '#9E9E9E',
    textWhite: '#FFFFFF',

    // Background Colors
    background: '#F5F5F5',
    surface: '#FFFFFF',
    card: '#FFFFFF',

    // Border & Divider
    border: '#E0E0E0',
    divider: '#EEEEEE',

    // Device Status Indicators
    deviceActive: '#4CAF50',
    deviceStandby: '#FFC107',
    deviceInactive: '#F44336',

    // Misc
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
};

// Gradient presets for cards
export const Gradients = {
    primary: ['#4CAF50', '#2E7D32'],
    ph: ['#FF9800', '#F57C00'],
    humidity: ['#00BCD4', '#0097A7'],
    temperature: ['#4CAF50', '#388E3C'],
    light: ['#FFC107', '#FFA000'],
    soil: ['#795548', '#5D4037'],
    weather: ['#FFFFFF', '#F5F5F5'],
};

export default Colors;
