let cache = {};
const TTL = 60 * 1000;

function cacheMiddleware(req, res, next) {
    if (req.method === 'GET') {
        const key = req.originalUrl;
        const cachedEntry = cache[key];

        if (cachedEntry) {
            const now = Date.now();
            if (now - cachedEntry.timestamp < TTL) {
                res.setHeader('X-Cache', 'HIT');
                return res.json(cachedEntry.data);
            } else {
                delete cache[key];
            }
        }
        
        res.setHeader('X-Cache', 'MISS');

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
        res.on('finish', () => {
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache = {};
                }
            }
        });
        next();
    }
}

module.exports = { cacheMiddleware };
