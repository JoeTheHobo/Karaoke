/*
    ----------------Simple----------------
          Use JavaScript but simply.
    Version: 16
    Created By: JoeTheHobo (John Jones)
    Email: johnjonesma@gmail.com
*/

//For Console Log - Ignore
let plugingLogs = [];
function pluginsIncludes(name,version) {
    plugingLogs.push({
        name: name,
        version: version,
    })
} 

Array.prototype.insert = function ( index, ...items ) {
    this.splice( index, 0, ...items );
};
Object.prototype.classRemove = function(classes) {
    if (this.length == undefined) {
        [this].classRemove(classes);
    } else {
        let arr = [];
        for (let i = 0; i < this.length; i++) {
            arr.push(this[i])
        }
        arr.classRemove(classes);
    }
    return this;
}
Object.prototype.classAdd = function(classes) {
    if (this.length == undefined) {
        [this].classAdd(classes);
    } else {
        let arr = [];
        for (let i = 0; i < this.length; i++) {
            arr.push(this[i])
        }
        arr.classAdd(classes);
    }
    return this;
}
Array.prototype.classAdd = function(classes) {
    let list = classes.split(" ")
    repeat(this,(object,i) => {
        repeat(list,(name,i) => {
            object.classList.add(name);
        })
    })
    return this;
}
Array.prototype.classRemove = function(classes) {
    let list = classes.split(" ")
    repeat(this,(object,i) => {
        repeat(list,(name,i) => {
            try {
                object.classList.remove(name);
            } catch {
                
            }
            
        })
    })
    return this;
}


Object.prototype.$P = function(x = 1) {
    let a = this;
    for (var i = 0; i < x; i++) {
        a = a.parentNode;
    }
    return a;
}
Object.prototype.$ = function(c) {
    if (this.length) {
        let all = [];
        for (let i = 0; i < this.length; i++) {
            all.push($(c,this[i]));
        }
        return all;
    } else return $(c,this); 
}
function $(selector,context = document) {
    if (selector.includes(' ')) {
        return selector.split(" ").map(s => $(s, context));
    } else {
        if(!'#.<'.includes(selector.charAt(0))) selector = '#' + selector;
        if (selector.charAt(0) == '<') selector = selector.charAt(selector.length-1) == '>' ? selector.substring(1,selector.length-1) : selector.substring(1,selector.length);
        const elements  = context.querySelectorAll(selector);
        return elements.length === 1 ? (elements[0]) : (elements.length === 0 ? false : Array.from(elements));
    }
}

Object.prototype.css = function(obj,val) {
    if (this.length) {
        for (let i = 0; i < this.length; i++) {
            this[i].css(obj,val)
        }
    }
    else {
        if (_type(obj).type == "string" && val) {
            newObj = {};
            newObj[obj] = val;
            obj = newObj;
        }
        for (let i = 0; i < Object.keys(obj).length; i++) {
            let key = Object.keys(obj)[i];
            let value = Object.values(obj)[i];
            if (_type(value).type == "number") value += "px";

            if (key == "absoluteCenter") {
                this.css({
                    position: "absolute",
                    margin: "auto",
                    left: value === "horizontal" || value === true ? 0 : '',
                    right: value === "horizontal" || value === true ? 0 : '',
                    top: value === "vertical" || value === true ? 0 : '',
                    bottom: value === "vertical" || value === true ? 0 : ''
                })
                continue;
            }
            if (key.orCompare("outline","border","display") && value == false) value = "none";
            if (key.orCompare("color","backgroundColor")) value = _color(value).color; 
            if (key.includes("margin") && key.length > 6) {
                if (key.toLowerCase().includes("left")) this.style.marginLeft = value;
                if (key.toLowerCase().includes("right")) this.style.marginRight = value;
                if (key.toLowerCase().includes("top")) this.style.marginTop = value;
                if (key.toLowerCase().includes("bottom")) this.style.marginBottom = value;
                continue;
            }
            if (key.includes("padding") && key.length > 7) {
                if (key.toLowerCase().includes("left")) this.style.paddingLeft = value;
                if (key.toLowerCase().includes("right")) this.style.paddingRight = value;
                if (key.toLowerCase().includes("top")) this.style.paddingTop = value;
                if (key.toLowerCase().includes("bottom")) this.style.paddingBottom = value;
                continue;
            }

            this.style[key] = value;
        }
    }
    return this;
}
Object.prototype.on = function(what,func) {
    if (this.length) {
        for (let i = 0; i < this.length; i++) {
            this[i].on(what,func)
        }
    } else {
        let actions = what.split(" ");
        for (let i = 0; i < actions.length; i++) {
            this.addEventListener(actions[i],function(e) {
                func.call(this,e);
            });
        }
    }

    return this;
}
Array.prototype.toLowerCase = function() {
    for (let i = 0; i < this.length; i++) {
        this[i] = this[i].toLowerCase();
    }
    return this;
}
Array.prototype.toUpperCase = function() {
    for (let i = 0; i < this.length; i++) {
        this[i] = this[i].toUpperCase();
    }
    return this;
}
String.prototype.rnd = function(amt = false,l=[]) {
    for (let i = 0; i < amt; i++) {
        l.push(this.charAt(rnd(0,this.length - 1)));
    }
    return amt !== false ? l : this.charAt(rnd(0,this.length - 1));
}
Array.prototype.rnd = function(amt = false,l=[]) {
    for (let i = 0; i < amt; i++) {
        l.push(this[rnd(0,this.length - 1)]);
    }
    return amt !== false ? l : this[rnd(0,this.length - 1)];
}

/*
    _type v2 Documentation
    _type(object) return a string of whatever the object is
    Detailed is set to false, if you set it too true it will give you a detailed explanation of the type
    All Types
    ------------
    number
    string
    array
    object
    boolean
    number
    function
    HTMLElement
    class
    symbol
    bigint
    null
    undefined
*/
function _type(ele) {
    if (ele == null || ele == undefined) {
        obj = {
            type: ele+"",
            value: ele,
        }
        return obj
    }
    
    let returnName = ele.constructor.name;
    if (ele instanceof HTMLElement) returnName = "HTMLElement";
    if (isClass(ele)) returnName = "class";

    let returnObj = {
        type: ele.constructor.name.toLowerCase(),
        detailedType: ele.constructor.name,
        constructor: ele.constructor,
        value: ele,
        isNumber: false,
    }
    if (returnName == "HTMLElement") {
        returnObj.type = "htmlelement";
        returnObj.parent = ele.$P();
        returnObj.children = ele.children;
    }
    if (returnObj.type == "number") {
        returnObj.length = (ele + "").length;
        returnObj.isNumber = true;
    }
    if (returnObj.type == "array") {
        returnObj.length = ele.length;

        let foundType = false;
        searching: for (let i = 0; i < ele.length; i++) {
            if (foundType === false) foundType = _type(ele[i]).type;
            else {
                if (foundType !== _type(ele[i]).type) {
                    foundType = undefined;
                    break searching;
                }
            }
        }
        if (foundType === undefined) returnObj.arrayType = "mixed";
        if (foundType === false) returnObj.arrayType = "empty";
        if (foundType === "number") returnObj.arrayType = "number";
        if (foundType === "string") returnObj.arrayType = "string";
        if (foundType === "array") returnObj.arrayType = "array";
        if (foundType === "object") returnObj.arrayType = "object";
    }
    if (returnObj.type == "string") {
        returnObj.length = ele.length;
        returnObj.isNumber = !isNaN(ele);
        if (ele.includes(" ") || ele === "") returnObj.isNumber = false;

        returnObj.isUpperCase = ele.toUpperCase() == ele;
        returnObj.isLowerCase = ele.toLowerCase() == ele;

        returnObj.isColor = false;
        
        try {
            JSON.parse(ele);
            returnObj.isJSON = true;
        } catch {
            returnObj.isJSON = false;

        }

        //Testing If Color
        //Hex
        if (ele.charAt(0) == "#" && _type(ele.substring(1,ele.length)).isNumber && (ele.length == 4 || ele.length == 5 || ele.length == 7 || ele.length == 8)) {
            returnObj.isColor = true;
            returnObj.colorType = "hex";
            returnObj.colorObject = _color(ele);
        }  
        //other colors
        if (ele.charAt(ele.length-1) == ")" && ele.includes(",")) {
            let colorTypes = ["rgb","rgba","cmyk","hsl","hsla","ryb","ryba"];
            
            let pass = false, colorType;

            for (let i = 0; i < colorTypes.length; i++) {
                if (ele.substring(0,colorTypes[i].length+1).toLowerCase() == colorTypes[i] + "(") {
                    pass = true;
                    colorType = colorTypes[i];
                }
            }

            if (pass) {
                returnObj.isColor = true;
                returnObj.colorType = colorType;
                returnObj.colorObject = _color(ele);
            }
        }

    }

    if (isClass(ele)) returnObj.type = "class";

    return returnObj;
    
}
function isClass(obj) {
    const isCtorClass = obj.constructor
        && obj.constructor.toString().substring(0, 5) === 'class'
    if(obj.prototype === undefined) {
      return isCtorClass
    }
    const isPrototypeCtorClass = obj.prototype.constructor 
      && obj.prototype.constructor.toString
      && obj.prototype.constructor.toString().substring(0, 5) === 'class'
    return isCtorClass || isPrototypeCtorClass
  }



  
  pluginsIncludes("_type",2);

//////////////////
//HOW TO USE RND//
//////////////////
//rnd(num) Returns random number 1 through your number
//rnd(num1,num2) Returns random number between first and second number
//
//rnd("color",none|"rgb"|"hex") Return random color (hex)
//rnd("abc"||"ABC"||"letter"||"LETTER"||"Abc"||"Letter") Return random letter from ABC. Captilized if string is
//////////////////

function rnd(num,to,exp) {
    if (!isNaN(num)) {
        while (true) {
            if (!to && to !== 0) {
                to = num;
                num = 1;
            }
            let finalNum = Math.floor((Math.random() * (to - num + 1)) + num);
            let checked = true; 
            if (exp) {
                if (!exp.length) exp = [exp];
                for (let i = 0; i < exp.length; i++) {
                    if (exp[i] == finalNum) checked = false;
                }
            }
            if (checked || !exp) return finalNum;
        }
    }

    if (typeof num == 'string') {
        if ((num.toLowerCase() == 'letter' || num.toLowerCase() == 'abc') && to !== false) {
            let abc = 'abcdefghijklmnopqrstuvwxyz';
            if (num === 'LETTER' || num === 'ABC') return abc.rnd().toUpperCase();
            if (num === 'Letter' || num === 'Abc') return rnd(2) == 2 ? abc.rnd().toUpperCase() : abc.rnd();
            return abc.rnd();
        }

        if (num == 'color') {
            if (to == 'hex' || !to) {
                let tool = '0123456789abcdef';
                return '#' + tool.rnd() + tool.rnd() + tool.rnd() + tool.rnd() + tool.rnd() + tool.rnd();
            }
            if (to == 'rgb') return 'rgb(' + rnd(0,255) + ',' + rnd(0,255) + ',' + rnd(0,255) + ')';

            return console.warn('Invalid Coler Format, try "hex" or "rgb"');
        }

        //Return Random Letter In String Num
        return num.rnd();
    }
    if (typeof num == 'object') {
        return num.rnd();
    }
}

/*
    Create Documentation

    --Create A Simple Div--
    create("div")

    --Give Classes And IDS--
    create("div #id .class")
        -Space Between Attributes
        Other Acceptable Ways To Write
        -id="id"
        -#=id
        -class="class"
    
    --Write InnerHTML--
    create("div>innerHTML");

    ------INPUTS--------
    Add Placeholders
    create("input placeholder=placeholder")
        -placeholderINSERTTEXT (Also acceptable Formating)
    
    Add input Types
    create("input type='checkbox')
        -typeTYPE (Also acceptable Formating)
    
*/
function create(ele,x = null) {
    return document.body.create(ele,x);
}
Object.prototype.create = function(elem,x = null) {
    let all = [];
    let type = false;
    class addition {
        constructor(obj) {
            this.names = obj.names.length ? obj.names : [obj.names];
            this.txt = '';
            this.on = false;
            this.control = obj.control;
            this.fix = obj.fix;
        }
    }
    all.push(new addition({
        names: ['#','id'],
        fix: function(ele) {
            ele.id = this.txt;
        },
    }))
    all.push(new addition({
        names: ['.','class'],
        fix: function(ele) {
            ele.className = this.txt;
        },
    }))
    all.push(new addition({
        names: ['type'],
        fix: function(ele) {
            ele.type = this.txt;
        },
    }))
    all.push(new addition({
        names: ['placeholder'],
        fix: function(ele) {
            ele.placeholder = this.txt;
        },
    }))
    let text = '';


    let element = '';
    let acceptable = [' ','>','.','#'];
    for (let i = 0; i < elem.length; i++) {
        if (elem.charAt(i) !== '<' && !acceptable.includes(elem.charAt(i))) element += elem.charAt(i);
        if (acceptable.includes(elem.charAt(i))) break;
    }
    for (let i = element.length; i < elem.length; i++) {
        let a = elem.charAt(i);

        let ban = ['<',' ','"',"'",'`','='];
        if (!ban.includes(a)) {
            all.forEach((e) => {
                let worked = e.names.length;
                let key = false;
                e.names.forEach((n) => {
                    let pass = true;
                    for (let k = 0; k < n.length; k++) {
                        if (elem.charAt(i+k) !== n.charAt(k)) {
                            pass = false;
                        }
                    }
                    if (!pass) worked--;
                    else key = n;
                });
                if (worked > 0) {
                    i += key.length - 1;
                    for (let j = i+1; j < elem.length; j++) {
                        if (!ban.includes(elem.charAt(j)) && !acceptable.includes(elem.charAt(j))) e.txt += elem.charAt(j);
                        if (acceptable.includes(elem.charAt(j))) {
                            i = j;
                            break;
                        }
                    }
                }
            })

            if(elem.charAt(i-1) == '>') {
                for (let j = i; j < elem.length; j++) {
                    text += elem.charAt(j);
                    i = j;
                }
            }
        }
    }

    let ele = document.createElement(element);
    all.forEach((e) => {
        if (e.txt) e.fix(ele);
    })
    if (text) ele.innerHTML = text;
    if (x !== null) {
    this.insertBefore(ele,this.children[x]);
    } else this.appendChild(ele);
    return ele;
}
/*
    Repeat Documentation

    --Repeat From 0 to x--
    repeat(x,(i) => {

    })
        -The Count Of The Loop Is Sent To The Functions Parameter

    --Start At Any Number--
    repeat(firstNum,LastNum,Function);

    --Repeat Through Arrays--
    let array = [1,2,3]
    repeat(array,(child,i) => {

    })
        -The Count of the loop, and the current child is sent to the functions Parameters;

    --Repeat Through Strings--
    let string = "abc"
    repeat(string,(child,i) => {
        
    })

    --Tips--

    -You Can Break a Loop by returning false in your functions

    --Inverting A List--
    Simply add a -1 parameter to the end of the repeat function to go backwards.
    repeat(count,function,-1)
        -You can do any number! It just controls the count of the loop. You can index by 2s and more!


    --Doing A While Loop--
    Setting First Parameter to true will make it iterate forever. Make sure to return false somewhere in the function.
    repeat(true,(iteration) => {

        return false;
    })
        -Iteration is passed to your functions parameters
        
*/
function repeat(count, func, func2, inverse = 1) {
    let startNum = 0;
    let countTo;
    let isInverse = inverse;
    let type = typeof count === 'string' ? 'string' : Array.isArray(count) ? 'array' : count === true ? 'while' : '';

    if (type === 'string' || type === 'array') {
        countTo = count.length;
    } else if (type === 'while') {
        let i = 0;
        while (true) {
            let resolve = func(i);
            if (resolve === false) break;
            i++;
        }
        return;
    } else {
        countTo = count;
    }

    if (func2 && typeof func2 === 'function') {
        startNum = count;
        isInverse = inverse;
        func = func2;
    }

    let iterator;
    if (isInverse > 0) {
        iterator = i => i < countTo;
    } else {
        iterator = i => i > startNum - 1;
    }

    for (let i = startNum; iterator(i); i += isInverse) {
        let wontKill = true;
        if (type === 'array') {
            wontKill = func(count[i], i);
        } else if (type === 'string') {
            wontKill = func(count.charAt(i), i);
        } else {
            wontKill = func(i);
        }
        if (wontKill === false) break;
    }
}
/*
    $MAP Documentation
    Example:
    let map = $MAP(5,5,function(i,j) {
        return i*j;
    });
    Example Written Out
    $MAP(height,width,(i,j) => { 
        let cell = null;
        return cell;
    })

*/
function $MAP(y,x=y,func = function() {return null}) {
    let map = [];
    for (let i = 0; i < y; i++) {
        let toPush = [];
        for (let j = 0; j < x; j++) {
            toPush.push(func(i,j))
        }
        map.push(toPush)
    }
    return map;
}


function s_shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
Array.prototype.shuffle = function() {
    return s_shuffle(this);
}
String.prototype.shuffle = function() {
    return s_shuffle(this.split('')).join("");
}


Array.prototype.sum = function() {
    return this.reduce((total,num) => { return total + num; });
}
Array.prototype.avg = function() {
    return this.sum()/this.length;
}
Array.prototype.high = function() {
    return Math.max(...this);
}
Array.prototype.low = function() {
    return Math.min(...this);
}
Array.prototype.median = function () {
    return this.slice().sort((a, b) => a - b)[Math.floor(this.length / 2)];
};
Array.prototype.mode = function() {
    let a = this;
    return Object.values(
    a.reduce((count, i) => {
        if (!(i in count)) {
        count[i] = [0, i];
        }
        
        count[i][0]++;
        return count;
    }, {})
    ).reduce((a, v) => v[0] < a[0] ? a : v, [0, null])[1];
}

function clone(orig) {
    return Object.assign(Object.create(Object.getPrototypeOf(orig)),orig);
}

/*
    Example code:
    slog('.[background: green; color: red;]Hello World'); //Out puts a log that says "Hello World" in red with a green background.
*/
window.slog = function() {
    let final = 'console.log(';
    if (!arguments.length) arguments = [''];
    for (let k = 0; k < arguments.length; k++) {
        let texts = [];
        let addons = [];
        let text = '';
        let prev = false;
        let txt = arguments[k] + '';
        if (txt !== '<br>') {
            for (var i = 0; i < txt.length; i++) {
                if (txt.charAt(i) == '.' && txt.charAt(i + 1) == '[') {
                    if (prev) {
                        texts.push(text);
                        text = '';
                    }
                    i += 2;
                    let add = '';
                    for (var j = i; j < txt.length; j++) {
                        if (txt.charAt(j) == ']') {
                            addons.push(add);
                            i = j;
                            j = txt.length;
                        } else {
                            add += txt.charAt(j);
                        }
                    }
                    prev = true;
                } else {
                    text += txt.charAt(i);
                }
            }
            texts.push(text);
            if (addons.length > 0) {
                for (var i = 0; i < texts.length - k; i++) {
                    final += ' "%c' + texts[i] + '" +';
                }
            } else if (k > 0) {
                final += "'" + texts + "''";
            } else {
                final += "'" + texts + "''";
            }
            final = final.substring(0, final.length - 1);
            final += ',';
            for (var i = 0; i < addons.length; i++) {
                final += ' "' + addons[i] + '",';
            }   
            final = final.substring(0, final.length - 1);
            final += ',';
        } else {
            final += `"<br>",`;
        }
    }
    final = final.substring(0,final.length - 1) + ')';
    eval(final);
}
sloglibrary = function(v,n,c) {
slog('.[background: lightgreen; font-weight: bold; font-size: 14px; color: black]V' + v + ' Library .[background: lightgreen;font-weight: bold; font-size: 20px; color: black]' + n + '.[background: lightgreen;font-weight: bold; font-size: 14px; color: black] ' + c);
}
slogplugin = function(v,n,c) {
    slog('.[background: lightyellow; color: black;font-weight: bold; black;font-size: 14px]V' + v + ' Plugin .[background: lightyellow;font-weight: bold;color: black; font-size: 20px]' + n +'.[background: lightyellow;color: black;font-weight: bold; font-size: 14px] ' + c);
}
slogIncludes = function(text) {
    slog(`.[font-size: 12px; background: silver; color: black;]${text}`)
}







/*
LS Version 3

Localstorage! LS object
ls.save(name, value)  -  Save any value (arrays, objects, numbers, strings) to a given name.
ls.get(name, result)  -  Returns the value of the name given, and if it can't find anything returns result.
ls.clear()  -  Deletes all items.
ls.delete(name)  -  Deletes that one item with given name.
ls.log()  -  Logs all the items in your Localstorage.
ls.facts() - Get Storage Usage Facts For Various Drives
*/

window.ls = {
    uniqueID: false,
    setID: function(id) {
        ls.uniqueID = id;
    },
    save: function(saveName,whatToSave) {
        let add = ls.uniqueID ? "/ui/" + ls.uniqueID + "/ui/" : "";
        localStorage.setItem(add + saveName,JSON.stringify(whatToSave))
    },
    get: function(saveName,elseReturn = false,byPass) {
        let add = ls.uniqueID ? "/ui/" + ls.uniqueID + "/ui/" : "";
        if (byPass) add = "";
        try {
            if (localStorage.getItem(add+saveName) == null || localStorage.getItem(add+saveName) == undefined) return elseReturn;
            else if (localStorage.getItem(add+saveName) == "undefined") return undefined;
            else return JSON.parse(localStorage.getItem(add+saveName));
        } catch {
            console.log("Local Storage Skipped")
        }
        
    },
    clear: function(deleteAll = false) {
        if (deleteAll) localStorage.clear();
        else {
            if (ls.uniqueID) {
                repeat(Object.keys(localStorage),(name,i) => {
                    if (name.includes("/ui/" + ls.uniqueID + "/ui/")) {
                        ls.delete(name,true)
                    }
                })
            } else
                console.warn("Local Storage: No uniqueID set, to delete all cookies write ls.clear(true), or set UniqueID by writing ls.setUniqueID(yourID)");
        }
    },
    delete: function(saveName,byPass) {
        let add = ls.uniqueID ? "/ui/" + ls.uniqueID + "/ui/" : "";
        if (byPass) add = "";
        localStorage.removeItem(add + saveName);
    },
    log: function(logAll = false) {
        if (!logAll) 
            if (ls.uniqueID) logAll = false;

        let matchId = logAll !== false ? logAll : ls.uniqueID;

        logAll === true ? slog(".[background:white;color:black;font-size:15px]LS is Logging All Storages") : slog(".[background:white;color:black;font-size:15px]LS is Logging '" + matchId + "' Storage");
        
        if (logAll === true) {
            let groups = ls.getArrayOfMe();
            for (let i = 0; i < groups.length; i++) {
                let group = groups[i];
                slog(`.[font-weight: bold;color:black;background:silver;font-size:10px]In Storage '${group.name}':`);
                for (let i = 0; i < group.storage.length; i++) {
                    let obj = group.storage[i];
                    console.log(obj.key + ": ",obj.value)
                }
            }
        } else {
            for (let i = 0; i < Object.keys(localStorage).length; i++) {
                if (Object.keys(localStorage)[i].includes("/ui/" + matchId + "/ui/")) {
                    console.log(Object.keys(localStorage)[i].split("/ui/" + matchId + "/ui/")[1] + ": ", ls.get(Object.keys(localStorage)[i],false,true))
                }
            }
        }
    },
    facts: function() {
        let groups = ls.getArrayOfMe();

        var _lsTotal = 0,
            _xLen, _x;
        for (_x in localStorage) {
            if (!localStorage.hasOwnProperty(_x)) {
                continue;
            }
            _xLen = ((localStorage[_x].length + _x.length) * 2);
            _lsTotal += _xLen;
            let newObj = {
                key: _x.substring(0, 50),
                value: (_xLen / 1024).toFixed(2),
            }
            let within = false;
            if (newObj.key.includes("/ui/")) {
                within = newObj.key.split("/ui/")[1];
                newObj.key = newObj.key.split("/ui/")[2];
                
            }

            repeat(groups,(group,i) => {
                if (within && group.name !== within) {
                    return;
                }
                repeat(group.storage,(obj,j) => {
                    if (obj.key == newObj.key) {
                        obj.space = (_xLen / 1024).toFixed(2);
                        group.space += Number((_xLen / 1024).toFixed(2));
                    }
                })
            })
        };

        let TotalUsed = (_lsTotal / 1024).toFixed(2);
        let percent = Math.round((TotalUsed / 5000)*10000)/100;



        slog(".[background:white;color:black;font-size:15px]--LS FACTS--")
        slog("Total Storage: 5000 KB");
        slog("Total Used: " + TotalUsed + " KB (" + percent + "%)");
        repeat(groups,(group,i) => {
            slog(`.[font-weight: bold;color:black;background:silver;font-size:12px]Storage '${group.name}' uses ${group.space.toFixed(2)} KB:`);
            repeat(group.storage,(obj,j) => {
                console.log(obj.key + ": " + obj.space + " KB")
            })
        })
    },
    getArrayOfMe: function() {
        let groups = [{name:"General Storage",storage:[],space:0}];
        for (let i = 0; i < Object.keys(localStorage).length; i++) {

            if (!Object.keys(localStorage)[i].includes("/ui/")) {
                groups[0].storage.push({
                    key: Object.keys(localStorage)[i],
                    value: ls.get(Object.keys(localStorage)[i],false,true),
                    space: 0,
                })
            } else {
                let foundGroup = false;
                let keyName = Object.keys(localStorage)[i].split("/ui/")[1]
                repeat(groups,(obj,i) => {
                    if (obj.name == keyName) foundGroup = i;
                })
                if (!foundGroup) {
                    groups.push({
                        name: keyName,
                        storage: [
                            {
                                key: Object.keys(localStorage)[i].split("/ui/")[2],
                                value: ls.get(Object.keys(localStorage)[i],false,true),
                                space: 0,
                            }
                        ],
                        space: 0,
                    })
                } else {
                    groups[foundGroup].storage.push(
                        {
                            key: Object.keys(localStorage)[i].split("/ui/")[2],
                            value: ls.get(Object.keys(localStorage)[i],false,true),
                            space: 0,
                        }
                    )
                }
            }
        }
        return groups;
    },
}
pluginsIncludes("ls",3.1);





