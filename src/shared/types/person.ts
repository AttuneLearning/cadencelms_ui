/**
 * Person Data Types - v2.0.0
 *
 * Three-layer person architecture matching API contracts:
 * 1. IPerson (Basic) - Core contact & identity
 * 2. IPersonExtended - Role-specific data
 * 3. IDemographics - Compliance data
 *
 * Source: API contracts/api/person.contract.ts, demographics.contract.ts
 */

// ==================== Email ====================

export type EmailType = 'institutional' | 'personal' | 'work' | 'other';

export interface IEmail {
  email: string;
  type: EmailType;
  isPrimary: boolean;
  verified: boolean;
  allowNotifications: boolean;
  label: string | null;
}

// ==================== Phone ====================

export type PhoneType = 'mobile' | 'home' | 'work' | 'other';

export interface IPhone {
  number: string;
  type: PhoneType;
  isPrimary: boolean;
  verified: boolean;
  allowSMS: boolean;
  label: string | null;
}

// ==================== Address ====================

export type AddressType = 'home' | 'work' | 'mailing' | 'other';

export interface IAddress {
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type: AddressType;
  isPrimary: boolean;
  label: string | null;
}

// ==================== Communication Preferences ====================

export type PreferredContactMethod = 'email' | 'phone' | 'sms' | 'mail' | null;
export type NotificationFrequency = 'immediate' | 'daily-digest' | 'weekly-digest' | 'none';

export interface ICommunicationPreferences {
  preferredMethod: PreferredContactMethod;
  allowEmail: boolean;
  allowSMS: boolean;
  allowPhoneCalls: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  notificationFrequency: NotificationFrequency;
}

// ==================== Legal Consent ====================

export interface ILegalConsent {
  ferpaConsent: boolean | null;
  ferpaConsentDate: Date | null;
  gdprConsent: boolean | null;
  gdprConsentDate: Date | null;
  photoConsent: boolean | null;
  photoConsentDate: Date | null;
  marketingConsent: boolean | null;
  marketingConsentDate: Date | null;
  thirdPartyDataSharing: boolean | null;
  thirdPartyDataSharingDate: Date | null;
}

// ==================== IPerson (Basic) ====================

/**
 * IPerson - Basic person data (Layer 1 of 3)
 *
 * Core contact information and identity shared across all user types.
 * Endpoint: GET /api/v2/users/me/person
 */
export interface IPerson {
  // Core Identity
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  preferredFirstName: string | null;
  preferredLastName: string | null;
  pronouns: string | null;

  // Contact Information
  emails: IEmail[];
  phones: IPhone[];
  addresses: IAddress[];

  // Personal Information
  dateOfBirth: Date | null;
  last4SSN: string | null;

  // Profile
  avatar: string | null;
  bio: string | null;

  // Preferences
  timezone: string;
  languagePreference: string;
  locale: string | null;

  // Communication & Legal
  communicationPreferences: ICommunicationPreferences;
  legalConsent: ILegalConsent;
}

// ==================== Emergency Contact ====================

export interface IEmergencyContact {
  fullName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  email: string | null;
  priority: number;
  medicalAuthorization: boolean;
  pickupAuthorization: boolean;
  notes: string | null;
}

// ==================== Parent/Guardian ====================

export interface IParentGuardian {
  fullName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  email: string | null;
  address: IAddress | null;
  legalGuardian: boolean;
  financialResponsibility: boolean;
  notes: string | null;
}

// ==================== Identification ====================

export type IdentificationType = 'drivers-license' | 'passport' | 'state-id' | 'military-id' | 'tribal-id' | 'other';

export interface IIdentification {
  idNumber: string;
  idType: IdentificationType;
  issuingAuthority: string;
  issueDate: Date | null;
  expirationDate: Date | null;
  documentUrl: string | null;
}

// ==================== Prior Education ====================

export type InstitutionType =
  | 'high-school'
  | 'community-college'
  | 'college'
  | 'university'
  | 'vocational'
  | 'online'
  | 'other';

export interface IPriorEducation {
  institutionName: string;
  institutionType: InstitutionType;
  degreeEarned: string | null;
  major: string | null;
  minor: string | null;
  startDate: Date | null;
  endDate: Date | null;
  graduationDate?: Date | null;
  gpa: number | null;
  gpaScale: number | null;
  graduated: boolean;
  creditsEarned?: number | null;
  creditsTransferred?: number | null;
  notes?: string | null;
  transcriptOnFile: boolean;
}

