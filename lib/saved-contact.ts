/**
 * Remember a GUEST's checkout details on this device so repeat orders don't
 * retype everything. Signed-in customers already have this via their account
 * (address book + profile), so this only matters when nobody is signed in.
 *
 * localStorage only (never sent anywhere); shape-validated on read; delivery
 * notes are deliberately NOT stored. All access is try/caught — storage can be
 * blocked (private mode) and checkout must work regardless.
 */

export type SavedContact = {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
};

export const SAVED_CONTACT_KEY = "ttm_checkout_details";
const FIELDS: (keyof SavedContact)[] = ["name", "email", "phone", "street", "city", "state", "pincode"];

export function loadSavedContact(): SavedContact | null {
  try {
    const raw = localStorage.getItem(SAVED_CONTACT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return null;
    const out = {} as SavedContact;
    for (const f of FIELDS) out[f] = typeof o[f] === "string" ? o[f].slice(0, 300) : "";
    return FIELDS.some((f) => out[f]) ? out : null;
  } catch {
    return null;
  }
}

export function saveContact(c: SavedContact): void {
  try {
    const out = {} as SavedContact;
    for (const f of FIELDS) out[f] = String(c[f] ?? "").slice(0, 300);
    localStorage.setItem(SAVED_CONTACT_KEY, JSON.stringify(out));
  } catch {}
}

export function clearSavedContact(): void {
  try {
    localStorage.removeItem(SAVED_CONTACT_KEY);
  } catch {}
}