/*

-------------
---DOM  V1---
-------------

domElement.fadeOut(speedInMS);
domElement.fadeIn(speedInMS);
domElement.hide();
domElement.show();
domElement.delete();
domElement.getSize() (Return width and height object)
domElement.slideIn("width"/"height",speedInMS);
domElement.slideOut("width"/"height",speedInMS);
domElement.hover(cssObj);

*/
/*
    _warning Documentation

    let a = new _warning({
        text: "hey", -Optional popup text
        time: [miliseconds], -Optional time popup is on screen
        fade: true/false, -Optional if popup fades in and out
        speed: [miliseconds], -Optional speed of fade in and out
        css: {}"css", -Optional Control CSS
    });
    a.show("I'm A Bunny, And I really like to dance");

    _warning.show(text [string] optional, time [milliseconds] optional);
*/

class _warning {
    constructor(obj = {}) {
        if (obj.css)
            this.css = obj.css;
        
        this.css.color = obj.css.color ?? "white";
        this.css.background = obj.css.background ? obj.css.background : "#414141ee";
        this.css.borderRadius = obj.css.borderRadius ? obj.css.borderRadius : "5px";
        this.css.width = obj.css.width ? obj.css.width : "80%";
        this.css.maxWidth = obj.css.maxWidth ? obj.css.maxWidth : "500px";
        this.css.height = obj.css.height ? obj.css.height : "";
        this.css.padding = obj.css.padding ? obj.css.padding : "5px";
        this.css.position = obj.css.position ? obj.css.position : "fixed";
        this.css.left = obj.css.left ? obj.css.left : 0;
        this.css.right = obj.css.right ? obj.css.right : 0;
        this.css.bottom = obj.css.bottom ? obj.css.bottom : "50px";
        this.css.top = obj.css.top ? obj.css.top : "";
        this.css.margin = obj.css.margin ? obj.css.margin : "auto";
        this.css.textAlign = obj.css.textAlign ? obj.css.textAlign : "center";
        this.css.lineHeight = obj.css.lineHeight ?? (obj.css.height ?? "");
        this.css.fontSize = obj.css.fontSize ? obj.css.fontSize : "20px";
        this.css.opacity = obj.css.opacity ? obj.css.opacity : 0;
            
        
        this.text = obj.text ? obj.text : "";
        this.time = obj.time ? obj.time : 1000;
        this.fade = obj.fade ? obj.fade : true;
        this.speed = obj.speed ? obj.speed : 5000;
        if (!this.fade) {
            this.css.opacity = obj.opacity ? obj.opacity : 1;
        }
        this.css.transition =  obj.transition ? obj.transition : "all " + (this.speed/10000) + "s ease-in-out";

    }
    show(text = this.text,time = this.time) {
        this.div = document.body.create("div");
        this.div.css(this.css);
        this.div.css({
            zIndex: 1000,
        })
        this.div.innerHTML = text;

        let div = this.div;
        if (this.fade) {
            setTimeout(function() {
                div.style.opacity = 1;
                
            },1)
        }
        
        let ele = this;
        setTimeout(function() {
            
            if (ele.fade) {
                setTimeout(function() {
                    div.style.opacity = 0;
                    
                    setTimeout(function() {
                        ele.hide();
                    },ele.speed)
                },1)
            } else {
                ele.hide();
            }
        },time)
    }
    hide() {
        this.div.remove();
    }
}


Object.prototype.fadeOut = function(ms = 1000,whatHappensToMe = "hidden") {
    let element = this;
    this.css({
        transition: "opacity " + (ms/1000) + "s",
        opacity: 1, 
    })

    setTimeout(function() {
        element.css({
            opacity: 0,
        })
        setTimeout(function() {
            element.css({
                visibility: whatHappensToMe,
            })
        },ms)
    },1)
}
Object.prototype.fadeIn = function(ms = 1000,whatHappensToMe = "visible") {
    let element = this;
    this.css({
        transition: "opacity " + (ms/1000) + "s",
        opacity: 0, 
        visibility: whatHappensToMe,
    })

    setTimeout(function() {
        element.css({
            opacity: 1,
        })
    },1)
}
Object.prototype.show = function(as = "block") {
    if (this.length) {
        for (let i = 0; i < this.length; i++) {
            this[i].show(as);
        }
    } else {
        this.style.display = as;
    }
}
Object.prototype.hide = function() {
    if (this.length) {
        for (let i = 0; i < this.length; i++) {
            this[i].hide();
        }
    } else {
        this.style.display = "none";
    }
}
Object.prototype.getSize = function() {
    let node = this.cloneNode();

    node.style.transition = "";
    node.style.maxWidth = window.innerWidth + "px";
    node.style.maxHeight = window.innerHeight + "px";
    node.style.visibility = "visible";

    document.body.appendChild(node)

    let object = {
        width: node.offsetWidth,
        height: node.offsetHeight,
    }
    
    node.delete();

    return object;
} 


Object.prototype.slideOut = function(where = "width",speedMS = 500) {
    let whatToTransition = "max-" + where;

    let element = this;
    this.css({
        transition: whatToTransition + " " + (speedMS/1000) + "s",
    })

    if (whatToTransition == "max-width") this.style.maxWidth = this.offsetWidth + "px";
    else this.style.maxHeight = this.offsetHeight + "px";

    setTimeout(function() {
        if (whatToTransition == "max-width") element.style.maxWidth = "0px";
        else element.style.maxHeight = "0px";

        setTimeout(function() {
            element.css({
                visibility: "hidden",
            })
        },speedMS)
    },1)
}
Object.prototype.slideIn = function(where = "width",speedMS = 500) {
    let whatToTransition = "max-" + where;

    let element = this;
    this.css({
        transition: whatToTransition + " " + (speedMS/1000) + "s",
        visibility: "visible",
    })

    if (whatToTransition == "max-width") {
        this.style.maxWidth = "0px";
        this.style.maxHeight = "100%";
    } else {
        this.style.maxHeight = "0px";
        this.style.maxWidth = "100%";
    } 

    setTimeout(function() {
        if (whatToTransition == "max-width") element.style.maxWidth = element.getSize().width + "px";
        else element.style.maxHeight = element.getSize().height + "px";
    },1)
}
Object.prototype.hover = function(obj) {
    this.hoverSaves = this.hoverSaves ? this.hoverSaves : [];
    for (let i = 0; i < Object.keys(obj).length; i++) {
        this.hoverSaves.push({
            key: Object.keys(obj)[i],
            value: eval("this.style." + Object.keys(obj)[i]),
            newVal: Object.values(obj)[i]
        })
    }
    this.on('mouseover',function() {
        for (let i = 0; i < this.hoverSaves.length; i++) {
            eval('this.style.' + this.hoverSaves[i].key + ' = "' + this.hoverSaves[i].newVal + '"')
        }
    });
    this.on('mouseout',function(obj) {
        for (let i = 0; i < this.hoverSaves.length; i++) {
            eval('this.style.' + this.hoverSaves[i].key + ' = "' + this.hoverSaves[i].value + '"')
        }
    });
}

pluginsIncludes("DOM",1);

/*
    Currently Working:
    innerHTML
    placeholder
    src
    id
    className
    href
    title
    disabled
    checked
    alt
    target
    type
    size
    pattern

    Cant Work:
    Value
    maxlength

    Havent Attemped:
    style
    min
    max
    rows
    cols
    readonly
    contenteditable
    data-*
    download
    rel
    autocomplete
    autofocus
    controls
    form
    formaction
    formenctype
    formmethod
    formtarget
    muliple
    required
    tabindex
    translate
    aria-*
    lang
    scrolling
    sandbox
    charset
    defer
    async
    integrity
    media
    sizes
    usemap
    datetime
    poster
    loop
    muted
    preload
    open
    label
    selected
    wrap
*/


Object.defineProperty(Array.prototype, 'pattern', {
    get: function() {
        // When accessing the property, return the innerHTML of the first element
        return this[0] ? this[0].pattern : '';
    },
    set: function(pattern) {
        // When setting the property, set innerHTML for all elements in the array
        this.forEach(element => {
            if (element) {
                element.pattern = pattern;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'size', {
    get: function() {
        // When accessing the property, return the innerHTML of the first element
        return this[0] ? this[0].size : '';
    },
    set: function(size) {
        // When setting the property, set innerHTML for all elements in the array
        this.forEach(element => {
            if (element) {
                element.size = size;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'innerHTML', {
    get: function() {
        // When accessing the property, return the innerHTML of the first element
        return this[0] ? this[0].innerHTML : '';
    },
    set: function(html) {
        // When setting the property, set innerHTML for all elements in the array
        this.forEach(element => {
            if (element) {
                element.innerHTML = html;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'placeholder', {
    get: function() {
        // When accessing the property, return the placeholder attribute of the first element
        return this[0] ? this[0].placeholder : '';
    },
    set: function(placeholder) {
        // When setting the property, set the placeholder attribute for all elements in the array
        this.forEach(element => {
            if (element && element.tagName.toLowerCase() === 'input') {
                element.placeholder = placeholder;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'value', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].value : '';
    },
    set: function(value) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.value !== 'undefined') {
                element.value = value;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'id', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].id : '';
    },
    set: function(id) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.id !== 'undefined') {
                element.id = id;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'className', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].class : '';
    },
    set: function(className) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.className !== 'undefined') {
                element.className = className;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'href', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].class : '';
    },
    set: function(href) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.href !== 'undefined') {
                element.href = href;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'title', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].class : '';
    },
    set: function(title) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.title !== 'undefined') {
                element.title = title;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'disabled', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].class : '';
    },
    set: function(disabled) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.disabled !== 'undefined') {
                element.disabled = disabled;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'checked', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].class : '';
    },
    set: function(checked) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.checked !== 'undefined') {
                element.checked = checked;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'alt', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].class : '';
    },
    set: function(alt) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.alt !== 'undefined') {
                element.alt = alt;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'target', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].class : '';
    },
    set: function(target) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.target !== 'undefined') {
                element.target = target;
            }
        });
    }
});
Object.defineProperty(Array.prototype, 'type', {
    get: function() {
        // When accessing the property, return the value property of the first element
        return this[0] ? this[0].class : '';
    },
    set: function(type) {
        // When setting the property, set the value property for all elements in the array
        this.forEach(element => {
            if (element && typeof element.type !== 'undefined') {
                element.type = type;
            }
        });
    }
});

























































//Lorem
let lorem_elements = $("<lorem");
if (!lorem_elements.length) lorem_elements = [lorem_elements];
for (let i = 0; i < lorem_elements.length; i++) {
    let wordCount = 50;
    let paragraphs = 1;
    if (lorem_elements[i].id) {
        let idSplit = lorem_elements[i].id.split(",")
        wordCount = Number(idSplit[0]);
        if (idSplit[1]) paragraphs = Number(idSplit[1]);
    }

    
    lorem_elements[i].innerHTML = lorem(Number(wordCount),Number(paragraphs));
}


function lorem(words,paragraphs=1) {
    let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id nibh tortor id aliquet lectus proin. Urna nunc id cursus metus aliquam. Vitae justo eget magna fermentum iaculis eu non. Phasellus faucibus scelerisque eleifend donec. Accumsan tortor posuere ac ut consequat semper viverra. Est pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus. Consectetur a erat nam at lectus urna duis. In iaculis nunc sed augue. Purus sit amet luctus venenatis lectus magna fringilla urna porttitor. Mi eget mauris pharetra et ultrices neque. Id interdum velit laoreet id donec ultrices tincidunt arcu. Pharetra sit amet aliquam id diam. Ac turpis egestas maecenas pharetra convallis posuere morbi. Convallis posuere morbi leo urna molestie at elementum eu.'
    let textSplit = text.split(" ");
    let returnText = "";
    let count = 0;
    let whenToSplitCount = 0;
    let WhenToSplit = Math.round(words/paragraphs);
    let capitalize = false;

    repeat(words,(i) => {
        let word = textSplit[count];
        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.substring(1,word.length);
            capitalize = false;

            if (word.charAt(word.length-1) == ".") word = word.substring(0,word.length-1)
        }
        returnText += word + " ";

        if (whenToSplitCount == WhenToSplit && paragraphs !== 1) {
            returnText = returnText.substring(0,returnText.length-1) + '.<br><br>'
            whenToSplitCount = 0;
            capitalize = true;
        }

        count++;
        whenToSplitCount++;
        if (count > textSplit.length) count = 0;
    })
    return returnText;
}