// ==================== Accommodation ====================

export type AccommodationType = 'extended-time' | 'reduced-distraction' | 'assistive-technology' | 'note-taker' | 'interpreter' | 'other';

export interface IAccommodation {
  type: AccommodationType;
  accommodationType?: string;
  disabilityType?: DisabilityType;
  status?: 'active' | 'pending' | 'expired' | 'denied' | string;
  description: string;
  documentationOnFile: boolean;
  approved: boolean;
  approvedBy: string | null;
  approvedDate: Date | null;
  notes: string | null;
}

// ==================== Learner Extended ====================

export type EnrollmentStatus = 'enrolled' | 'leave-of-absence' | 'withdrawn' | 'graduated' | 'suspended';
export type HousingStatus = 'on-campus' | 'off-campus' | 'commuter' | 'other';

export interface ILearnerPersonExtended {
  studentId: string | null;
  emergencyContacts: IEmergencyContact[];
  parentGuardians: IParentGuardian[];
  identifications: IIdentification[];
  priorEducation: IPriorEducation[];
  transferCredits: number | null;
  accommodations: IAccommodation[];
  enrollmentStatus: EnrollmentStatus | null;
  expectedGraduationDate: Date | null;
  actualGraduationDate: Date | null;
  housingStatus: HousingStatus | null;
  residenceHall: string | null;
  buildingName?: string | null;
  roomNumber: string | null;
  vehicleOnCampus: boolean;
  vehicleInfo: string | null;
  parkingPermit: string | null;
  hasParkingPermit?: boolean;
  parkingLotAssignment?: string | null;
  parkingPermitNumber?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleLicensePlate?: string | null;
  financialAidRecipient: boolean;
  workStudyParticipant: boolean;
}

// ==================== Credential ====================

export type CredentialType = 'degree' | 'certification' | 'license' | 'award' | 'other';

export interface ICredential {
  type: CredentialType;
  title: string;
  issuingInstitution: string;
  dateEarned: Date | null;
  expirationDate: Date | null;
  credentialNumber: string | null;
  verificationUrl: string | null;
}

// ==================== Publication ====================

export type PublicationType = 'journal' | 'conference' | 'book' | 'chapter' | 'thesis' | 'other';

export interface IPublication {
  type: PublicationType;
  title: string;
  authors: string[];
  publicationVenue: string;
  publicationDate: Date | null;
  doi: string | null;
  url: string | null;
  abstract: string | null;
}

// ==================== Professional Membership ====================

export interface IProfessionalMembership {
  organization: string;
  role: string | null;
  startDate: Date | null;
  endDate: Date | null;
  active: boolean;
}

// ==================== Office Hours ====================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface IOfficeHours {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  location: string;
  virtual: boolean;
  virtualLink: string | null;
  notes: string | null;
}

// ==================== Staff Extended ====================

export type ContractType = 'full-time' | 'part-time' | 'adjunct' | 'visiting' | 'emeritus' | 'other';
export type AcademicRank = 'instructor' | 'assistant-professor' | 'associate-professor' | 'professor' | 'distinguished-professor' | 'other';

export interface IStaffPersonExtended {
  professionalTitle: string | null;
  officeLocation: string | null;
  headline: string | null;
  credentials: ICredential[];
  researchInterests: string[] | null;
  publications: IPublication[];
  professionalMemberships: IProfessionalMembership[];
  officeHours: IOfficeHours[];
  linkedInUrl: string | null;
  orcidId: string | null;
  googleScholarUrl: string | null;
  websiteUrl: string | null;
  employeeId: string | null;
  hireDate: Date | null;
  contractType: ContractType | null;
  academicRank: AcademicRank | null;
}

// ==================== IPersonExtended ====================

/**
 * IPersonExtended - Role-specific extended data (Layer 2 of 3)
 *
 * Extended person information that varies by role.
 * Endpoint: GET /api/v2/users/me/person/extended
 */
export type IPersonExtended =
  | { role: 'learner'; learner: ILearnerPersonExtended }
  | { role: 'staff'; staff: IStaffPersonExtended };

// ==================== Demographics Enums ====================

export type LegalGender = 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';

export type RaceCategory =
  | 'american-indian-alaska-native'
  | 'asian'
  | 'black-african-american'
  | 'native-hawaiian-pacific-islander'
  | 'white'
  | 'two-or-more-races'
  | 'other'
  | 'prefer-not-to-say';

