#!/usr/bin/env node

console.log('redoor-devtool\n')
console.log('options:')
console.log('-o -- open browser after start (default: "google-chrome")')
console.log('-b [command] -- run command  (ex.: redoor-devtool -o -b firefox)')
console.log('\n\n')

require('../dist/server.js')(__dirname+'/../dist/index.html', function run(url){

    let arr =  process.argv;
    let run = 'google-chrome';
    let open = false;
    for(let i=0;i<arr.length;i++) {
      if(arr[i] === '-o') {  open = true;    }
      if(arr[i] === '-b' && arr[i+1].length>1) {      run = arr[i+1];    }
    }
    if(open) {
      const spawn = require('child_process').spawn;
      chrome = spawn(run, [url], { shell: true,detached: true,stdio: 'ignore'});
      chrome.unref(); // this one is important too
    }

});