// Color
let colorGroups = [
    {
        name: "misc",
        noName: true,
        colors: [
            {name: "rborblue",color:"#6BD2FE"}
        ]
    },
    {
        name: "pastel",
        colors: [
            {name: "yellow",color: "#FAEDCB"},
            {name: "green",color: "#C9E4D3"},
            {name: "blue",color: "#C6DEF1"},
            {name: "purple",color: "#DBCDF0"},
            {name: "red",color: "#F2C6DE"},
            {name: "orange",color: "#F7D9C4"},
        ]
    },
    {
        name: "roblox",
        noName: false,
        colors: [
            {name: "white",color:"#f2f3f3"},
            {name: "grey",color:"#a1a5a2"},
            {name: "light yellow",color:"#f9e999"},
            {name: "brick yellow",color:"#d7c59a"},
            {name: "light green (mint)",color:"#c2dab8"},
            {name: "light reddish violet",color:"#e8bac8"},
            {name: "pastel blue",color:"#80bbdb"},
            {name: "light orange brown",color:"#cb8442"},
            {name: "nougat",color:"#cc8e69"},
            {name: "bright red",color:"#c4281c"},
            {name: "med. reddish violet",color:"#c470a0"},
            {name: "bright blue",color:"#0d69ac"},
            {name: "bright yellow",color:"#f5cd30"},
            {name: "earth orange",color:"#624732"},
            {name: "black",color:"#1b2a35"},
            {name: "dark grey",color:"#6d6e6c"},
            {name: "dark green",color:"#287f47"},
            {name: "medium green",color:"#a1c48c"},
            {name: "lig. yellowich orange",color:"#f3cf9b"},
            {name: "bright green",color:"#4b974b"},
            {name: "dark orange",color:"#a05f35"},
            {name: "light bluish violet",color:"#c1cade"},
            {name: "transparent",color:"#ececec"},
            {name: "tr. red",color:"#cd544b"},
            {name: "tr. lg blue",color:"#c1dff0"},
            {name: "tr. blue",color:"#7bb6e8"},
            {name: "tr. yellow",color:"#f7f18d"},
            {name: "light blue",color:"#b4d2e4"},
            {name: "tr. flu. reddish orange",color:"#d9856c"},
            {name: "tr. green",color:"#84b68d"},
            {name: "tr. flu. green",color:"#f8f184"},
            {name: "phosph. white",color:"#ece8de"},
            {name: "light red",color:"#eec4b6"},
            {name: "medium red",color:"#da867a"},
            {name: "medium blue",color:"#6e99ca"},
            {name: "light grey",color:"#c7c1b7"},
            {name: "bright violet",color:"#6b327c"},
            {name: "br. yellowish orange",color:"#e29b40"},
            {name: "bright orange",color:"#da8541"},
            {name: "bright bluish green",color:"#008f9c"},
            {name: "earth yellow",color:"#685c43"},
            {name: "bright bluish violet",color:"#435493"},
            {name: "tr. brown",color:"#bfb7b1"},
            {name: "medium bluish violet",color:"#6874ac"},
            {name: "tr. medi. reddish violet",color:"#e5adc8"},
            {name: "med. yellowish green",color:"#c7d23c"},
            {name: "med. bluish green",color:"#55a5af"},
            {name: "light bluish green",color:"#b7d7d5"},
            {name: "br. yellowish green",color:"#a4bd47"},
            {name: "lig. yellowish green",color:"#d9e4a7"},
            {name: "med. yellowish orange",color:"#e7ac58"},
            {name: "br. reddish orange",color:"#d36f4c"},
            {name: "bright reddish violet",color:"#923978"},
            {name: "light orange",color:"#eab892"},
            {name: "tr. bright bluish violet",color:"#a5a5cb"},
            {name: "gold",color:"#dcbc81"},
            {name: "dark nougat",color:"#ae7a59"},
            {name: "silver",color:"#9ca3a8"},
            {name: "neon orange",color:"#d5733d"},
            {name: "neon green",color:"#d8dd56"},
            {name: "sand blue",color:"#74869d"},
            {name: "sand violet",color:"#877c90"},
            {name: "medium orange",color:"#e09864"},
            {name: "sand yellow",color:"#958a73"},
            {name: "earth blue",color:"#203a56"},
            {name: "earth green",color:"#27462d"},
            {name: "tr. flu. blue",color:"#cfe2f7"},
            {name: "sand blue metallic",color:"#7988a1"},
            {name: "sand violet metallic",color:"#958ea3"},
            {name: "sand yellow metallic",color:"#938767"},
            {name: "dark grey metallic",color:"#575857"},
            {name: "black metallic",color:"#161d32"},
            {name: "light grey metallic",color:"#abadac"},
            {name: "sand green",color:"#789082"},
            {name: "sand red",color:"#957977"},
            {name: "dark red",color:"#7b2e2f"},
            {name: "tr. flu. yellow",color:"#fff67b"},
            {name: "tr. flu. red",color:"#e1a4c2"},
            {name: "gun metallic",color:"#756c62"},
            {name: "red flip/flop",color:"#97695b"},
            {name: "yellow flip/flop",color:"#b48455"},
            {name: "silver flip/flop",color:"#898788"},
            {name: "curry",color:"#d7a94b"},
            {name: "fire yellow",color:"#f9d62e"},
            {name: "flame yellowish orange",color:"#e8ab2d"},
            {name: "reddish brown",color:"#694028"},
            {name: "flame reddish orange",color:"#cf6024"},
            {name: "medium stone grey",color:"#a3a2a5"},
            {name: "royal blue",color:"#4667a4"},
            {name: "dark royal blue",color:"#23478b"},
            {name: "bright reddish lilac",color:"#8e4285"},
            {name: "dark stone grey",color:"#635f62"},
            {name: "lemon metalic",color:"#828a5d"},
            {name: "light stone grey",color:"#e5e4df"},
            {name: "dark curry",color:"#b08e44"},
            {name: "faded green",color:"#709578"},
            {name: "turquoise",color:"#79b5b5"},
            {name: "light royal blue",color:"#9fc3e9"},
            {name: "medium royal blue",color:"#6c81b7"},
            {name: "rust",color:"#904c2a"},
            {name: "brown",color:"#7c5c46"},
            {name: "reddish lilac",color:"#96709f"},
            {name: "lilac",color:"#6b629b"},
            {name: "light lilac",color:"#a7a9ce"},
            {name: "bright purple",color:"#cd6298"},
            {name: "light purple",color:"#e4adc8"},
            {name: "light pink",color:"#dc9095"},
            {name: "light brick yellow",color:"#f0d5a0"},
            {name: "warm yellowish orange",color:"#ebb87f"},
            {name: "cool yellow",color:"#fdea8d"},
            {name: "dove blue",color:"#7dbbdd"},
            {name: "medium lilac",color:"#342b75"},
            {name: "slime green",color:"#506d54"},
            {name: "smoky grey",color:"#5b5d69"},
            {name: "dark blue",color:"#0010b0"},
            {name: "parsley green",color:"#2c651d"},
            {name: "steel blue",color:"#527cae"},
            {name: "storm blue",color:"#335882"},
            {name: "lapis",color:"#102adc"},
            {name: "dark indigo",color:"#3d1585"},
            {name: "sea green",color:"#348e40"},
            {name: "shamrock",color:"#5b9a4c"},
            {name: "fossil",color:"#9fa1ac"},
            {name: "mulberry",color:"#592259"},
            {name: "forest green",color:"#1f801d"},
            {name: "cadet blue",color:"#9fadc0"},
            {name: "electric blue",color:"#0989cf"},
            {name: "eggplant",color:"#7b007b"},
            {name: "moss",color:"#7c9c6b"},
            {name: "artichoke",color:"#8aab85"},
            {name: "sage green",color:"#b9c4b1"},
            {name: "ghost grey",color:"#cacbd1"},
            {name: "lilac",color:"#a75e9b"},
            {name: "plum",color:"#7b2f7b"},
            {name: "olivine",color:"#94be81"},
            {name: "laurel green",color:"#a8bd99"},
            {name: "quill grey",color:"#dfdfde"},
            {name: "crimson",color:"#970000"},
            {name: "mint",color:"#b1e5a6"},
            {name: "baby blue",color:"#98c2db"},
            {name: "carnation pink",color:"#ff98dc"},
            {name: "persimmon",color:"#ff5959"},
            {name: "maroon",color:"#750000"},
            {name: "gold",color:"#efb838"},
            {name: "daisy orange",color:"#f8d96d"},
            {name: "pearl",color:"#e7e7ec"},
            {name: "fog",color:"#c7d4e4"},
            {name: "salmon",color:"#ff9494"},
            {name: "terra cotta",color:"#be6862"},
            {name: "cocoa",color:"#562424"},
            {name: "wheat",color:"#f1e7c7"},
            {name: "buttermilk",color:"#fef3bb"},
            {name: "mauve",color:"#e0b2d0"},
            {name: "sunrise",color:"#d490bd"},
            {name: "tawny",color:"#965555"},
            {name: "rust",color:"#8f4c2a"},
            {name: "cashmere",color:"#d3be96"},
            {name: "khaki",color:"#e2dcbc"},
            {name: "lily white",color:"#edeaea"},
            {name: "seashell",color:"#e9dada"},
            {name: "burgundy",color:"#883e3e"},
            {name: "cork",color:"#bc9b5d"},
            {name: "burlap",color:"#c7ac78"},
            {name: "beige",color:"#cabfa3"},
            {name: "oyster",color:"#bbb3b2"},
            {name: "pine cone",color:"#6c584b"},
            {name: "fawn brown",color:"#a0844f"},
            {name: "hurricane grey",color:"#958988"},
            {name: "cloudy grey",color:"#aba89e"},
            {name: "linen",color:"#af9483"},
            {name: "copper",color:"#966766"},
            {name: "dirt brown",color:"#564236"},
            {name: "bronze",color:"#7e683f"},
            {name: "flint",color:"#69665c"},
            {name: "dark taupe",color:"#5a4c42"},
            {name: "burnt sienna",color:"#6a3909"},
            {name: "institutional white",color:"#f8f8f8"},
            {name: "mid gray",color:"#cdcdcd"},
            {name: "really black",color:"#111111"},
            {name: "deep orange",color:"#ffb000"},
            {name: "alder",color:"#b480ff"},
            {name: "dusty rose",color:"#a34b4b"},
            {name: "olive",color:"#c1be42"},
            {name: "navy blue",color:"#002060"},
            {name: "deep blue",color:"#2154b9"},
            {name: "cyan",color:"#04afec"},
            {name: "cga brown",color:"#aa5500"},
            {name: "magenta",color:"#aa00aa"},
            {name: "pink",color:"#ff66cc"},
            {name: "deep orange",color:"#ffaf00"},
            {name: "teal",color:"#12eed4"},
            {name: "camo",color:"#3a7d15"},
            {name: "grime",color:"#7f8e64"},
            {name: "lavender",color:"#8c5b9f"},
            {name: "pastel light blue",color:"#afddff"},
            {name: "pastel orange",color:"#ffc9c9"},
            {name: "pastel violet",color:"#b1a7ff"},
            {name: "pastel blue-green",color:"#9ff3e9"},
            {name: "pastel green",color:"#ccffcc"},
            {name: "pastel brown",color:"#ffcc99"},
            {name: "royal purple",color:"#6225d1"},
            {name: "hot pink",color:"#ff00bf"},
            
        ]
    },
    {
        name: "computerhope",
        noName: true,
        colors: [
            {name: "black blue",color:"#040720"},
            {name: "night",color:"#0c090a"},
            {name: "charcoal",color:"#34282c"},
            {name: "oil",color:"#3b3131"},
            {name: "stormy gray",color:"#3a3b3c"},
            {name: "light black",color:"#454545"},
            {name: "dark steampunk",color:"#4d4d4f"},
            {name: "black cat",color:"#413839"},
            {name: "iridium",color:"#3d3c3a"},
            {name: "black eel",color:"#463e3f"},
            {name: "black cow",color:"#4c4646"},
            {name: "gray wolf",color:"#504a4b"},
            {name: "vampire gray",color:"#565051"},
            {name: "iron gray",color:"#52595d"},
            {name: "gray dolphin",color:"#5c5858"},
            {name: "carbon gray",color:"#625d5d"},
            {name: "ash gray",color:"#666362"},
            {name: "nardo gray",color:"#686a6c"},
            {name: "cloudy gray",color:"#6d6968"},
            {name: "smokey gray",color:"#726e6d"},
            {name: "alien gray",color:"#736f6e"},
            {name: "platinum gray",color:"#797979"},
            {name: "granite",color:"#837e7c"},
            {name: "sheet metal",color:"#888b90"},
            {name: "gunmetal gray",color:"#8d918d"},
            {name: "cold metal",color:"#9b9a96"},
            {name: "stainless steel gray",color:"#99a3a3"},
            {name: "gray cloud",color:"#b6b6b4"},
            {name: "metal",color:"#b6b6b6"},
            {name: "steampunk",color:"#c9c1c1"},
            {name: "gear steel gray",color:"#c0c6c7"},
            {name: "gray goose",color:"#d1d0ce"},
            {name: "platinum silver",color:"#cecece"},
            {name: "silver white",color:"#dadbdd"},
            {name: "light steel gray",color:"#e0e5e5"},
            {name: "white gray",color:"#eeeeee"},
            {name: "metallic silver",color:"#bcc6cc"},
            {name: "blue gray",color:"#98afc7"},
            {name: "rat gray",color:"#6d7b8d"},
            {name: "slate granite gray",color:"#657383"},
            {name: "jet gray",color:"#616d7e"},
            {name: "mist blue",color:"#646d7e"},
            {name: "steel gray",color:"#71797e"},
            {name: "marble blue",color:"#566d7e"},
            {name: "slate blue gray",color:"#737ca1"},
            {name: "light purple blue",color:"#728fce"},
            {name: "azure blue",color:"#4863a0"},
            {name: "estoril blue",color:"#2f539b"},
            {name: "blue jay",color:"#2b547e"},
            {name: "dark blue gray",color:"#29465b"},
            {name: "dark slate",color:"#2b3856"},
            {name: "deep sea blue",color:"#123456"},
            {name: "night blue",color:"#151b54"},
            {name: "denim dark blue",color:"#151b8d"},
            {name: "lapis blue",color:"#15317e"},
            {name: "new midnight blue",color:"#0000a0"},
            {name: "earth blue",color:"#0000a5"},
            {name: "cobalt blue",color:"#0020c2"},
            {name: "blueberry blue",color:"#0041c2"},
            {name: "canary blue",color:"#2916f5"},
            {name: "samco blue",color:"#0002ff"},
            {name: "bright blue",color:"#0909ff"},
            {name: "blue orchid",color:"#1f45fc"},
            {name: "sapphire blue",color:"#2554c7"},
            {name: "blue eyes",color:"#1569c7"},
            {name: "balloon blue",color:"#2b60de"},
            {name: "ocean blue",color:"#2b65ec"},
            {name: "dark sky blue",color:"#0059ff"},
            {name: "blue ribbon",color:"#306eff"},
            {name: "blue dress",color:"#157dec"},
            {name: "neon blue",color:"#1589ff"},
            {name: "glacial blue ice",color:"#368bc1"},
            {name: "silk blue",color:"#488ac7"},
            {name: "windows blue",color:"#357ec7"},
            {name: "blue ivy",color:"#3090c7"},
            {name: "cyan blue",color:"#14a3c7"},
            {name: "blue koi",color:"#659ec7"},
            {name: "columbia blue",color:"#87afc7"},
            {name: "baby blue",color:"#95b9c7"},
            {name: "sky blue dress",color:"#6698ff"},
            {name: "iceberg",color:"#56a5ec"},
            {name: "butterfly blue",color:"#38acec"},
            {name: "midday blue",color:"#3bb9ff"},
            {name: "crystal blue",color:"#5cb3ff"},
            {name: "denim blue",color:"#79baec"},
            {name: "day sky blue",color:"#82caff"},
            {name: "jeans blue",color:"#a0cfec"},
            {name: "blue angel",color:"#b7ceec"},
            {name: "pastel blue",color:"#b4cfec"},
            {name: "light day blue",color:"#addfff"},
            {name: "sea blue",color:"#c2dfff"},
            {name: "heavenly blue",color:"#c6deff"},
            {name: "robin egg blue",color:"#bdedff"},
            {name: "coral blue",color:"#afdcec"},
            {name: "lightsteelblue (w3c)",color:"#b0cfde"},
            {name: "gulf blue",color:"#c9dfec"},
            {name: "pastel light blue",color:"#d5d6ea"},
            {name: "lavender blue",color:"#e3e4fa"},
            {name: "white blue",color:"#dbe9fa"},
            {name: "water",color:"#ebf4fa"},
            {name: "light slate",color:"#ccffff"},
            {name: "electric blue",color:"#9afeff"},
            {name: "tron blue",color:"#7dfdfe"},
            {name: "blue zircon",color:"#57feff"},
            {name: "bright cyan",color:"#0affff"},
            {name: "celeste",color:"#50ebec"},
            {name: "blue diamond",color:"#4ee2ec"},
            {name: "bright turquoise",color:"#16e2f5"},
            {name: "blue lagoon",color:"#8eebec"},
            {name: "pale blue lily",color:"#cfecec"},
            {name: "light teal",color:"#b3d9d9"},
            {name: "blue hosta",color:"#77bfc7"},
            {name: "cyan opaque",color:"#92c7c7"},
            {name: "northern lights blue",color:"#78c7c7"},
            {name: "blue green",color:"#7bccb5"},
            {name: "aqua seafoam green",color:"#93e9be"},
            {name: "light aquamarine",color:"#93ffe8"},
            {name: "bright teal",color:"#01f9c6"},
            {name: "deep turquoise",color:"#48cccd"},
            {name: "jellyfish",color:"#46c7c7"},
            {name: "blue turquoise",color:"#43c6db"},
            {name: "macaw blue green",color:"#43bfc7"},
            {name: "seafoam green",color:"#3ea99f"},
            {name: "deep sea",color:"#3b9c9c"},
            {name: "teal blue",color:"#007c80"},
            {name: "medium teal",color:"#045f5f"},
            {name: "dark teal",color:"#045d5d"},
            {name: "deep teal",color:"#033e3e"},
            {name: "darkslategray or darkslategrey (w3c)",color:"#25383c"},
            {name: "gunmetal",color:"#2c3539"},
            {name: "blue moss green",color:"#3c565b"},
            {name: "beetle green",color:"#4c787e"},
            {name: "grayish turquoise",color:"#5e7d7e"},
            {name: "greenish blue",color:"#307d7e"},
            {name: "aquamarine stone",color:"#348781"},
            {name: "sea turtle green",color:"#438d80"},
            {name: "dull sea green",color:"#4e8975"},
            {name: "dark green blue",color:"#1f6357"},
            {name: "deep sea green",color:"#306754"},
            {name: "bottle green",color:"#006a4e"},
            {name: "elf green",color:"#1b8a6b"},
            {name: "dark mint",color:"#31906e"},
            {name: "jade",color:"#00a36c"},
            {name: "earth green",color:"#34a56f"},
            {name: "chrome green",color:"#1aa260"},
            {name: "isle of man green",color:"#22ce83"},
            {name: "metallic green",color:"#7c9d8e"},
            {name: "camouflage green",color:"#78866b"},
            {name: "sage green",color:"#848b79"},
            {name: "hazel green",color:"#617c58"},
            {name: "venom green",color:"#728c00"},
            {name: "military green",color:"#4e5b31"},
            {name: "green leaves",color:"#3a5f0b"},
            {name: "army green",color:"#4b5320"},
            {name: "fern green",color:"#667c26"},
            {name: "fall forest green",color:"#4e9258"},
            {name: "irish green",color:"#08a04b"},
            {name: "pine green",color:"#387c44"},
            {name: "medium forest green",color:"#347235"},
            {name: "racing green",color:"#27742c"},
            {name: "jungle green",color:"#347c2c"},
            {name: "cactus green",color:"#227442"},
            {name: "deep green",color:"#056608"},
            {name: "deep emerald green",color:"#046307"},
            {name: "dark forest green",color:"#254117"},
            {name: "broccoli green",color:"#026c3d"},
            {name: "seaweed green",color:"#437c17"},
            {name: "shamrock green",color:"#347c17"},
            {name: "green onion",color:"#6aa121"},
            {name: "grass green",color:"#3f9b0b"},
            {name: "green pepper",color:"#4aa02c"},
            {name: "dark lime green",color:"#41a317"},
            {name: "parrot green",color:"#12ad2b"},
            {name: "clover green",color:"#3ea055"},
            {name: "dinosaur green",color:"#73a16c"},
            {name: "green snake",color:"#6cbb3c"},
            {name: "alien green",color:"#6cc417"},
            {name: "green apple",color:"#4cc417"},
            {name: "pea green",color:"#52d017"},
            {name: "kelly green",color:"#4cc552"},
            {name: "zombie green",color:"#54c571"},
            {name: "green peas",color:"#89c35c"},
            {name: "dollar bill green",color:"#85bb65"},
            {name: "frog green",color:"#99c68e"},
            {name: "basil green",color:"#829f82"},
            {name: "gray green",color:"#a2ad9c"},
            {name: "light olive green",color:"#b8bc86"},
            {name: "iguana green",color:"#9cb071"},
            {name: "citron green",color:"#8fb31d"},
            {name: "avocado green",color:"#b2c248"},
            {name: "salad green",color:"#a1c935"},
            {name: "hummingbird green",color:"#7fe817"},
            {name: "nebula green",color:"#59e817"},
            {name: "stoplight go green",color:"#57e964"},
            {name: "neon green",color:"#16f529"},
            {name: "jade green",color:"#5efb6e"},
            {name: "ocean green",color:"#00ff80"},
            {name: "lime mint green",color:"#36f57f"},
            {name: "aqua green",color:"#12e193"},
            {name: "emerald green",color:"#5ffb17"},
            {name: "yellow lawn green",color:"#87f717"},
            {name: "aloe vera green",color:"#98f516"},
            {name: "dull green yellow",color:"#b1fb17"},
            {name: "lemon green",color:"#adf802"},
            {name: "chameleon green",color:"#bdf516"},
            {name: "neon yellow green",color:"#daee01"},
            {name: "yellow green grosbeak",color:"#e2f516"},
            {name: "tea green",color:"#ccfb5d"},
            {name: "slime green",color:"#bce954"},
            {name: "dragon green",color:"#6afb92"},
            {name: "green thumb",color:"#b5eaaa"},
            {name: "organic brown",color:"#e3f9a6"},
            {name: "light jade",color:"#c3fdb8"},
            {name: "light mint green",color:"#c2e5d3"},
            {name: "light rose green",color:"#dbf9db"},
            {name: "chrome white",color:"#e8f1d4"},
            {name: "parchment",color:"#ffffc2"},
            {name: "cream",color:"#ffffcc"},
            {name: "white yellow",color:"#f2f0df"},
            {name: "blonde",color:"#fbf6d9"},
            {name: "light beige",color:"#fff0db"},
            {name: "light orange",color:"#fed8b1"},
            {name: "coral peach",color:"#fbd5ab"},
            {name: "golden blonde",color:"#fbe7a1"},
            {name: "golden silk",color:"#f3e3c3"},
            {name: "dark blonde",color:"#f0e2b6"},
            {name: "light gold",color:"#f1e5ac"},
            {name: "tan brown",color:"#ece5b6"},
            {name: "dirty white",color:"#e8e4c9"},
            {name: "cardboard brown",color:"#edda74"},
            {name: "harvest gold",color:"#ede275"},
            {name: "sun yellow",color:"#ffe87c"},
            {name: "corn yellow",color:"#fff380"},
            {name: "pastel yellow",color:"#faf884"},
            {name: "neon yellow",color:"#ffff33"},
            {name: "lemon yellow",color:"#fef250"},
            {name: "banana yellow",color:"#f5e216"},
            {name: "bold yellow",color:"#f9db24"},
            {name: "rubber ducky yellow",color:"#ffd801"},
            {name: "bright gold",color:"#fdd017"},
            {name: "chrome gold",color:"#ffce44"},
            {name: "golden brown",color:"#eac117"},
            {name: "deep yellow",color:"#f6be00"},
            {name: "macaroni and cheese",color:"#f2bb66"},
            {name: "saffron",color:"#fbb917"},
            {name: "neon gold",color:"#fdbd01"},
            {name: "beer",color:"#fbb117"},
            {name: "cantaloupe",color:"#ffa62f"},
            {name: "cheese orange",color:"#ffa600"},
            {name: "brown sand",color:"#ee9a4d"},
            {name: "brown sugar",color:"#e2a76f"},
            {name: "deer brown",color:"#e6bf83"},
            {name: "soft hazel",color:"#c6ba8b"},
            {name: "fall leaf brown",color:"#c8b560"},
            {name: "ginger brown",color:"#c9be62"},
            {name: "bronze gold",color:"#c9ae5d"},
            {name: "olive green",color:"#bab86c"},
            {name: "brass",color:"#b5a642"},
            {name: "cookie brown",color:"#c7a317"},
            {name: "bee yellow",color:"#e9ab17"},
            {name: "school bus yellow",color:"#e8a317"},
            {name: "orange gold",color:"#d4a017"},
            {name: "caramel",color:"#c68e17"},
            {name: "cinnamon",color:"#c58917"},
            {name: "pumpkin pie",color:"#ca762b"},
            {name: "tiger orange",color:"#c88141"},
            {name: "dark gold",color:"#aa6c39"},
            {name: "dark almond",color:"#ab784e"},
            {name: "wood",color:"#966f33"},
            {name: "khaki brown",color:"#906e3e"},
            {name: "oak brown",color:"#806517"},
            {name: "hazel",color:"#8e7618"},
            {name: "dark yellow",color:"#8b8000"},
            {name: "dark moccasin",color:"#827839"},
            {name: "khaki green",color:"#8a865d"},
            {name: "millennium jade",color:"#93917c"},
            {name: "dark beige",color:"#9f8c76"},
            {name: "bullet shell",color:"#af9b60"},
            {name: "army brown",color:"#827b60"},
            {name: "sandstone",color:"#786d5f"},
            {name: "dark grayish olive",color:"#4a412a"},
            {name: "dark hazel brown",color:"#473810"},
            {name: "mocha",color:"#493d26"},
            {name: "milk chocolate",color:"#513b1c"},
            {name: "gray brown",color:"#3d3635"},
            {name: "dark coffee",color:"#3b2f2f"},
            {name: "western charcoal",color:"#49413f"},
            {name: "red brown",color:"#622f22"},
            {name: "bakers brown",color:"#5c3317"},
            {name: "dark bronze",color:"#804a00"},
            {name: "brown bear",color:"#835c3b"},
            {name: "red dirt",color:"#7f5217"},
            {name: "sepia",color:"#7f462c"},
            {name: "dark sienna",color:"#8a4117"},
            {name: "sangria",color:"#7e3817"},
            {name: "blood red",color:"#7e3517"},
            {name: "coral brown",color:"#9e4638"},
            {name: "deep amber",color:"#a05544"},
            {name: "chestnut red",color:"#c34a2c"},
            {name: "ginger red",color:"#b83c08"},
            {name: "red gold",color:"#eb5406"},
            {name: "red fox",color:"#c35817"},
            {name: "dark bisque",color:"#b86500"},
            {name: "petra gold",color:"#b76734"},
            {name: "brown rust",color:"#a55d35"},
            {name: "rust",color:"#c36241"},
            {name: "orange salmon",color:"#c47451"},
            {name: "sedona",color:"#cc6600"},
            {name: "papaya orange",color:"#e56717"},
            {name: "halloween orange",color:"#e66c2c"},
            {name: "bright orange",color:"#ff5f1f"},
            {name: "fluro orange",color:"#fe632a"},
            {name: "pumpkin orange",color:"#f87217"},
            {name: "safety orange",color:"#ff7900"},
            {name: "carrot orange",color:"#f88017"},
            {name: "construction cone orange",color:"#f87431"},
            {name: "indian saffron",color:"#ff7722"},
            {name: "sunrise orange",color:"#e67451"},
            {name: "mango orange",color:"#ff8040"},
            {name: "basket ball orange",color:"#f88158"},
            {name: "light salmon rose",color:"#f9966b"},
            {name: "pink orange",color:"#f89880"},
            {name: "tangerine",color:"#e78a61"},
            {name: "salmon pink",color:"#ff8674"},
            {name: "peach pink",color:"#f98b88"},
            {name: "pastel red",color:"#f67280"},
            {name: "pink coral",color:"#e77471"},
            {name: "bean red",color:"#f75d59"},
            {name: "valentine red",color:"#e55451"},
            {name: "shocking orange",color:"#e55b3c"},
            {name: "neon red",color:"#fd1c03"},
            {name: "ruby red",color:"#f62217"},
            {name: "fire engine red",color:"#f62817"},
            {name: "lava red",color:"#e42217"},
            {name: "love red",color:"#e41b17"},
            {name: "grapefruit",color:"#dc381f"},
            {name: "cherry red",color:"#c24641"},
            {name: "chilli pepper",color:"#c11b17"},
            {name: "carbon red",color:"#a70d2a"},
            {name: "cranberry",color:"#9f000f"},
            {name: "saffron red",color:"#931314"},
            {name: "red wine or wine red",color:"#990012"},
            {name: "maroon red",color:"#8f0b0b"},
            {name: "burgundy",color:"#8c001a"},
            {name: "vermilion",color:"#7e191b"},
            {name: "deep red",color:"#800517"},
            {name: "blood night",color:"#551606"},
            {name: "dark scarlet",color:"#560319"},
            {name: "chocolate brown",color:"#3f000f"},
            {name: "dark maroon",color:"#2f0909"},
            {name: "midnight",color:"#2b1b17"},
            {name: "purple lily",color:"#550a35"},
            {name: "purple maroon",color:"#810541"},
            {name: "plum pie",color:"#7d0541"},
            {name: "plum velvet",color:"#7d0552"},
            {name: "velvet maroon",color:"#7e354d"},
            {name: "rosy-finch",color:"#7f4e52"},
            {name: "dull purple",color:"#7f525d"},
            {name: "puce",color:"#7f5a58"},
            {name: "rose dust",color:"#997070"},
            {name: "pastel brown",color:"#b1907f"},
            {name: "rosy pink",color:"#b38481"},
            {name: "khaki rose",color:"#c5908e"},
            {name: "lipstick pink",color:"#c48793"},
            {name: "dusky pink",color:"#cc7a8b"},
            {name: "pink brown",color:"#c48189"},
            {name: "dusty pink",color:"#d58a94"},
            {name: "pink daisy",color:"#e799a3"},
            {name: "rose",color:"#e8adaa"},
            {name: "dusty rose",color:"#c9a9a6"},
            {name: "gold pink",color:"#e6c7c2"},
            {name: "rose gold",color:"#ecc5c0"},
            {name: "pastel orange",color:"#f8b88b"},
            {name: "pig pink",color:"#fdd7e4"},
            {name: "pale pink",color:"#f2d4d7"},
            {name: "blush",color:"#ffe6e8"},
            {name: "pink bubble gum",color:"#ffdfdd"},
            {name: "light rose",color:"#fbcfcd"},
            {name: "rose quartz",color:"#f7cac9"},
            {name: "warm pink",color:"#f6c6bd"},
            {name: "deep rose",color:"#fbbbb9"},
            {name: "soft pink",color:"#ffb8bf"},
            {name: "powder pink",color:"#ffb2d0"},
            {name: "donut pink",color:"#faafbe"},
            {name: "baby pink",color:"#faafba"},
            {name: "flamingo pink",color:"#f9a7b0"},
            {name: "pastel pink",color:"#fea3aa"},
            {name: "rose pink or pink rose",color:"#e7a1b0"},
            {name: "cadillac pink",color:"#e38aae"},
            {name: "carnation pink",color:"#f778a1"},
            {name: "pastel rose",color:"#e5788f"},
            {name: "blush red",color:"#e56e94"},
            {name: "purple pink",color:"#d16587"},
            {name: "tulip pink",color:"#c25a7c"},
            {name: "bashful pink",color:"#c25283"},
            {name: "dark pink",color:"#e75480"},
            {name: "dark hot pink",color:"#f660ab"},
            {name: "violet red",color:"#f6358a"},
            {name: "hot deep pink",color:"#f52887"},
            {name: "red magenta",color:"#ff0080"},
            {name: "neon pink",color:"#f535aa"},
            {name: "chrome pink",color:"#ff33aa"},
            {name: "neon hot pink",color:"#fd349c"},
            {name: "pink cupcake",color:"#e45e9d"},
            {name: "royal pink",color:"#e759ac"},
            {name: "dimorphotheca magenta",color:"#e3319d"},
            {name: "barbie pink",color:"#da1884"},
            {name: "pink lemonade",color:"#e4287c"},
            {name: "red pink",color:"#fa2a55"},
            {name: "rose red",color:"#c21e56"},
            {name: "rogue pink",color:"#c12869"},
            {name: "burnt pink",color:"#c12267"},
            {name: "pink violet",color:"#ca226b"},
            {name: "magenta pink",color:"#cc338b"},
            {name: "dark carnation pink",color:"#c12283"},
            {name: "pink plum",color:"#b93b8f"},
            {name: "deep mauve",color:"#df73d4"},
            {name: "fuchsia pink",color:"#ff77ff"},
            {name: "bright neon pink",color:"#f433ff"},
            {name: "crimson purple",color:"#e238ec"},
            {name: "heliotrope purple",color:"#d462ff"},
            {name: "tyrian purple",color:"#c45aec"},
            {name: "purple flower",color:"#a74ac7"},
            {name: "orchid purple",color:"#b048b5"},
            {name: "pastel violet",color:"#d291bc"},
            {name: "rosy",color:"#a17188"},
            {name: "viola purple",color:"#7e587e"},
            {name: "plum purple",color:"#583759"},
            {name: "grape",color:"#5e5a80"},
            {name: "blue lotus",color:"#6960ec"},
            {name: "blurple",color:"#5865f2"},
            {name: "light slate blue",color:"#736aff"},
            {name: "periwinkle purple",color:"#7575cf"},
            {name: "very peri",color:"#6667ab"},
            {name: "bright grape",color:"#6f2da8"},
            {name: "bright purple",color:"#6a0dad"},
            {name: "purple amethyst",color:"#6c2dc7"},
            {name: "blue magenta",color:"#822eff"},
            {name: "dark blurple",color:"#5539cc"},
            {name: "deep periwinkle",color:"#5453a6"},
            {name: "purple haze",color:"#4e387e"},
            {name: "purple iris",color:"#571b7e"},
            {name: "dark purple",color:"#4b0150"},
            {name: "deep purple",color:"#36013f"},
            {name: "midnight purple",color:"#2e1a47"},
            {name: "purple monster",color:"#461b7e"},
            {name: "blue whale",color:"#342d7e"},
            {name: "purple jam",color:"#6a287e"},
            {name: "purple violet",color:"#8d38c9"},
            {name: "jasmine purple",color:"#a23bec"},
            {name: "purple daffodil",color:"#b041ff"},
            {name: "clematis violet",color:"#842dce"},
            {name: "purple sage bush",color:"#7a5dc7"},
            {name: "lovely purple",color:"#7f38ec"},
            {name: "neon purple",color:"#9d00ff"},
            {name: "purple plum",color:"#8e35ef"},
            {name: "aztech purple",color:"#893bff"},
            {name: "light purple",color:"#8467d7"},
            {name: "crocus purple",color:"#9172ec"},
            {name: "purple mimosa",color:"#9e7bff"},
            {name: "pastel indigo",color:"#8686af"},
            {name: "rose purple",color:"#b09fca"},
            {name: "viola",color:"#c8c4df"},
            {name: "purple dragon",color:"#c38ec7"},
            {name: "blush pink",color:"#e6a9ec"},
            {name: "pastel purple",color:"#f2a2e8"},
            {name: "blossom pink",color:"#f9b7ff"},
            {name: "wisteria purple",color:"#c6aec7"},
            {name: "purple thistle",color:"#d2b9d3"},
            {name: "purple white",color:"#dfd3e3"},
            {name: "periwinkle pink",color:"#e9cfec"},
            {name: "cotton candy",color:"#fcdfff"},
            {name: "lavender pinocchio",color:"#ebdde2"},
            {name: "dark white",color:"#e1d9d1"},
            {name: "ash white",color:"#e9e4d4"},
            {name: "warm white",color:"#efebd8"},
            {name: "creamy white",color:"#f0e9d6"},
            {name: "off white",color:"#f8f0e3"},
            {name: "soft ivory",color:"#faf0dd"},
            {name: "pearl white",color:"#f8f6f0"},
            {name: "red white",color:"#f3e8ea"},
            {name: "pearl",color:"#fdeef4"},
            {name: "egg shell",color:"#fff9e3"},
            {name: "oldlace (w3c)",color:"#fef0e3"},
            {name: "white ice",color:"#eaeee9"},
            {name: "bone white",color:"#f9f6ee"},
            {name: "rice",color:"#faf5ef"},
            {name: "white gold",color:"#fffff4"},
            {name: "light white",color:"#fffff7"},
            {name: "cotton",color:"#fbfbf9"},
            {name: "milk white",color:"#fefcff"},
            {name: "half white",color:"#fffefa"},
    
        ]
    },
    {
        name: "wikipedia",
        noName: true,
        colors: [
            {name: "absolute zero",color: "#0048BA"}        
            ,{name: "acid green",color: "#B0BF1A"}        
            ,{name: "aero",color: "#00B9E8"}        
            ,{name: "african violet",color: "#B284BE"}        
            ,{name: "air superiority blue",color: "#72A0C1"}        
            ,{name: "alabaster",color: "#F2F0E6"}        
            ,{name: "alice blue",color: "#F0F8FF"}        
            ,{name: "alizarin",color: "#DB2D43"}        
            ,{name: "alloy orange",color: "#C46210"}        
            ,{name: "almond",color: "#EFDECD"}        
            ,{name: "amaranth",color: "#E52B50"}        
            ,{name: "amaranth deep purple",color: "#9F2B68"}        
            ,{name: "amaranth pink",color: "#F19CBB"}        
            ,{name: "amaranth purple",color: "#AB274F"}        
            ,{name: "amazon",color: "#3B7A57"}        
            ,{name: "amber",color: "#FFBF00"}        
            ,{name: "amber (sae/ece)",color: "#FF7E00"}        
            ,{name: "amethyst",color: "#9966CC"}        
            ,{name: "amethyst (crayola)",color: "#64609A"}        
            ,{name: "android green",color: "#3DDC84"}        
            ,{name: "antique brass",color: "#CD9575"}        
            ,{name: "antique bronze",color: "#665D1E"}        
            ,{name: "antique fuchsia",color: "#915C83"}        
            ,{name: "antique ruby",color: "#841B2D"}        
            ,{name: "antique white",color: "#FAEBD7"}        
            ,{name: "apricot",color: "#FBCEB1"}        
            ,{name: "aquamarine (crayola)",color: "#95E0E8"}        
            ,{name: "arctic lime",color: "#D0FF14"}        
            ,{name: "artichoke green",color: "#4B6F44"}        
            ,{name: "arylide yellow",color: "#E9D66B"}        
            ,{name: "ash gray",color: "#B2BEB5"}        
            ,{name: "asparagus",color: "#7BA05B"}        
            ,{name: "atomic tangerine",color: "#FF9966"}        
            ,{name: "aureolin",color: "#FDEE00"}        
            ,{name: "aztec gold",color: "#C39953"}        
            ,{name: "azure (x11/web color)",color: "#F0FFFF"}        
            ,{name: "baby blue",color: "#89CFF0"}        
            ,{name: "baby blue eyes",color: "#A1CAF1"}        
            ,{name: "baby pink",color: "#F4C2C2"}        
            ,{name: "baby powder",color: "#FEFEFA"}        
            ,{name: "baker-miller pink",color: "#FF91AF"}        
            ,{name: "banana mania",color: "#FAE7B5"}        
            ,{name: "barbie pink",color: "#E0218A"}        
            ,{name: "barn red",color: "#7C0A02"}        
            ,{name: "battleship grey",color: "#848482"}        
            ,{name: "beau blue",color: "#BCD4E6"}        
            ,{name: "beaver",color: "#9F8170"}        
            ,{name: "berry parfait",color: "#A43482"}        
            ,{name: "b'dazzled blue",color: "#2E5894"}        
            ,{name: "big dip o’ruby",color: "#9C2542"}        
            ,{name: "big foot feet",color: "#E88E5A"}        
            ,{name: "bistre",color: "#3D2B1F"}        
            ,{name: "bistre brown",color: "#967117"}        
            ,{name: "bitter lemon",color: "#CAE00D"}        
            ,{name: "bittersweet",color: "#FE6F5E"}        
            ,{name: "bittersweet shimmer",color: "#BF4F51"}        
            ,{name: "black bean",color: "#3D0C02"}        
            ,{name: "black coral",color: "#54626F"}        
            ,{name: "black olive",color: "#3B3C36"}        
            ,{name: "black shadows",color: "#BFAFB2"}        
            ,{name: "blanched almond",color: "#FFEBCD"}        
            ,{name: "blast-off bronze",color: "#A57164"}        
            ,{name: "bleu de france",color: "#318CE7"}        
            ,{name: "blizzard blue",color: "#50BFE6"}        
            ,{name: "blood red",color: "#660000"}        
            ,{name: "blue (crayola)",color: "#1F75FE"}        
            ,{name: "blue (munsell)",color: "#0093AF"}        
            ,{name: "blue (ncs)",color: "#0087BD"}        
            ,{name: "blue (pantone)",color: "#0018A8"}        
            ,{name: "blue (pigment)",color: "#333399"}        
            ,{name: "blue bell",color: "#A2A2D0"}        
            ,{name: "blue-gray",color: "#6699CC"}        
            ,{name: "blue-gray (crayola)",color: "#C8C8CD"}        
            ,{name: "blue-green",color: "#0D98BA"}        
            ,{name: "blue jeans",color: "#5DADEC"}        
            ,{name: "blue ribbon",color: "#0B10A2"}        
            ,{name: "blue sapphire",color: "#126180"}        
            ,{name: "blue-violet",color: "#8A2BE2"}        
            ,{name: "blue yonder",color: "#5072A7"}        
            ,{name: "blueberry",color: "#4F86F7"}        
            ,{name: "bluetiful",color: "#3C69E7"}        
            ,{name: "blush",color: "#DE5D83"}        
            ,{name: "bole",color: "#79443B"}        
            ,{name: "bone",color: "#E3DAC9"}        
            ,{name: "booger buster",color: "#DDE26A"}        
            ,{name: "brick red",color: "#CB4154"}        
            ,{name: "bright green",color: "#66FF00"}        
            ,{name: "bright lilac",color: "#D891EF"}        
            ,{name: "bright maroon",color: "#C32148"}        
            ,{name: "bright navy blue",color: "#1974D2"}        
            ,{name: "bright pink",color: "#FF007F"}        
            ,{name: "bright turquoise",color: "#08E8DE"}        
            ,{name: "bright yellow (crayola)",color: "#FFAA1D"}        
            ,{name: "brilliant rose",color: "#E667CE"}        
            ,{name: "brink pink",color: "#FB607F"}        
            ,{name: "british racing green",color: "#004225"}        
            ,{name: "bronze",color: "#CD7F32"}        
            ,{name: "brown (crayola)",color: "#AF593E"}        
            ,{name: "brown sugar",color: "#AF6E4D"}        
            ,{name: "bud green",color: "#7BB661"}        
            ,{name: "buff",color: "#F0DC82"}        
            ,{name: "burgundy",color: "#800020"}        
            ,{name: "burnished brown",color: "#A17A74"}        
            ,{name: "burnt orange",color: "#CC5500"}        
            ,{name: "burnt sienna",color: "#E97451"}        
            ,{name: "burnt umber",color: "#8A3324"}        
            ,{name: "byzantine",color: "#BD33A4"}        
            ,{name: "byzantium",color: "#702963"}        
            ,{name: "cadet",color: "#536872"}        
            ,{name: "cadet blue",color: "#5F9EA0"}        
            ,{name: "cadet grey",color: "#91A3B0"}        
            ,{name: "cadmium green",color: "#006B3C"}        
            ,{name: "cadmium orange",color: "#ED872D"}        
            ,{name: "cadmium red",color: "#E30022"}        
            ,{name: "cadmium yellow",color: "#FFF600"}        
            ,{name: "café au lait",color: "#A67B5B"}        
            ,{name: "café noir",color: "#4B3621"}        
            ,{name: "cambridge blue",color: "#A3C1AD"}        
            ,{name: "camel",color: "#C19A6B"}        
            ,{name: "cameo pink",color: "#EFBBCC"}        
            ,{name: "canary",color: "#FFFF99"}        
            ,{name: "canary yellow",color: "#FFEF00"}        
            ,{name: "candy apple red",color: "#FF0800"}        
            ,{name: "candy pink",color: "#E4717A"}        
            ,{name: "cardinal",color: "#C41E3A"}        
            ,{name: "caribbean green",color: "#00CC99"}        
            ,{name: "carmine",color: "#960018"}        
            ,{name: "carnation pink",color: "#FFA6C9"}        
            ,{name: "carolina blue",color: "#56A0D3"}        
            ,{name: "carrot orange",color: "#ED9121"}        
            ,{name: "catawba",color: "#703642"}        
            ,{name: "cedar chest",color: "#CA3435"}        
            ,{name: "celadon",color: "#ACE1AF"}        
            ,{name: "celeste",color: "#B2FFFF"}        
            ,{name: "cerise",color: "#DE3163"}        
            ,{name: "cerulean",color: "#007BA7"}        
            ,{name: "cerulean blue",color: "#2A52BE"}        
            ,{name: "cerulean frost",color: "#6D9BC3"}        
            ,{name: "cerulean (crayola)",color: "#1DACD6"}        
            ,{name: "champagne",color: "#F7E7CE"}        
            ,{name: "champagne pink",color: "#F1DDCF"}        
            ,{name: "charcoal",color: "#36454F"}        
            ,{name: "charleston green",color: "#232B2B"}        
            ,{name: "charm pink",color: "#E68FAC"}        
            ,{name: "cherry blossom pink",color: "#FFB7C5"}        
            ,{name: "chestnut",color: "#954535"}        
            ,{name: "china pink",color: "#DE6FA1"}        
            ,{name: "chinese red",color: "#AA381E"}        
            ,{name: "chinese violet",color: "#856088"}        
            ,{name: "chocolate (traditional)",color: "#7B3F00"}           
            ,{name: "cinereous",color: "#98817B"}        
            ,{name: "cinnamon satin",color: "#CD607E"}        
            ,{name: "citrine",color: "#E4D00A"}        
            ,{name: "citron",color: "#9FA91F"}        
            ,{name: "claret",color: "#7F1734"}        
            ,{name: "cobalt blue",color: "#0047AB"}        
            ,{name: "coconut",color: "#965A3E"}        
            ,{name: "coffee",color: "#6F4E37"}        
            ,{name: "columbia blue",color: "#C4D8E2"}        
            ,{name: "congo pink",color: "#F88379"}        
            ,{name: "cool grey",color: "#8C92AC"}        
            ,{name: "copper",color: "#B87333"}        
            ,{name: "copper penny",color: "#AD6F69"}        
            ,{name: "copper red",color: "#CB6D51"}        
            ,{name: "copper rose",color: "#996666"}        
            ,{name: "coquelicot",color: "#FF3800"}        
            ,{name: "coral pink",color: "#F88379"}        
            ,{name: "cordovan",color: "#893F45"}            
            ,{name: "cornflower blue (crayola)",color: "#93CCEA"}        
            ,{name: "cosmic cobalt",color: "#2E2D88"}        
            ,{name: "cosmic latte",color: "#FFF8E7"}        
            ,{name: "coyote brown",color: "#81613C"}        
            ,{name: "cotton candy",color: "#FFBCD9"}        
            ,{name: "cream",color: "#FFFDD0"}        
            ,{name: "crimson (ua)",color: "#AF002A"}        
            ,{name: "cultured",color: "#F5F5F5"}        
            ,{name: "cyber grape",color: "#58427C"}        
            ,{name: "cyber yellow",color: "#FFD300"}        
            ,{name: "cyclamen",color: "#F56FA1"}        
            ,{name: "dandelion",color: "#DDF719"}        
            ,{name: "dark blue",color: "#00008B"}        
            ,{name: "dark blue-gray",color: "#666699"}        
            ,{name: "dark brown",color: "#654321"}        
            ,{name: "dark byzantium",color: "#5D3954"}        
            ,{name: "dark cyan",color: "#008B8B"}        
            ,{name: "dark electric blue",color: "#536878"}        
            ,{name: "dark fuchsia",color: "#A00955"}        
            ,{name: "dark goldenrod",color: "#B8860B"}        
            ,{name: "dark gray (x11)",color: "#A9A9A9"}        
            ,{name: "dark green",color: "#013220"}        
            ,{name: "dark green (x11)",color: "#006400"}        
            ,{name: "dark jungle green",color: "#1A2421"}        
            ,{name: "dark khaki",color: "#BDB76B"}        
            ,{name: "dark lava",color: "#483C32"}        
            ,{name: "dark liver",color: "#534B4F"}        
            ,{name: "dark magenta",color: "#8B008B"}        
            ,{name: "dark midnight blue",color: "#003366"}        
            ,{name: "dark moss green",color: "#4A5D23"}        
            ,{name: "dark olive green",color: "#556B2F"}        
            ,{name: "dark orange",color: "#FF8C00"}        
            ,{name: "dark orchid",color: "#9932CC"}        
            ,{name: "dark pastel green",color: "#03C03C"}        
            ,{name: "dark purple",color: "#301934"}        
            ,{name: "dark raspberry",color: "#872657"}        
            ,{name: "dark red",color: "#8B0000"}        
            ,{name: "dark salmon",color: "#E9967A"}        
            ,{name: "dark sea green",color: "#8FBC8F"}        
            ,{name: "dark sienna",color: "#3C1414"}        
            ,{name: "dark sky blue",color: "#8CBED6"}        
            ,{name: "dark slate blue",color: "#483D8B"}        
            ,{name: "dark slate gray",color: "#2F4F4F"}        
            ,{name: "dark spring green",color: "#177245"}        
            ,{name: "dark tan",color: "#918151"}        
            ,{name: "dark turquoise",color: "#00CED1"}        
            ,{name: "dark vanilla",color: "#D1BEA8"}        
            ,{name: "dark violet",color: "#9400D3"}        
            ,{name: "dartmouth green",color: "#00703C"}        
            ,{name: "davy's grey",color: "#555555"}        
            ,{name: "deep cerise",color: "#DA3287"}        
            ,{name: "deep champagne",color: "#FAD6A5"}        
            ,{name: "deep chestnut",color: "#B94E48"}        
            ,{name: "deep fuchsia",color: "#C154C1"}        
            ,{name: "deep jungle green",color: "#004B49"}        
            ,{name: "deep lemon",color: "#F5C71A"}        
            ,{name: "deep mauve",color: "#D473D4"}        
            ,{name: "deep pink",color: "#FF1493"}        
            ,{name: "deep sky blue",color: "#00BFFF"}        
            ,{name: "deep space sparkle",color: "#4A646C"}        
            ,{name: "deep taupe",color: "#7E5E60"}        
            ,{name: "denim",color: "#1560BD"}        
            ,{name: "denim blue",color: "#2243B6"}        
            ,{name: "desert",color: "#C19A6B"}        
            ,{name: "desert sand",color: "#EDC9AF"}        
            ,{name: "dim gray",color: "#696969"}        
            ,{name: "dingy dungeon",color: "#C53151"}        
            ,{name: "dirt",color: "#9B7653"}        
            ,{name: "dodger blue",color: "#1E90FF"}        
            ,{name: "dogwood rose",color: "#D71868"}        
            ,{name: "duke blue",color: "#00009C"}        
            ,{name: "dutch white",color: "#EFDFBB"}        
            ,{name: "earth yellow",color: "#E1A95F"}        
            ,{name: "ebony",color: "#555D50"}        
            ,{name: "ecru",color: "#C2B280"}        
            ,{name: "eerie black",color: "#1B1B1B"}        
            ,{name: "eggplant",color: "#614051"}        
            ,{name: "eggshell",color: "#F0EAD6"}        
            ,{name: "egyptian blue",color: "#1034A6"}        
            ,{name: "electric blue",color: "#7DF9FF"}        
            ,{name: "electric indigo",color: "#6F00FF"}        
            ,{name: "electric lime",color: "#CCFF00"}        
            ,{name: "electric purple",color: "#BF00FF"}        
            ,{name: "electric violet",color: "#8F00FF"}        
            ,{name: "emerald",color: "#50C878"}        
            ,{name: "eminence",color: "#6C3082"}        
            ,{name: "english lavender",color: "#B48395"}        
            ,{name: "english red",color: "#AB4B52"}        
            ,{name: "english vermillion",color: "#CC474B"}        
            ,{name: "english violet",color: "#563C5C"}        
            ,{name: "eton blue",color: "#96C8A2"}        
            ,{name: "eucalyptus",color: "#44D7A8"}        
            ,{name: "fallow",color: "#C19A6B"}        
            ,{name: "falu red",color: "#801818"}        
            ,{name: "fandango",color: "#B53389"}        
            ,{name: "fandango pink",color: "#DE5285"}        
            ,{name: "fashion fuchsia",color: "#F400A1"}        
            ,{name: "fawn",color: "#E5AA70"}        
            ,{name: "feldgrau",color: "#4D5D53"}        
            ,{name: "fern green",color: "#4F7942"}        
            ,{name: "field drab",color: "#6C541E"}        
            ,{name: "fiery rose",color: "#FF5470"}        
            ,{name: "fire engine red",color: "#CE2029"}        
            ,{name: "fire opal",color: "#E95C4B"}        
            ,{name: "flame",color: "#E25822"}        
            ,{name: "flax",color: "#EEDC82"}        
            ,{name: "flirt",color: "#A2006D"}        
            ,{name: "floral white",color: "#FFFAF0"}        
            ,{name: "fluorescent blue",color: "#15F4EE"}        
            ,{name: "forest green (crayola)",color: "#5FA777"}        
            ,{name: "forest green (traditional)",color: "#014421"}        
            ,{name: "french beige",color: "#A67B5B"}        
            ,{name: "french bistre",color: "#856D4D"}        
            ,{name: "french blue",color: "#0072BB"}        
            ,{name: "french fuchsia",color: "#FD3F92"}        
            ,{name: "french lilac",color: "#86608E"}        
            ,{name: "french lime",color: "#9EFD38"}        
            ,{name: "french mauve",color: "#D473D4"}        
            ,{name: "french pink",color: "#FD6C9E"}        
            ,{name: "french raspberry",color: "#C72C48"}        
            ,{name: "french rose",color: "#F64A8A"}        
            ,{name: "french sky blue",color: "#77B5FE"}        
            ,{name: "french violet",color: "#8806CE"}        
            ,{name: "frostbite",color: "#E936A7"}        
            ,{name: "fuchsia (crayola)",color: "#C154C1"}        
            ,{name: "fuchsia purple",color: "#CC397B"}        
            ,{name: "fuchsia rose",color: "#C74375"}        
            ,{name: "fulvous",color: "#E48400"}        
            ,{name: "fuzzy wuzzy",color: "#87421F"}        
            ,{name: "gamboge",color: "#E49B0F"}        
            ,{name: "garnet",color: "#733635"}        
            ,{name: "generic viridian",color: "#007F66"}        
            ,{name: "ghost white",color: "#F8F8FF"}        
            ,{name: "glaucous",color: "#6082B6"}        
            ,{name: "glossy grape",color: "#AB92B3"}        
            ,{name: "go green",color: "#00AB66"}        
            ,{name: "gold (metallic)",color: "#D4AF37"}            
            ,{name: "gold (crayola)",color: "#E6BE8A"}        
            ,{name: "gold fusion",color: "#85754E"}        
            ,{name: "golden brown",color: "#996515"}        
            ,{name: "golden poppy",color: "#FCC200"}        
            ,{name: "golden yellow",color: "#FFDF00"}        
            ,{name: "granite gray",color: "#676767"}        
            ,{name: "granny smith apple",color: "#A8E4A0"}        
            ,{name: "gray (x11)",color: "#BEBEBE"}        
            ,{name: "green (crayola)",color: "#1CAC78"}            
            ,{name: "green (munsell)",color: "#00A877"}        
            ,{name: "green (ncs)",color: "#009F6B"}        
            ,{name: "green (pantone)",color: "#00AD43"}        
            ,{name: "green (pigment)",color: "#00A550"}        
            ,{name: "green (ryb)",color: "#66B032"}        
            ,{name: "green-blue",color: "#1164B4"}        
            ,{name: "green-blue (crayola)",color: "#2887C8"}        
            ,{name: "green-cyan",color: "#009966"}        
            ,{name: "green lizard",color: "#A7F432"}        
            ,{name: "green sheen",color: "#6EAEA1"}        
            ,{name: "green-yellow",color: "#ADFF2F"}        
            ,{name: "green-yellow (crayola)",color: "#F0E891"}        
            ,{name: "grullo",color: "#A99A86"}        
            ,{name: "gunmetal",color: "#2a3439"}        
            ,{name: "han blue",color: "#446CCF"}        
            ,{name: "han purple",color: "#5218FA"}        
            ,{name: "hansa yellow",color: "#E9D66B"}        
            ,{name: "harlequin",color: "#3FFF00"}        
            ,{name: "harvest gold",color: "#DA9100"}        
            ,{name: "heat wave",color: "#FF7A00"}        
            ,{name: "heliotrope",color: "#DF73FF"}        
            ,{name: "heliotrope gray",color: "#AA98A9"}        
            ,{name: "hollywood cerise",color: "#F400A1"}        
            ,{name: "honolulu blue",color: "#006DB0"}        
            ,{name: "hooker's green",color: "#49796B"}        
            ,{name: "hot fuchsia",color: "#FF00C6"}        
            ,{name: "hot magenta",color: "#FF1DCE"}        
            ,{name: "hot pink",color: "#FF69B4"}        
            ,{name: "hunter green",color: "#355E3B"}        
            ,{name: "iceberg",color: "#71A6D2"}        
            ,{name: "icterine",color: "#FCF75E"}        
            ,{name: "illuminating emerald",color: "#319177"}        
            ,{name: "imperial red",color: "#ED2939"}        
            ,{name: "inchworm",color: "#B2EC5D"}        
            ,{name: "independence",color: "#4C516D"}        
            ,{name: "india green",color: "#138808"}        
            ,{name: "indian red",color: "#CD5C5C"}        
            ,{name: "indian yellow",color: "#E3A857"}        
            ,{name: "indigo(color wheel)",color: "#4000FF"}        
            ,{name: "indigo dye",color: "#00416A"}        
            ,{name: "international orange (aerospace)",color: "#FF4F00"}        
            ,{name: "international orange (engineering)",color: "#BA160C"}        
            ,{name: "international orange (golden gate bridge)",color: "#C0362C"}        
            ,{name: "iris",color: "#5A4FCF"}        
            ,{name: "irresistible",color: "#B3446C"}        
            ,{name: "isabelline",color: "#F4F0EC"}        
            ,{name: "italian sky blue",color: "#B2FFFF"}        
            ,{name: "jade",color: "#00A86B"}        
            ,{name: "japanese carmine",color: "#9D2933"}        
            ,{name: "japanese violet",color: "#5B3256"}        
            ,{name: "jasmine",color: "#F8DE7E"}        
            ,{name: "jazzberry jam",color: "#A50B5E"}        
            ,{name: "jet",color: "#343434"}        
            ,{name: "jonquil",color: "#F4CA16"}        
            ,{name: "june bud",color: "#BDDA57"}        
            ,{name: "jungle green",color: "#29AB87"}        
            ,{name: "kelly green",color: "#4CBB17"}        
            ,{name: "keppel",color: "#3AB09E"}        
            ,{name: "key lime",color: "#E8F48C"}            
            ,{name: "khaki (x11) (light khaki)",color: "#F0E68C"}        
            ,{name: "kobe",color: "#882D17"}        
            ,{name: "kobi",color: "#E79FC4"}        
            ,{name: "kobicha",color: "#6B4423"}        
            ,{name: "kombu green",color: "#354230"}        
            ,{name: "ksu purple",color: "#512888"}        
            ,{name: "la salle green",color: "#087830"}        
            ,{name: "languid lavender",color: "#D6CADD"}        
            ,{name: "lanzones",color: "#E0BC5B"}        
            ,{name: "lapis lazuli",color: "#26619C"}          
            ,{name: "laurel green",color: "#A9BA9D"}        
            ,{name: "lava",color: "#CF1020"}        
            ,{name: "lavender (floral)",color: "#B57EDC"}          
            ,{name: "lavender blue",color: "#CCCCFF"}        
            ,{name: "lavender gray",color: "#C4C3D0"}        
            ,{name: "lavender indigo",color: "#9457EB"}        
            ,{name: "lavender magenta",color: "#EE82EE"}        
            ,{name: "lavender mist",color: "#E6E6FA"}        
            ,{name: "lavender purple",color: "#967BB6"}        
            ,{name: "lavender rose",color: "#FBA0E3"}        
            ,{name: "lemon",color: "#FFF700"}        
            ,{name: "lemon chiffon",color: "#FFFACD"}        
            ,{name: "lemon curry",color: "#CCA01D"}        
            ,{name: "lemon glacier",color: "#FDFF00"}        
            ,{name: "lemon iced tea",color: "#BD3000"}        
            ,{name: "lemon lime",color: "#E3FF00"}        
            ,{name: "lemon lime",color: "#5CFF67"}        
            ,{name: "lemon meringue",color: "#F6EABE"}        
            ,{name: "lemon yellow",color: "#FFF44F"}        
            ,{name: "lemon yellow (crayola)",color: "#FFFF9F"}        
            ,{name: "licorice",color: "#1A1110"}        
            ,{name: "light brown",color: "#B5651D"}        
            ,{name: "light carmine pink",color: "#E66771"}        
            ,{name: "light chocolate cosmos",color: "#551F2F"}        
            ,{name: "light cobalt blue",color: "#88ACE0"}        
            ,{name: "light cornflower blue",color: "#93CCEA"}        
            ,{name: "light crimson",color: "#F56991"}        
            ,{name: "light cyan",color: "#E0FFFF"}        
            ,{name: "light french beige",color: "#C8AD7F"}        
            ,{name: "light fuchsia pink",color: "#F984EF"}        
            ,{name: "light gold",color: "#B29700"}        
            ,{name: "light grayish magenta",color: "#CC99CC"}        
            ,{name: "light medium orchid",color: "#D39BCB"}        
            ,{name: "light orchid",color: "#E6A8D7"}        
            ,{name: "light pastel purple",color: "#B19CD9"}        
            ,{name: "light periwinkle",color: "#C5CBE1"}        
            ,{name: "light red",color: "#FFCCCB"}        
            ,{name: "light red ochre",color: "#E97451"}        
            ,{name: "light salmon pink",color: "#FF9999"}        
            ,{name: "light sea green",color: "#20B2AA"}        
            ,{name: "light silver",color: "#D8D8D8"}        
            ,{name: "light thulian pink",color: "#E68FAC"}        
            ,{name: "lilac",color: "#C8A2C8"}        
            ,{name: "lilac luster",color: "#AE98AA"}        
            ,{name: "lime (color wheel)",color: "#BFFF00"}           
            ,{name: "lime green",color: "#32CD32"}        
            ,{name: "limerick",color: "#9DC209"}        
            ,{name: "lincoln green",color: "#195905"}        
            ,{name: "lion",color: "#C19A6B"}        
            ,{name: "liseran purple",color: "#DE6FA1"}        
            ,{name: "little boy blue",color: "#6CA0DC"}        
            ,{name: "little girl pink",color: "#F8B9D4"}        
            ,{name: "liver",color: "#674C47"}        
            ,{name: "liver (dogs)",color: "#B86D29"}        
            ,{name: "liver (organ)",color: "#6C2E1F"}        
            ,{name: "liver chestnut",color: "#987456"}        
            ,{name: "livid",color: "#6699CC"}        
            ,{name: "lotion",color: "#FEFDFA"}        
            ,{name: "lotion blue",color: "#15F2FD"}        
            ,{name: "lotion pink",color: "#ECCFCF"}        
            ,{name: "lumber",color: "#FFE4CD"}        
            ,{name: "lust",color: "#E62020"}        
            ,{name: "maastricht blue",color: "#001C3D"}        
            ,{name: "macaroni and cheese",color: "#FFBD88"}        
            ,{name: "madder lake",color: "#CC3336"}        
            ,{name: "magenta (pantone)",color: "#D0417E"}        
            ,{name: "magic mint",color: "#AAF0D1"}        
            ,{name: "mahogany",color: "#C04000"}        
            ,{name: "maize",color: "#FBEC5D"}        
            ,{name: "maize (crayola)",color: "#F2C649"}        
            ,{name: "majorelle blue",color: "#6050DC"}        
            ,{name: "malachite",color: "#0BDA51"}        
            ,{name: "manatee",color: "#979AAA"}        
            ,{name: "mandarin",color: "#F37A48"}        
            ,{name: "mango",color: "#FDBE02"}        
            ,{name: "mango green",color: "#96FF00"}        
            ,{name: "mango tango",color: "#FF8243"}        
            ,{name: "mantis",color: "#74C365"}        
            ,{name: "mardi gras",color: "#880085"}        
            ,{name: "marigold",color: "#EAA221"}        
            ,{name: "maroon (crayola)",color: "#C32148"}            
            ,{name: "maroon (x11)",color: "#B03060"}        
            ,{name: "mauve",color: "#E0B0FF"}        
            ,{name: "mauve taupe",color: "#915F6D"}        
            ,{name: "mauvelous",color: "#EF98AA"}        
            ,{name: "maximum blue",color: "#47ABCC"}        
            ,{name: "maximum blue green",color: "#30BFBF"}        
            ,{name: "maximum blue purple",color: "#ACACE6"}        
            ,{name: "maximum green",color: "#5E8C31"}        
            ,{name: "maximum green yellow",color: "#D9E650"}        
            ,{name: "maximum orange",color: "#FF5B00"}        
            ,{name: "maximum purple",color: "#733380"}        
            ,{name: "maximum pink",color: "#F6A5F2"}        
            ,{name: "maximum red",color: "#D92121"}        
            ,{name: "maximum red purple",color: "#A63A79"}        
            ,{name: "maximum violet",color: "#892F77"}        
            ,{name: "maximum yellow",color: "#FAFA37"}        
            ,{name: "maximum yellow red",color: "#F2BA49"}        
            ,{name: "may green",color: "#4C9141"}        
            ,{name: "maya blue",color: "#73C2FB"}        
            ,{name: "medium aquamarine",color: "#66DDAA"}        
            ,{name: "medium blue",color: "#0000CD"}        
            ,{name: "medium candy apple red",color: "#E2062C"}        
            ,{name: "medium carmine",color: "#AF4035"}        
            ,{name: "medium champagne",color: "#F3E5AB"}        
            ,{name: "medium electric blue",color: "#035096"}        
            ,{name: "medium green",color: "#037949"}        
            ,{name: "medium jungle green",color: "#1C352D"}          
            ,{name: "medium orange",color: "#FF7802"}        
            ,{name: "medium orchid",color: "#BA55D3"}        
            ,{name: "medium persian blue",color: "#0067A5"}        
            ,{name: "medium pink",color: "#FE6E9F"}        
            ,{name: "medium purple",color: "#9370DB"}        
            ,{name: "medium red",color: "#B10304"}        
            ,{name: "medium red-violet",color: "#BB3385"}        
            ,{name: "medium ruby",color: "#AA4069"}        
            ,{name: "medium sea green",color: "#3CB371"}        
            ,{name: "medium sky blue",color: "#80DAEB"}        
            ,{name: "medium slate blue",color: "#7B68EE"}        
            ,{name: "medium spring bud",color: "#C9DC87"}        
            ,{name: "medium spring green",color: "#00FA9A"}        
            ,{name: "medium taupe",color: "#674C47"}        
            ,{name: "medium turquoise",color: "#48D1CC"}        
            ,{name: "medium tuscan red",color: "#79443B"}        
            ,{name: "medium vermilion",color: "#D9603B"}        
            ,{name: "medium violet",color: "#65315F"}        
            ,{name: "medium violet-red",color: "#C71585"}        
            ,{name: "medium yellow",color: "#FFE302"}        
            ,{name: "mellow apricot",color: "#F8B878"}        
            ,{name: "mellow yellow",color: "#F8DE7E"}        
            ,{name: "melon",color: "#FDBCB4"}        
            ,{name: "melon (crayola)",color: "#FEBAAD"}        
            ,{name: "menthol",color: "#C1F9A2"}        
            ,{name: "metallic blue",color: "#32527B"}        
            ,{name: "metallic bronze",color: "#A97142"}        
            ,{name: "metallic brown",color: "#AC4313"}        
            ,{name: "metallic gold",color: "#D3AF37"}        
            ,{name: "metallic green",color: "#296E01"}        
            ,{name: "metallic orange",color: "#DA680F"}        
            ,{name: "metallic pink",color: "#EDA6C4"}        
            ,{name: "metallic red",color: "#A62C2B"}        
            ,{name: "metallic seaweed",color: "#0A7E8C"}        
            ,{name: "metallic silver",color: "#A8A9AD"}        
            ,{name: "metallic sunburst",color: "#9C7C38"}        
            ,{name: "metallic violet",color: "#5B0A91"}        
            ,{name: "metallic yellow",color: "#FDCC0D"}        
            ,{name: "mexican pink",color: "#E4007C"}        
            ,{name: "microsoft blue",color: "#00A2ED"}        
            ,{name: "microsoft edge blue",color: "#0078D7"}        
            ,{name: "microsoft green",color: "#7DB700"}        
            ,{name: "microsoft red",color: "#F04E1F"}        
            ,{name: "microsoft yellow",color: "#FDB900"}        
            ,{name: "middle blue",color: "#7ED4E6"}        
            ,{name: "middle blue green",color: "#8DD9CC"}        
            ,{name: "middle blue purple",color: "#8B72BE"}        
            ,{name: "middle grey",color: "#8B8680"}        
            ,{name: "middle green",color: "#4D8C57"}        
            ,{name: "middle green yellow",color: "#ACBF60"}        
            ,{name: "middle purple",color: "#D982B5"}        
            ,{name: "middle red",color: "#E58E73"}        
            ,{name: "middle red purple",color: "#A55353"}        
            ,{name: "middle yellow",color: "#FFEB00"}        
            ,{name: "middle yellow red",color: "#ECB176"}        
            ,{name: "midnight",color: "#702670"}        
            ,{name: "midnight blue",color: "#191970"}        
            ,{name: "midnight blue",color: "#00468C"}        
            ,{name: "midnight green (eagle green)",color: "#004953"}        
            ,{name: "mikado yellow",color: "#FFC40C"}        
            ,{name: "milk",color: "#FDFFF5"}        
            ,{name: "milk chocolate",color: "#84563C"}        
            ,{name: "mimi pink",color: "#FFDAE9"}        
            ,{name: "mindaro",color: "#E3F988"}        
            ,{name: "ming",color: "#36747D"}        
            ,{name: "minion yellow",color: "#F5E050"}        
            ,{name: "mint",color: "#3EB489"}        
            ,{name: "mint cream",color: "#F5FFFA"}        
            ,{name: "mint green",color: "#98FF98"}        
            ,{name: "misty moss",color: "#BBB477"}        
            ,{name: "misty rose",color: "#FFE4E1"}        
            ,{name: "mocha",color: "#BEA493"}        
            ,{name: "mode beige",color: "#967117"}        
            ,{name: "moonstone",color: "#3AA8C1"}        
            ,{name: "moonstone blue",color: "#73A9C2"}        
            ,{name: "mordant red 19",color: "#AE0C00"}        
            ,{name: "morning blue",color: "#8DA399"}        
            ,{name: "moss green",color: "#8A9A5B"}        
            ,{name: "mountain meadow",color: "#30BA8F"}        
            ,{name: "mountbatten pink",color: "#997A8D"}        
            ,{name: "msu green",color: "#18453B"}        
            ,{name: "mud",color: "#70543E"}        
            ,{name: "mughal green",color: "#306030"}        
            ,{name: "mulberry",color: "#C54B8C"}        
            ,{name: "mulberry (crayola)",color: "#C8509B"}        
            ,{name: "mummy's tomb",color: "#828E84"}        
            ,{name: "mustard",color: "#FFDB58"}        
            ,{name: "mustard brown",color: "#CD7A00"}        
            ,{name: "mustard green",color: "#6E6E30"}        
            ,{name: "mustard yellow",color: "#E1AD01"}        
            ,{name: "myrtle green",color: "#317873"}        
            ,{name: "mystic",color: "#D65282"}        
            ,{name: "mystic maroon",color: "#AD4379"}        
            ,{name: "mystic red",color: "#FF5500"}        
            ,{name: "nadeshiko pink",color: "#F6ADC6"}        
            ,{name: "napier green",color: "#2A8000"}        
            ,{name: "naples yellow",color: "#FADA5E"}        
            ,{name: "navajo white",color: "#FFDEAD"}        
            ,{name: "navy blue",color: "#000080"}        
            ,{name: "navy blue (crayola)",color: "#1974D2"}        
            ,{name: "navy purple",color: "#9457EB"}        
            ,{name: "neon blue",color: "#1B03A3"}        
            ,{name: "neon brown",color: "#C3732A"}        
            ,{name: "neon carrot",color: "#AAF0D1"}        
            ,{name: "neon cyan",color: "#00FEFC"}        
            ,{name: "neon fuchsia",color: "#FE4164"}        
            ,{name: "neon gold",color: "#CFAA01"}        
            ,{name: "neon gray",color: "#808080"}        
            ,{name: "neon dark green",color: "#008443"}        
            ,{name: "neon green",color: "#139B42"}        
            ,{name: "neon green",color: "#39FF14"}        
            ,{name: "neon pink",color: "#FE347E"}        
            ,{name: "neon purple",color: "#9457EB"}        
            ,{name: "neon red",color: "#FF1818"}        
            ,{name: "neon scarlet",color: "#FF2603"}        
            ,{name: "neon silver",color: "#CCCCCC"}        
            ,{name: "neon tangerine",color: "#F6890A"}        
            ,{name: "neon yellow",color: "#FFF700"}        
            ,{name: "new car",color: "#214FC6"}        
            ,{name: "new york pink",color: "#D7837F"}        
            ,{name: "nickel",color: "#727472"}        
            ,{name: "nintendo red",color: "#E4000F"}        
            ,{name: "non-photo blue",color: "#A4DDED"}        
            ,{name: "nyanza",color: "#E9FFDB"}        
            ,{name: "ocean boat blue",color: "#0077BE"}        
            ,{name: "ochre",color: "#CC7722"}            
            ,{name: "old burgundy",color: "#43302E"}        
            ,{name: "old gold",color: "#CFB53B"}        
            ,{name: "old heliotrope",color: "#563C5C"}        
            ,{name: "old lace",color: "#FDF5E6"}        
            ,{name: "old lavender",color: "#796878"}        
            ,{name: "old mauve",color: "#673147"}        
            ,{name: "old moss green",color: "#867E36"}        
            ,{name: "old rose",color: "#C08081"}        
            ,{name: "old silver",color: "#848482"}        
            ,{name: "olive drab (#3)",color: "#6B8E23"}        
            ,{name: "olive drab #7",color: "#3C341F"}        
            ,{name: "olive green",color: "#B5B35C"}        
            ,{name: "olivine",color: "#9AB973"}        
            ,{name: "onyx",color: "#353839"}        
            ,{name: "opal",color: "#A8C3BC"}        
            ,{name: "opera mauve",color: "#B784A7"}        
            ,{name: "orange (color wheel)",color: "#FF7F00"}        
            ,{name: "orange (crayola)",color: "#FF7538"}        
            ,{name: "orange (pantone)",color: "#FF5800"}        
            ,{name: "orange (ryb)",color: "#FB9902"}        
            ,{name: "orange iced tea",color: "#FF6700"}        
            ,{name: "orange-red (crayola)",color: "#FF5349"}        
            ,{name: "orange soda",color: "#E74E14"}        
            ,{name: "orange soda",color: "#FA5B3D"}        
            ,{name: "orange-yellow",color: "#F5BD1F"}        
            ,{name: "orange-yellow (crayola)",color: "#F8D568"}        
            ,{name: "orchid pink",color: "#F2BDCD"}        
            ,{name: "orchid (crayola)",color: "#E29CD2"}        
            ,{name: "orioles orange",color: "#FB4F14"}        
            ,{name: "otter brown",color: "#654321"}        
            ,{name: "outer space",color: "#414A4C"}        
            ,{name: "outer space (crayola)",color: "#2D383A"}        
            ,{name: "outrageous orange",color: "#FF6037"}        
            ,{name: "oxblood",color: "#800020"}        
            ,{name: "oxford blue",color: "#002147"}        
            ,{name: "oxley",color: "#6D9A79"}        
            ,{name: "ou crimson red",color: "#990000"}        
            ,{name: "pacific blue",color: "#1CA9C9"}        
            ,{name: "pakistan green",color: "#006600"}        
            ,{name: "palatinate blue",color: "#273BE2"}        
            ,{name: "palatinate purple",color: "#682860"}        
            ,{name: "pale aqua",color: "#BCD4E6"}        
            ,{name: "pale blue",color: "#AFEEEE"}        
            ,{name: "pale brown",color: "#987654"}        
            ,{name: "pale carmine",color: "#AF4035"}        
            ,{name: "pale cerulean",color: "#9BC4E2"}        
            ,{name: "pale chestnut",color: "#DDADAF"}        
            ,{name: "pale copper",color: "#DA8A67"}        
            ,{name: "pale cornflower blue",color: "#ABCDEF"}        
            ,{name: "pale cyan",color: "#87D3F8"}        
            ,{name: "pale gold",color: "#E6BE8A"}        
            ,{name: "pale goldenrod",color: "#EEE8AA"}        
            ,{name: "pale green",color: "#98FB98"}        
            ,{name: "pale lavender",color: "#DCD0FF"}        
            ,{name: "pale magenta",color: "#F984E5"}        
            ,{name: "pale pink",color: "#FADADD"}         
            ,{name: "pale robin egg blue",color: "#96DED1"}        
            ,{name: "pale silver",color: "#C9C0BB"}        
            ,{name: "pale spring bud",color: "#ECEBBD"}        
            ,{name: "pale taupe",color: "#BC987E"}        
            ,{name: "pale turquoise",color: "#AFEEEE"}        
            ,{name: "pale violet",color: "#CC99FF"}        
            ,{name: "pale violet-red",color: "#DB7093"}        
            ,{name: "pansy purple",color: "#78184A"}        
            ,{name: "paolo veronese green",color: "#009B7D"}        
            ,{name: "papaya whip",color: "#FFEFD5"}        
            ,{name: "paradise pink",color: "#E63E62"}        
            ,{name: "parchment",color: "#F1E9D2"}        
            ,{name: "paris green",color: "#50C878"}        
            ,{name: "pastel blue",color: "#AEC6CF"}        
            ,{name: "pastel brown",color: "#836953"}        
            ,{name: "pastel gray",color: "#CFCFC4"}        
            ,{name: "pastel green",color: "#77DD77"}        
            ,{name: "pastel magenta",color: "#F49AC2"}        
            ,{name: "pastel orange",color: "#FFB347"}        
            ,{name: "pastel pink",color: "#DEA5A4"}        
            ,{name: "pastel purple",color: "#B39EB5"}        
            ,{name: "pastel red",color: "#FF6961"}        
            ,{name: "pastel violet",color: "#CB99C9"}        
            ,{name: "pastel yellow",color: "#FDFD96"}        
            ,{name: "payne's grey",color: "#536878"}        
            ,{name: "peach",color: "#FFE5B4"}        
            ,{name: "peach (crayola)",color: "#FFCBA4"}        
            ,{name: "peach puff",color: "#FFDAB9"}        
            ,{name: "pear",color: "#D1E231"}        
            ,{name: "pearl",color: "#EAE0C8"}        
            ,{name: "pearl aqua",color: "#88D8C0"}        
            ,{name: "pearly purple",color: "#B768A2"}        
            ,{name: "peridot",color: "#E6E200"}        
            ,{name: "periwinkle",color: "#CCCCFF"}        
            ,{name: "periwinkle (crayola)",color: "#C3CDE6"}        
            ,{name: "persian blue",color: "#1C39BB"}        
            ,{name: "persian green",color: "#00A693"}        
            ,{name: "persian indigo",color: "#32127A"}        
            ,{name: "persian orange",color: "#D99058"}        
            ,{name: "persian pink",color: "#F77FBE"}        
            ,{name: "persian plum",color: "#701C1C"}        
            ,{name: "persian red",color: "#CC3333"}        
            ,{name: "persian rose",color: "#FE28A2"}        
            ,{name: "persimmon",color: "#EC5800"}        
            ,{name: "petal",color: "#F5E2E2"}        
            ,{name: "pewter blue",color: "#8BA8B7"}        
            ,{name: "philippine blue",color: "#0038A7"}        
            ,{name: "philippine bronze",color: "#6E3A07"}        
            ,{name: "philippine brown",color: "#5D1916"}        
            ,{name: "philippine gold",color: "#B17304"}        
            ,{name: "philippine golden yellow",color: "#FFDF00"}        
            ,{name: "philippine gray",color: "#8C8C8C"}        
            ,{name: "philippine green",color: "#008543"}        
            ,{name: "philippine indigo",color: "#00416A"}        
            ,{name: "philippine orange",color: "#FF7300"}        
            ,{name: "philippine pink",color: "#FA1A8E"}        
            ,{name: "philippine red",color: "#CE1127"}        
            ,{name: "philippine silver",color: "#B3B3B3"}        
            ,{name: "philippine sky blue",color: "#0066FF"}        
            ,{name: "philippine violet",color: "#81007F"}        
            ,{name: "philippine yellow",color: "#FECB00"}        
            ,{name: "phlox",color: "#DF00FF"}        
            ,{name: "phthalo blue",color: "#000F89"}        
            ,{name: "phthalo green",color: "#123524"}        
            ,{name: "picton blue",color: "#45B1E8"}        
            ,{name: "pictorial carmine",color: "#C30B4E"}        
            ,{name: "piggy pink",color: "#FDDDE6"}        
            ,{name: "pine green",color: "#01796F"}        
            ,{name: "pine green",color: "#2A2F23"}        
            ,{name: "pineapple",color: "#563C0D"}        
            ,{name: "pink (pantone)",color: "#D74894"}        
            ,{name: "pink diamond (ace hardware color)",color: "#F6D6DE"}        
            ,{name: "pink diamond (independent retailers colors)",color: "#F0D3DC"}        
            ,{name: "pink flamingo",color: "#FC74FD"}        
            ,{name: "pink lace",color: "#FFDDF4"}        
            ,{name: "pink pearl",color: "#E7ACCF"}        
            ,{name: "pink sherbet",color: "#F78FA7"}        
            ,{name: "pistachio",color: "#93C572"}        
            ,{name: "platinum",color: "#E5E4E2"}          
            ,{name: "plump purple",color: "#5946B2"}        
            ,{name: "poison purple",color: "#7F01FE"}        
            ,{name: "police blue",color: "#374F6B"}        
            ,{name: "polished pine",color: "#5DA493"}        
            ,{name: "pomp and power",color: "#86608E"}        
            ,{name: "portland orange",color: "#FF5A36"}        
            ,{name: "powder blue",color: "#B0E0E6"}        
            ,{name: "princeton orange",color: "#F58025"}        
            ,{name: "prune",color: "#701C1C"}        
            ,{name: "prussian blue",color: "#003153"}        
            ,{name: "psychedelic purple",color: "#DF00FF"}        
            ,{name: "puce",color: "#CC8899"}        
            ,{name: "puce red",color: "#722F37"}        
            ,{name: "pullman brown (ups brown)",color: "#644117"}        
            ,{name: "pumpkin",color: "#FF7518"}           
            ,{name: "purple (munsell)",color: "#9F00C5"}        
            ,{name: "purple (x11)",color: "#A020F0"}        
            ,{name: "purple heart",color: "#69359C"}        
            ,{name: "purple mountain majesty",color: "#9678B6"}        
            ,{name: "purple navy",color: "#4E5180"}        
            ,{name: "purple pizzazz",color: "#FE4EDA"}        
            ,{name: "purple plum",color: "#9C51B6"}        
            ,{name: "purple taupe",color: "#50404D"}        
            ,{name: "purpureus",color: "#9A4EAE"}        
            ,{name: "quartz",color: "#51484F"}        
            ,{name: "queen blue",color: "#436B95"}        
            ,{name: "queen pink",color: "#E8CCD7"}        
            ,{name: "quick silver",color: "#A6A6A6"}        
            ,{name: "quinacridone magenta",color: "#8E3A59"}        
            ,{name: "quincy",color: "#6A5445"}        
            ,{name: "rackley",color: "#5D8AA8"}        
            ,{name: "radical red",color: "#FF355E"}        
            ,{name: "raisin black",color: "#242124"}        
            ,{name: "rajah",color: "#FBAB60"}        
            ,{name: "raspberry",color: "#E30B5D"}        
            ,{name: "raw sienna",color: "#D68A59"}        
            ,{name: "raw umber",color: "#826644"}        
            ,{name: "razzmatazz",color: "#E30B5C"}        
            ,{name: "razzle dazzle rose",color: "#FF33CC"}        
            ,{name: "razzmic berry",color: "#8D4E85"}        
            ,{name: "rebecca purple",color: "#663399"}        
            ,{name: "red (crayola)",color: "#EE204D"}        
            ,{name: "red (munsell)",color: "#F2003C"}        
            ,{name: "red (ncs)",color: "#C40233"}        
            ,{name: "red (pantone)",color: "#ED2939"}        
            ,{name: "red (pigment)",color: "#ED1C24"}        
            ,{name: "red (ryb)",color: "#FE2712"}         
            ,{name: "red cola",color: "#DF0118"}        
            ,{name: "red-orange (crayola)",color: "#FF681F"}        
            ,{name: "red-orange (color wheel)",color: "#FF4500"}        
            ,{name: "red rum",color: "#973A4A"}        
            ,{name: "red salsa",color: "#FD3A4A"}        
            ,{name: "red strawberry",color: "#EC0304"}        
            ,{name: "red-violet",color: "#C71585"}        
            ,{name: "red-violet (crayola)",color: "#C0448F"}        
            ,{name: "red-violet (color wheel)",color: "#922B3E"}        
            ,{name: "redwood",color: "#A45A52"}        
            ,{name: "registration black",color: "#000000"}        
            ,{name: "resolution blue",color: "#002387"}        
            ,{name: "rhythm",color: "#777696"}        
            ,{name: "rich brilliant lavender",color: "#F1A7FE"}        
            ,{name: "rich carmine",color: "#D70040"}        
            ,{name: "rich electric blue",color: "#0892D0"}        
            ,{name: "rich lavender",color: "#A76BCF"}        
            ,{name: "rich lilac",color: "#B666D2"}        
            ,{name: "rich maroon",color: "#B03060"}        
            ,{name: "rifle green",color: "#444C38"}        
            ,{name: "ripe mango",color: "#FFC324"}        
            ,{name: "roast coffee",color: "#704241"}        
            ,{name: "robin egg blue",color: "#00CCCC"}        
            ,{name: "rocket metallic",color: "#8A7F80"}        
            ,{name: "roman silver",color: "#838996"}        
            ,{name: "root beer",color: "#290E05"}        
            ,{name: "rose",color: "#FF007F"}        
            ,{name: "rose dust",color: "#9E5E6F"}        
            ,{name: "royal azure",color: "#0038A8"}        
            ,{name: "royal blue",color: "#002366"}        
            ,{name: "royal blue",color: "#4169E1"}        
            ,{name: "royal brown",color: "#523B35"}        
            ,{name: "royal fuchsia",color: "#CA2C92"}        
            ,{name: "royal green",color: "#136207"}        
            ,{name: "royal orange",color: "#F99245"}        
            ,{name: "royal pink",color: "#E73895"}        
            ,{name: "royal red",color: "#9B1C31"}        
            ,{name: "royal red",color: "#D00060"}        
            ,{name: "royal purple",color: "#7851A9"}        
            ,{name: "royal yellow",color: "#FADA5E"}        
            ,{name: "ruby",color: "#E0115F"}        
            ,{name: "rufous",color: "#A81C07"}        
            ,{name: "rum",color: "#9A4E40"}        
            ,{name: "russet",color: "#80461B"}        
            ,{name: "russian green",color: "#679267"}        
            ,{name: "russian violet",color: "#32174D"}        
            ,{name: "rust",color: "#B7410E"}        
            ,{name: "rusty red",color: "#DA2C43"}        
            ,{name: "sacramento state green",color: "#043927"}        
            ,{name: "saddle brown",color: "#8B4513"}        
            ,{name: "safety orange",color: "#FF7800"}        
            ,{name: "safety orange (blaze orange)",color: "#FF6700"}        
            ,{name: "safety yellow",color: "#EED202"}        
            ,{name: "saffron",color: "#F4C430"}        
            ,{name: "sage",color: "#BCB88A"}        
            ,{name: "st. patrick's blue",color: "#23297A"}        
            ,{name: "salem",color: "#177B4D"}        
            ,{name: "salmon rose",color: "#E7968B"}        
            ,{name: "salmon pink",color: "#FF91A4"}        
            ,{name: "samsung blue",color: "#12279E"}        
            ,{name: "sand",color: "#C2B280"}        
            ,{name: "sand dune",color: "#967117"}        
            ,{name: "sandy brown",color: "#F4A460"}        
            ,{name: "sandy taupe",color: "#967117"}        
            ,{name: "sap green",color: "#507D2A"}        
            ,{name: "sapphire",color: "#0F52BA"}        
            ,{name: "sapphire blue",color: "#0067A5"}        
            ,{name: "satin sheen gold",color: "#CBA135"}        
            ,{name: "scarlet",color: "#FF2400"}        
            ,{name: "scarlet (crayola)",color: "#FD0E35"}        
            ,{name: "schauss pink",color: "#FF91AF"}        
            ,{name: "school bus yellow",color: "#FFD800"}        
            ,{name: "screamin' green",color: "#66FF66"}        
            ,{name: "sea blue",color: "#006994"}        
            ,{name: "sea green",color: "#2E8B57"}        
            ,{name: "sea green (crayola)",color: "#00FFCD"}        
            ,{name: "seal brown",color: "#59260B"}        
            ,{name: "selective yellow",color: "#FFBA00"}        
            ,{name: "sepia",color: "#704214"}        
            ,{name: "shadow",color: "#8A795D"}        
            ,{name: "shadow blue",color: "#778BA5"}        
            ,{name: "shampoo",color: "#FFCFF1"}        
            ,{name: "shamrock green",color: "#009E60"}        
            ,{name: "shandy",color: "#FFE670"}        
            ,{name: "sheen green",color: "#8FD400"}        
            ,{name: "shimmering blush",color: "#D98695"}        
            ,{name: "shiny shamrock",color: "#5FA778"}        
            ,{name: "shocking pink",color: "#FC0FC0"}        
            ,{name: "shocking pink (crayola)",color: "#FF6FFF"}        
            ,{name: "silver (crayola)",color: "#C9C0BB"}        
            ,{name: "silver (metallic)",color: "#AAA9AD"}        
            ,{name: "silver chalice",color: "#ACACAC"}        
            ,{name: "silver foil",color: "#AFB1AE"}        
            ,{name: "silver lake blue",color: "#5D89BA"}        
            ,{name: "silver pink",color: "#C4AEAD"}        
            ,{name: "silver sand",color: "#BFC1C2"}        
            ,{name: "sinopia",color: "#CB410B"}        
            ,{name: "sizzling red",color: "#FF3855"}        
            ,{name: "sizzling sunrise",color: "#FFDB00"}        
            ,{name: "skobeloff",color: "#007474"}        
            ,{name: "sky blue",color: "#87CEEB"}        
            ,{name: "sky blue (crayola)",color: "#76D7EA"}        
            ,{name: "sky magenta",color: "#CF71AF"}        
            ,{name: "slate blue",color: "#6A5ACD"}        
            ,{name: "slate gray",color: "#708090"}        
            ,{name: "slimy green",color: "#299617"}        
            ,{name: "smalt (dark powder blue)",color: "#003399"}        
            ,{name: "smoke",color: "#738276"}        
            ,{name: "smokey topaz",color: "#832A0D"}        
            ,{name: "smoky black",color: "#100C08"}        
            ,{name: "soap",color: "#CEC8EF"}        
            ,{name: "solid pink",color: "#893843"}        
            ,{name: "sonic silver",color: "#757575"}        
            ,{name: "spartan crimson",color: "#9E1316"}        
            ,{name: "space cadet",color: "#1D2951"}        
            ,{name: "spanish bistre",color: "#807532"}        
            ,{name: "spanish blue",color: "#0070B8"}        
            ,{name: "spanish carmine",color: "#D10047"}        
            ,{name: "spanish crimson",color: "#E51A4C"}        
            ,{name: "spanish gray",color: "#989898"}        
            ,{name: "spanish green",color: "#009150"}        
            ,{name: "spanish orange",color: "#E86100"}        
            ,{name: "spanish pink",color: "#F7BFBE"}        
            ,{name: "spanish purple",color: "#66033C"}        
            ,{name: "spanish red",color: "#E60026"}        
            ,{name: "spanish sky blue",color: "#00FFFF"}        
            ,{name: "spanish violet",color: "#4C2882"}        
            ,{name: "spanish viridian",color: "#007F5C"}        
            ,{name: "spanish yellow",color: "#F6B511"}        
            ,{name: "spicy mix",color: "#8B5f4D"}        
            ,{name: "spring bud",color: "#A7FC00"}        
            ,{name: "spring frost",color: "#87FF2A"}        
            ,{name: "spring green",color: "#00FF7F"}        
            ,{name: "spring green (crayola)",color: "#ECEBBD"}        
            ,{name: "star command blue",color: "#007BB8"}        
            ,{name: "steel blue",color: "#4682B4"}        
            ,{name: "steel pink",color: "#CC33CC"}        
            ,{name: "steel teal",color: "#5F8A8F"}        
            ,{name: "stil de grain yellow",color: "#FADA5E"}        
            ,{name: "straw",color: "#E4D96F"}        
            ,{name: "strawberry",color: "#FC5A8D"}        
            ,{name: "stop red",color: "#CF142B"}        
            ,{name: "strawberry iced tea",color: "#FC5A8D"}        
            ,{name: "strawberry red",color: "#C83F49"}        
            ,{name: "sugar plum",color: "#914E75"}        
            ,{name: "sunglow",color: "#FFCC33"}        
            ,{name: "sunray",color: "#E3AB57"}        
            ,{name: "sunset",color: "#FAD6A5"}        
            ,{name: "sunset orange",color: "#FD5E53"}        
            ,{name: "super pink",color: "#CF6BA9"}        
            ,{name: "sweet brown",color: "#A83731"}        
            ,{name: "tan (crayola)",color: "#D99A6C"}        
            ,{name: "tangelo",color: "#F94D00"}        
            ,{name: "tangerine",color: "#F28500"}        
            ,{name: "tangerine yellow",color: "#FFCC00"}        
            ,{name: "tango pink",color: "#E4717A"}        
            ,{name: "tart orange",color: "#FB4D46"}        
            ,{name: "taupe",color: "#483C32"}        
            ,{name: "taupe gray",color: "#8B8589"}        
            ,{name: "tea green",color: "#D0F0C0"}        
            ,{name: "tea rose",color: "#F88379"}        
            ,{name: "tea rose",color: "#F4C2C2"}        
            ,{name: "teal blue",color: "#367588"}        
            ,{name: "teal deer",color: "#99E6B3"}        
            ,{name: "teal green",color: "#00827F"}        
            ,{name: "telemagenta",color: "#CF3476"}        
            ,{name: "temptress",color: "#3C2126"}        
            ,{name: "tenné",color: "#CD5700"}        
            ,{name: "terra cotta",color: "#E2725B"}        
            ,{name: "thistle (crayola)",color: "#EBB0D7"}        
            ,{name: "thulian pink",color: "#DE6FA1"}        
            ,{name: "tickle me pink",color: "#FC89AC"}        
            ,{name: "tiffany blue",color: "#81D8D0"}        
            ,{name: "tiger's eye",color: "#E08D3C"}        
            ,{name: "timberwolf",color: "#DBD7D2"}        
            ,{name: "titanium",color: "#878681"}        
            ,{name: "titanium yellow",color: "#EEE600"}        
            ,{name: "tomato sauce",color: "#B21807"}        
            ,{name: "tooth",color: "#FFFAFA"}        
            ,{name: "topaz",color: "#FFC87C"}        
            ,{name: "tractor red",color: "#FD0E35"}        
            ,{name: "trolley grey",color: "#808080"}        
            ,{name: "tropical rain forest",color: "#00755E"}        
            ,{name: "true blue",color: "#0073CF"}        
            ,{name: "tufts blue",color: "#3E8EDE"}        
            ,{name: "tulip",color: "#FF878D"}        
            ,{name: "tumbleweed",color: "#DEAA88"}        
            ,{name: "turkish rose",color: "#B57281"}        
            ,{name: "turquoise green",color: "#A0D6B4"}        
            ,{name: "tuscan brown",color: "#6F4E37"}        
            ,{name: "tuscan red",color: "#7C4848"}        
            ,{name: "tuscan tan",color: "#A67B5B"}        
            ,{name: "tuscany",color: "#C09999"}        
            ,{name: "twitter blue",color: "#26A7DE"}        
            ,{name: "twilight lavender",color: "#8A496B"}        
            ,{name: "tyrian purple",color: "#66023C"}        
            ,{name: "ultramarine",color: "#3F00FF"}        
            ,{name: "ultramarine blue",color: "#4166F5"}        
            ,{name: "ultramarine blue (caran d'ache)",color: "#2111EF"}        
            ,{name: "ultra pink",color: "#FF6FFF"}        
            ,{name: "ultra red",color: "#FC6C85"}        
            ,{name: "umber",color: "#635147"}        
            ,{name: "unbleached silk",color: "#FFDDCA"}        
            ,{name: "united nations blue",color: "#5B92E5"}        
            ,{name: "unmellow yellow",color: "#FFFF66"}        
            ,{name: "up maroon",color: "#7B1113"}        
            ,{name: "upsdell red",color: "#AE2029"}        
            ,{name: "urobilin",color: "#E1AD21"}        
            ,{name: "van dyke brown",color: "#664228"}        
            ,{name: "vanilla",color: "#F3E5AB"}        
            ,{name: "vanilla ice",color: "#F38FA9"}        
            ,{name: "vegas gold",color: "#C5B358"}        
            ,{name: "venetian red",color: "#C80815"}        
            ,{name: "verdigris",color: "#43B3AE"}        
            ,{name: "vermilion",color: "#E34234"}        
            ,{name: "vermilion",color: "#D9381E"}        
            ,{name: "veronica",color: "#A020F0"}        
            ,{name: "very light azure",color: "#74BBFB"}        
            ,{name: "very light blue",color: "#6666FF"}        
            ,{name: "very light malachite green",color: "#64E986"}        
            ,{name: "very light tangelo",color: "#FFB077"}        
            ,{name: "very pale orange",color: "#FFDFBF"}        
            ,{name: "very pale yellow",color: "#FFFFBF"}        
            ,{name: "vine green",color: "#164010"}        
            ,{name: "violet (caran d'ache)",color: "#6E00C0"}        
            ,{name: "violet (color wheel)",color: "#7F00FF"}        
            ,{name: "violet (crayola)",color: "#963D7F"}        
            ,{name: "violet (ryb)",color: "#8601AF"}         
            ,{name: "violet-blue",color: "#324AB2"}        
            ,{name: "violet-blue (crayola)",color: "#766EC8"}        
            ,{name: "violin brown",color: "#674403"}        
            ,{name: "viridian",color: "#40826D"}        
            ,{name: "viridian green",color: "#009698"}        
            ,{name: "vista blue",color: "#7C9ED9"}        
            ,{name: "vivid amber",color: "#cc9900"}        
            ,{name: "vivid auburn",color: "#922724"}        
            ,{name: "vivid burgundy",color: "#9F1D35"}        
            ,{name: "vivid cerise",color: "#DA1D81"}        
            ,{name: "vivid cerulean",color: "#00AAEE"}        
            ,{name: "vivid crimson",color: "#CC0033"}        
            ,{name: "vivid gamboge",color: "#FF9900"}        
            ,{name: "vivid lime green",color: "#a6d608"}        
            ,{name: "vivid mulberry",color: "#B80CE3"}        
            ,{name: "vivid orange",color: "#FF5F00"}        
            ,{name: "vivid orange peel",color: "#FFA000"}        
            ,{name: "vivid orchid",color: "#CC00FF"}        
            ,{name: "vivid raspberry",color: "#FF006C"}        
            ,{name: "vivid red",color: "#F70D1A"}        
            ,{name: "vivid red-tangelo",color: "#DF6124"}        
            ,{name: "vivid tangelo",color: "#F07427"}        
            ,{name: "vivid vermilion",color: "#e56024"}        
            ,{name: "vivid violet",color: "#9F00FF"}        
            ,{name: "vivid yellow",color: "#FFE302"}        
            ,{name: "water",color: "#D4F1F9"}        
            ,{name: "watermelon",color: "#F05C85"}        
            ,{name: "watermelon red",color: "#BF4147"}        
            ,{name: "watermelon yellow",color: "#EEFF1B"}        
            ,{name: "waterspout",color: "#A4F4F9"}        
            ,{name: "wenge",color: "#645452"}        
            ,{name: "white chocolate",color: "#EDE6D6"}        
            ,{name: "white coffee",color: "#E6E0D4"}        
            ,{name: "white smoke",color: "#F5F5F5"}        
            ,{name: "wild orchid",color: "#D470A2"}        
            ,{name: "wild strawberry",color: "#FF43A4"}        
            ,{name: "wild watermelon",color: "#FC6C85"}        
            ,{name: "willpower orange",color: "#FD5800"}        
            ,{name: "windsor tan",color: "#A75502"}        
            ,{name: "wine",color: "#722F37"}        
            ,{name: "wine red",color: "#B11226"}        
            ,{name: "winter sky",color: "#FF007C"}        
            ,{name: "wintergreen dream",color: "#56887D"}        
            ,{name: "wisteria",color: "#C9A0DC"}        
            ,{name: "wood brown",color: "#C19A6B"}        
            ,{name: "xanadu",color: "#738678"}        
            ,{name: "yellow (crayola)",color: "#FCE883"}        
            ,{name: "yellow (munsell)",color: "#EFCC00"}        
            ,{name: "yellow (ncs)",color: "#FFD300"}        
            ,{name: "yellow (pantone)",color: "#FEDF00"}        
            ,{name: "yellow (process)",color: "#FFEF00"}        
            ,{name: "yellow (ryb)",color: "#FEFE33"}        
            ,{name: "yellow-green",color: "#9ACD32"}        
            ,{name: "yellow-green (crayola)",color: "#C5E384"}        
            ,{name: "yellow orange",color: "#FFAE42"}        
            ,{name: "yellow rose",color: "#FFF000"}        
            ,{name: "yellow sunshine",color: "#FFF700"}        
            ,{name: "yinmn blue",color: "#2E5090"}        
            ,{name: "zaffre",color: "#0014A8"}        
            ,{name: "zebra white",color: "#F5F5F5"}        
            ,{name: "zinnwaldite",color: "#2C1608"}        
    
        ]
    },
    {
        name: "css",
        noName: true,
        colors: [
            {name: "AliceBlue",color: "#F0F8FF"},
            {name: "AntiqueWhite",color: "#FAEBD7"},
            {name: "Aqua",color: "#00FFFF"},
            {name: "Aquamarine",color: "#7FFFD4"},
            {name: "Azure",color: "#F0FFFF"},
            {name: "Beige",color: "#F5F5DC"},
            {name: "Bisque",color: "#FFE4C4"},
            {name: "Black",color: "#000000"},
            {name: "BlanchedAlmond",color: "#FFEBCD"},
            {name: "Blue",color: "#0000FF"},
            {name: "BlueViolet",color: "#8A2BE2"},
            {name: "Brown",color: "#A52A2A"},
            {name: "BurlyWood",color: "#DEB887"},
            {name: "CadetBlue",color: "#5F9EA0"},
            {name: "Chartreuse",color: "#7FFF00"},
            {name: "Chocolate",color: "#D2691E"},
            {name: "Coral",color: "#FF7F50"},
            {name: "CornflowerBlue",color: "#6495ED"},
            {name: "Cornsilk",color: "#FFF8DC"},
            {name: "Crimson",color: "#DC143C"},
            {name: "Cyan",color: "#00FFFF"},
            {name: "DarkBlue",color: "#00008B"},
            {name: "DarkCyan",color: "#008B8B"},
            {name: "DarkGoldenRod",color: "#B8860B"},
            {name: "DarkGray",color: "#A9A9A9"},
            {name: "DarkGrey",color: "#A9A9A9"},
            {name: "DarkGreen",color: "#006400"},
            {name: "DarkKhaki",color: "#BDB76B"},
            {name: "DarkMagenta",color: "#8B008B"},
            {name: "DarkOliveGreen",color: "#556B2F"},
            {name: "DarkOrange",color: "#FF8C00"},
            {name: "DarkOrchid",color: "#9932CC"},
            {name: "DarkRed",color: "#8B0000"},
            {name: "DarkSalmon",color: "#E9967A"},
            {name: "DarkSeaGreen",color: "#8FBC8F"},
            {name: "DarkSlateBlue",color: "#483D8B"},
            {name: "DarkSlateGray",color: "#2F4F4F"},
            {name: "DarkSlateGrey",color: "#2F4F4F"},
            {name: "DarkTurquoise",color: "#00CED1"},
            {name: "DarkViolet",color: "#9400D3"},
            {name: "DeepPink",color: "#FF1493"},
            {name: "DeepSkyBlue",color: "#00BFFF"},
            {name: "DimGray",color: "#696969"},
            {name: "DimGrey",color: "#696969"},
            {name: "DodgerBlue",color: "#1E90FF"},
            {name: "FireBrick",color: "#B22222"},
            {name: "FloralWhite",color: "#FFFAF0"},
            {name: "ForestGreen",color: "#228B22"},
            {name: "Fuchsia",color: "#FF00FF"},
            {name: "Gainsboro",color: "#DCDCDC"},
            {name: "GhostWhite",color: "#F8F8FF"},
            {name: "Gold",color: "#FFD700"},
            {name: "GoldenRod",color: "#DAA520"},
            {name: "Gray",color: "#808080"},
            {name: "Grey",color: "#808080"},
            {name: "Green",color: "#008000"},
            {name: "GreenYellow",color: "#ADFF2F"},
            {name: "HoneyDew",color: "#F0FFF0"},
            {name: "HotPink",color: "#FF69B4"},
            {name: "IndianRed",color: "#CD5C5C"},
            {name: "Indigo",color: "#4B0082"},
            {name: "Ivory",color: "#FFFFF0"},
            {name: "Khaki",color: "#F0E68C"},
            {name: "Lavender",color: "#E6E6FA"},
            {name: "LavenderBlush",color: "#FFF0F5"},
            {name: "LawnGreen",color: "#7CFC00"},
            {name: "LemonChiffon",color: "#FFFACD"},
            {name: "LightBlue",color: "#ADD8E6"},
            {name: "LightCoral",color: "#F08080"},
            {name: "LightCyan",color: "#E0FFFF"},
            {name: "LightGoldenRodYellow",color: "#FAFAD2"},
            {name: "LightGray",color: "#D3D3D3"},
            {name: "LightGrey",color: "#D3D3D3"},
            {name: "LightGreen",color: "#90EE90"},
            {name: "LightPink",color: "#FFB6C1"},
            {name: "LightSalmon",color: "#FFA07A"},
            {name: "LightSeaGreen",color: "#20B2AA"},
            {name: "LightSkyBlue",color: "#87CEFA"},
            {name: "LightSlateGray",color: "#778899"},
            {name: "LightSlateGrey",color: "#778899"},
            {name: "LightSteelBlue",color: "#B0C4DE"},
            {name: "LightYellow",color: "#FFFFE0"},
            {name: "Lime",color: "#00FF00"},
            {name: "LimeGreen",color: "#32CD32"},
            {name: "Linen",color: "#FAF0E6"},
            {name: "Magenta",color: "#FF00FF"},
            {name: "Maroon",color: "#800000"},
            {name: "MediumAquaMarine",color: "#66CDAA"},
            {name: "MediumBlue",color: "#0000CD"},
            {name: "MediumOrchid",color: "#BA55D3"},
            {name: "MediumPurple",color: "#9370DB"},
            {name: "MediumSeaGreen",color: "#3CB371"},
            {name: "MediumSlateBlue",color: "#7B68EE"},
            {name: "MediumSpringGreen",color: "#00FA9A"},
            {name: "MediumTurquoise",color: "#48D1CC"},
            {name: "MediumVioletRed",color: "#C71585"},
            {name: "MidnightBlue",color: "#191970"},
            {name: "MintCream",color: "#F5FFFA"},
            {name: "MistyRose",color: "#FFE4E1"},
            {name: "Moccasin",color: "#FFE4B5"},
            {name: "NavajoWhite",color: "#FFDEAD"},
            {name: "Navy",color: "#000080"},
            {name: "OldLace",color: "#FDF5E6"},
            {name: "Olive",color: "#808000"},
            {name: "OliveDrab",color: "#6B8E23"},
            {name: "Orange",color: "#FFA500"},
            {name: "OrangeRed",color: "#FF4500"},
            {name: "Orchid",color: "#DA70D6"},
            {name: "PaleGoldenRod",color: "#EEE8AA"},
            {name: "PaleGreen",color: "#98FB98"},
            {name: "PaleTurquoise",color: "#AFEEEE"},
            {name: "PaleVioletRed",color: "#DB7093"},
            {name: "PapayaWhip",color: "#FFEFD5"},
            {name: "PeachPuff",color: "#FFDAB9"},
            {name: "Peru",color: "#CD853F"},
            {name: "Pink",color: "#FFC0CB"},
            {name: "Plum",color: "#DDA0DD"},
            {name: "PowderBlue",color: "#B0E0E6"},
            {name: "Purple",color: "#800080"},
            {name: "RebeccaPurple",color: "#663399"},
            {name: "Red",color: "#FF0000"},
            {name: "RosyBrown",color: "#BC8F8F"},
            {name: "RoyalBlue",color: "#4169E1"},
            {name: "SaddleBrown",color: "#8B4513"},
            {name: "Salmon",color: "#FA8072"},
            {name: "SandyBrown",color: "#F4A460"},
            {name: "SeaGreen",color: "#2E8B57"},
            {name: "SeaShell",color: "#FFF5EE"},
            {name: "Sienna",color: "#A0522D"},
            {name: "Silver",color: "#C0C0C0"},
            {name: "SkyBlue",color: "#87CEEB"},
            {name: "SlateBlue",color: "#6A5ACD"},
            {name: "SlateGray",color: "#708090"},
            {name: "SlateGrey",color: "#708090"},
            {name: "Snow",color: "#FFFAFA"},
            {name: "SpringGreen",color: "#00FF7F"},
            {name: "SteelBlue",color: "#4682B4"},
            {name: "Tan",color: "#D2B48C"},
            {name: "Teal",color: "#008080"},
            {name: "Thistle",color: "#D8BFD8"},
            {name: "Tomato",color: "#FF6347"},
            {name: "Turquoise",color: "#40E0D0"},
            {name: "Violet",color: "#EE82EE"},
            {name: "Wheat",color: "#F5DEB3"},
            {name: "White",color: "#FFFFFF"},
            {name: "WhiteSmoke",color: "#F5F5F5"},
            {name: "Yellow",color: "#FFFF00"},
            {name: "YellowGreen",color: "#9ACD32"},
        ]
    }
]
/*
    findClosestName("pizza")
    'purple pizzazz'
    findClosestName("cheese")
    'lightsteelblue (w3c)'
    findClosestName("bright yellow")
    'light brick yellow'
    findClosestName("rosy red")
    'darkslategray or darkslategrey (w3c)'
*/
function findClosestName(string) {
    string = string.toLowerCase();
    let similar;
    let highest = 0;
    let highestName = false;
    let color;
    for (let i = 0; i < colorGroups.length; i++) {
        for (let j = 0; j < colorGroups[i].colors.length; j++) {
            //Search By Word
            let string1 = string.split(" ");
            let string2 = colorGroups[i].colors[j].name.toLowerCase().split(" ");
            similar = 0;
            for (let p = 0; p < string1.length; p++) {
                for (let q = 0; q < string2.length; q++) {
                    if (string2[q] == string1[p]) {
                        string1.splice(p,1)
                        string2.splice(q,1)
                        p = 0;
                        q = 0;
                        similar += 5;
                    }
                }
            }

            //Search By Letter
            string1 = string.split("");
            string2 = colorGroups[i].colors[j].name.toLowerCase().split("");
            for (let p = 0; p < string1.length; p++) {
                for (let q = 0; q < string2.length; q++) {
                    if (string2[q] == string1[p]) {
                        string1.splice(p,1)
                        string2.splice(q,1)
                        p = 0;
                        q = 0;
                        similar++;
                    }
                }
            }

            //Calculate
            if (similar > highest) {
                highest = similar;
                highestName = colorGroups[i].colors[j].name;
                color = colorGroups[i].colors[j].color;
            }
        }
    }
    return {
        name: highestName,
        color: color,
    }
}
function _color(string,opacity=1,a,b,c,d) {
    string = string + "";
    string = string.toLowerCase();

    
    for (let i = 0; i < colorGroups.length; i++) {
        let pass = false;
        let group = colorGroups[i];
        let MatchName = "";
        if (group.noName) {
            pass = true;
        } else {
            if (string.includes(group.name)) {
                pass = true;
                MatchName += group.name;
            }
        }

        if (!pass) continue;

        if (string.includes(group.name) && (string.includes("random") || string.includes("rnd"))) {
            return addOpacityToColor(group.colors.rnd().color,opacity,a,b,c,d);
        }

        for (let j = 0; j < group.colors.length; j++) {
            let color = group.colors[j];
            if (MatchName + color.name.toLowerCase() == string) {
                return addOpacityToColor(color.color,opacity,a,b,c,d);
            }
        }        
    }

    if (string == "random" || string == "rnd") return addOpacityToColor(rnd("color"),opacity);

    if (string.charAt(0) == "#" || string.includes("rgb") || string.includes("hsl") || string.includes("cmyk") || string.includes("ryb")) return addOpacityToColor(string,opacity,a,b,c,d);

    return _color(findClosestName(string).color,opacity,a,b,c,d);
}
function _colorFixParameter(type) {
    type = type.toLowerCase();
    if (type == "arr" || type == "a") type = "array";
    if (type == "obj" || type == "o") type = "object";
    if (type == "str" || type == "s") type = "string";
    return type;
}
function addOpacityToColor(color,opacity="ff",a="ff",b="ff",c="ff",d="ff") {
    //Fix Parameters
    if (color.toLowerCase() == "rgb" || color.toLowerCase() == "hsl" || color.toLowerCase() == "ryb" || color.toLowerCase() == "cmyk" || color.toLowerCase() == "hsla" || color.toLowerCase() == "rgba" || color.toLowerCase() == "ryba") {
        let word = color.toLowerCase();
        let extraString = "";
        if (word.length == 4) {
            if (_type(opacity).type == "array") {
                extraString = "," + opacity[3];
            } else {
                extraString = "," + c;
            }
        }
        if (_type(opacity).type == "array") {
            color = word + "(" + opacity[0] + "," + opacity[1] + "," + opacity[2];
            opacity = a;
        } else {
            color = word + "(" + opacity + "," + a + "," + b;
            opacity = word.length == 4 ? d : c;
        }
        color = color + extraString + ")";
    }
    
    //Fix Color Strings
    if (color.includes("#")) {
        let newColor = color;
        //Full Hex + Alpha
        if (color.length == 9) {
            opacity = color.substring(7,9);
            newColor = color.substring(0,7);
        }
        //Small Hex
        if (color.length == 4) {
            newColor = "#" + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3); 
            opacity = Math.floor(Number(opacity) * 255).toString(16);
        }
        //Small Hex + Alpha
        if (color.length == 5) {
            newColor = "#" + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3); 
            opacity = color.charAt(4) + color.charAt(4);
        }
        //Full Hex
        if (color.length == 7) {
            opacity = Math.floor(Number(opacity) * 255).toString(16);
        }
        color = newColor;
    }

    if (color.includes("rgb")) {
        let r="",g="",b="",a="";
        let on = false;
        for (let i = 0; i < color.length; i++) {
            let char = color.charAt(i);

            if (on === false && _type(char).isNumber) {
                if (r === "") on = "red";
                else if (g === "") on = "green";
                else if (b === "") on = "blue";
                else if (a === "") on = "alpha";
            }
            if (_type(char).isNumber || char == ".") {
                if (on == "red") r += char;
                if (on == "green") g += char;
                if (on == "blue") b += char;
                if (on == "alpha") a += char;
            }
            if (char == ",") on = false;
        }
        r = Number(r);
        g = Number(g);
        b = Number(b);
        if (a == "") a = false;
        else opacity = Math.floor(Number(a) * 255).toString(16);

        color = rgbToHex(r,g,b);
    }
    
    if (color.includes("cmyk")) {
        let c="",m="",y="",k="";
        let on = false;
        for (let i = 0; i < color.length; i++) {
            let char = color.charAt(i);

            if (on === false && _type(char).isNumber) {
                if (c === "") on = "c";
                else if (m === "") on = "m";
                else if (y === "") on = "y";
                else if (k === "") on = "k";
            }
            if (_type(char).isNumber || char == ".") {
                if (on == "c") c += char;
                if (on == "m") m += char;
                if (on == "y") y += char;
                if (on == "k") k += char;
            }
            if (char == ",") on = false;
        }
        c = Number(c);
        m = Number(m);
        y = Number(y);
        k = Number(k);

        color = cmykToHex(c,m,y,k);
    }
    
    if (color.includes("hsl")) {
        let h="",s="",l="",a="";
        let on = false;
        for (let i = 0; i < color.length; i++) {
            let char = color.charAt(i);

            if (on === false && _type(char).isNumber) {
                if (h === "") on = "h";
                else if (s === "") on = "s";
                else if (l === "") on = "l";
                else if (a === "") on = "alpha";
            }
            if (_type(char).isNumber || char == ".") {
                if (on == "h") h += char;
                if (on == "s") s += char;
                if (on == "l") l += char;
                if (on == "alpha") a += char;
            }
            if (char == ",") on = false;
        }
        h = Number(h);
        s = Number(s);
        l = Number(l);
        if (a == "") a = false;
        else opacity = Math.floor(Number(a) * 255).toString(16);

        let object = hslToRgb(h,s,l);
        color = rgbToHex(object[0],object[1],object[2]);
    }


    let opacityString = opacity;
    opacityString = padZero(opacityString);


    let ogColor = color;
    color = color + opacityString;
    
    return {
        color: color,
        ogColor: ogColor,
        opacity: opacityString,
        colorName: findColorName(ogColor).name,
        colorNameSimilarity: findColorName(ogColor).similar,
        rgb: function(type = "object") {
            type = _colorFixParameter(type);
            let conversion = hexToRGB(this.color);
            if (type == "object") return { r: conversion.r,g: conversion.g,b: conversion.b};
            if (type == "string") return "rgb(" + conversion.r + "," + conversion.g + "," + conversion.b + ")";
            if (type == "array") return [conversion.r,conversion.g,conversion.b];
            console.warn("Invalid Type To Return, Enter either Object/String/Array")
        },
        hex: function(type = "string",opacity = true) {
            type = _colorFixParameter(type);

            var r = this.ogColor.substring(1, 3);
            var g = this.ogColor.substring(3, 5);
            var b = this.ogColor.substring(5, 7);
            let a = this.opacity;


            if (type == "object") return {r: r, g: g, b: b, a: a};
            if (type == "array") return [r,g,b,a];
            if (!opacity) a = "ff";
            if (type == "string") return a == "ff" ? this.ogColor : this.color;
            console.warn("Invalid Type To Return, Enter either Object/String/Array")
        },
        ryb: function(type = "object") {
            type = _colorFixParameter(type);
            let conversion = hexToRYB(this.color);
            if (type == "object") return conversion;
            if (type == "string") return "ryb(" + conversion.r + "," + conversion.y + "," + conversion.b + ")";
            if (type == "array") return [conversion.r,conversion.y,conversion.b];
            console.warn("Invalid Type To Return, Enter either Object/String/Array")
        },
        cmyk: function(type = "object") {
            type = _colorFixParameter(type);
            let conversion = rgb2cmyk(hexToRGB(this.ogColor));
            if (type == "object") return conversion;
            if (type == "string") return "cmyk(" + conversion.c + "," + conversion.m + "," + conversion.y + conversion.k + ")";
            if (type == "array") return [conversion.c,conversion.m,conversion.y,conversion.k];
            console.warn("Invalid Type To Return, Enter either Object/String/Array")
        },
        hsl: function( type = "object") {
            type = _colorFixParameter(type);
            let conversion = rgbToHsl_GPT(hexToRGB(this.color));
            if (type == "object") return {h: conversion[0], s: conversion[1], l: conversion[2]};
            if (type == "string") return "hsl(" + conversion[0] + "," + conversion[1] + "%," + conversion[2] + "%)";
            if (type == "array") return conversion;
            console.warn("Invalid Type To Return, Enter either Object/String/Array")
        },
        hsla: function( type = "object") {
            type = _colorFixParameter(type);
            let conversion = rgbToHsl_GPT(hexToRGB(this.color));
            conversion.push((parseInt(this.opacity, 16)/255).toFixed(2));

            if (type == "object") return {h: conversion[0], s: conversion[1], l: conversion[2], a: conversion[3]};
            if (type == "string") return "hsl(" + conversion[0] + "," + conversion[1] + "%," + conversion[2] + "%," + conversion[3] + ")";
            if (type == "array") return conversion;
            console.warn("Invalid Type To Return, Enter either Object/String/Array")
        },
        rgba: function( type = "object") {
            type = _colorFixParameter(type);
            let conversion = hexToRGB(this.color);
            conversion.a = parseInt(this.opacity, 16);
            if (type == "object") return { r: conversion.r,g: conversion.g,b: conversion.b,a: conversion.a};
            if (type == "string") return "rgba(" + conversion.r + "," + conversion.g + "," + conversion.b + conversion.a + ")";
            if (type == "array") return [conversion.r,conversion.g,conversion.b,conversion.a];
            console.warn("Invalid Type To Return, Enter either Object/String/Array")
        },
        
        complimentary: function() {
            let newObj = clone(this);
            newObj.ogColor = hexToComplimentary(this.ogColor);
            newObj.color = newObj.ogColor + this.opacity;
            let findColorObj = findColorName(newObj.ogColor)
            newObj.colorName = findColorObj.name;
            newObj.colorNameSimilarity = findColorObj.similar;
            return newObj;
        },
        grayScale: function() {
            let newObj = clone(this);
            newObj.ogColor = hexToGrayscale_GPT(this.ogColor);
            newObj.color = newObj.ogColor + this.opacity;
            let findColorObj = findColorName(newObj.ogColor)
            newObj.colorName = findColorObj.name;
            newObj.colorNameSimilarity = findColorObj.similar;
            return newObj;
        },
        saturation: function(amt=10) {
            let newObj = clone(this);
            newObj.ogColor = increaseSaturation_GPT(this.ogColor,amt);
            newObj.color = newObj.ogColor + this.opacity;
            let findColorObj = findColorName(newObj.ogColor)
            newObj.colorName = findColorObj.name;
            newObj.colorNameSimilarity = findColorObj.similar;
            return newObj;
        },
        contrast: function(baw = false) {
            let newObj = clone(this);
            if (baw) newObj.ogColor = findBAWFromHex(this.ogColor);
            else newObj.ogColor = invertColor(this.ogColor);
            newObj.color = newObj.ogColor + this.opacity;
            let findColorObj = findColorName(newObj.ogColor)
            newObj.colorName = findColorObj.name;
            newObj.colorNameSimilarity = findColorObj.similar;
            return newObj;
        },
        add: function(color) {
            let newObj = clone(this);
            var {red,green,blue} = hexToRGB(_color(color).color);
            var {r,g,b} = hexToRGB(ogColor);

            let newRed = r + red;
            let newGreen = green + g;
            let newBlue = b + blue;


            if (newRed > 255) newRed = 255;
            if (newBlue > 255) newBlue = 255;
            if (newGreen > 255) newGreen = 255;

            newObj.ogColor =  rgbToHex_GPT(newRed,newGreen,newBlue);
            newObj.color = newObj.ogColor + this.opacity;
            let findColorObj = findColorName(newObj.ogColor)
            newObj.colorName = findColorObj.name;
            newObj.colorNameSimilarity = findColorObj.similar;

            return newObj;
        },
        subtract: function(color) {
            let newObj = clone(this);
            var {red,green,blue} = hexToRGB(_color(color).color);
            var {r,g,b} = hexToRGB(ogColor);

            let newRed = r - red;
            let newGreen = g - green;
            let newBlue = b - blue;


            if (newRed < 0) newRed = 0;
            if (newBlue < 0) newBlue = 0;
            if (newGreen < 0) newGreen = 0;

            newObj.ogColor =  rgbToHex_GPT(newRed,newGreen,newBlue);
            newObj.color = newObj.ogColor + this.opacity;
            let findColorObj = findColorName(newObj.ogColor)
            newObj.colorName = findColorObj.name;
            newObj.colorNameSimilarity = findColorObj.similar;

            return newObj;
        },
        mix: function(color) {
            let newObj = clone(this);
            let useArr = [];

            let newColor = subtractiveMix(hexToRGB(this.ogColor),hexToRGB(_color(color).color),0.5);

            newObj.ogColor = rgbToHex_GPT(newColor.r,newColor.g,newColor.b);
            newObj.color = newObj.ogColor + this.opacity;
            let findColorObj = findColorName(newObj.ogColor)
            newObj.colorName = findColorObj.name;
            newObj.colorNameSimilarity = findColorObj.similar;

            return newObj;
        },
        compare: function(color) {
            let color2 = _color(color).color;
            return findSimilarity(color2,ogColor);
        },
        darken: function(percentage) {
            let newObj = clone(this);

            newObj.ogColor = darkenHexColor(this.ogColor,percentage);
            newObj.color = newObj.ogColor + this.opacity;
            let findColorObj = findColorName(newObj.ogColor)
            newObj.colorName = findColorObj.name;
            newObj.colorNameSimilarity = findColorObj.similar;
            return newObj;
        }
    }
}
function darkenHexColor(hex, percent) {
    // Ensure hex is valid and remove '#' if present
    hex = hex.replace(/^#/, '');

    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Calculate darkened values
    r = Math.max(0, Math.round(r * (1 - percent / 100)));
    g = Math.max(0, Math.round(g * (1 - percent / 100)));
    b = Math.max(0, Math.round(b * (1 - percent / 100)));

    // Convert back to hex and return
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


function hexToRYB(hex) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    // Convert RGB to RYB
    let w = Math.min(r, g, b);
    let f = 1 - w;
    let R = r - w;
    let G = g - w;
    let B = b - w;

    let my = Math.max(R, G, B);
    let n = Math.min(Math.min(R, G), B);
    let Y = Math.max(0, G - B + f) * 0.5;
    let m = Math.max(R, G, B);

    let Ymax = Math.max(R, G, B);
    let Ymin = Math.min(R, G, B);

    let Yprime;
    if (Ymax == 0) {
        Yprime = 1;
    } else {
        Yprime = (Ymax - Ymin) / Ymax;
    }

    let RYB_R = R * Yprime + Ymin;
    let RYB_Y = Yprime * (G - B) + B;
    let RYB_B = Math.max(0, B - G + f) * 0.5;

    // Convert RYB to 0-255 scale
    let R_scaled = Math.round(RYB_R * 255);
    let Y_scaled = Math.round(RYB_Y * 255);
    let B_scaled = Math.round(RYB_B * 255);

    return { r: R_scaled, y: Y_scaled, b: B_scaled };
}

// Function to calculate the color distance between two colors
function colorDistance(color1, color2) {
    const rgb1 = color1;
    const rgb2 = color2;

    // Calculate the Euclidean distance between the two colors in RGB space
    const distance = Math.sqrt(
        Math.pow(rgb2.r - rgb1.r, 2) +
        Math.pow(rgb2.g - rgb1.g, 2) +
        Math.pow(rgb2.b - rgb1.b, 2)
    );

    // Normalize the distance between 0.0 and 1.0
    const normalizedDistance = distance / Math.sqrt(3 * Math.pow(255, 2));

    return normalizedDistance;
}

// Function to perform subtractive color mixing
function subtractiveMix(colorA, colorB, blend) {
    const invertedColorA = colorInv(colorA);
    const invertedColorB = colorInv(colorB);

    const f = {
        r: Math.max(0, 255 - invertedColorA.r - invertedColorB.r),
        g: Math.max(0, 255 - invertedColorA.g - invertedColorB.g),
        b: Math.max(0, 255 - invertedColorA.b - invertedColorB.b)
    };

    const colorDist = colorDistance(colorA, colorB);
    const cd = 4.0 * blend * (1.0 - blend) * colorDist;

    const additiveMix = colorMixLin(colorA, colorB, blend);
    const result = colorMixLin(additiveMix, f, cd);

    return result;
}

// Function to calculate the inverse of a color
function colorInv(color) {
    return {
        r: 255 - color.r,
        g: 255 - color.g,
        b: 255 - color.b
    };
}

// Function to linearly mix two colors
function colorMixLin(colorA, colorB, blend) {
    const result = {
        r: (1.0 - blend) * colorA.r + blend * colorB.r,
        g: (1.0 - blend) * colorA.g + blend * colorB.g,
        b: (1.0 - blend) * colorA.b + blend * colorB.b
    };

    return result;
}







function cmykToHex(c,m,y,k) {
    var hex,
        rgb;
    //convert cmyk to rgb first
    rgb = cmykToRgb(c,m,y,k);
    //then convert rgb to hex
    hex = rgbToHex_GPT(rgb.r, rgb.g, rgb.b);
    //return hex color format
    return hex;
}
//converts cmyk color to rgb
var cmykToRgb = function(c, m, y, k, normalized){
    c = (c / 100);
    m = (m / 100);
    y = (y / 100);
    k = (k / 100);
    
    c = c * (1 - k) + k;
    m = m * (1 - k) + k;
    y = y * (1 - k) + k;
    
    var r = 1 - c;
    var g = 1 - m;
    var b = 1 - y;
    
    if(!normalized){
        r = Math.round(255 * r);
        g = Math.round(255 * g);
        b = Math.round(255 * b);
    }
    
    return {
        r: r,
        g: g,
        b: b
    }
}
var rgb2cmyk = function(rgb, normalized){
    var c = 1 - (rgb.r / 255);
    var m = 1 - (rgb.g / 255);
    var y = 1 - (rgb.b / 255);
    var k = Math.min(c, Math.min(m, y));
    
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
    
    if(!normalized){
        c = Math.round(c * 10000) / 100;
        m = Math.round(m * 10000) / 100;
        y = Math.round(y * 10000) / 100;
        k = Math.round(k * 10000) / 100;
    }
    
    c = isNaN(c) ? 0 : c;
    m = isNaN(m) ? 0 : m;
    y = isNaN(y) ? 0 : y;
    k = isNaN(k) ? 0 : k;
    
    return {
        c: c,
        m: m,
        y: y,
        k: k
    }
}


function findBAWFromHex(hex) {
    let {r,g,b} = hexToRGB(hex);
    return (r*0.299 + g*0.587 + b*0.114) > 186 ? "#000000" : "#ffffff";
}
function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}
function hexToRGB(hex,type="object") {
    // Remove '#' if it exists
    hex = hex.replace('#', '');
    // Convert hex to RGB
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    if (type=="object") {
        return {
            r: r,
            g: g,
            b: b,
            red: r,
            green: g,
            blue: b,
        }
    }
    if (type == "array") {
        return [r,g,b];
    } 
   
}
function findSimilarity(color1,color2) {
    let {r,g,b} = hexToRGB(color1);
    let {red,green,blue} = hexToRGB(color2);

    let rDiff = Math.abs(red - r), gDiff = Math.abs(green - g), bDiff = Math.abs(blue - b);
    let similarity = rDiff + gDiff + bDiff;

    return 100-((similarity*100)/765).toFixed(2);
}
function findColorName(name) {
    let highestSimilarity = (255*3);
    let highestName = false;
    
    let {r,g,b} = hexToRGB(name);

    for (let i = 0; i < colorGroups.length; i++) {
        let group = colorGroups[i];
        for (let j = 0; j < group.colors.length; j++) {
            let _color = group.colors[j];
            
            let {red,green,blue} = hexToRGB(_color.color);

            let rDiff = Math.abs(red - r), gDiff = Math.abs(green - g), bDiff = Math.abs(blue - b);
            let similarity = rDiff + gDiff + bDiff;

            if (similarity < highestSimilarity) {
                highestSimilarity = similarity;
                highestName = _color.name;
            }
        }
    }
    /*
        Similar
        0 - 765
        100 - 0
    */
    return {
        name: highestName,
        similar: 100-((highestSimilarity*100)/765).toFixed(2),
    }
}
function rgbToHsl_GPT(rgb) {
    let r = rgb.r;
    let g = rgb.g;
    let b = rgb.b;

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}
function hslToRgb(h, s, l) {
    let r, g, b;
  
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1/3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1/3);
    }
  
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
function increaseSaturation_GPT(hex, amount) {
    // Remove '#' if it exists
    hex = hex.replace('#', '');

    // Convert hex to RGB
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    // Convert RGB to HSL
    var hsl = rgbToHsl_GPT({r: r,g: g,b: b});

    // Increase saturation
    hsl[1] = Math.min(1, hsl[1] + amount);

    // Convert HSL back to RGB
    var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);

    // Convert RGB to hex
    var newHex = rgbToHex_GPT(rgb[0], rgb[1], rgb[2]);

    return newHex;
}
function componentToHex_GPT(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex_GPT(r, g, b) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return "#" + componentToHex_GPT(r) + componentToHex_GPT(g) + componentToHex_GPT(b);
}
function hexToGrayscale_GPT(hex) {
    // Remove '#' if it exists
    hex = hex.replace('#', '');

    // Convert hex to RGB
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);


    // Convert RGB to grayscale
    var grayscale = 0.2989 * r + 0.5870 * g + 0.1140 * b;

    // Convert grayscale to hex
    var grayscaleHex = rgbToHex_GPT(grayscale, grayscale, grayscale);

    return grayscaleHex;
}
/* hexToComplimentary : Converts hex value to HSL, shifts
 * hue by 180 degrees and then converts hex, giving complimentary color
 * as a hex value
 * @param  [String] hex : hex value  
 * @return [String] : complimentary color as hex value
 */
