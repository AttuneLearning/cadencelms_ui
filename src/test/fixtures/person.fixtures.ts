/**
 * Test Fixtures for Person Data v2.0
 *
 * Mock data for:
 * - IPerson (Basic person data)
 * - IPersonExtended (Role-specific data - learner and staff)
 * - IDemographics (Compliance data)
 *
 * These fixtures are used across all person-related tests.
 */

import type {
  IPerson,
  IEmail,
  IPhone,
  IAddress,
  ICommunicationPreferences,
  ILegalConsent,
  IPersonExtended,
  ILearnerPersonExtended,
  IStaffPersonExtended,
  IDemographics,
  IPersonResponse,
  IPersonExtendedResponse,
  IDemographicsResponse,
  IEmergencyContact,
  IParentGuardian,
  IIdentification,
  IPriorEducation,
  IAccommodation,
  ICredential,
  IPublication,
  IProfessionalMembership,
  IOfficeHours,
} from '@/shared/types/person';

// ==================== Basic Contact Data ====================

export const mockPrimaryEmail: IEmail = {
  email: 'jane.smith@university.edu',
  type: 'institutional',
  isPrimary: true,
  verified: true,
  allowNotifications: true,
  label: null,
};

export const mockSecondaryEmail: IEmail = {
  email: 'jane.personal@gmail.com',
  type: 'personal',
  isPrimary: false,
  verified: true,
  allowNotifications: false,
  label: 'Personal Email',
};

export const mockPrimaryPhone: IPhone = {
  number: '+1-555-0123',
  type: 'mobile',
  isPrimary: true,
  verified: true,
  allowSMS: true,
  label: null,
};

export const mockSecondaryPhone: IPhone = {
  number: '+1-555-9876',
  type: 'home',
  isPrimary: false,
  verified: false,
  allowSMS: false,
  label: 'Home Phone',
};

export const mockPrimaryAddress: IAddress = {
  street1: '123 Main Street',
  street2: 'Apt 4B',
  city: 'Boston',
  state: 'MA',
  postalCode: '02101',
  country: 'US',
  type: 'home',
  isPrimary: true,
  label: null,
};

export const mockSecondaryAddress: IAddress = {
  street1: '456 Work Plaza',
  street2: null,
  city: 'Cambridge',
  state: 'MA',
  postalCode: '02139',
  country: 'US',
  type: 'work',
  isPrimary: false,
  label: 'Office Address',
};

export const mockCommunicationPreferences: ICommunicationPreferences = {
  preferredMethod: 'email',
  allowEmail: true,
  allowSMS: true,
  allowPhoneCalls: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  notificationFrequency: 'daily-digest',
};

export const mockLegalConsent: ILegalConsent = {
  ferpaConsent: true,
  ferpaConsentDate: new Date('2025-09-01T00:00:00.000Z') as any,
  gdprConsent: true,
  gdprConsentDate: new Date('2025-09-01T00:00:00.000Z') as any,
  photoConsent: true,
  photoConsentDate: new Date('2025-09-01T00:00:00.000Z') as any,
  marketingConsent: false,
  marketingConsentDate: null,
  thirdPartyDataSharing: false,
  thirdPartyDataSharingDate: null,
};

// ==================== IPerson (Basic) ====================

export const mockPersonWithAllFields: IPerson = {
  firstName: 'Jane',
  middleName: 'Marie',
  lastName: 'Smith',
  suffix: null,
  preferredFirstName: 'Janey',
  preferredLastName: null,
  pronouns: 'she/her',
  emails: [mockPrimaryEmail, mockSecondaryEmail],
  phones: [mockPrimaryPhone, mockSecondaryPhone],
  addresses: [mockPrimaryAddress, mockSecondaryAddress],
  dateOfBirth: new Date('1998-03-15T00:00:00.000Z'),
  last4SSN: '4567',
  avatar: 'https://cdn.example.com/avatars/jane-smith.jpg',
  bio: 'Computer Science major passionate about AI and machine learning.',
  timezone: 'America/New_York',
  languagePreference: 'en',
  locale: 'en-US',
  communicationPreferences: mockCommunicationPreferences,
  legalConsent: mockLegalConsent,
};

