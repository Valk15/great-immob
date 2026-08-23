export type StayChannel = "airbnb" | "classique";
export type StayStatus = "awaiting_guest" | "guest_completed" | "countersigned";
export type GuestGender = "homme" | "femme";

export type Cohabitant = {
  nom: string;
  prenom: string;
  cin: string;
  nationalite: string;
  telephone: string;
};

export type GuestProfile = {
  nom: string;
  prenom: string;
  cin: string;
  genre: GuestGender;
  nationalite: string;
  telephone: string;
  email: string;
  locale?: "fr" | "en" | "de" | "ar";
  acceptedRulesAt: string;
  submittedAt: string;
};

export type StayFiles = {
  idRecto?: string;
  idVerso?: string;
  guestSignature?: string;
  contractPdf?: string;
  fichePdf?: string;
  dossierPdf?: string;
};

export type Stay = {
  id: string;
  token: string;
  createdAt: string;
  status: StayStatus;
  propertyId: string;
  propertyAddress: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  channel: StayChannel;
  guest?: GuestProfile;
  cohabitants: Cohabitant[];
  files: StayFiles;
  countersignedAt?: string;
};

export type StoreShape = {
  stays: Stay[];
};
