import React from 'react';
import { ObjectInspector, ObjectRootLabel, ObjectLabel} from 'react-inspector';


import s from './debugger.css';

import ActionItem from './comp/ActionItem'

import { Connect } from './store';

const defaultNodeRenderer = ({ depth, name, data, isNonenumerable, expanded }) =>
  depth === 0
    ? name
    : <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />;



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

/** future */
/*
const _filterStateDeep = (r,obj) =>{
  let ret_obj = {}
  Object.keys(obj).map(key=>{
    if(key.match(r)) {
      ret_obj[key] = obj[key];
    }
    return key;
  })
  return ret_obj;
}*/
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

const _filterActions = (str,obj) => {
  let r = str;
  try {
    r = new RegExp(str,'g');
  }catch(e) {
    r = escapeRegExp(str);
  }

  let ret_obj = []
  obj.map(it=>{
    if(it.name.match(r)) {
      ret_obj.push(it);
    }
    return it;
  })

  return ret_obj.reverse();
}


class Debugger extends React.Component {
  body = null;
  constructor(props) {
    super(props);
    this.state = {};

    window.onbeforeunload = function() {
    }.bind(this);
  }
  componentDidMount() {
    this.props.cxRun('action_SoketConnection');
    this.setWidth(50,50);
  }




  /**
    move
  */
  move = false
  sz = 0
  sy = 0
  startMove = e => {
    this.move = true;
    document.addEventListener("mousemove", this.moveHanler,false);
    document.addEventListener('mouseup',this.stopMove,false);

    document.addEventListener('touchend',this.stopMove,false);
    document.addEventListener("touchmove", this.moveHanler,false);
  }

  stopMove = e => {
    this.move = false;
    document.removeEventListener('mouseup',this.stopMove);
    document.removeEventListener("mousemove", this.moveHanler);
    document.removeEventListener('touchend',this.stopMove);
    document.removeEventListener("touchmove", this.moveHanler);
  }

  moveHanler = e => {
    if(!this.move) return;

    const rec = this.box.getBoundingClientRect();
    let x = e.clientX - rec.x ;
    let w = rec.width - 11;
    let w2 = (w - x) / w * 100;
    let w1 = x / w * 100 ;
    this.col1.style.width = w1+"%";
    this.col2.style.width = w2+"%";
  }

  setWidth = (w1,w2) =>{
    this.col1.style.width = w1+"%";
    this.col2.style.width = w2+"%";
  }

  getBytes = (b) => {
    function readableBytes(bytes) {
      let i = Math.floor(Math.log(bytes) / Math.log(1024)),
      sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + '' + sizes[i];
    }
    return `${readableBytes(b)} (${b})`;
  }

  render()   {
    let {error,

      state_out,
      state_filter_val,
      actions_src,
      actions_filter_val,
      wsStatus,
      cxRun,
      parr,
      pcurr,
    } = this.props;

    //let state_out = _filterState(state_filter_val, state_src);

    let state_len = JSON.stringify(state_out).length;

    let actions_out = _filterActions(actions_filter_val, actions_src);

    return <div className={s.debugger}>
      <div className={s.projects}>
        {!parr.length && <div> app: wating data... </div>}

        {parr.map((it,v)=><div
                        key={v+"proj"}
                        className={s.pbo+" "+(it===pcurr ? s.pbo_active : '')}
                        onClick={e=>cxRun('action_selectProject',it)}
                      >
                        {it}
                      </div>)}
      </div>
      <div className={s.header}>
        <div className={s.hwrp}>-= Debugger
          [ <span onClick={e=>cxRun('action_clearStore')}>Store clear</span> &nbsp;
          <span onClick={e=>cxRun('action_clearActions')}>Actions clear</span> ]
          &nbsp;&nbsp;&nbsp;
          <span onClick={e=>this.setWidth(30,70)}>[.O]</span>
          <span onClick={e=>this.setWidth(50,50)}>[oo]</span>
          <span onClick={e=>this.setWidth(70,30)}>[O.]</span>
        </div>
        <div>debug server: <div className={s['ws_status_'+wsStatus]}>{wsStatus}</div> </div>
        <div className={s.fold}>&nbsp; =-</div>
      </div>
      <div className={s.switch}>

      </div>
      {error && <div className={s.error}>{error}</div>}
      <div className={s.inp}>
        <input type="text"
                value={state_filter_val}
                onChange={e=>cxRun('action_filterState',e.target.value)}
                placeholder={`filter (string or RegExp, ex. "^some|word$")`}
        />
        <input type="text"
                value={actions_filter_val}
                onChange={e=>cxRun('action_filterAction',e.target.value)}
                placeholder={`filter (string or RegExp, ex. "^some|word$")`}
        />
      </div>
      <div className={s.body} ref={box=>this.box=box} onMouseLeave={this.stopMove}>
        <div className={s.state}   ref={r=>this.col1=r}>
          {state_out && <ObjectInspector data={state_out} name="state" expandLevel={1} nodeRenderer={defaultNodeRenderer} />}
          <br/>
          <br/>
          {state_len ? this.getBytes(state_len) : ""}
        </div>
        <div className={s.sizer} onMouseDown={this.startMove} onTouchStart={this.startMove}></div>
        <div className={s.actions} ref={r=>this.col2=r}>
          {actions_out.map((it,v)=><ActionItem key={v}
                                              showStr={false}
                                                it={it}
                                                fnopen={it=>cxRun('action_unfoldAction',it)}
                                    />)}
        </div>
      </div>

    </div>
  }
}


export default Connect(Debugger);