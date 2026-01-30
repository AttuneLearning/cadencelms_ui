/**
 * User Profile Entity Types
 * Generated from: /contracts/api/users.contract.ts v1.0.0
 *
 * Unified user profile types matching backend contract.
 * Role-specific fields are conditionally present based on user role.
 */

export type UserRole = 'global-admin' | 'staff' | 'learner';
export type UserStatus = 'active' | 'inactive' | 'withdrawn';
export type UserProfileContext = 'staff' | 'learner';

/**
 * Department role assignment for staff members
 */
export interface DepartmentRole {
  departmentId: string;
  role: string;
}

/**
 * Base User Profile
 * Unified profile for any authenticated user
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;

  // Staff-only fields (present when role === 'staff')
  departments?: string[];
  permissions?: string[];
  departmentRoles?: DepartmentRole[];

  // Learner-only fields (present when role === 'learner')
  studentId?: string;
  programEnrollments?: string[];
  courseEnrollments?: string[];

  // Common optional fields
  profileImage: string | null;
  phone: string | null;

  // Metadata
  createdAt: string;
  lastLoginAt: string | null;
  updatedAt: string;
}

/**
 * Update Profile Payload
 * Fields that users can modify in their own profile
 */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string | null;
}

/**
 * Department Summary (from /users/me/departments)
 */
export interface UserDepartment {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  // Role in this department
  userRole?: string;
}

// ============================================================================
// ISS-010: PersonExtended & Demographics Types
// ============================================================================

/**
 * Common enum types for extended profiles and demographics
 */
export type AcademicRank =
  | 'instructor'
  | 'assistant-professor'
  | 'associate-professor'
  | 'professor'
  | 'distinguished-professor';

export type ContractType = 'full-time' | 'part-time' | 'adjunct' | 'visiting' | 'emeritus' | 'contract';

export type CredentialType = 'degree' | 'certification' | 'license' | 'other';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type PublicationType =
  | 'journal-article'
  | 'conference-paper'
  | 'book'
  | 'book-chapter'
  | 'other';

export type LegalGender = 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';

export type Race =
  | 'american-indian-alaska-native'
  | 'asian'
  | 'black-african-american'
  | 'native-hawaiian-pacific-islander'
  | 'white'
  | 'two-or-more-races'
  | 'other'
  | 'prefer-not-to-say';

export type VeteranStatus =
  | 'not-veteran'
  | 'active-duty'
  | 'veteran'
  | 'reserve'
  | 'dependent'
  | 'prefer-not-to-say';

export type Citizenship =
  | 'us-citizen'
  | 'us-national'
  | 'permanent-resident'
  | 'visa-holder'
  | 'refugee-asylee'
  | 'temporary-resident'
  | 'other'
  | 'prefer-not-to-say';

export type VisaType = 'h1b' | 'h4' | 'f1' | 'j1' | 'm1' | 'other';

export type DisabilityType =
  | 'physical'
  | 'visual'
  | 'hearing'
  | 'learning'
  | 'psychiatric'
  | 'mental-health'
  | 'chronic-illness'
  | 'other';

export type EnglishProficiency =
  | 'native'
  | 'fluent'
  | 'advanced'
  | 'intermediate'
  | 'basic'
  | 'limited';

export type EnrollmentStatus =
  | 'enrolled'
  | 'admitted'
  | 'prospective'
  | 'leave-of-absence'
  | 'withdrawn'
  | 'expelled'
  | 'graduated';

export type RelationshipType = 'mother' | 'father' | 'legal-guardian' | 'other';

export type IdType =
  | 'passport'
  | 'drivers-license'
  | 'state-id'
  | 'student-id'
  | 'visa'
  | 'birth-certificate'
  | 'other';

export type InstitutionType =
  | 'high-school'
  | 'community-college'
  | 'college'
  | 'university'
  | 'vocational'
  | 'online'
  | 'other';

export type EducationLevel =
  | 'less-than-high-school'
  | 'high-school'
  | 'some-college'
  | 'associates'
  | 'bachelors'
  | 'masters'
  | 'doctorate';

export type HousingStatus = 'on-campus' | 'off-campus' | 'commuter' | 'other';

export type MaritalStatus =
  | 'single'
  | 'married'
  | 'domestic-partnership'
  | 'divorced'
  | 'widowed'
  | 'separated'
  | 'prefer-not-to-say';

export type HouseholdIncomeRange =
  | 'under-25k'
  | '25k-50k'
  | '50k-75k'
  | '75k-100k'
  | '100k-150k'
  | 'over-150k'
  | 'prefer-not-to-say';

/**
 * Staff Extended Profile - Professional Information
 */
export interface ICredential {
  type: CredentialType;
  name: string;
  issuingOrganization: string;
  fieldOfStudy?: string;
  dateEarned?: string; // ISO date
  expirationDate?: string; // ISO date
  credentialId?: string;
}

export interface IOfficeHours {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  location?: string;
  appointmentRequired?: boolean;
  notes?: string;
}

export interface IPublication {
  title: string;
  type: PublicationType;
  authors: string;
  venue: string;
  publicationDate?: string; // ISO date
  doi?: string;
  url?: string;
  abstract?: string;
}

export interface IProfessionalMembership {
  organizationName: string;
  membershipType?: string;
  memberId?: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  isActive: boolean;
}

export interface IStaffPersonExtended {
  // Professional Information
  professionalTitle?: string;
  headline?: string;
  academicRank?: AcademicRank;
  contractType?: ContractType;

