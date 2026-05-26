import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? "3000");
const storePath =
  process.env.STORE_PATH ?? path.resolve(__dirname, "../data/clawcompass-store.json");

const app = createApp({ storePath });

app.listen(port, () => {
  console.log(`clawcompass-api listening on port ${port}`);
});
