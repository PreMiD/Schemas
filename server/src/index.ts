import "dotenv/config";

import Axios from "axios";
import Cache from "node-cache";
import Express from "express";
import Helmet from "helmet";

process.env.LOG = process.env.LOG || "true";
process.env.PORT = process.env.PORT || "8080";

const schemaCache = new Cache({ stdTTL: 86400 });

const app = Express();
app.use(Helmet());

app.get("/", (_, res) => res.send({ date: new Date() }));

app.get("/:schemaName/:version", async (req, res) => {
	const cacheKey = `${req.params.schemaName}-${req.params.version}`;

	if (req.query.purge !== undefined) {
		schemaCache.del(cacheKey);
		return res.send({
			message: "Cache cleared for this schema. Remove `?purge` and refresh."
		});
	}

	const cachedSchema = schemaCache.get(cacheKey);
	if (!cachedSchema) {
		try {
			const result = await Axios.get(
				`https://api.github.com/repos/premid/schemas/contents/schemas/${req.params.schemaName}/${req.params.version}.json`
			);
			const decoded = JSON.stringify(
				JSON.parse(Buffer.from(result.data.content, "base64").toString("utf-8"))
			); // decode from base64 to utf-8, parse and stringify to minify JSON
			schemaCache.set(cacheKey, decoded); // cache immediately so other people's requests are faster
			res.type("application/schema+json").send(decoded);
		} catch (e) {
			if (e.message === "Request failed with status code 404") {
				res.status(404).send({ error: "Schema not found." });
			} else {
				res.status(500).send({ error: e.message });
			}
		}
	} else {
		res.type("application/schema+json").send(cachedSchema);
	}
});

app.listen(process.env.PORT, () =>
	console.log(`Server started on port ${process.env.PORT}`)
);
