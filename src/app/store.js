//import {Component, createContext, createElement} from 'react'
import { h, Component, createContext } from 'preact';
import createStoreFactory from '../lib/redoor/provider';

import * as actions_Connection  from './actions_Connection';
import * as actions_Data  from './actions_Data';

//const is_debug = process.env.NODE_ENV === 'development';

//const createStore = createStoreFactory({Component, createContext, createElement});//react
const createStore = createStoreFactory({Component, createContext, createElement:h});//preact

const { Provider, Connect } = createStore(
  [
    actions_Connection,
    actions_Data,
  ],
  false, // debug
);

export { Provider, Connect };

