import React from 'react';

//import createInfernoContext from 'create-inferno-context';

/** Debugger plug functions */
let __dbg = false;
function __dbgSend(data) {} // plug will rewrite on open

/** Provider */
class Prevent extends React.PureComponent {
  render() {
    const { renderComponent, ...rest } = this.props;
    return renderComponent(rest);
  }
}

const CreateConnect = Consumer => (WrappedComponent, filterParam) => {
  //const mapStateToProps = !filterParam ? (state => state) : filterParam;
  let mapStateToProps;
  if (!filterParam) {
    mapStateToProps = state => state;
  } else {
    if (typeof filterParam === 'string') {
      filterParam = filterParam.replace(/\s+/g, '');
      let arr = filterParam.split(/[,]/g);

      mapStateToProps = state => {
        let res = {};
        arr.map(it => {
          if (it.length) {
            res[it] = state[it];
          }
          return it;
        });
        return res;
      };
    } else {
      mapStateToProps = filterParam;
    }
  }

  const renderComponent = props => <WrappedComponent {...props} />;

  const ConnectedComponent = props => (
    <Consumer>
      {state => {
        //context
        const filteredState = mapStateToProps(state || {});
        return (
          <Prevent
            renderComponent={renderComponent}
            {...props}
            {...filteredState}
          />
        );
      }}
    </Consumer>
  );

  ConnectedComponent.displayName = `Connect(${WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Unknown'})`;

  return ConnectedComponent;
};

const ProviderEx = (StoreContext, Modules) =>
  class Provider extends React.Component {
    constructor(props) {
      super(props);
      this.__actions = {};
      this.listeners = [];


      if (!Array.isArray(Modules)) {
        return console.error('Error: createStore() actions must be an array!');
      }

      let testActions = {};
      let testModules = {};
      let testInitState = {};

      Modules.forEach((module, mod_cnt) => {
        if(module.__module_name) {
          if(testModules[module.__module_name] === undefined) {
            testModules[module.__module_name] = module.__module_name;
          }else {
            __dbg && console.warn(`Duplicate modules name ${module.__module_name}`)
          }
        }else {
          __dbg && console.warn(`Module in createStore No:[${mod_cnt+1}] has no __module_name; add to file \nexport const __module_name = "your module name";`)
        }


        for (const action_name in module) {
          if (action_name.substr(0, 6) === 'action') {

            if(testActions[action_name] === undefined) {
              testActions[action_name] = module.__module_name || ' ';
            }else {
              let error_str = `Modules: ${module.__module_name} <-> ${testActions[action_name]} has dublicate action: ${action_name}`;
              __dbg && console.error(error_str);
              __dbg && __dbgSend({ type: 'error', name: 'initState', args: error_str});
            }

            this.__actions[action_name] = module[action_name];

          }
        }
      });

      let _initState;
      Modules.forEach((module,mod_cnt) => {
        if (module.initState) {
          let res;
          if (typeof module.initState == 'object') {
            res = module.initState;
          } else {
            res = module.initState(props.default);
          }
          Object.keys(res).map(key=>{
            if(testInitState[key] !== undefined) {
              __dbg &&
                __dbgSend({
                  type: 'error',
                  name: 'initState',
                  args: `Warning: ${testInitState[key]} - ${module.__module_name || `$Module No:[${mod_cnt}] in initState`} duplicate initState key [${key}]`,
                });
                __dbg &&
                  console.warn(
                    `Warning: ${testInitState[key]} - ${module.__module_name || `$Module No:[${mod_cnt}] in initState`} duplicate initState key [${key}]`,
                  );
            } else {
              testInitState[key] = module.__module_name || key;
            }
          })
          _initState = Object.assign({}, _initState, res);
        } else {
          __dbg &&
            __dbgSend({
              type: 'error',
              name: 'initState',
              args: `Warning: ${module.__module_name || `$Module No:[${mod_cnt}] in createStore`} Actions file has no initState`,
            });
          __dbg &&
            console.warn(
              `Warning: ${module.__module_name || `$Module No:[${mod_cnt}] in createStore`} Actions file has no initState`,
            );
        }
      });

      /* IS THIS NEED???
    let def = {
      ...props.default,
      ..._initState,
    }
    for(let key in props.default) {
      def[key] = props.default[key] || _initState[key];
    }

    Modules.map(module=>{
      for(let key in module.initState) {
        def[key] = props.default[key] || _initState[key];
      }
    });*/

      __dbg &&
        __dbgSend({ type: 'action', name: 'initState', args: _initState });

      this.state = {
        //...def,
        ..._initState,

        /*    cxSetObject :this.__updateObject,*/
        cxRun: this.__cxRun,
        cxEmit: this.__emit,
      };
      //console.log('provider.js -> this.state: ',this.state)
      Modules.map(
        module =>
          module.bindStateMethods &&
          module.bindStateMethods(
            () => this.state, //first parameter
            this.__updateState, //sendond parameter
            this.__emit, //thord paramter
          ),
      );

      Modules.map(module => {
        module.listen && this.listeners.push(module.listen);
      });
    } //constructor

    /*
    run action
    params:
    obj - string or object or function
    args - parameters for action
    resFn - callback success update state
  */
    __cxRun = (actionName, args, resFn = () => {}) => {
      try {
        let newstate;
        if (typeof actionName === 'string') {
          __dbg && __dbgSend({ type: 'action', name: actionName, args: args });

          newstate = this.__actions[actionName]({
            done: this.__updateState,
            state: this.state,
            actions: this.__actions,
            emit: this.__emit, // ??? TODO! IS THIS NEED ?
            /*actions:this.MDULES,*/ args: args,
          });
        }
        if (typeof actionName === 'object') {
          __dbg &&
            __dbgSend({ type: 'action', name: 'setState', args: actionName });

          newstate = actionName;
        }

        if (typeof actionName === 'function') {
          __dbg &&
            __dbgSend({
              type: 'action',
              name: 'setState',
              args: '[[function]]',
            });

          newstate = actionName;
        }

        this.setState(newstate, resFn);
      } catch (e) {
        if (!this.__actions[actionName]) {
          let err = 'provider.js -> No action function: [' + actionName + ']';
          __dbg && console.warn(err);

          __dbg && __dbgSend({ type: 'error', name: actionName, args: err });
        }

        __dbg &&
          __dbgSend({ type: 'error', name: actionName, args: e.toString() });

        __dbg &&
          console.error(
            'provider.js -> action_name [',
            actionName,
            '] Error: ',
            e,
          );
      }
    };

    // __cxRun
    __emit = (event, data) => {
      __dbg && __dbgSend({ type: 'emit', name: event, args: data });

      this.listeners.map(listener => {
        listener(event, data);
      });
    };

    __updateState = fn => {
      this.setState(fn);
    };

    render() {
      __dbg && __dbgSend({ type: 'state', name: 'state', args: this.state });

      return (
        <StoreContext.Provider value={this.state}>
          {this.props.children}
        </StoreContext.Provider>
      );
    }
  };

