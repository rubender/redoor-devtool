export const __module_name = 'actions_Connection';

//= ================================================================================
//              init
//= ================================================================================
let __socket = null;
let __initData = null;
let __setState = null;
let __getState = null;
let __emit = null;

export const bindStateMethods = (stateFn, updateState, emit) => {
  __getState = stateFn;
  __setState = updateState;
  __emit = emit;
};

export const initState = prop => {
  return {
    __name__: '-=< DEBUGGER >=-',
    wsStatus:'off',
  };
};

//= ================================================================================
//              WS
//= ================================================================================
//   START POINT:
//   Layout.js
//   componentDidMount() --->  this.props.cxRun('action_SoketConnection');
//

export const action_SoketConnection = async ({ args: user }) => {
  __socket && __socket.close();

  let host = window.__debuger && __debuger.HOST || 'localhost';
  let port = window.__debuger && __debuger.PORT || 8333;

  __socket = new WebSocket(`ws://${host}:${port}?dbg=dbg`);
  __socket.onerror = error => onConnectionError(error);
  __socket.onclose = event => onConnectionClose(event);
  __socket.onopen = event => onConnectionOpen(event);

  __socket.onmessage = event => {
    let d = { type: 'error' };
    try {
      d = JSON.parse(event.data);
    } catch (e) {
      d.msg = 'parse event error';
    }
    return wsRouter(d);
  };
}; // soketConnection

export const listen = (name, data) => {
  if (name === 'ws_send') {
    __socket.wsSend(data);
  }
  if (name === 'ws_connection_error' || name === 'ws_connection_close') {
    //setTimeout(action_SoketConnection({args:null}),1000);
  }
};

export const wsRouter = data => {
  __emit('ws_router', data);
};

const ws_CatchError = data => {
  console.error('actionsAdmin.js -> Errror data: ', data);
  onConnectionError(data);
};

const onConnectionOpen = event => {
  __setState({
    wsStatus: 'on'
  });
  __emit('ws_connection_open', event);
};

const onConnectionClose = event => {
  __setState({
    wsStatus: 'off',
  });
  __emit('ws_connection_close', event);
};

const onConnectionError = error => {
  __setState({
    wsStatus: 'error',
  });
  __emit('ws_connection_error', error);
};


