import serve from 'rollup-plugin-serve';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import hmr from 'rollup-plugin-hot'
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer'
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser'
import fs from 'fs';
import path from 'path';

const browsers = [  "last 2 years",  "> 0.1%",  "not dead"]
//['IE 6','Chrome 9', 'Firefox 14']

let is_production = process.env.BUILD === 'production';

const replace_cfg = {
  'process.env.NODE_ENV': JSON.stringify( is_production ? 'production' : 'development' ),
  preventAssignment:false,
}

const babel_cfg = {
      babelrc: false,
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              browsers: browsers
              //overrideBrowserslist: browsers
            },
          }
        ],
        "@babel/preset-react"
      ],
      exclude: 'node_modules/**',
      plugins: [
        "@babel/plugin-proposal-class-properties",
        //"@babel/plugin-syntax-async-generators",
        ["@babel/plugin-transform-runtime", {
           "regenerator": true
        }],
        [ "transform-react-jsx", { "pragma": "h" } ]
        //[ "transform-react-jsx" ]
      ],
      babelHelpers: 'runtime'
}



function copyAndWatch() {
    let db = {}
    return {
        name: 'generate_single_html',
        /*async buildStart() {
            this.addWatchFile('dist/index.js');
            this.addWatchFile('dist/index.css');
        },*/

        async writeBundle(bndle,files) {
          let js = files['index.js'].code;
          let css = files['index.css'].source;
          let code = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#000000">
    <link href="/dist/index.css" rel="stylesheet">
    <style>${css}</style>
  </script>
  </head>
  <body id="body">
    <script  type="module">${js}</script>
  </body>
</html>
              `
              fs.writeFile('dist/index.html', code, (err) => {
                if (err) { console.log('[84] rollup.config.js -> err: ',err)}
              });
        }

    }
}


function get_production_config(name,isServer) {
  let date = new Date();
  let sdate = [ date.getYear(), date.getMonth() + 1, date.getDate(), date.getHours(),date.getMinutes() ].join('')
  let inp = isServer ? 'src/server.js' : 'src/app/index.js';
  return {
    input: inp,
    output: {
      file: 'dist/'+name+'.js',
      format: 'iife',
      sourcemap: false,
      exports: 'named',
    },
    plugins: [
      replace(replace_cfg),
      postcss({
        plugins: [ autoprefixer(),   ],
        extract:true,
        modules: {
          generateScopedName: "[hash:base64:5]",
        },
        minimize:true,
      }),
      babel(babel_cfg),
      commonjs({
          sourceMap: false,
      }),
      nodeResolve({
          browser: true,
          jsnext: true,
          module: false,
      }),
      terser(),
      !isServer && copyAndWatch('in','out')
    ],
  }
}


const cfg = !is_production ? {
  input: [
    'src/app/index.js',
  ],
  output: {
    //assetFileNames:'[name]-[hash].[ext]',
    dir:'dist',
    format: 'iife',
    sourcemap: true,
    exports: 'named',
  },
  inlineDynamicImports: true,
  plugins: [
    replace(replace_cfg),
    babel(babel_cfg),
    postcss({
      plugins: [
        autoprefixer({
          overrideBrowserslist: browsers
          //browsers: browsers
        }),
      ]
    }),
    commonjs(
      {
        sourceMap: false,
      }
    ),
    nodeResolve(
      {
        browser: true,
        jsnext: true,
        module: false,
      }

      ),

    serve({
      open: false,
      host: 'localhost',
      port: 8001,
      //contentBase: 'dist',
    }),
    /*hmr({
      //inMemory: true,
      //port: 8555,
      //openPort: 33301,
    }),*/
  ],
} : [
  get_production_config('index'),
  get_production_config('server',true),
];


export default cfg;