const createStore = (
  ACTIONS,
  dbg = null,
  //inferno = false
) => {

  __dbg = !!dbg;

  if (dbg) {
    let dbg_options = { host: 'localhost', port: '8666' };
    if (typeof dbg === 'object') {
      dbg_options = {
        ...dbg_options,
        ...dbg,
      };
    }
    runDebugger(dbg_options);
  }


  const StoreContext = React.createContext();
  //let StoreContext = createInfernoContext();

  const Provider = ProviderEx(StoreContext, ACTIONS);
  const Connect = CreateConnect(StoreContext.Consumer); // for react 16.??
  //const Connect = CreateConnect(StoreContext); // for react 16.??

  return {
    Provider,
    Connect,
  };
}; //fn

function runDebugger(dbg_opt) {
  let __ws = null;

  if(process.env.BROWSER) {
    __ws = new WebSocket(`ws://${dbg_opt.host}:${dbg_opt.port}`);

    __ws.onopen = msg => {
      let dbg_id = Math.random();
      __dbgSend = data => {
        data.user_id = dbg_id;
        __ws && setTimeout(()=>__ws.send(JSON.stringify(data)));
      };
    };
    __ws.onerror = error => {
      //console.log('Ошибка ' ,(error));
    };

    __ws.onclose = e => {
      //console.log('provider.js [316] -> close: ',e)
    }

  }

  window.onerror = function(msg, url, lineNo, columnNo, error) {
    __dbgSend({
      type: 'error',
      name: 'error',
      args: { msg, url, lineNo, columnNo, error: error.stack.toString() },
    });
  };
}

export default createStore;
