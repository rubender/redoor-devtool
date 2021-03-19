import { h, Component } from 'preact';
//import React from 'react';
import s from './ObjectInspector.module.css';


let openObj = {}
function isOpen(key) {
  return !!openObj[key];
}
function close(key) {  return openObj[key] = false;}
function open(key)  {  return openObj[key] = true;}


function print(str) {
  if(str === 'null') return <div className={s.null}>null</div>;
  if(str.toString() === 'NaN') return <div className={s.number}>NaN</div>;
  if(typeof str === 'boolean') return <div className={s.boolean}>{str ? 'true' : 'false'}</div>;
  if(typeof str === 'number') return <div className={s.number}>{str}</div>;

  return <div className={s.string}>"{str}"</div>;
}

const ObjectInspector = props=>{
  let {data, lvl, change, openObj,rand} = props;
  let arr = Object.keys(data);
  return arr.map((key,num)=>{
    let v = data[key]
    let lbl = (lvl || '0:')+num+":";

    let isOpen = openObj[lbl];

    if(v === null || v === undefined) {
      return <div key={lbl} className={s.root}>
        <div className={s.item}><div className={s.keyEnd}>{key}:</div>
          <div className={s.null}>null</div>
        </div>
      </div>
    }

    if(Array.isArray(v)) {
      return <div key={lbl} className={s.root}>
          <div className={s.key+" "+(isOpen ? s.keyOpen : s.keyClose)} onClick={e=>change(lbl)}>{key}: <div className={s.otype}>Array[{v.length}] {isOpen ? '' : '...' }</div></div>
          {isOpen && <ObjectInspector openObj={openObj} change={change} data={v} lvl={lbl}/>}
      </div>
    }
    if(typeof v === 'object') {
      return <div key={lbl} className={s.root}>
          <div className={s.key+" "+(isOpen ? s.keyOpen : s.keyClose)} onClick={e=>change(lbl)}>{key}: <div className={s.otype}>Object({Object.keys(v).length}) {isOpen ? '' : '...' }</div></div>
          {isOpen && <ObjectInspector openObj={openObj} change={change} data={v} lvl={lbl}/>}
      </div>
    }else {
      return <div key={lbl} className={s.root}>
        <div className={s.item}><div className={s.keyEnd}>{key}:</div>
          {print(v)}
        </div>
      </div>
    }

  })
}



class ObjectInspectorWrp extends Component {
  constructor(props) {
    super(props);

    this.state ={
      rand:null,
      openObj:{}
    }
  }
/** not working -- future
  oldStr = null
  recalcObj = (d, data, obj, lvl) => {
    let arr = Object.keys(d);
    arr.map((key,num)=>{
        let v = data[key]
        let lbl = (lvl || '0:')+num+":";
        obj[lbl] = true;
        if(!!v && typeof v === 'object') {
          return this.recalcObj(v, data, obj, lbl);
        }
    });
    return obj;
  }
  componentWillUpdate(nextProps, nextState) {
    let data = nextProps.data
    let data_str = JSON.stringify(data);
    if(data_str !== this.oldStr) {
      this.oldStr = data_str;
      let openObj = this.recalcObj(data, data, this.state.openObj, '0');
      this.setState({
        openObj:{...openObj},
        rand:Math.random(),
      });
    }
  }
*/
  change = (lbl)=>{
    let openObj = this.state.openObj;
    openObj[lbl] = !openObj[lbl];
    this.setState({
      rand:Math.random(),
      openObj:{...openObj}
    });
  }
  render() {
    let {data} = this.props;
    return <ObjectInspector data={data} lbl={"0"} change={this.change} rand={this.state.rand} openObj={this.state.openObj}/>
  }
}

export default ObjectInspectorWrp;