'use strict';

/**
 * [Animation description]
 * @param {[type]} duration       [description]
 * @param {[type]} timingFunction [description]
 */
var Animation = function(duration, timingFunction) {
    this.duration = duration || 400;
    this.timingFunction = timingFunction || 'ease-out';
    this.animation = wx.createAnimation({
        timingFunction: timingFunction,
        duration: duration
    });
}
Animation.prototype = {

    opacity: function(opacity) {
        this.animation.opacity(opacity).step();
    },

    scale: function(s) {
        this.animation.scale(s).step();
    },

    rotate: function(deg) {
        this.animation.rotate(deg).step();
    },

    translateX: function(xpx) {
        this.animation.translateX(xpx).step();
    },

    translateY: function(ypx) {
        this.animation.translateY(ypx).step();
    },

    translate: function(xpx, ypx) {
        this.animation.translate(xpx, ypx).step();
    },

    objectAnim: function(animName) {
        var args = [];
        for (var i = 1, len = arguments.length; i < len; i++) {
            args[i - 1] = arguments[i];
        }
        this.animation[animName].call(this.animation, args).step();
    },

    setTimingFunction: function(timingFunction) {
        this.animation.option.transition.timingFunction = timingFunc || 'ease-out';
    },

    setDuration: function(duration) {
        this.animation.option.transition.duration = duration || 400;
    },

    step: function(){
        this.animation.step();
    },

    export: function() {
        return this.animation.export();
    }
}

let anim = new Animation(350, 'ease-out');
let exportsObj = {};
let keys = Object.keys(Animation.prototype);
keys.push('animation');
keys.map(function(name) {
    if(name != 'animation' || name != 'export'){
        let func = anim[name];
        anim[name] = function(){
            func.apply(this, arguments);
            return this;
        }
    }
    exportsObj[name] = anim[name];
});
module.exports = exportsObj;
