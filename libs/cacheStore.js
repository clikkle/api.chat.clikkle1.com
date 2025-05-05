// cache.js
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 0 , checkperiod: 12, useClones: false });

const getCache = (key) => {
    const value = cache.get(key);
    if (value) { 
        console.log(`Cache hit for key: ${key}`);
        return value;
    } else {
        console.error(`Cache miss for key: ${key}`);
    }
    return null
   
};

const setCache = (key, value) => {
    cache.set(key, value);
};

const delCache = (keys) => {
    cache.del(keys);
};

const flushCache = () => {
    cache.flushAll();
};

export { getCache, setCache, delCache, flushCache };
