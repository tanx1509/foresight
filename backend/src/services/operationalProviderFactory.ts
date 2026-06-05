import { OperationalProvider, MockOperationalProvider } from "./operational";

export function getOperationalProvider(): OperationalProvider {
  const providerType = process.env.OPERATIONAL_PROVIDER || "mock";
  
  switch (providerType.toLowerCase()) {
    case "azure":
      throw new Error("NotImplementedError: Azure OperationalProvider is not implemented yet.");
    case "github":
      throw new Error("NotImplementedError: GitHub OperationalProvider is not implemented yet.");
    case "mock":
    default:
      return new MockOperationalProvider();
  }
}
