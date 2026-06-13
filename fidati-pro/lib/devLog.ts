export function devLog(message: string, detail?: unknown) {
  if (!__DEV__) return;
  if (detail !== undefined) {
    console.log(`[Fidati Pro] ${message}`, detail);
    return;
  }
  console.log(`[Fidati Pro] ${message}`);
}
