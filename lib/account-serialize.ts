import type { ISavedAddress, IOccasion } from "@/models/Customer";

/** Wire DTO for a saved address — string id, no Mongoose internals. */
export type AddressDTO = {
  _id: string;
  label?: string;
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
  isDefault?: boolean;
};

export function serializeAddresses(addresses: ISavedAddress[] = []): AddressDTO[] {
  return addresses.map((a) => ({
    _id: a._id?.toString() ?? "",
    label: a.label,
    name: a.name,
    phone: a.phone,
    street: a.street,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    notes: a.notes,
    isDefault: a.isDefault,
  }));
}

/** Wire DTO for an occasion. */
export type OccasionDTO = {
  _id: string;
  label?: string;
  type?: string;
  month: number;
  day: number;
  recipientName?: string;
  remind?: boolean;
};

export function serializeOccasions(occasions: IOccasion[] = []): OccasionDTO[] {
  return occasions.map((o) => ({
    _id: o._id?.toString() ?? "",
    label: o.label,
    type: o.type,
    month: o.month,
    day: o.day,
    recipientName: o.recipientName,
    remind: o.remind,
  }));
}
