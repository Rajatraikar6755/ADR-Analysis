-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "doctorDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "patientDeleted" BOOLEAN NOT NULL DEFAULT false;