function hexToComplimentary(hex){
    // Convert hex to rgb
    // Credit to Denis http://stackoverflow.com/a/36253499/4939630
    var rgb = 'rgb(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length/3 + '})', 'g')).map(function(l) { return parseInt(hex.length%2 ? l+l : l, 16); }).join(',') + ')';

    // Get array of RGB values
    rgb = rgb.replace(/[^\d,]/g, '').split(',');

    var r = rgb[0], g = rgb[1], b = rgb[2];

    // Convert RGB to HSL
    // Adapted from answer by 0x000f http://stackoverflow.com/a/34946092/4939630
    r /= 255.0;
    g /= 255.0;
    b /= 255.0;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2.0;

    if(max == min) {
        h = s = 0;  //achromatic
    } else {
        var d = max - min;
        s = (l > 0.5 ? d / (2.0 - max - min) : d / (max + min));

        if(max == r && g >= b) {
            h = 1.0472 * (g - b) / d ;
        } else if(max == r && g < b) {
            h = 1.0472 * (g - b) / d + 6.2832;
        } else if(max == g) {
            h = 1.0472 * (b - r) / d + 2.0944;
        } else if(max == b) {
            h = 1.0472 * (r - g) / d + 4.1888;
        }
    }

    h = h / 6.2832 * 360.0 + 0;

    // Shift hue to opposite side of wheel and convert to [0-1] value
    h+= 180;
    if (h > 360) { h -= 360; }
    h /= 360;

    // Convert h s and l values into r g and b values
    // Adapted from answer by Mohsen http://stackoverflow.com/a/9493060/4939630
    if(s === 0){
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255); 
    b = Math.round(b * 255);

    // Convert r b and g values to hex
    rgb = b | (g << 8) | (r << 16); 
    return "#" + (0x1000000 | rgb).toString(16).substring(1);
}  
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}



