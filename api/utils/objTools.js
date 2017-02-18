//*****************************************************************/  
//    erratik library
//*****************************************************************/
module.exports = {
    sameObj: function(obj1, obj2) {
        return (JSON.stringify(obj1) === JSON.stringify(obj2)) ? true : false;
    },
    isEmpty: function(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) return false;
        }
        return true;
    },
    countProperties: function(obj) {
        var count = 0;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                ++count;
        }
        return count;
    },
    sortObject: function(o) {
        var sorted = {},
            key, a = [];
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                a.push(key);
            }
        }
        a.sort();
        for (key = 0; key < a.length; key++) {
            sorted[a[key]] = o[a[key]];
        }
        return sorted;
    }

    
};