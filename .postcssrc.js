let cfg =  {
      "modules": true,
      "plugins": {
        "autoprefixer": {    },
        "cssnano":{},
        "postcss-modules": {
          generateScopedName: "[name]_[local]"
        }
      }
};
if(process.env.NODE_ENV === 'production'){
    cfg = {
      "modules": true,
      "plugins": {
        "autoprefixer": {    },
        "cssnano":{},
        "postcss-modules": {
          generateScopedName: "[hash:base64:5]"
        }
      }
  }
}

module.exports = cfg;