const simulationStore = new Map<string, any>();

export function saveSimulation(decisionId: string, simulation: any) {
  simulationStore.set(decisionId, simulation);
}

export function getSimulation(decisionId: string): any {
  return simulationStore.get(decisionId);
}