  // Employment Details
  employeeId?: string; // Readonly
  hireDate?: string; // Readonly, ISO date
  officeLocation?: string;

  // Credentials & Certifications
  credentials?: ICredential[];

  // Office Hours
  officeHours?: IOfficeHours[];

  // Research & Publications
  researchInterests?: string[];
  publications?: IPublication[];

  // Professional Links
  linkedInUrl?: string;
  orcidId?: string; // Format: 0000-0000-0000-0000
  googleScholarUrl?: string;
  websiteUrl?: string;

  // Professional Memberships
  professionalMemberships?: IProfessionalMembership[];
}

/**
 * Learner Extended Profile - Student Information
 */
export interface IEmergencyContact {
  fullName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  priority: number; // 1, 2, 3...
  medicalAuthorization?: boolean;
  pickupAuthorization?: boolean;
  notes?: string;

  // Optional address
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IParentGuardian {
  fullName: string;
  relationship: RelationshipType;
  isCustodial: boolean;
  phones: string[]; // Min 1 required
  emails?: string[];
  employer?: string;
  jobTitle?: string;
  educationLevel?: EducationLevel;
  ferpaAccess?: boolean;
  notes?: string;
}

export interface IIdentification {
  idType: IdType;
  idNumber: string; // Will be masked in UI
  issuingAuthority?: string;
  issueDate?: string; // ISO date
  expirationDate?: string; // ISO date
}

export interface IPriorEducation {
  institutionName: string;
  institutionType: InstitutionType;
  degreeEarned?: string;
  major?: string;
  minor?: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  graduationDate?: string; // ISO date
  gpa?: number;
  gpaScale?: number; // 4.0, 5.0, or 100
  graduated?: boolean;
  creditsEarned?: number;
  creditsTransferred?: number;
  notes?: string;
  transcriptOnFile?: boolean; // Readonly
}

export interface IAccommodation {
  type: string;
  accommodationType?: string;
  disabilityType?: DisabilityType;
  description?: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  isActive: boolean;
  status?: 'active' | 'pending' | 'expired' | 'denied' | string;
  approvedBy?: string;
  documentationOnFile?: boolean; // Readonly
  instructorNotes?: string; // Readonly
}

export interface ILearnerPersonExtended {
  // Student Information
  studentId?: string; // Readonly
  enrollmentStatus?: EnrollmentStatus; // Readonly
  expectedGraduationDate?: string; // ISO date
  actualGraduationDate?: string; // Readonly, ISO date
  transferCredits?: number; // Readonly
  age?: number;

  // Emergency Contacts (min 1 required)
  emergencyContacts?: IEmergencyContact[];

  // Parent/Guardian Information
  parentGuardians?: IParentGuardian[];

  // Identification Documents
  identifications?: IIdentification[];

  // Prior Education
  priorEducation?: IPriorEducation[];

  // Accommodations (VIEW + REQUEST only for learners)
  accommodations?: IAccommodation[];

  // Housing & Parking
  housingStatus?: HousingStatus;
  residenceHall?: string; // Show if on-campus
  buildingName?: string;
  roomNumber?: string; // Show if on-campus
  vehicleOnCampus?: boolean;
  vehicleInfo?: string; // Show if vehicleOnCampus
  parkingPermit?: string; // Readonly
  hasParkingPermit?: boolean;
  parkingLotAssignment?: string;
  parkingPermitNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleLicensePlate?: string;
}

/**
 * Demographics - Shared between Staff and Learner (context-specific)
 */
export interface IDemographics {
  // Identity & Gender
  legalGender?: LegalGender;
  genderIdentity?: string;
  pronouns?: string;

  // Race & Ethnicity
  isHispanicLatino?: boolean;
  race?: Race[];
  tribalAffiliation?: string; // Learner only, show if american-indian-alaska-native

  // Citizenship
  citizenship?: Citizenship;
  countryOfCitizenship?: string; // ISO country code
  countryOfBirth?: string; // Learner only, ISO country code
  visaType?: VisaType; // Show if visa-holder
  visaExpirationDate?: string; // Required if visaType set, ISO date
  alienRegistrationNumber?: string; // Learner only, masked

  // First Generation (Learner only)
  firstGenerationStudent?: boolean;
  parent1EducationLevel?: EducationLevel;
  parent2EducationLevel?: EducationLevel;

  // Veteran Status
  veteranStatus?: VeteranStatus;
  militaryBranch?: string; // Show if veteran/active-duty/reserve
  yearsOfService?: number; // Show if veteran/active-duty/reserve

  // Disability
  hasDisability?: boolean;
  disabilityType?: DisabilityType[];
  accommodationsRequired?: boolean;

  // Language
  primaryLanguage?: string; // ISO 639-1 code
  englishProficiency?: EnglishProficiency;
  otherLanguages?: string[]; // ISO 639-1 codes

  // Personal & Family Status (Learner only)
  maritalStatus?: MaritalStatus;
  numberOfDependents?: number;
  householdIncomeRange?: HouseholdIncomeRange;

  // Financial Aid Fields (ISS-012 - READONLY, calculated by Financial Aid office)
  pellEligible?: boolean | null; // Readonly - null if not set by Financial Aid
  lowIncomeStatus?: boolean | null; // Readonly - null if not set by Financial Aid

  // Religious Accommodations (Learner only)
  religiousAffiliation?: string;
  religiousAccommodations?: boolean;

  // Reporting Consent
  allowReporting: boolean; // Default true (opt-out)
  allowResearch: boolean; // Default true (opt-out)
  lastUpdated?: string; // Readonly, ISO date
}
