/**
 * Class
 */
var Class = function() {
}
Class.prototype = {
    extend: function(args) {
        var newClass = Object.create(this);
        if (args && typeof args == 'object') {
            for (var a in args) {
                newClass[a] = args[a];
            }
        }
        return newClass;
    }
}

var clazz = new Class();

/**
 * View
 * @type {[type]}
 */
var View = clazz.extend();

// 
var Presenter = clazz.extend();

//
// var Model = clazz.extend({
// 	url: '',
// 	get: function(){

// 	},
// 	post: function(){
		
// 	}
// });