-- CreateEnum
CREATE TYPE "RescheduleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "callDuration" INTEGER,
ADD COLUMN     "hasHadVideoCall" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rescheduleDate" TIMESTAMP(3),
ADD COLUMN     "rescheduleReason" TEXT,
ADD COLUMN     "rescheduleStatus" "RescheduleStatus" DEFAULT 'PENDING',
ADD COLUMN     "rescheduleTime" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "deletedForEveryone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fileMimeType" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "hasAttachment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDelivered" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qualification" TEXT,
    "specialties" TEXT[],
    "about" TEXT,
    "profilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallAssessment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE INDEX "CallAssessment_appointmentId_idx" ON "CallAssessment"("appointmentId");

-- CreateIndex
CREATE INDEX "CallAssessment_patientId_idx" ON "CallAssessment"("patientId");

-- CreateIndex
CREATE INDEX "CallAssessment_doctorId_idx" ON "CallAssessment"("doctorId");

-- CreateIndex
CREATE INDEX "CallAssessment_createdAt_idx" ON "CallAssessment"("createdAt");

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallAssessment" ADD CONSTRAINT "CallAssessment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallAssessment" ADD CONSTRAINT "CallAssessment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallAssessment" ADD CONSTRAINT "CallAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
