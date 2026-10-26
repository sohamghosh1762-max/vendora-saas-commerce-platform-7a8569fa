/** First letter of a store name, used for tinted avatar circles. */
export function getStoreInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
