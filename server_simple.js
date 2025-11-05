module.exports = {
    subset: function(string,start=0,end = undefined,...modifiers) {
        return subset(string,start,end,...modifiers)
    },
    shuffle: function(obj,) {
        if (_type(obj) == "string") {
            return s_shuffle(obj.split('')).join("");
        }
        if (_type(obj) == "array") {
            return s_shuffle(obj);
        }
    },
    type: function(ele,full) {
        return _type(ele,full);
    },
    rnd: function(num,to,exp) {
        return rnd(num,to,exp)
    },
}
//Subset v1
let subset = function(string,start=0,end = undefined,...modifiers) {
    let startIndex = findIndex(string,start)
    let endIndex = findIndex(string,end);

    if (end === true) endIndex.index = string.length;
    if (end === false || end === undefined) endIndex.index = startIndex.index;
    if (endIndex.indexType == "count") endIndex.index = startIndex.index + endIndex.index;
    if (!isNaN(end) && !(end == true || end == false)) endIndex.index = end;

    if (startIndex.position == "full") startIndex.index -= startIndex.string.length - 1;

    //Return With Modifers
    let returnString = string.substring(startIndex.index,endIndex.index+1)
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
            if (("after","before","on","full").includes(stringArr[i])) indexObj.position = stringArr[i];
            if (("count","index").includes(stringArr[i])) indexObj.indexType = stringArr[i];
            if (("ci","cs").includes(stringArr[i])) indexObj.caseSensitive = stringArr[i] == "cs" ? true : false;
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
function _type(ele,isFull) {
    if (ele == null || ele == undefined) {
        obj = {
            type: ele+"",
            value: ele,
        }
        return obj
    }
    
    let returnName = ele.constructor.name;

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
        returnObj.isWholeNumber = Number.isInteger(ele);
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

    if (isFull)
        return returnObj;
    else
        return returnObj.type;
    
}

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
            if (num === 'Letter' || num === 'Abc') return rnd(2) == 2 ? rnd(abc).toUpperCase() : rnd(abc);
            return abc.rnd();
        }

        if (num == 'color') {
            if (to == 'hex' || !to) {
                let tool = '0123456789abcdef';
                return '#' + rnd(tool) + rnd(tool) + rnd(tool) + rnd(tool) + rnd(tool) + rnd(tool);
            }
            if (to == 'rgb') return 'rgb(' + rnd(0,255) + ',' + rnd(0,255) + ',' + rnd(0,255) + ')';

            return console.warn('Invalid Coler Format, try "hex" or "rgb"');
        }

        //Return Random Letter In String Num
        return num.charAt(rnd(0,num.length - 1));
    }
    if (_type(num) == "array") {
        return num[rnd(0,num.length - 1)];
    }
}