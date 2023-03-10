import fastify, { RequestGenericInterface } from "fastify";

if (process.env.NODE_ENV !== "production") await import("dotenv/config");

import helmet from "@fastify/helmet";
import got, { HTTPError } from "got";
import KeyV from "keyv";

export const schemaCache = new KeyV({
		ttl: 86_400,
	}),
	app = fastify();

app.register(helmet);

app.get("/", (_, reply) => reply.send({ date: new Date() }));

interface versionRequest extends RequestGenericInterface {
	Querystring: {
		purge?: string;
	};
	Params: {
		schemaName: string;
		version: string;
	};
}

app.get<versionRequest>("/:schemaName/:version", async (request, reply) => {
	const cacheKey = `${request.params.schemaName}-${request.params.version}`;

	if (request.query.purge !== undefined) {
		await schemaCache.delete(cacheKey);
		return reply.send({
			message: "Cache cleared for this schema. Remove `?purge` and refresh.",
		});
	}

	const cachedSchema = await schemaCache.get(cacheKey);
	if (cachedSchema) {
		reply.type("application/schema+json").send(cachedSchema);
		return;
	}

	try {
		const schema = await got
			.get(
				`https://raw.githubusercontent.com/PreMiD/Schemas/main/schemas/${request.params.schemaName}/${request.params.version}.json`
			)
			.json();

		await schemaCache.set(cacheKey, schema);
		reply.type("application/schema+json").send(schema);
	} catch (error) {
		/* c8 ignore next */
		if (!(error instanceof HTTPError)) return;

		switch (error.response.statusCode) {
			case 404:
				reply.status(404).send({ error: "Schema not found." });
				break;
			/* c8 ignore start */
			default:
				reply.status(500).send({ error: error.message });
				break;
			/* c8 ignore stop */
		}
	}
});

/* c8 ignore start */
if (process.env.NODE_ENV !== "test") {
	const url = await app.listen({
		host: "0.0.0.0",
		port: Number.parseInt(process.env.PORT || "80"),
	});

	// eslint-disable-next-line no-console
	console.log(`Listening on ${url}`);
}
/* c8 ignore stop */
