const path = require('path');

module.exports = {
    webpack: (config, options, webpack) => {
        if (options.env === 'production') {
            console.log('[5] backpack.config.js -> config: ',config);           
            config.devtool = false;
            //config.plugins.splice(1, 1);
            config.output.path = path.join(process.cwd(), 'dist');
        }
        return config;
    }
}
