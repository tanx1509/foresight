import { OperationalProvider, MockOperationalProvider } from "./operational";
import { AzureDevOpsOperationalProvider } from "../providers/AzureDevOpsOperationalProvider";

export function getOperationalProvider(): OperationalProvider {
  const providerType = process.env.OPERATIONAL_PROVIDER || "mock";
  
  switch (providerType.toLowerCase()) {
    case "azure":
      return new AzureDevOpsOperationalProvider();
    case "github":
      throw new Error("NotImplementedError: GitHub OperationalProvider is not implemented yet.");
    case "mock":
    default:
      return new MockOperationalProvider();
  }
}
