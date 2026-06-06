import { OperationalProvider, MockOperationalProvider } from "../services/operational";
import { getCurrentSprint, getTeamCapacity } from "../services/azureDevops";

export class AzureDevOpsOperationalProvider implements OperationalProvider {
  private fallbackMock = new MockOperationalProvider();

  async getSprintMetrics(): Promise<any> {
    try {
      const iteration = await getCurrentSprint();
      const capacityData = await getTeamCapacity(iteration.id);

      let totalCapacityPerDay = 0;

      if (capacityData?.teamMembers) {
        capacityData.teamMembers.forEach((member: any) => {
          member.activities.forEach((activity: any) => {
            totalCapacityPerDay += activity.capacityPerDay || 0;
          });
        });
      }

      const start = new Date(iteration.attributes?.startDate);
      const end = new Date(iteration.attributes?.finishDate);

      let workingDays = 0;
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const day = currentDate.getDay();

        if (day !== 0 && day !== 6) {
          workingDays++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      const availableHours = totalCapacityPerDay * workingDays;

      const maxPossibleHours =
        (capacityData?.teamMembers?.length || 0) *
        8 *
        workingDays;

      const capacityPercentage =
        maxPossibleHours > 0
          ? Math.round((availableHours / maxPossibleHours) * 100)
          : 0;

      return {
        sprintName: iteration.name,
        startDate: iteration.attributes?.startDate,
        endDate: iteration.attributes?.finishDate,
        capacityPercentage,
        availableHours,
        velocity30Day: 0
      };
    } catch (err: any) {
      console.error(
        `Azure DevOps OperationalProvider Error: ${err.message}`
      );
      throw err;
    }
  }

  async getPRMetrics(): Promise<any> {
    return this.fallbackMock.getPRMetrics();
  }

  async getDeploymentMetrics(): Promise<any> {
    return this.fallbackMock.getDeploymentMetrics();
  }
}
