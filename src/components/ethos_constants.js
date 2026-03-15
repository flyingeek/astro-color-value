// Ethos source categories
export const CATEGORY_NONE = 0;
export const CATEGORY_ALWAYS_ON = 1;
export const CATEGORY_ANALOG = 2;
export const CATEGORY_SWITCH = 3;
export const CATEGORY_LOGIC = 4;
export const CATEGORY_SWITCH_POSITION = 14;
export const CATEGORY_FUNCTION_SWITCH = 15;
export const CATEGORY_LOGIC_SWITCH = 16;
export const CATEGORY_TRIM = 17;
export const CATEGORY_TRIM_POSITION = 18;
export const CATEGORY_CHANNEL = 19;
export const CATEGORY_GYRO = 20;
export const CATEGORY_GYRO_SWITCH = 21;
export const CATEGORY_TRAINER = 22;
export const CATEGORY_FLIGHT = 23;
export const CATEGORY_FLIGHT_VALUE = 24;
export const CATEGORY_TIMER = 25;
export const CATEGORY_TELEMETRY_SENSOR = 26;
export const CATEGORY_SYSTEM = 27;
export const CATEGORY_SYSTEM_EVENT = 28;

// Ethos theme colors (dark mode)
export const THEME_DEFAULT_COLOR = "#FFFFFF";
export const THEME_DEFAULT_BGCOLOR = "#292829";
export const THEME_FOCUS_COLOR = "#F4B554";
export const THEME_FOCUS_BGCOLOR = "#212021";
export const THEME_WARNING_COLOR = "#D3382A";

// Standard colors
export const COLOR_BLACK = "#000000";
export const COLOR_WHITE = "#FFFFFF";
export const COLOR_RED = "#FF0000";
export const COLOR_GREEN = "#00FF00";
export const COLOR_BLUE = "#0000FF";
export const COLOR_CYAN = "#00FFFF";
export const COLOR_MAGENTA = "#FF00FF";
export const COLOR_YELLOW = "#FFFF00";
export const COLOR_ORANGE = "#FFA500";

// Color palette for color pickers
export const COLOR_CHOICES = [
    THEME_DEFAULT_BGCOLOR,
    COLOR_WHITE,
    COLOR_RED,
    COLOR_GREEN,
    COLOR_BLUE,
    COLOR_CYAN,
    COLOR_MAGENTA,
    COLOR_YELLOW,
    COLOR_ORANGE,
];

// Resolve a color name (like "COLOR_RED") or hex string to its hex value
const _COLOR_MAP = {
    THEME_DEFAULT_COLOR, THEME_DEFAULT_BGCOLOR, THEME_FOCUS_COLOR, THEME_FOCUS_BGCOLOR, THEME_WARNING_COLOR,
    COLOR_BLACK, COLOR_WHITE, COLOR_RED, COLOR_GREEN, COLOR_BLUE,
    COLOR_CYAN, COLOR_MAGENTA, COLOR_YELLOW, COLOR_ORANGE,
};
export function resolveColor(c) {
    if (!c) return "#ffffff";
    if (typeof c === "string" && c.startsWith("#")) return c;
    return _COLOR_MAP[c] ?? c;
}

// Substitute _tags in a text/title string using source properties.
// Skipping _b (line-break tag) for now — returns a single string.
export function parseTags(text, source) {
    if (!text) return [""];

    const value    = source.value    ?? 0;
    const decimals = source.decimals ?? 0;
    const unit     = source.unit     ?? "";

    function fmt(v) {
        return `${Number(v).toFixed(decimals)}${unit}`;
    }

    function applySubstitutions(s) {
        // _0v.._9v → value with N decimal places, no unit
        s = s.replace(/_([0-9])v/g, (_, d) => Number(value).toFixed(Number(d)));
        // _v → value with source decimals + unit
        s = s.replace(/_v/g, () => Number(value).toFixed(Number(decimals)));
        // _t → stringValue(value) if available, else _v
        s = s.replace(/_t/g, () => source.stringValue ? source.stringValue(value) : fmt(value));
        // _n → source name
        s = s.replace(/_n/g, () => source.name ?? "");
        // _u → unit
        s = s.replace(/_u/g, () => unit);
        // _10v, _100v, ... → floor(0.5 + value × 10ⁿ)
        s = s.replace(/_1(0+)v/g, (_, zeros) => {
            const m = Number('1' + zeros);
            return String(Math.floor(0.5 + value * m));
        });
        // _Nx (e.g. _2x, _0.5x) → value × N formatted with source decimals + unit
        s = s.replace(/_([0-9]+(?:\.[0-9]+)?)x/g, (_, multiplier) =>
            fmt(value * Number(multiplier))
        );
        return s;
    }

    if (!text.includes('_')) return [text];

    // Protect __ → placeholder, split on _b, apply substitutions, restore __
    const encoded = text.replace(/__/g, '\x00');
    return encoded.split('_b').map(part =>
        applySubstitutions(part).replace(/\x00/g, '_')
    );
}

export const SOURCE_CHOICES = {
    "RxBatt": {
        "name": "RxBatt",
        "category": CATEGORY_TELEMETRY_SENSOR,
        "unit": "V",
        "decimals": 2,
        "minimum": 3,
        "maximum": 4.4,
        "value": 4.15
    },
    "Lipo2S": {
        "name": "Lipo2S",
        "category": CATEGORY_TELEMETRY_SENSOR,
        "unit": "V",
        "decimals": 2,
        "minimum": 6,
        "maximum": 8.8,
        "value": 8.3,
    },
    "Rssi": {
        "name": "Rssi",
        "category": CATEGORY_TELEMETRY_SENSOR,
        "unit": "dB",
        "decimals": 0,
        "minimum": 0,
        "maximum": 100,
        "value": 95,
    },
    "Timer1": {
        "name": "Timer1",
        "category": CATEGORY_TIMER,
        "unit": "s",
        "decimals": 0,
        "minimum": -1024,
        "maximum": 1024,
        "value": 0,
        "stringValue": (value) => {
            const seconds = Math.abs(value);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(seconds / 3600);
            const remainingSeconds = seconds % 60;
            const sign = value < 0 ? "-" : "";
            return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    },
    "SA": {
        "name": "SA",
        "category": CATEGORY_SWITCH,
        "unit": "",
        "decimals": 0,
        "minimum": -100,
        "maximum": 100,
        "value": 0,
    },
    "Pot1": {
        "name": "Pot1",
        "category": CATEGORY_ANALOG,
        "unit": "",
        "decimals": 0,
        "minimum": -1024,
        "maximum": 1024,
        "value": 0,
        "stringValue": (value) => {
            return (value / 1024 * 100).toFixed(0).toString() + "%";
        }
    },
    "Current F.M.": {
        "name": "Current F.M.",
        "category": CATEGORY_FLIGHT_VALUE,
        "decimals": 0,
        "minimum": 0,
        "maximum": 3,
        "value": 0,
        "stringValue": (value) => {
            const defaultFlightMode = "Default Flight Mode";
            const flightModes = [defaultFlightMode,"Stabilized", "Acro", "Angle"];
            return flightModes[value] || defaultFlightMode;
        }
    }
}