pluginsIncludes("_color",1);









//Subset v1
String.prototype.subset = function(start=0,end = undefined,...modifiers) {

    
    startIndex = findIndex(this,start)
    endIndex = findIndex(this,end);

    if (end === true) endIndex.index = this.length;
    if (end === false || end === undefined) endIndex.index = startIndex.index;
    if (endIndex.indexType == "count") endIndex.index = startIndex.index + endIndex.index;
    if (!isNaN(end) && !(end == true || end == false)) endIndex.index = end;

    if (startIndex.position == "full") startIndex.index -= startIndex.string.length - 1;

    //Return With Modifers
    let returnString = this.substring(startIndex.index,endIndex.index+1)
    let modObj = {
        length: returnString.length,
        trim: [],
        return: "string",
    }

    for (let i = 0; i < modifiers.length; i++) {
        let setting = modifiers[i].split("\\");
        setting[0] = setting[0].toLowerCase();
        if (setting[0] == "limit" || setting[0] == "length") modObj.length = Number(setting[1])
        if (setting[0] == "trim") modObj.trim.push(setting[1])
        if (setting[0] == "return") modObj.return = setting[1];
    }

    for (let i = 0; i < modObj.trim.length; i++) {
        returnString = returnString.replaceAll(modObj.trim[i],"");
    }

    if (modObj.return == "string")
        return returnString.substring(0,modObj.length);
    if (modObj.return == "number")
        return Number(returnString.substring(0,modObj.length));
}

