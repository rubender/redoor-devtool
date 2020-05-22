import React from 'react';
import ReactDOM from 'react-dom';
import Debugger from './debugger'
import { Provider } from './store';


let debbuger = document.createElement('div');
document.getElementsByTagName('body')[0].appendChild(debbuger)

ReactDOM.render(<Provider><Debugger /></Provider>, debbuger);

