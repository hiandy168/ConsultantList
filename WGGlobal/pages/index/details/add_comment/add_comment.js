// pages/index/details/add_comment/add_comment.js
var util = require('../../../../utils/util.js')
var star = 0;
var content = '';
var canSubmit = false;

var presenter ;
Page({
    data: {

        info:{},

        starsSelected:[
            false, false, false, false, false
        ],

        textCount: 50,

        canSubmit: canSubmit
    },
    onLoad: function(options) {
        // console.log(options.cid);
        // console.log(options.name);
        var info = {};

        ['cid', 'name'].map(function(v){
            info[v] = options[v];
        });
        this.setData({
            info: info
        });

        presenter = new Presenter(this);

    },

    /**
     * 点击评价星级
     * @param  {[event]} e [description]
     * @return {[void]}   [description]
     */
    bindStarTap: function(e){
        var index = e.currentTarget.dataset.index;
        star = index + 1;
        var starsSelected = this.data.starsSelected.map(function(value, i){
            return i <= index;
        });
        this.setData({
            starsSelected: starsSelected
        });
    },

    /**
     * [bindContentInout description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    bindContentInout: function(e){
        content = e.detail.value;
        var length = content.length;
        var textCount = 50 - length;
        canSubmit = length > 0;
        this.setData({
            canSubmit: canSubmit,
            textCount: textCount < 0 ? 0 : textCount
        });
    },

    /**
     * 提交评论
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    bindSubmitTap: function(e){
        // console.log('评论长度：' + content.length);
        if (!content.length) {
            this.showMessage('请输入评论内容');
            return ;
        }
        // console.log(`star = ${star}, content = ${content}`);
        presenter.addComment(this.data.info.cid, content, star);
    },

    /**
     * 返回上一个页面
     * @return {[type]} [description]
     */
    backToPrevPage: function(){
        wx.navigateBack();
    },

    /**
     * 显示信息
     * @param  {[type]} msg [description]
     * @return {[type]}     [description]
     */
    showMessage: function(msg){
        wx.showModal({
            content: msg,
            showCancel: false,
            confirmColor: '#32B5D2'
        });
    }

});

var Presenter = function(view){
    var globalUserInfo = getApp().globalData.userInfo;
    this.url = util.host + '/api/user/add_comment.html?uid=$uid&code=$code&sp_id=$cid&con=$con&star=$star';
    this.url = this.url.replace('$uid', globalUserInfo.uid)
                       .replace('$code', globalUserInfo.code);
    this.view = view;
} 

Presenter.prototype = {

    addComment: function(consultantId, content, star){
        var url = this.url.replace('$cid', consultantId)
                            .replace('$con', content)
                            .replace('$star', star);
        // console.log(url);
        util.get(this, url, 'add_comment');
    },

    onGetData: function(data, tag){
        this.view.backToPrevPage();
    },

    onError: function(msg){
        this.view.showMessage(msg);
    }
}
