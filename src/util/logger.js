const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const DEFAULT_LEVEL = "error";

const getConfiguredLevel = () => {
  const configured = import.meta?.env?.VITE_LOG_LEVEL;
  return configured && LEVELS[configured] !== undefined ? configured : DEFAULT_LEVEL;
};

const threshold = getConfiguredLevel();

const shouldLog = (level) => LEVELS[level] <= LEVELS[threshold];

const safeStringify = (payload) => {
  if (!payload) return "";
  try {
    return JSON.stringify(payload);
  } catch {
    return "[unserializable-metadata]";
  }
};

const emit = (consoleMethod, scope, message, context) => {
  const meta = context ? ` ${safeStringify(context)}` : "";
  consoleMethod(`[${scope}] ${message}${meta}`);
};

export const createLogger = (scope = "App") => {
  const logScope = scope;

  return {
    info: (message, context) => {
      if (!shouldLog("info")) return;
      emit(console.info, logScope, message, context);
    },
    warn: (message, context) => {
      if (!shouldLog("warn")) return;
      emit(console.warn, logScope, message, context);
    },
    debug: (message, context) => {
      if (!shouldLog("debug")) return;
      emit(console.debug, logScope, message, context);
    },
    error: (message, error, context) => {
      const payload =
        error instanceof Error
          ? { ...context, message: error.message, stack: error.stack }
          : { ...context, error };
      emit(console.error, logScope, message, payload);
    },
  };
};
