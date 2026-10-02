let cache = {};
const TTL = 60 * 1000; // 1 minute in milliseconds

function cacheMiddleware(req, res, next) {
    if (req.method === 'GET') {
        const key = req.originalUrl;
        const cachedEntry = cache[key];

        if (cachedEntry) {
            const now = Date.now();
            if (now - cachedEntry.timestamp < TTL) {
                // Cache hit and not expired
                res.setHeader('X-Cache', 'HIT');
                return res.json(cachedEntry.data);
            } else {
                // Cache expired
                delete cache[key];
            }
        }
        
        // Cache miss
        res.setHeader('X-Cache', 'MISS');

        // Intercept response to cache successful GET requests
        const originalJson = res.json;
        res.json = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache[key] = {
                    data: body,
                    timestamp: Date.now()
                };
            }
            return originalJson.call(this, body);
        };
        next();
    } else {
        // Intercept completion to invalidate cache on successful modification
        res.on('finish', () => {
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Invalidate all cache entries
                    cache = {};
                }
            }
        });
        next();
    }
}

module.exports = { cacheMiddleware };