export type CitizenshipStatus =
  | 'us-citizen'
  | 'us-national'
  | 'permanent-resident'
  | 'refugee-asylee'
  | 'temporary-resident'
  | 'visa-holder'
  | 'other'
  | 'prefer-not-to-say';

export type VisaType = 'f1' | 'j1' | 'h1b' | 'm1' | 'h4' | 'other';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'domestic-partner' | 'prefer-not-to-say';

export type VeteranStatus =
  | 'not-veteran'
  | 'active-duty'
  | 'veteran'
  | 'reserve'
  | 'dependent'
  | 'prefer-not-to-say';

export type DischargeType = 'honorable' | 'general' | 'other-than-honorable' | 'dishonorable' | 'bad-conduct';

export type EducationLevel =
  | 'less-than-high-school'
  | 'high-school'
  | 'some-college'
  | 'associates'
  | 'bachelors'
  | 'masters'
  | 'doctorate';

export type DisabilityType =
  | 'physical'
  | 'psychiatric'
  | 'learning'
  | 'mental-health'
  | 'visual'
  | 'hearing'
  | 'chronic-illness'
  | 'other';

export type EnglishProficiency = 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic' | 'limited';

export type IncomeRange =
  | 'under-25k'
  | '25k-50k'
  | '50k-75k'
  | '75k-100k'
  | '100k-150k'
  | 'over-150k'
  | 'prefer-not-to-say';

// ==================== IDemographics ====================

/**
 * IDemographics - Compliance and reporting data (Layer 3 of 3)
 *
 * Demographics information used for IPEDS, Title IX, ADA compliance.
 * All fields are optional - user privacy first.
 * Endpoint: GET /api/v2/users/me/demographics
 */
export interface IDemographics {
  // Gender & Identity
  legalGender: LegalGender | null;
  genderIdentity: string | null;
  pronouns: string | null;

  // Race & Ethnicity (IPEDS)
  isHispanicLatino: boolean | null;
  race: RaceCategory[] | null;
  tribalAffiliation: string | null;

  // Citizenship & Immigration
  citizenship: CitizenshipStatus | null;
  countryOfCitizenship: string | null;
  countryOfBirth: string | null;
  visaType: VisaType | null;
  visaExpirationDate: Date | null;
  alienRegistrationNumber: string | null;

  // Personal Status
  maritalStatus: MaritalStatus | null;
  numberOfDependents: number | null;

  // Veteran & Military
  veteranStatus: VeteranStatus | null;
  militaryBranch: string | null;
  yearsOfService: number | null;
  dischargeType: DischargeType | null;

  // First Generation & Educational Background
  firstGenerationStudent: boolean | null;
  parent1EducationLevel: EducationLevel | null;
  parent2EducationLevel: EducationLevel | null;

  // Disability & Accommodations
  hasDisability: boolean | null;
  disabilityType: DisabilityType[] | null;
  accommodationsRequired: boolean | null;

  // Language
  primaryLanguage: string | null;
  englishProficiency: EnglishProficiency | null;
  otherLanguages: string[] | null;

  // Socioeconomic
  pellEligible: boolean | null;
  lowIncomeStatus: boolean | null;
  householdIncomeRange: IncomeRange | null;

  // Religion
  religiousAffiliation: string | null;
  religiousAccommodations: boolean | null;

  // Consent & Privacy
  allowReporting: boolean;
  allowResearch: boolean;
  lastUpdated: Date | null;
  collectedDate: Date | null;
}

// ==================== API Response Types ====================

export interface IPersonResponse {
  success: boolean;
  data: IPerson;
}

export interface IPersonExtendedResponse {
  success: boolean;
  data: IPersonExtended;
}

export interface IDemographicsResponse {
  success: boolean;
  data: IDemographics;
}

// ==================== Update Request Types ====================

export type IPersonUpdateRequest = Partial<Omit<IPerson, 'communicationPreferences' | 'legalConsent'>> & {
  communicationPreferences?: Partial<ICommunicationPreferences>;
  legalConsent?: Partial<ILegalConsent>;
};

export type ILearnerPersonExtendedUpdateRequest = Partial<ILearnerPersonExtended>;
export type IStaffPersonExtendedUpdateRequest = Partial<IStaffPersonExtended>;

export type IDemographicsUpdateRequest = Partial<IDemographics>;
