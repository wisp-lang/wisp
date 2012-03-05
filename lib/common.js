var _LS = {};
_LS.reduce = function(fn, arr) {
    var l = arr.length;
    if (l < 2) return arr[0];
    var s = arr[0];
    for (var i = 1; i < l; i++)
        s = fn(s, arr[i]);
    return s;
}
_LS["+"] = function(arr) {
    return this.reduce(function(x, y) {return x + y;}, arr);
};
_LS["-"] = function(arr) {
    return this.reduce(function(x, y) {return x - y;}, arr);
};