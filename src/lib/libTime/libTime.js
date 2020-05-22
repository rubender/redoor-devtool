const DAY_IN_MILLISEC = 1000 * 60 * 60 * 24;
const HOUR_IN_MILLISEC = 1000 * 60 * 60;
const MIN_IN_MILLISEC = 1000 * 60;
// const MIN_IN_MILLISEC  = 1000 * 60;
/* const CONV = {
  'MMMM': {type:'month',val:'long'},
  'MMM' : {type:'month',val:'short'},
  'MM'  : {type:'month',val:'2-digi'},
  'M'   : {type:'month',val:'numeric'},
  'DD'  : {type:'day',  val:'2-digit'},
  'D'   : {type:'day',  val:'numeric'},
} */
const CONVERT_WDAY = [6, 0, 1, 2, 3, 4, 5];

const POINT_1970  = (new Date(0)).getTime();
const POINT_2019  = (new Date('2019-01-01T00:00:00.000Z')).getTime();
const POINT_DELTA = POINT_2019 - POINT_1970;



_Date = function() {
  return new Date(...arguments);
}





function exzero(m) {
  return m < 10 ? '0' + m : m;
}
// import mo from 'moment'

const CONST_WO = {
  months: {
    format: 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split(
      '_',
    ),
    standalone: 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split(
      '_',
    ),
  },
  monthsShort: {
    // по CLDR именно "июл." и "июн.", но какой смысл менять букву на точку ?
    format: 'янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.'.split(
      '_',
    ),
    standalone: 'янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.'.split(
      '_',
    ),
  },
  weekdays: {
    standalone: 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split(
      '_',
    ),
    format: 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split(
      '_',
    ),
    isFormat: /\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?\] ?dddd/,
  },
  weekdaysShort: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
  weekdaysMin: 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
};

const converFunctionCreate = function(lcl) {
  function IntlFormat(obj, d) {
    return new Intl.DateTimeFormat(lcl, obj).formatToParts(d)[0].value;
  }

  return {
    // year
    YYYY(d) {
      return d.getFullYear();
    },
    YY(d) {
      return (d.getFullYear() + '').substr(2);
    },
    // months
    MMMJ(d) {
      return CONST_WO.months.format[d.getMonth()];
    },
    MMMM(d) {
      return CONST_WO.months.standalone[d.getMonth()];
    },
    MMJ(d) {
      return CONST_WO.monthsShort.format[d.getMonth()];
    },
    MMM(d) {
      return CONST_WO.monthsShort.standalone[d.getMonth()];
    },
    MM(d) {
      return exzero(d.getMonth() + 1);
    },
    M: function(d) {
      return d.getMonth() + 1;
    },
    // days
    DD(d) {
      return exzero(d.getDate());
    },
    D(d) {
      return d.getDate();
    },

    dddd(d) {
      return CONST_WO.weekdays.standalone[d.getDay()];
    },
    dddj(d) {
      return CONST_WO.weekdays.format[d.getDay()];
    },

    ddd(d) {
      return CONST_WO.weekdaysShort[d.getDay()];
    },

    d(d) {
      return d.getDay();
    },

    // hours
    HH(d) {
      return exzero(d.getHours());
    },
    H(d) {
      return d.getHours();
    },
    // minutes
    mm(d) {
      return exzero(d.getMinutes());
    },
    m: function(d) {
      return d.getMinutes();
    },

    sss(d) {
      return d.getMilliseconds();
    },

    // seconds
    ss(d) {
      return exzero(d.getSeconds());
    },
    s: function(d) {
      return d.getSeconds();
    },
  };
};

Date.prototype.setLocale = function(lcl) {
  this.__converFunctions = converFunctionCreate(lcl);
};

Date.prototype.__converFunctions = converFunctionCreate('ru');

Date.prototype.format = function(str) {
  const arr = str.match(
    /(YYYY|YY|MMMJ|MMMM|MMJ|MMM|MM|M|DD|D|dddd|dddj|ddd|dd|d|HH|H|mm|m|sss|ss|s)/g,
  );
  const time = this;
  let res = str;
  arr.map(it => {
    const fu = this.__converFunctions[it];
    if (!fu) return it;
    else {
      res = res.replace(new RegExp(it), fu(time));
      // fu(time);
    }
  });
  return res;
};
const W_INDEX = [6, 0, 1, 2, 3, 4, 5];
Date.prototype.wday = function() {
  return W_INDEX[this.getDay()];
};

Date.prototype.clone = function() {
  return new Date(this);
};

/**
(new Date()).chain(['add',1,])
????
*/
Date.prototype.chain = function(ch) {
  let self = this;
  for (let i = 0; i < ch.length; i++) {
    try {
      let f = ch[i];
      let p = ch[i + 1];
      if (typeof self[f] === 'function') {
        if (typeof self[p] === 'function') {
          self[f]();
        } else {
          self[f](p);
        }
      }
    } catch (e) {
      console.log('libTime.js [132] -> no function: ', ch[i]);
    }
  }
  return self;
};

Date.prototype.add = function(n, str) {
  if (str === 'day' || str === 'days') return this.addDay(n); //day
  if (str === 'week' || str === 'weeks') return this.addDay(n*7); //day
  if (str === 'hour' || str === 'hours') return this.addHour(n); //hour
  if (str === 'minute' || str === 'minutes') return this.addMinute(n); //minute
  if (str === 'month' || str === 'month') {
    if (n > 0) {
      return this.addMonth(n);
    } else {
      return this.subMonth(Math.abs(n));
    }
  }
  return this;
};

Date.prototype.addMinute = function(m) {
  const d = this.getTime() + MIN_IN_MILLISEC * m;
  this.setTime(d);
  return this;
};
Date.prototype.addMinutes = Date.prototype.addMinute;