export const mockPersonMinimal: IPerson = {
  firstName: 'John',
  middleName: null,
  lastName: 'Doe',
  suffix: null,
  preferredFirstName: null,
  preferredLastName: null,
  pronouns: null,
  emails: [mockPrimaryEmail],
  phones: [],
  addresses: [],
  dateOfBirth: null,
  last4SSN: null,
  avatar: null,
  bio: null,
  timezone: 'America/New_York',
  languagePreference: 'en',
  locale: null,
  communicationPreferences: {
    preferredMethod: null,
    allowEmail: true,
    allowSMS: false,
    allowPhoneCalls: false,
    quietHoursStart: null,
    quietHoursEnd: null,
    notificationFrequency: 'immediate',
  },
  legalConsent: {
    ferpaConsent: null,
    ferpaConsentDate: null,
    gdprConsent: null,
    gdprConsentDate: null,
    photoConsent: null,
    photoConsentDate: null,
    marketingConsent: null,
    marketingConsentDate: null,
    thirdPartyDataSharing: null,
    thirdPartyDataSharingDate: null,
  },
};

export const mockPersonNoPrimary: IPerson = {
  ...mockPersonMinimal,
  emails: [
    { ...mockPrimaryEmail, isPrimary: false },
    { ...mockSecondaryEmail, isPrimary: false },
  ],
  phones: [
    { ...mockPrimaryPhone, isPrimary: false },
    { ...mockSecondaryPhone, isPrimary: false },
  ],
  addresses: [
    { ...mockPrimaryAddress, isPrimary: false },
    { ...mockSecondaryAddress, isPrimary: false },
  ],
};

// ==================== Learner Extended Data ====================

export const mockEmergencyContact: IEmergencyContact = {
  fullName: 'Mary Smith',
  relationship: 'Mother',
  primaryPhone: '+1-555-1234',
  secondaryPhone: '+1-555-5678',
  email: 'mary.smith@email.com',
  priority: 1,
  medicalAuthorization: true,
  pickupAuthorization: true,
  notes: null,
};

export const mockParentGuardian: IParentGuardian = {
  fullName: 'Robert Smith',
  relationship: 'Father',
  primaryPhone: '+1-555-2345',
  secondaryPhone: null,
  email: 'robert.smith@email.com',
  address: mockPrimaryAddress,
  legalGuardian: true,
  financialResponsibility: true,
  notes: null,
};

export const mockIdentification: IIdentification = {
  idNumber: 'ENCRYPTED',
  idType: 'drivers-license',
  issuingAuthority: 'Massachusetts RMV',
  issueDate: new Date('2022-01-15T00:00:00.000Z'),
  expirationDate: new Date('2027-01-15T00:00:00.000Z'),
  documentUrl: null,
};

export const mockPriorEducation: IPriorEducation = {
  institutionName: 'Lincoln High School',
  institutionType: 'high-school',
  degreeEarned: 'High School Diploma',
  major: null,
  minor: null,
  startDate: new Date('2012-09-01T00:00:00.000Z'),
  endDate: new Date('2016-06-15T00:00:00.000Z'),
  gpa: 3.8,
  gpaScale: 4.0,
  graduated: true,
  transcriptOnFile: true,
};

export const mockAccommodation: IAccommodation = {
  type: 'extended-time',
  description: 'Extended time for exams (1.5x)',
  documentationOnFile: true,
  approved: true,
  approvedBy: 'Dr. Johnson',
  approvedDate: new Date('2025-08-15T00:00:00.000Z'),
  notes: 'Approved for all examinations',
};

