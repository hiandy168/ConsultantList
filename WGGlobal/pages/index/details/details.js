// pages/index/details/details.js
var util = require('../../../utils/util.js')
var presenter;
Page({
    data: {
        info: null,
        wholeInfo: null,
        tabIndex: 0,
        comments: null,

        hasLiked: false
    },
    onLoad: function(options) {
        var info = JSON.parse(options.info);

        // console.log(info);
        this.setData({
            info: info,
            hasLiked: info.is_collects == 1
        });

        presenter = new Presenter(this);
        
    },
    onShow: function() {
        // 页面显示
        // console.log('details onshow');
        presenter && presenter.getDetailsById(this.data.info.id);
    },

    /**
     * 点击tab
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    bindTabTap: function(e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            tabIndex: index
        });
    },

    /**
     * 点赞
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    bindLikeTap: function(e) {
        // var self = this;
        var hasLiked  = !this.data.hasLiked;
        var wholeInfo = this.data.wholeInfo;
        var info      = this.data.info;
        var goodNum   = wholeInfo.good_num;

        var globalLikeState = getApp().globalData.likeState;

        if (hasLiked) {
            wholeInfo.good_num = parseInt(goodNum) + 1;
            info.is_collects = 1;
            globalLikeState.state = 1;
        } else {
            wholeInfo.good_num = parseInt(goodNum) - 1;
            info.is_collects = 0;
            globalLikeState.state = 0;
        }
        presenter.like(this.data.info.id, hasLiked);

        this.setData({
            hasLiked: hasLiked,
            wholeInfo: wholeInfo,
            info: info
        });

    },

    /**
     * 点击跳转到添加评论的页面
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    bindAddCommentTap: function(e) {
        var info = this.data.info;
        wx.navigateTo({
            url: 'add_comment/add_comment?cid=' + info.id + '&name=' + info.name
        })
    },

    /**
     * 显示顾问详情
     * @param  {[json]} data [description]
     * @return {[void]}      [description]
     */
    showDetails: function(data) {
        // console.log(data);
        // 替换迷之html标签
        data.introduce = data.introduce.replace(/&lt;\w+&gt;|&lt;\/\w+&gt;|<\w+>|<\/\w+>|<\w+\/>/g, '');
        this.setData({
            wholeInfo: data
        });
        presenter.getComments(this.data.wholeInfo.id);
    },

    /**
     * 显示顾问评论
     * @param  {[type]} comments [description]
     * @return {[type]}          [description]
     */
    showComments: function(comments) {
        comments.comment = comments.comment.map(function(com) {
            com.tm = util.formatDate(com.tm);
            // console.log(com.star);
            return com;
        });
        this.setData({
            comments: comments
        });
        // console.table(comments.comment);
    }
})


/**
 * [Presenter description]
 * @param {[type]} view [description]
 */
var Presenter = function(view) {
    // 获取存储在全局的用户信息
    var globalUserInfo = getApp().globalData.userInfo;
    // console.log(globalUserInfo);
    this.uid = globalUserInfo.uid;
    this.code = globalUserInfo.code;
    this.view = view;
    this.likeUrl = util.host + '/api/Public/ajax_likes?uid=' + this.uid + '&code=' + this.code + '&man=1';
}
Presenter.prototype = {
    /**
     * 获取顾问详情
     * @param  {String} id 顾问id
     * @return {Void}      
     */
    getDetailsById: function(id) {
        util.get(this, util.host + '/api/consultant/consultant_info.html?uid=' + id, 'details');
    },
    /**
     * 获取顾问评论
     * @param  {String} id 顾问id
     * @return {Void}    
     */
    getComments: function(id) {
        util.get(this, util.host + '/api/Public/comment.html?id=' + id, 'comments')
    },
    /**
     * 获取到数据
     * @param  {Object} data [description]
     * @param  {Object} tag  [description]
     * @return {Void}      
     */
    onGetData: function(data, tag) {
        switch(tag){
            case 'details' : this.view.showDetails(data) ; break;
            case 'comments': this.view.showComments(data); break;
            case 'like'    : console.log('点赞成功');    ; break;
        }
    },

    /**
     * 操作有误
     * @param  {Object} msg [description]
     * @param  {Object} tag [description]
     * @return {Void}     
     */
    onError: function(msg, tag){
        console.log(msg);
    },

    /**
     * 网络请求失败
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    onFail: function(e){
        console.log(e);
    },

    /**
     * [like description]
     * @param  {Number}  index        顾问在当前列表中的索引
     * @param  {String}  consultantId 要进行操作的顾问id
     * @param  {Boolean} isNegative   isNegative   true：点赞， false：取消赞
     * @return {Void} 
     */
    like: function(consultantId, isNegative) {
        var url = this.likeUrl + '&type=1&is=' + (isNegative ? '0' : '1') + '&sp_id=' + consultantId;
        util.get(this, url, 'like');
        console.log('details like url >> ' + url);
    },
}
