import createStore from '../lib/provider';

import * as actions_Connection  from './actions_Connection';
import * as actions_Data  from './actions_Data';

const is_debug = process.env.NODE_ENV === 'development';


const { Provider, Connect } = createStore(
  [
    actions_Connection,
    actions_Data,
  ],
  false, // debug
);

export { Provider, Connect };

