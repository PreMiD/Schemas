require('dotenv').config();
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

app.get('/:schemaName/:version', async (req, res) => {
    const cacheKey = `${req.params.schemaName}-${req.params.version}`;

    if (req.query.purge !== undefined) {
        schemaCache.del(cacheKey);
        return res.send({ message: 'Cache cleared for this schema. Remove `?purge` and refresh.' });
    }

    const cachedSchema = schemaCache.get(cacheKey);
    if (!cachedSchema) {
        try {
            const result = await Axios.get(`https://cdn.jsdelivr.net/gh/premid/schemas/schemas/${req.params.schemaName}/${req.params.version}.json`);
            res.type('application/schema+json').send(result.data);
            schemaCache.set(cacheKey, result.data);
        } catch (e) {
            if (e.message === 'Request failed with status code 404') {
                res.status(404).send({ error: 'Schema not found.' });
            }
        }
    } else {
        res.type('application/schema+json').send(cachedSchema);
    }
});

app.listen(process.env.PORT);