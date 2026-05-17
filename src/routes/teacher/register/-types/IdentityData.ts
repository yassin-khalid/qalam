export enum IdentityType {
  NATIONAL_ID = 1,
  IQAMA = 2,
  PASSPORT = 3,
  DRIVING_LICENSE = 4,
}

export enum TeacherDocumentType {
  IDENTITY_DOCUMENT = 1,
  CERTIFICATE = 2,
  OTHER = 3,
}

export enum DocumentVerificationStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export enum TeacherStatus {
  AWAITING_DOCUMENTS = 1,
  PENDING_VERIFICATION = 2,
  DOCUMENTS_REJECTED = 3,
  ACTIVE = 4,
  BLOCKED = 5,
}