export const mockLearnerExtended: ILearnerPersonExtended = {
  studentId: 'STU123456',
  emergencyContacts: [mockEmergencyContact],
  parentGuardians: [mockParentGuardian],
  identifications: [mockIdentification],
  priorEducation: [mockPriorEducation],
  transferCredits: 0,
  accommodations: [mockAccommodation],
  enrollmentStatus: 'enrolled',
  expectedGraduationDate: new Date('2026-05-15T00:00:00.000Z'),
  actualGraduationDate: null,
  housingStatus: 'on-campus',
  residenceHall: 'Adams Hall',
  roomNumber: '312',
  vehicleOnCampus: false,
  vehicleInfo: null,
  parkingPermit: null,
  financialAidRecipient: true,
  workStudyParticipant: false,
};

export const mockLearnerExtendedMinimal: ILearnerPersonExtended = {
  studentId: null,
  emergencyContacts: [],
  parentGuardians: [],
  identifications: [],
  priorEducation: [],
  transferCredits: null,
  accommodations: [],
  enrollmentStatus: null,
  expectedGraduationDate: null,
  actualGraduationDate: null,
  housingStatus: null,
  residenceHall: null,
  roomNumber: null,
  vehicleOnCampus: false,
  vehicleInfo: null,
  parkingPermit: null,
  financialAidRecipient: false,
  workStudyParticipant: false,
};

// ==================== Staff Extended Data ====================

export const mockCredential: ICredential = {
  type: 'degree',
  title: 'Ph.D. in Computer Science',
  issuingInstitution: 'MIT',
  dateEarned: new Date('2018-05-15T00:00:00.000Z'),
  expirationDate: null,
  credentialNumber: null,
  verificationUrl: 'https://mit.edu/verify/12345',
};

export const mockPublication: IPublication = {
  type: 'journal',
  title: 'Advanced Machine Learning Techniques for Natural Language Processing',
  authors: ['Jane Smith', 'John Doe', 'Alice Johnson'],
  publicationVenue: 'Journal of AI Research',
  publicationDate: new Date('2023-06-01T00:00:00.000Z'),
  doi: '10.1234/jair.2023.001',
  url: 'https://jair.org/papers/2023/001',
  abstract: 'This paper explores advanced machine learning techniques...',
};

export const mockProfessionalMembership: IProfessionalMembership = {
  organization: 'Association for Computing Machinery',
  role: 'Senior Member',
  startDate: new Date('2019-01-01T00:00:00.000Z'),
  endDate: null,
  active: true,
};

export const mockOfficeHours: IOfficeHours = {
  dayOfWeek: 'monday',
  startTime: '14:00',
  endTime: '16:00',
  location: 'Office 301, CS Building',
  virtual: true,
  virtualLink: 'https://zoom.us/j/123456789',
  notes: 'Please schedule ahead via email',
};

export const mockStaffExtended: IStaffPersonExtended = {
  professionalTitle: 'Associate Professor of Computer Science',
  officeLocation: 'CS Building, Room 301',
  headline: 'AI researcher specializing in NLP and machine learning',
  credentials: [mockCredential],
  researchInterests: ['Machine Learning', 'Natural Language Processing', 'Deep Learning'],
  publications: [mockPublication],
  professionalMemberships: [mockProfessionalMembership],
  officeHours: [mockOfficeHours],
  linkedInUrl: 'https://linkedin.com/in/janesmith',
  orcidId: '0000-0001-2345-6789',
  googleScholarUrl: 'https://scholar.google.com/citations?user=abc123',
  websiteUrl: 'https://janesmith.example.com',
  employeeId: 'EMP98765',
  hireDate: new Date('2019-08-15T00:00:00.000Z'),
  contractType: 'full-time',
  academicRank: 'associate-professor',
};

export const mockStaffExtendedMinimal: IStaffPersonExtended = {
  professionalTitle: null,
  officeLocation: null,
  headline: null,
  credentials: [],
  researchInterests: null,
  publications: [],
  professionalMemberships: [],
  officeHours: [],
  linkedInUrl: null,
  orcidId: null,
  googleScholarUrl: null,
  websiteUrl: null,
  employeeId: null,
  hireDate: null,
  contractType: null,
  academicRank: null,
};

