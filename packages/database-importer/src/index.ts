import saveDataToFirebase from "./database/saveData"
import getConvertedData from "./sheets/getConvertedData"

async function runImport() {
  const oldData = await getConvertedData()
  saveDataToFirebase(oldData.routes, oldData.locations, oldData.providers)
}

runImport()