String.prototype.orCompare = function(...compares) {
    for (let i = 0; i < compares.length; i++) {
        if (this.toString() === compares[i]) return true;
    }
    return false;
}
String.prototype.andCompare = function(...compares) {
    for (let i = 0; i < compares.length; i++) {
        if (this !== compares[i]) return false;
    }
    return true;
}
function findIndex(string,searchString) {
    let indexObj = {
        position: "on", //before/on/after/full
        indexType: "find",//index/count/find
        caseSensitive: true, //true/false
        add: 0, //Any Number
        index: searchString, 
        string: searchString,
    }
    searchingString: if (typeof searchString == "string") {

        let stringArr = searchString.split("\\");

        for (let i = 1; i < stringArr.length; i++) {
            //Fix abriviations
            if (stringArr[i] == "af") stringArr[i] = "after";
            if (stringArr[i] == "be") stringArr[i] = "before";
            if (stringArr[i] == "fu") stringArr[i] = "full";
            if (stringArr[i] == "in") stringArr[i] = "index";
            if (stringArr[i] == "co") stringArr[i] = "count";
            if (stringArr[i] == "fi") stringArr[i] = "find";

            //Find results
            if (stringArr[i].orCompare("after","before","on","full")) indexObj.position = stringArr[i];
            if (stringArr[i].orCompare("count","index")) indexObj.indexType = stringArr[i];
            if (stringArr[i].orCompare("ci","cs")) indexObj.caseSensitive = stringArr[i] == "cs" ? true : false;
            if (!isNaN(stringArr[i])) indexObj.add = Number(stringArr[i]);
        }

        indexObj.string = stringArr[0];

        if (indexObj.indexType === "count" || indexObj.indexType === "index") {
            searchString = Number(stringArr[0]);
            break searchingString;
        }

        if (indexObj.caseSensitive)
            searchString = string.indexOf(stringArr[0]);
        else
            searchString = string.toLowerCase().indexOf(stringArr[0].toLowerCase());

        if (stringArr[0] === "*end") {
            searchString = string.length-1;
        }

        if (searchString == -1) {
            searchString = string.length;
            break searchingString;
        }

        if (indexObj.position == "before") searchString -= 1;
        if (indexObj.position == "after") searchString += stringArr[0].length;
        if (indexObj.position == "full") searchString += stringArr[0].length-1;


    }
    indexObj.index = searchString + indexObj.add;

    return indexObj;
}


