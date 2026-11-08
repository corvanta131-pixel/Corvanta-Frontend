/**
 * Sends the browser to another address (for example the payment page). Kept in its own file so tests can replace it.
 * Only secure addresses are accepted, so a damaged or tampered response can never send someone to a plain-HTTP page.
 */
export function redirectTo(url: string): void {
  if (!/^https:\/\//i.test(url)) throw new Error('The payment page address was not valid.');
  window.location.assign(url);
}
