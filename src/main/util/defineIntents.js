export default function defineIntents(config) {
    const ret = {};

    for (let type in config) {
        if (config.hasOwnProperty(type)) {
            ret[type] = createIntent(type,  config[type]);
        }
    }

    return ret;
}

function createIntent(type, hasArgs) {
    let ret;

    if (!hasArgs) {
        ret = { type };
    } else {
        ret = (...args) => ({
            type,
            payload: args
        });
    }

    return ret;
}
