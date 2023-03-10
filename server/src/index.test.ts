import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

import { app, schemaCache } from "./index.js";

describe("schemas", () => {
	test("/ should return date", async () => {
		const result = await app.inject({ url: "/" });

		expect(result.statusCode).toBe(200);
		expect(result.json()).toEqual({ date: expect.any(String) });
	});

	test("/metadata/1.0 should return metadata schema", async () => {
		const result = await app.inject({ url: "/metadata/1.0" }),
			schema = JSON.parse(
				await readFile("../schemas/metadata/1.0.json", "utf8")
			);

		expect(result.statusCode).toBe(200);
		expect(result.json()).toEqual(schema);
	});

	test("/metadata/1.0 should return cached metadata schema", async () => {
		const result = await app.inject({ url: "/metadata/1.0" }),
			schema = JSON.parse(
				await readFile("../schemas/metadata/1.0.json", "utf8")
			);

		expect(result.statusCode).toBe(200);
		expect(result.json()).toEqual(schema);
	});

	test("/metadata/1.0?purge should return metadata schema", async () => {
		expect(await schemaCache.has("metadata-1.0"));
		const result = await app.inject({ url: "/metadata/1.0?purge" });
		expect(!(await schemaCache.has("metadata-1.0")));

		expect(result.statusCode).toBe(200);
		expect(result.json()).toEqual({
			message: "Cache cleared for this schema. Remove `?purge` and refresh.",
		});
	});

	test("/metadata/1 should return 404", async () => {
		const result = await app.inject({ url: "/metadata/1" });

		expect(result.statusCode).toBe(404);
		expect(result.json()).toEqual({ error: "Schema not found." });
	});
});
