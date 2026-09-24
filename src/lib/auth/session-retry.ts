/** Keep the retry locked immediately, even before React renders the disabled button. */
export function createSessionRetry(setRetrying: (retrying: boolean) => void) {
  let inFlight = false;

  return async (retry: () => unknown): Promise<void> => {
    if (inFlight) return;
    inFlight = true;
    setRetrying(true);
    try {
      await retry();
    } catch {
      // The recovery control remains visible if the session check fails again.
    } finally {
      inFlight = false;
      setRetrying(false);
    }
  };
}