// ==================== IPersonExtended ====================

export const mockPersonExtendedLearner: IPersonExtended = {
  role: 'learner',
  learner: mockLearnerExtended,
};

export const mockPersonExtendedStaff: IPersonExtended = {
  role: 'staff',
  staff: mockStaffExtended,
};

// ==================== Demographics Data ====================

export const mockDemographicsComplete: IDemographics = {
  // Gender & Identity
  legalGender: 'female',
  genderIdentity: 'Woman',
  pronouns: 'she/her',

  // Race & Ethnicity
  isHispanicLatino: false,
  race: ['asian', 'white'],
  tribalAffiliation: null,

  // Citizenship
  citizenship: 'us-citizen',
  countryOfCitizenship: 'US',
  countryOfBirth: 'US',
  visaType: null,
  visaExpirationDate: null,
  alienRegistrationNumber: null,

  // Personal Status
  maritalStatus: 'single',
  numberOfDependents: 0,

  // Veteran & Military
  veteranStatus: 'not-veteran',
  militaryBranch: null,
  yearsOfService: null,
  dischargeType: null,

  // First Generation
  firstGenerationStudent: false,
  parent1EducationLevel: 'bachelors',
  parent2EducationLevel: 'masters',

  // Disability
  hasDisability: false,
  disabilityType: null,
  accommodationsRequired: false,

  // Language
  primaryLanguage: 'en',
  englishProficiency: 'native',
  otherLanguages: ['es'],

  // Socioeconomic
  pellEligible: false,
  lowIncomeStatus: false,
  householdIncomeRange: '75k-100k',

  // Religion
  religiousAffiliation: null,
  religiousAccommodations: false,

  // Consent & Privacy
  allowReporting: true,
  allowResearch: true,
  lastUpdated: new Date('2025-09-01T00:00:00.000Z'),
  collectedDate: new Date('2025-09-01T00:00:00.000Z'),
};

export const mockDemographicsMinimal: IDemographics = {
  // Gender & Identity
  legalGender: null,
  genderIdentity: null,
  pronouns: null,

  // Race & Ethnicity
  isHispanicLatino: null,
  race: null,
  tribalAffiliation: null,

  // Citizenship
  citizenship: null,
  countryOfCitizenship: null,
  countryOfBirth: null,
  visaType: null,
  visaExpirationDate: null,
  alienRegistrationNumber: null,

  // Personal Status
  maritalStatus: null,
  numberOfDependents: null,

  // Veteran & Military
  veteranStatus: null,
  militaryBranch: null,
  yearsOfService: null,
  dischargeType: null,

  // First Generation
  firstGenerationStudent: null,
  parent1EducationLevel: null,
  parent2EducationLevel: null,

  // Disability
  hasDisability: null,
  disabilityType: null,
  accommodationsRequired: null,

  // Language
  primaryLanguage: null,
  englishProficiency: null,
  otherLanguages: null,

  // Socioeconomic
  pellEligible: null,
  lowIncomeStatus: null,
  householdIncomeRange: null,

  // Religion
  religiousAffiliation: null,
  religiousAccommodations: null,

  // Consent & Privacy
  allowReporting: false,
  allowResearch: false,
  lastUpdated: null,
  collectedDate: null,
};

// ==================== API Response Types ====================

export const mockPersonResponse: IPersonResponse = {
  success: true,
  data: mockPersonWithAllFields,
};

export const mockPersonExtendedLearnerResponse: IPersonExtendedResponse = {
  success: true,
  data: mockPersonExtendedLearner,
};

export const mockPersonExtendedStaffResponse: IPersonExtendedResponse = {
  success: true,
  data: mockPersonExtendedStaff,
};

export const mockDemographicsResponse: IDemographicsResponse = {
  success: true,
  data: mockDemographicsComplete,
};
