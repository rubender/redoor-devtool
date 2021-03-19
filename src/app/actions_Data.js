//import * as R from 'ramda'

function R_clone(d) {
  return d;
  //return JSON.parse(JSON.stringify(d))
}


export const __module_name = 'actions_Data';

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

let OBJ_OBJ = {
  un:undefined,
  nl:null,
  na:NaN,
  inf:+Infinity,
  inf2:-Infinity,
  some:{
    file:{
      hello:'hello'
    },
    some2:{
      arr:[1,2,3,4]
    }
  },
  arra:{
    arr_ob:{
      arr2:[{a:1},{a:2}],
      dd:'fdfdf',
    }
  }
}

export const initState = prop => {
  return {
    state_src:{},
    state_out:{},
    state_filter_val:'',

    actions_src:[],
    actions_filter_val:'',
    actions_cnt:0,

    error:null,
    switch:true,
    unfolder:[],

    pcurr:null,
    parr:[],
  };
};


export const listen = (name, data) => {
  name === 'ws_router' && wsRouter(data);
};


let _projects  = {};
let _pcurr = null;

const wsRouter = data => {
  let {parr} = __getState();
  let proj_name = data.proj_name;
  if(_projects[proj_name] === undefined){
    _projects[proj_name] = {
      actions:[],
      actions_cnt:0,
      state:{},
    };
    parr.push(proj_name);
    __setState(parr);
  }
  if(_pcurr === null) {
    _pcurr = proj_name;
  }

  if(data.type === 'state') {
    ws_PushState(data)
  }else {
    ws_PushAction(data);
  }
  /*data.type === 'state'  && ws_PushState(data);
  data.type === 'action' && ws_PushAction(data);
  data.type === 'emit'   && ws_PushAction(data);
  data.type === 'error'  && ws_PushAction(data);
  data.type === 'warn'  && ws_PushAction(data);
  data.type === 'log'  && ws_PushAction(data);*/
};


function getDateStr() {
  let d = new Date();
  const ex = i => (i>9 ? i : "0"+i);
  return `${ex(d.getHours())}:${ex(d.getMinutes())}:${ex(d.getSeconds())}.${d.getMilliseconds()}`;
}


function ws_PushAction({proj_name, type, name, args, created}) {

  let actions_src = _projects[proj_name].actions;
  let actions_cnt = _projects[proj_name].actions_cnt;

  let obj = {
    _id:Date.now()+"_"+~~( Math.random() * 10000),
    type,
    date:getDateStr(),
    no:actions_cnt++,
    created,
    name,
    args:args || '',
    open:false,
  }

  actions_src.push(obj);

  _projects[proj_name].actions = actions_src;
  _projects[proj_name].actions_cnt = actions_cnt;

  if(_pcurr === proj_name) {
    __setState({
      actions_src:R_clone(actions_src),
    });
  }
}


function ws_PushState({proj_name, type, name, args }) {
  let state_src =  {...args};
  _projects[proj_name].state = state_src;

  if(_pcurr === proj_name) {
    let state_filter_val = __getState().state_filter_val;
    let state_out = _filterState(state_filter_val,R_clone(state_src));
    __setState({
      state_src:R_clone(state_src),
      state_out,
    });
  }
}


function updateProject() {
  let state_src = _projects[_pcurr].state;
  let actions_src = _projects[_pcurr].actions;
  __setState({
    state_src:R_clone(state_src),
    actions_src:R_clone(actions_src),
    pcurr:_pcurr,
  });
}





function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


const _filterStateFields = (r,obj) =>{
  let ret_obj = {}
  Object.keys(obj).map(key=>{
    if(key.match(r)) {
      ret_obj[key] = obj[key];
    }
    return key;
  })
  return ret_obj;
}


const  _filterState = (str, obj) => {

  let deep = false;

  if(str.substr(0,1) === '=') {
    str = str.substr(1);
    depp = true;
  }

  let r = str;
  try {
    r = new RegExp(str,'g');
  }catch(e){
    r = escapeRegExp(str);
  }

  /*if(deep) { // future
    return _filterStateDeep(r,obj);
  }*/
  return _filterStateFields(r,obj);
}

export const action_filterState =  ({ state, done, args: state_filter_val   }) => {
  let {state_src} = state;
  let state_out = _filterState(state_filter_val,R_clone(state_src));
  return {
    state_filter_val,
    state_out,
  }
};


export const action_filterAction = ({ state, done, args: actions_filter_val }) => ({actions_filter_val});


export const action_selectProject = ({ state, done, args: proj }) => {
  _pcurr = proj;
  updateProject();
}


export const action_clearActions = ({ state, done, args: it }) => {
  _projects[_pcurr].actions = [];
  _projects[_pcurr].actions_cnt = 0;

  updateProject();
}


export const action_clearStore = ({ state, done, args: it }) => {
  _projects[_pcurr].state = {}
  updateProject();
}


export const action_unfoldAction = ({ state, done, args: it }) => {

  let actions_src = state.actions_src.map(i=>{
    if(i._id === it._id) {
      it.open = !it.open;
    }
    return i;
  })

  return {
    actions_src
  };
}