pluginsIncludes("subset",1);


class _time {
    constructor(date = new Date(),type) {
        if (type == "duration") date = timeObject(date);
        this.time = date;
        this.months = ["Janurary","February","March","April","May","June","July","August","September","October","November","December"];
        this.days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    }
    format(string) {

        let dateArr = [];
        let newString = "";
        let custStr = "";
        let customString = false;
        for (let i = 0; i < string.length; i++) {
            let char = string.charAt(i);

            if (char == "*" && customString == false) {
                custStr = "";
                customString = true;
            }
            if (customString) custStr += char;

            if (!customString && char.orCompare("/",":"," ","|")) {
                if (newString !== "") dateArr.push(newString)
                newString = "";
                dateArr.push(char)
                continue;
            }

            newString += char;
            
            if (char == "*" && customString == true && custStr !== "*") {
                customString = false;
                dateArr.push(custStr);
                newString = "";
            }
        }
        if (newString !== "") dateArr.push(newString)
        for (let i = 0; i < dateArr.length; i++) {
            let modSplit = dateArr[i].split("\\");
            let obj = {
                string: modSplit[0],
            }
            modSplit.splice(0,1);
            obj.mods = modSplit;
            dateArr[i] = obj;
        }

        let finalDateString = "";
        for (let i = 0; i < dateArr.length; i++) {
            let str = dateArr[i].string;
            let addingString = "";

            if (str == "m") addingString += this.time.getMonth() + 1;
            if (str == "mm") addingString += (this.time.getMonth() + 1) < 10 ? "0" + (this.time.getMonth() + 1) : (this.time.getMonth() + 1);
            if (str == "month") addingString += this.months[this.time.getMonth()].toLowerCase();
            if (str == "Month") addingString += this.months[this.time.getMonth()];
            if (str == "MONTH") addingString += this.months[this.time.getMonth()].toUpperCase();
            
            if (str == "d") addingString += this.time.getDate();
            if (str == "dd") addingString += this.time.getDate() < 10 ? "0" + this.time.getDate() : this.time.getDate();
            if (str == "day") addingString += this.days[this.time.getDay()].toLowerCase();
            if (str == "Day") addingString += this.days[this.time.getDay()];
            if (str == "DAY") addingString += this.days[this.time.getDay()].toUpperCase();

            if (str == "tomorrow") addingString += this.days[(this.time.getDay()+1)%7].toLowerCase();
            if (str == "Tomorrow") addingString += this.days[(this.time.getDay()+1)%7];
            if (str == "TOMORROW") addingString += this.days[(this.time.getDay()+1)%7].toUpperCase();

            if (str == "yesterday") addingString += this.days[(this.time.getDay()+7-1)%7].toLowerCase();
            if (str == "Yesterday") addingString += this.days[(this.time.getDay()+7-1)%7];
            if (str == "YESTERDAY") addingString += this.days[(this.time.getDay()+7-1)%7].toUpperCase();

            if (str == "dow") addingString += this.time.getDay();

            if (str.orCompare("yy","year")) addingString += this.time.getFullYear().toString().subset(2,3);
            if (str.orCompare("yyyy","Year")) addingString += this.time.getFullYear();

            if (str.orCompare("M","minutes")) addingString += this.time.getMinutes();
            if (str.orCompare("MM","Minutes")) addingString += this.time.getMinutes() < 10 ? "0" + this.time.getMinutes() : this.time.getMinutes();

            if (str == "H") addingString += this.time.getHours() > 12 ? this.time.getHours() - 12 : this.time.getHours();
            if (str == "HH") addingString += (this.time.getHours() > 12 ? this.time.getHours() - 12 : this.time.getHours()) < 10 ? "0" + (this.time.getHours() > 12 ? this.time.getHours() - 12 : this.time.getHours()) : (this.time.getHours() > 12 ? this.time.getHours() - 12 : this.time.getHours());
            
            if (str.orCompare("S","seconds")) addingString += this.time.getSeconds();
            if (str.orCompare("SS","Seconds")) addingString += this.time.getSeconds() < 10 ? "0" + this.time.getSeconds() : this.time.getSeconds();

            if (str == "MS") addingString += this.time.getMilliseconds();
            if (str == "MSMS") addingString += this.time.getMilliseconds() < 10 ? "00" + this.time.getMilliseconds() : this.time.getMilliseconds() < 100 ? "0" + this.time.getMilliseconds() : this.time.getMilliseconds();

            if (str == "ampm") addingString += this.time.getHours() > 12 ? "pm" : "am";
            if (str == "AMPM") addingString += this.time.getHours() > 12 ? "PM" : "AM";
            if (str == "ap") addingString += this.time.getHours() > 12 ? "pm" : "am";
            if (str == "AP") addingString += this.time.getHours() > 12 ? "PM" : "AM";
            

            if (str.charAt(0) == "*") addingString += str.subset(1,"*end\\-1");

            if (str.orCompare("/",":"," ")) {
                addingString += str;
            }

            for (let j = 0; j < dateArr[i].mods.length; j++) {
                let mod = dateArr[i].mods[j];

                if (mod.charAt(0) == "+") {
                    
                    if (str == "m" || str == "d") addingString = (Number(addingString) + Number(mod.subset(1,true)));
                    if (str == "mm" || str == "dd") addingString = (Number(addingString) + Number(mod.subset(1,true))) < 10 ? "0" + (Number(addingString) + Number(mod.subset(1,true))) : (Number(addingString) + Number(mod.subset(1,true)));
                    if (!_type(addingString).isNumber) {
                        let addition = Number(mod.subset(1,true));
                        let index;
                        if (str.orCompare("month","Month","MONTH")) {
                            index = (this.time.getMonth() + addition) % 12;
                        }
                        if (str == "month") addingString = this.months[index].toLowerCase();
                        if (str == "Month") addingString = this.months[index];
                        if (str == "MONTH") addingString = this.months[index].toUpperCase();
                        
                        if (str.orCompare("day","Day","DAY")) {
                            index = (this.time.getDay() + addition) % 7;

                        }
                        if (str == "day") addingString = this.days[index].toLowerCase();
                        if (str == "Day") addingString = this.days[index];
                        if (str == "DAY") addingString = this.days[index].toUpperCase();
                    }
                }
                if (mod.charAt(0) == "-") {
                    if (str == "m" || str == "d") addingString = (Number(addingString) - Number(mod.subset(1,true)));
                    if (str == "mm" || str == "dd") addingString = (Number(addingString) - Number(mod.subset(1,true))) < 10 ? "0" + (Number(addingString) - Number(mod.subset(1,true))) : (Number(addingString) - Number(mod.subset(1,true)));
                    if (!_type(addingString).isNumber) {
                        let addition = Number(mod.subset(1,true));
                        let index;
                        if (str.orCompare("month","Month","MONTH")) {
                            index = (this.time.getMonth() - addition) % 12;
                            while (index < 0) {
                                index += 12;
                            }
                            index = index % 12;
                        }
                        if (str == "month") addingString = this.months[index].toLowerCase();
                        if (str == "Month") addingString = this.months[index];
                        if (str == "MONTH") addingString = this.months[index].toUpperCase();
                        
                        if (str.orCompare("day","Day","DAY")) {
                            index = (this.time.getDay() - addition) % 7;
                            while (index < 0) {
                                index += 7;
                            }
                            index = index % 7;
                        }
                        if (str == "day") addingString = this.days[index].toLowerCase();
                        if (str == "Day") addingString = this.days[index];
                        if (str == "DAY") addingString = this.days[index].toUpperCase();
                    }
                } 
                if (mod.subset(0,4) == "limit") addingString = addingString.subset(0,mod.subset("limit\\after",true,"return\\number")-1);
                if (mod.subset(0,5) == "length") addingString = addingString.subset(0,mod.subset("length\\after",true,"return\\number")-1);
                if (mod.subset(0) == "=") {
                    if (addingString == mod.subset("=\\after",true)) {
                        addingString = dateArr[i].mods[j+1];
                    } else {
                        j++;
                    }
                }
                if (mod.subset(0,1) == "is") {
                    if (addingString == mod.subset("is\\after",true)) {
                        addingString = dateArr[i].mods[j+1];
                    } else {
                        j++;
                    }
                }
                if (mod == "mt") {
                    if (str == "H") addingString = this.time.getHours();
                    if (str == "HH") addingString = this.time.getHours() < 10 ? "0" + this.time.getHours() : this.time.getHours();
                }
            }

            finalDateString += addingString;
        }

        return finalDateString;
    }
}

