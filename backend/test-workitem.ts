import "dotenv/config";
import { createWorkItem } from "./src/services/azureDevops";

async function test() {
  try {
    const res = await createWorkItem("Test Title", "Test Desc");
    console.log(res);
  } catch (err: any) {
    if (err.response) {
      console.log("Error Status:", err.response.status);
      console.log("Error Body:", err.response.data);
    } else {
      console.log(err.message);
    }
  }
}
test();
