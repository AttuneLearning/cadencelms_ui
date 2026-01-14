/**
 * Learner Profile Extended Container
 * Demo: Integrates learner extended profile sections
 */

import React from 'react';
import { useLearnerExtended } from '@/entities/user-profile/model/useUserProfile';
import { StudentInfoSection } from './learner/StudentInfoSection';
import { EmergencyContactsSection } from './learner/EmergencyContactsSection';
import { ParentGuardianSection } from './learner/ParentGuardianSection';
import { IdentificationsSection } from './learner/IdentificationsSection';
import { PriorEducationSection } from './learner/PriorEducationSection';
import { AccommodationsSection } from './learner/AccommodationsSection';
import { HousingParkingSection } from './learner/HousingParkingSection';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle } from 'lucide-react';

export function LearnerProfileExtended() {
  const { data, isLoading, error } = useLearnerExtended();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load learner profile: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 2.1: Student Information */}
      <StudentInfoSection
        data={{
          studentId: data?.studentId,
          enrollmentStatus: data?.enrollmentStatus,
          expectedGraduationDate: data?.expectedGraduationDate,
          actualGraduationDate: data?.actualGraduationDate,
          transferCredits: data?.transferCredits,
        }}
      />

      {/* Section 2.2: Emergency Contacts */}
      <EmergencyContactsSection
        data={{
          emergencyContacts: data?.emergencyContacts,
        }}
      />

      {/* Section 2.3: Parent/Guardian Information */}
      <ParentGuardianSection
        data={{
          parentGuardians: data?.parentGuardians,
        }}
        userAge={data?.age}
      />

      {/* Section 2.4: Identification Documents */}
      <IdentificationsSection
        data={{
          identifications: data?.identifications,
        }}
      />

      {/* Section 2.5: Prior Education */}
      <PriorEducationSection
        data={{
          priorEducation: data?.priorEducation,
        }}
      />

      {/* Section 2.6: Accommodations */}
      <AccommodationsSection
        data={{
          accommodations: data?.accommodations,
        }}
      />

      {/* Section 2.7: Housing & Parking */}
      <HousingParkingSection
        data={{
          housingStatus: data?.housingStatus,
          buildingName: data?.buildingName,
          roomNumber: data?.roomNumber,
          hasParkingPermit: data?.hasParkingPermit,
          parkingLotAssignment: data?.parkingLotAssignment,
          parkingPermitNumber: data?.parkingPermitNumber,
          vehicleMake: data?.vehicleMake,
          vehicleModel: data?.vehicleModel,
          vehicleLicensePlate: data?.vehicleLicensePlate,
        }}
      />
    </div>
  );
}
