export function mergeAbortSignals(primary, secondary) {
  if (!primary) return secondary || undefined;
  if (!secondary) return primary;

  const controller = new AbortController();

  function forward(signal) {
    if (!signal) return;
    if (signal.aborted) {
      controller.abort(signal.reason);
      return;
    }
    signal.addEventListener(
      'abort',
      () => {
        controller.abort(signal.reason);
      },
      { once: true },
    );
  }

  forward(primary);
  forward(secondary);
  return controller.signal;
}

export async function fetchWithTimeout(input, init = {}, timeoutMs = 8000) {
  if (!timeoutMs || timeoutMs <= 0) return fetch(input, init);

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort(new Error('Timeout'));
  }, timeoutMs);

  try {
    const signal = mergeAbortSignals(init?.signal, timeoutController.signal);
    return await fetch(input, { ...init, signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