Date.prototype.addHour = function(h) {
  const d = this.getTime() + HOUR_IN_MILLISEC * h;
  this.setTime(d);
  return this;
};
Date.prototype.addHours = Date.prototype.addHour;

Date.prototype.addDay = function(day) {
  const d = this.getTime() + DAY_IN_MILLISEC * day;
  this.setTime(d);
  return this;
};

Date.prototype.startOfDay = function() {
  this.setHours(0, 0, 0, 0);
  return this;
};

Date.prototype.startOfHour = function() {
  this.setMinutes(0, 0, 0);
  return this;
};

Date.prototype.endOfDay = function() {
  this.setHours(23, 59, 59, 999);
  return this;
};

Date.prototype.startOfMonth = function() {
  this.setHours(0, 0, 0, 0);
  this.setDate(1);
  return this;
};

Date.prototype.endOfMonth = function() {
  this.setDate(27);
  this.addDay(7);
  this.setDate(1);
  this.startOfDay();
  this.setTime(this.getTime() - 1);
  return this;
};

Date.prototype.startOfWeek = function() {
  this.startOfDay();
  this.addDay(-this.getUTCDay());
  return this;
};

Date.prototype.endOfWeek = function() {
  this.endOfDay();
  this.addDay(7 - this.getUTCDay());
  return this;
};

Date.prototype.addMonth = function(cnt = 1) {
  const day = this.getDate() - 1;
  for (let i = 0; i < cnt; i++) {
    this.endOfMonth();
    this.addDay(1);
  }
  const next = new Date(this);
  next.addDay(day);

  if (this.getMonth() !== next.getMonth()) {
    this.endOfMonth();
  } else {
    this.addDay(day);
  }
  return this;
};

Date.prototype.setStrH = function(str) {
  this.startOfDay();
  let arr = str.split(/:/g);
  arr[0] && this.setHours(parseInt(arr[0]));
  arr[1] && this.setMinutes(parseInt(arr[1]));
  arr[2] && this.setSeconds(parseInt(arr[2]));
  return this;
};

Date.prototype.replaceYMD = function(src_date) {
  return new Date(
    src_date.getFullYear(),
    src_date.getMonth(),
    src_date.getDate(),
    this.getHours(),
    this.getMinutes(),
    this.getSeconds(),
    this.getMilliseconds(),
  );
}


Date.prototype.subMonth = function(cnt = 1) {
  const day = this.getDate() - 1;
  for (let i = 0; i < cnt; i++) {
    this.startOfMonth();
    this.addDay(-1);
    this.startOfMonth();
  }
  const next = new Date(this);
  next.addDay(day);

  if (this.getMonth() !== next.getMonth()) {
    this.endOfMonth();
  } else {
    this.addDay(day);
  }
  return this;
};

Date.prototype.genCalendar = function(today = new Date()) {
  const t = new Date(this);
  const tp = new Date(today);
  tp.startOfDay();
  const point = tp.getTime();

  t.startOfMonth();
  t.startOfWeek();
  const str = [];
  const cMon = new Date(t);
  cMon.addDay(10);
  for (let i = 0; i < 5; i++) {
    const arr = [];

    for (let j = 0; j < 7; j++) {
      const c = new Date(t);
      c.startOfDay();

      arr.push({
        date: new Date(t),
        wday: t.getDay(),
        dnum: CONVERT_WDAY[t.getDay()],
        day: t.getDate(),
        currentMonth: cMon.getMonth() == t.getMonth(),
        today:
          today.getMonth() == t.getMonth() && today.getDate() == t.getDate(),
        ltToday: point > c.getTime(),
        gtToday: point < c.getTime(),
      });
      t.addDay(1);
    }
    str.push(arr);
  }

  return str;
};

Date.prototype.round = function(round)  {
  const df = {
    'second' :1, 'minute' :2, 'hour' :3, 'day' :4, 'month' :5,
    'seconds':1, 'minutes':2, 'hours':3, 'days':4, 'months':5,
  }
  this.setMilliseconds(0);

  df[round] >= 1 && this.setSeconds(0);
  df[round] >= 2 && this.setMinutes(0);
  df[round] >= 3 && this.setHours(0);
  df[round] >= 4 && this.setDate(1);
  df[round] >= 5 && this.setMonth(0);

  return this;
}

Date.prototype.match = function(_p) {
  let p = _p || '=';
  let self = this;

  return function(d2,round = 'minute') {
    let t1 = (new Date(self)).round(round);
    let t2 = (new Date(d2)).round(round);
    console.log('libTime.js [383] -> t1.getTime()>t2.getTime(): ',t1.getTime(),t2.getTime())

    if(p === '>') {
      return t1.getTime()>t2.getTime();
    }
    if(p === '<') {
     return t1.getTime()<t2.getTime();
    }
    return t1.getTime() === t2.getTime();
  }
}

Date.prototype.strFull = function() {
  return this.format("YYYY-MM-DD HH:mm:ss.sss");
}

Date.prototype.getShort = function() {
  return ~~( //floor
    ( this.getTime() - POINT_DELTA ) / 60000
  )
}

Date.prototype.setShort = function(n) {
  this.setTime(  n*60000 + POINT_DELTA  );
  return this;
}



Date.prototype.getShort2 = function() {
  return Math.floor( //floor
    ( this.getTime()  ) / 60000
  )
}

Date.prototype.setShort2 = function(n) {
  this.setTime(  n*60000   );
  return this;
}



Date.prototype.getDDays= function(){
  return ~~( (  this.getTime() - POINT_2019 ) / DAY_IN_MILLISEC )
}

Date.prototype.setDDays= function(d){
  this.setTime( (DAY_IN_MILLISEC*d) + POINT_2019)
  return this;
}