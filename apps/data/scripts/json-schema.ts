// Generates a JSON Schema from the valibot venue schema so editors (VS Code YAML extension)
// can autocomplete and validate venue files as you type.
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { VenueSchema } from "@tennis/schema";
import { toJsonSchema } from "@valibot/to-json-schema";

const out = fileURLToPath(new URL("../schema/venue.schema.json", import.meta.url));
await mkdir(fileURLToPath(new URL("../schema", import.meta.url)), { recursive: true });
const schema = toJsonSchema(VenueSchema, { errorMode: "ignore", typeMode: "input" });
await writeFile(out, `${JSON.stringify(schema, null, 2)}\n`);
console.log("✓ apps/data/schema/venue.schema.json");
