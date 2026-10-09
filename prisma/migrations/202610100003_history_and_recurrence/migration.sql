-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "recurrenceParentId" TEXT;

-- CreateTable
CREATE TABLE "GoalCompletion" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalCompletion_goalId_completedAt_idx" ON "GoalCompletion"("goalId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Task_recurrenceParentId_key" ON "Task"("recurrenceParentId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_recurrenceParentId_fkey" FOREIGN KEY ("recurrenceParentId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalCompletion" ADD CONSTRAINT "GoalCompletion_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
