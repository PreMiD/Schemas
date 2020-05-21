import 'dotenv/config';
process.env.LOG = process.env.LOG || 'true';
process.env.PORT = process.env.PORT || '8080';

import Axios from 'axios';

import Cache from 'node-cache';

import Express from 'express';
import Helmet from 'helmet';
import Morgan from 'morgan';

const schemaCache = new Cache({ stdTTL: 86400 });

const app = Express();
app.use(Helmet());

if (process.env.LOG === 'true')
    app.use(Morgan('tiny'));

app.get('/', (_, res) => res.send({ date: new Date() }));

app.get('/:schemaName/:version', async (req, res) => {
    const cacheKey = `${req.params.schemaName}-${req.params.version}`;

    if (req.query.purge !== undefined) {
        schemaCache.del(cacheKey);
        return res.send({ message: 'Cache cleared for this schema. Remove `?purge` and refresh.' });
    }

    const cachedSchema = schemaCache.get(cacheKey);
    if (!cachedSchema) {
        try {
            const result = await Axios.get(`https://api.github.com/repos/premid/schemas/contents/schemas/${req.params.schemaName}/${req.params.version}.json`);
            const decoded = JSON.stringify(JSON.parse(Buffer.from(result.data.content, 'base64').toString('utf-8')));
            schemaCache.set(cacheKey, decoded);
            res.type('application/schema+json').send(decoded); // gh encodes in base64
        } catch (e) {
            if (e.message === 'Request failed with status code 404') {
                res.status(404).send({ error: 'Schema not found.' });
            } else {
                res.status(500).send({ error: e.message });
            }
        }
    } else {
        res.type('application/schema+json').send(cachedSchema);
    }
});

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));