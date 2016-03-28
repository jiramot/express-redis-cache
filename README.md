# express-redis-cache

```
const redisOptions = require(path.resolve('config/config')).redis;
const cache = require('express-redis-cache').options(redisOptions).middlewares;
app.use(cache({ttl: 900}));
```

# npmjs
```
https://www.npmjs.com/package/redis-api-cache
```
