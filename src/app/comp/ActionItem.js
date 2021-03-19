//import React from 'react';
import { h, Component } from 'preact';


//import { ObjectInspector, ObjectRootLabel, ObjectLabel} from 'react-inspector';
import  ObjectInspector from './ObjectInspector';
import s from './ActionItem.module.css';


const defaultNodeRenderer = ({ depth, name, data, isNonenumerable, expanded }) =>
  depth === 0
    ? name
    : <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />;



class ActionItem extends Component {
  constructor(props) {
    super(props);

    this.state ={
      on:true,
      strOn:false,
    }
  }

  getObjectString = (str)=>{
    let out = JSON.stringify(str,null,3);
    out = out.replace(/[\t ]/g,"&nbsp;");
    return out;
  }

  render() {
    let {it, showStr} = this.props;
    /*return <i onClick={e=>this.setState({on:!this.state.on})}  dangerouslySetInnerHTML={{__html:this.getObjectString(this.props.str)}}/>*/
    let str = "";
    if(!it.open) {
      str = JSON.stringify(it.args);
      if(str.length > 250) {
        str = str.substr(0,250)+"... ["+str.length+"]";
      }
    }

    let out_data = it.args;
    let out_name = ';'
    if(typeof it.args === 'string' ) {
      out_name = 'object'
    } else if(typeof it.args === 'array') {
      out_name = 'array []'
    } else {
      out_name = 'str'
    }

    return <div className={s.act+" "+s["action_"+it.type]}>
      <div className={s.action_bo} onClick={e=>this.props.fnopen(it)}>

        <div className={s.act_date}>
          {it.no}){it.date}
        </div>
        <div className={s.act_type}>
          [{it.type}]
        </div>
        <div className={s.act_name}>
          {it.name}
        </div>

      </div>
      {showStr && !it.open && <i>{str}</i>}
      {it.open && <i>
                      <ObjectInspector
                        data={( typeof it.args === 'string' ? {args:it.args} : it.args) }
                        name={( typeof it.args === 'string' ? "string" : "object") }
                        expandLevel={3}
                        nodeRenderer={defaultNodeRenderer}
                      />
                  </i>}
    </div>

  }
}

export default ActionItem;