/*
    MS - MiliSecond
    S - Second
    M - Minute
    H - Hour
    d - Day
    m - Month
    y - Year

    Day - String Day ("Monday")
    Month - String Month ("April")

    dow - Returns the day of the week starting With Sunday at 1

    Capitalization Of The Whole Word results MONTH => "APRIL";
    Capital First Letter Results Month => "April"
    No Capitals Results month => "april";

    # = Any Set Of The Above
    # - Get current Time ("3")
    ## - Get current Time With Padding ("03")

    Non Date Charcters:
    "/", ":", " " - These will be writing out ("mm/ss" => "09/59")
    "|" - This will seperate times, but not be writting out ("mm|ss" => "0959")

    "*__*" - Anything between parentheses will be written out as a string

    Modifiers
    After a given Code like mm you can add \\ to give special modifiers like \\limit2 will make the returning value of mm only be 2 characters in length
    \\limitx - Force Returning String to Be x Length (\\length works aswell)
    \\+x \\-x - Add or Subtract x from returning string

    \\equalsx\\y - If result equals x then return y 
    \\isx\\y - If result equals x then return y 

    \\mt - Converts Hour Time to Military Time


*/
function timeObject(ms) {
    const MS_PER_SECOND = 1000;
    const MS_PER_MINUTE = 60 * MS_PER_SECOND;
    const MS_PER_HOUR = 60 * MS_PER_MINUTE;
    const MS_PER_DAY = 24 * MS_PER_HOUR;
    const MS_PER_YEAR = 365.25 * MS_PER_DAY; // Approximate leap years
    const MS_PER_MONTH = MS_PER_YEAR / 12;

    return {
        getFullYear: function () {
            return Math.floor(ms / MS_PER_YEAR);
        },
        getMonth: function () {
            return Math.floor((ms % MS_PER_YEAR) / MS_PER_MONTH); // 0-11
        },
        getDate: function () {
            return Math.floor((ms % MS_PER_MONTH) / MS_PER_DAY) + 1; // 1-31
        },
        getHours: function () {
            return String(Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR));
        },
        getMinutes: function () {
            return String(Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE));
        },
        getSeconds: function () {
            return String(Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND));
        },
        getMilliseconds: function () {
            return ms % 1000;
        }
    };
}
pluginsIncludes("_time",1);






/*
    a - Tell me what I am
    b - You can be whatever you want
    i - Be the inverse

    "the cat is".format("[word\\A]") => "The Cat Is"

    "abc".format("A") => "Abc"
    "abc".format("...A") => "abC"
    "abc".format("A...A") => "AbC"
    "abc".format("A>") => "ABC"
    "abcdefg".format("(aA)>") => "aBcDeFg"
    "abcdefg".format("...A4") => "abcDEFG"
    "aBc".format("bbb") => "aBc"
    "8014716565".format("*(*bbb*) *bbb*-*bbbb") => "(801) 471-6565"
    "aBcD".format("i>") => "AbCd
    "abcdefg".format("<") => "gfedcba"
    "  abc  ".format("^") => "abc"
    "abcdefghi".format("A3!") => "ABC"
    "4120 4402 2132 4442".format("[trim\\ ]" => "4120440221324442";
    "4120 4402 2132 4442".format("<b4!<") => "4442";
    "4120 4402 2132 4442".format("...!bbbb") => "4120 4402 2132 ";
*/
/*
    Number Formating
    "1000.14235".format("#^^\\,\\$") //Results => $1,000.00;

    ^ - Set Round To Up For Future Operations
    v - Set Round To Down For Future Operations
    ^^ - Round Up
    vv - Round Down
    % - Change to Percent Format E.X. 0.52 => 52%
    $ - Change to Money format E.X. 156.214 => $156.21
    .## - toFixed(##)
    +## - Add Number By ##
    -## - Subtract Number By ##
    /## - Divide Number By ##
    *## - Multiply Number By ##
    , - Add Commas
    !xy - Take Symbol x and change to to symbol y;
*/
String.prototype.format = function(format,condition) {
    let pass = false;
    if (!condition) pass = true;
    else {
        //Test Condition
        if (condition.includes("length")) {
            if (condition.subset("length\\after") == "<") {
                if (this.length < Number(condition.subset("<\\after",true))) {
                    pass = true;
                }
            }
            if (condition.subset("length\\after") == ">") {
                if (this.length > Number(condition.subset(">\\after",true))) {
                    pass = true;
                }
            }
        }
    }

    if (!pass) return this.toString();

    let stringArr = this.split("");
    if (format.subset(0) == "#") {
        return numberFormating(stringArr,format.subset("#\\after",true))
    }

    let string = "";
    let index = 0;
    let mode = false;
    let doMode = false;
    let modeCount = false;
    let gettingNumber = false;
    let numberIndex = false;
    let pattern = false;
    let writingText = false;
    let inCommand = false;
    for (let i = 0; i < format.length + 1; i++) {
        let char = format.charAt(i);
        //Catch if no number
        if (gettingNumber && !_type(char).isNumber) {
            index = numberIndex;
            for (let j = numberIndex+1; j < numberIndex + Number(string); j++) {
                index++;
                if (!stringArr[j]) continue;
                if (mode == "A") stringArr[j] = stringArr[j].toUpperCase();
                if (mode == "a") stringArr[j] = stringArr[j].toLowerCase();
                if (mode == "i") {
                    if (stringArr[j] === stringArr[j].toUpperCase()) {
                        stringArr[j] = stringArr[j].toLowerCase();
                    } else {
                        stringArr[j] = stringArr[j].toUpperCase();
                    }
                }
                if (mode.toLowerCase() == "x") stringArr[j] = mode;
            }
            string = "";
            gettingNumber = false;
            index++;
        }

        string += char;

        
        if (!writingText && string == "i") {
            if (stringArr[index] == stringArr[index].toUpperCase()) {
                stringArr[index] = stringArr[index].toLowerCase();
            } else {
                stringArr[index] = stringArr[index].toUpperCase();
            }
            mode = "i";
            string = "";
            index++;
        }
        if (!writingText && string == "A") {
            if (stringArr[index])
                stringArr[index] = stringArr[index].toUpperCase();
            mode = "A";
            string = "";
            index++;
        }
        if (!writingText && string == "a") {
            if (stringArr[index])
                stringArr[index] = stringArr[index].toLowerCase();
            mode = "a";
            string = "";
            index++;
        }
        if (!writingText && string == "b") {
            mode = "b";
            string = "";
            index++;
        }
        if (!writingText && (string.toLowerCase() == "x")) {
            mode = string;
            if (stringArr[index])
                stringArr[index] = string;
            string = "";
            index++;
        }
        if (!writingText && string == "!") {
            let newArr = [];
            let add = _type(format[i-1]).isNumber ? 1 : 0;
            for (let j = 0; j < index + add; j++) {
                newArr.push(stringArr[j])
            }
            stringArr = newArr;
            string = "";
            index++;
        }
        if (!writingText && string == "...") {
            let findingLength = 0;
            let newMat = format.subset("...\\after",true);
            let newString = "";
            for (let j = 0; j < newMat.length+1; j++) {
                let char = newMat.charAt(j);
                if (!_type(char).isNumber && _type(newString).isNumber) {
                    findingLength += Number(newString)-1;
                }
                newString += char;
                if (char.orCompare("a","A","b","i","x","X")) {
                    findingLength++;
                }
                if (_type(char).isNumber && !_type(newString).isNumber) newString = char;
            }
            index = stringArr.length - findingLength;
            string = "";
        }
        if (!writingText && string == ">") {
            doMode = true;
            modeCount = "";
            for (let j = i+1; j < format.length; j++) {
                if (_type(format[j]).isNumber) {
                    i++;
                    modeCount += format[j];
                } else {
                    break;
                }
            }
            if (modeCount !== "") modeCount = Number(modeCount)
        
            string = "";
        }
        if (!writingText && string == "<") {
            stringArr.reverse();
            string = "";
        }
        if (!writingText && string == "[") {
            writingText = true;
            inCommand = true;
            string = "";
        }
        if (inCommand && char == "]") {
            writingText = false;
            inCommand = false;
            let command = string.subset(0,"*end\\-1").split("\\");
            if  (command[0] == "trim") {
                for (let j = index; j < stringArr.length; j++) {
                    if (stringArr[j] === command[1]) stringArr.splice(j,1);
                }
            }

            string = "";
        }
        if (!writingText && string == "^") {
            // Trim leading whitespace
            for (let j = 0; j < stringArr.length; j++) {
                while (stringArr[j] === ' ') {
                    stringArr.splice(j, 1);
                }
                // Trim trailing whitespace
                while (stringArr[j.length - 1] === ' ') {
                    stringArr.pop();
                }      
            }                       
            string = "";
        }
        if (!writingText && char == ")") {
            pattern = string.subset("(\\after",")\\before");
            string = "";
        }
        if (char == "*") {
            if (writingText === false) {
                writingText = true;
                string = "";
            } else {
                writingText = false;
                string = string.subset(0,"*\\before");
                stringArr.splice(index,0,string)
                string = "";
                index++;
            }
        }
        if (!writingText && _type(string).isNumber) {
            if (!gettingNumber) {
                numberIndex = index-1;
                gettingNumber = true;
            }
        }

        if (doMode) {
            if (!pattern) pattern = mode;
            doingMode: for (let j = index; j < stringArr.length; j++) {
                for (let k = 0; k < pattern.length; k++) {
                    if (j > stringArr.length-1) {
                        j++;
                        continue;
                    }
                    if (pattern.charAt(k) == "A") stringArr[j] = stringArr[j].toUpperCase();
                    if (pattern.charAt(k) == "a") stringArr[j] = stringArr[j].toLowerCase();
                    if (pattern.charAt(k) == "i") {
                        if (stringArr[j] === stringArr[j].toUpperCase()) {
                            stringArr[j] = stringArr[j].toLowerCase();
                        } else {
                            stringArr[j] = stringArr[j].toUpperCase();
                        }
                    }
                    if (pattern.charAt(k).toLowerCase() == "x") stringArr[j] = pattern.charAt(k);
                    if (k < pattern.length-1) j++;
                }
                if (modeCount !== "") {
                    modeCount--;
                    if (modeCount < 1) break doingMode;
                }
            }
            index = stringArr.length;
            pattern = false;
            doMode = false;
        }

    }
    return stringArr.join("");
}

function numberFormating(number,format) {
    number = number.join("");
    let actualNumber = Number(number);
    let formats = format.split("\\")
    let round = false;
    let addingCommas = false;
    let symbols = {
        period: ".",
        comma: ",",
        dollar: "$",
        percent: "%",
        one: "1",
        two: "2",
        three: "3",
        four: "4",
        five: "5",
        six: "6",
        seven: "7",
        eight: "8",
        nine: "9",
        zero: "0",
    }
    for (let i = 0; i < formats.length; i++) {
        format = formats[i];

        if (format.subset(0) == "$") {
            addingCommas = true;
            let currencyList = [
                {names: ["usd","","nzd","mxn","sgd"], symbol: "$", commaSwitch: false, fixed: 2},
                {names: ["jpy","yen","jap"], symbol: "¥", commaSwitch: false, fixed: 0},
                {names: ["gbp"], symbol: "£", commaSwitch: false, fixed: 2},
                {names: ["eur"], symbol: "€", commaSwitch: true, fixed: 2},
                {names: ["aud"], symbol: "A$", commaSwitch: false, fixed: 2},
                {names: ["brl"], symbol: "R$", commaSwitch: true, fixed: 2},
                {names: ["cny"], symbol: "¥", commaSwitch: false, fixed: 2},
                {names: ["hkd"], symbol: "HK$", commaSwitch: false, fixed: 2},
                {names: ["inr"], symbol: "₹", commaSwitch: false, fixed: 2},
                {names: ["thb"], symbol: "THB", commaSwitch: false, fixed: 2},
                {names: ["krw"], symbol: "₩", commaSwitch: false, fixed: 0},
                {names: ["myr"], symbol: "RM", commaSwitch: false, fixed: 2},
                {names: ["pkr"], symbol: "Rs", commaSwitch: false, fixed: 0},
                {names: ["php"], symbol: "₱", commaSwitch: false, fixed: 2},
            ];

            for (let j = 0; j < currencyList.length; j++) {
                let pass = false;
                for (let k = 0; k < currencyList[j].names.length; k++) {
                    if (currencyList[j].names[k] == format.subset(1,true).toLowerCase()) pass = true;
                }

                if (!pass) continue;

                symbols.dollar = currencyList[j].symbol;

                if (currencyList[j].commaSwitch) {
                    symbols.period = ",";
                    symbols.comma = ".";
                }
                actualNumber = _nfFixed(actualNumber,round,currencyList[j].fixed)
            }
            
            let useNumber = addingCommas ? numberWithCommas(actualNumber) : actualNumber;
            number = "$" + useNumber;
        }



        if (format == "^") round = "up";
        if (format == "v") round = "down";
        if (format.subset(0) == ".") {
            actualNumber = _nfFixed(actualNumber,round,format.subset(1,true));
            number = actualNumber
        }
        if (format == "%") {
            actualNumber = (Number(actualNumber) * 100);
            let useNumber = addingCommas ? numberWithCommas(actualNumber) : actualNumber;
            number = useNumber + symbols.percent;
        }
        if (format == "^^") {
            actualNumber = Math.round(actualNumber);
            number = actualNumber;
        }
        if (format == "vv") {
            actualNumber = Math.floor(actualNumber);
            number = actualNumber;
        }
        if (format.subset(0) == "+") {
            actualNumber += Number(format.subset(1,true));
            number = actualNumber;
        }
        if (format.subset(0) == "-") {
            actualNumber -= Number(format.subset(1,true));
            number = actualNumber;
        }
        if (format.subset(0) == "*") {
            actualNumber *= Number(format.subset(1,true));
            number = actualNumber;
        }
        if (format.subset(0) == "/") {
            actualNumber /= Number(format.subset(1,true));
            number = actualNumber;
        }
        if (format == ",") {
            addingCommas = true;
            number = numberWithCommas(actualNumber);
        }
        if (format.subset(0) == "!") {
            if ("." == format.subset(1)) symbols.period = format.subset(2);
            else if ("$" == format.subset(1)) symbols.dollar = format.subset(2);
            else if ("," == format.subset(1)) symbols.comma = format.subset(2);
            else if ("%" == format.subset(1)) symbols.percent = format.subset(2);
            else if ("1" == format.subset(1)) symbols.one = format.subset(2);
            else if ("2" == format.subset(1)) symbols.two = format.subset(2);
            else if ("3" == format.subset(1)) symbols.three = format.subset(2);
            else if ("4" == format.subset(1)) symbols.four = format.subset(2);
            else if ("5" == format.subset(1)) symbols.five = format.subset(2);
            else if ("6" == format.subset(1)) symbols.six = format.subset(2);
            else if ("7" == format.subset(1)) symbols.seven = format.subset(2);
            else if ("8" == format.subset(1)) symbols.eight = format.subset(2);
            else if ("9" == format.subset(1)) symbols.nine = format.subset(2);
            else if ("0" == format.subset(1)) symbols.zero = format.subset(2);
            
        }
    }
    return _nfFAR(number,symbols) + "";
}
function _nfFAR(number,symbols) {
    number = number.toString();
    number = number.replaceAll("$","a");
    number = number.replaceAll(".","b");
    number = number.replaceAll("%","c");
    number = number.replaceAll(",","d");
    number = number.replaceAll("1","e");
    number = number.replaceAll("2","f");
    number = number.replaceAll("3","g");
    number = number.replaceAll("4","h");
    number = number.replaceAll("5","i");
    number = number.replaceAll("6","j");
    number = number.replaceAll("7","k");
    number = number.replaceAll("8","l");
    number = number.replaceAll("9","m");
    number = number.replaceAll("0","n");

    
    number = number.replaceAll("a",symbols.dollar);
    number = number.replaceAll("b",symbols.period);
    number = number.replaceAll("c",symbols.percent);
    number = number.replaceAll("d",symbols.comma);
    number = number.replaceAll("e",symbols.one);
    number = number.replaceAll("f",symbols.two);
    number = number.replaceAll("g",symbols.three);
    number = number.replaceAll("h",symbols.four);
    number = number.replaceAll("i",symbols.five);
    number = number.replaceAll("j",symbols.six);
    number = number.replaceAll("k",symbols.seven);
    number = number.replaceAll("l",symbols.eight);
    number = number.replaceAll("m",symbols.nine);
    number = number.replaceAll("n",symbols.zero);

    return number;
}
function _nfFixed(number,round,formatNum) {
    if (!round)
        number = Number(number).toFixed(formatNum)
    if (round == "up") {
        let zeros = "";
        for (let j = 0; j < Number(formatNum); j++) {
            zeros += "0";
        }
        number = eval("Math.round(" + number + "*1" + zeros + ")/1" + zeros).toFixed(formatNum);
    } 
    if (round == "down") {
        let zeros = "";
        for (let j = 0; j < Number(formatNum); j++) {
            zeros += "0";
        }
        number = eval("Math.floor(" + number + "*1" + zeros + ")/1" + zeros).toFixed(formatNum);
    } 
    return number;
}
function numberWithCommas(x) {
    return x.toString().subset(0,".\\before").replace(/\B(?=(\d{3})+(?!\d))/g, ",") + x.toString().subset(".",true);
}




class Popup {
    constructor(obj) {
        this.div = create("div");
        this.css(obj.css ? obj.css : {});
        this.elements = obj.elements ? obj.elements : [];
    }
    css = function(obj = {}) {
        this.div.css({
            display: "none",
            background: obj.background ? obj.background : "gray",
            borderRadius: obj.borderRadius ? obj.borderRadius : "5px",
            position: obj.position ? obj.position : "absolute",
            zIndex: obj.zIndex ? obj.zIndex : 600,
            left: obj.left ? obj.left : 0,
            right: obj.right ? obj.right : 0,
            top: obj.top ? obj.top : 0,
            bottom: obj.bottom ? obj.bottom : 0,
            margin: obj.margin ? obj.margin : "auto",
            width: obj.width ? obj.width : "max-content",
            height: obj.height ? obj.height : "max-content",
            padding: obj.padding ? obj.padding : "20px",
        });
    }
    open = function() {
        this.div.style.display = "flex";
    }
    close = function() {
        this.div.style.display = "none";
    }
}





sloglibrary(16.5,'Simple','John Jones');
let includesString = "-Simple Includes: ";
for (let i = 0; i < plugingLogs.length; i++) {
    includesString += `${plugingLogs[i].name} V${plugingLogs[i].version}`
    if (i < plugingLogs.length - 1) includesString += ", ";
}
slogIncludes(includesString)

