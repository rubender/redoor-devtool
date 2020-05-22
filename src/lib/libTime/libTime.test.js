/* eslint-env jest */
/* eslint-disable padded-blocks, no-unused-expressions */
import mo from 'moment'

import Intl from 'intl';
global.Intl = Intl;


import './libTime'
describe('LibTest', () => {
  test('lib_test', () => {

    let d1 = new Date();
    d1.setDate(30)
    console.log('libTime.test.js -> d1: ',d1);
   //d1.addDay(1)
    let out = d1.format("YYYY-MMM-DD,MMMM [dddd,ddd,dd,d]  YY/MM/DD HH:mm:ss ");
    console.log('libTime.test.js -> out: ',out);
    d1.subMonth();
    out = d1.format("YYYY-MMM-DD,MMMM [dddd,ddd,dd,d]  YY/MM/DD HH:mm:ss ");
    console.log('libTime.test.js -> out: ',out);

    d1.subMonth(8);
    out = d1.format("YYYY-MMM-DD,MMMM [dddd,ddd,dd,d]  YY/MM/DD HH:mm:ss ");
    console.log('libTime.test.js -> out: ',out);


    expect(2 + 2).toBe(4);
  });
});

