//index.js
//获取应用实例
const NO_ORDER = 0;
const ASC_ORDER = 1;
const DESC_ORDER = -1;
const SELECTED_COLOR = '#7FC8DA';
const NORMAL_COLOR = '#A9A9A9';

const ASC_CLZ_NAME = 'filter-order-asc';
const DESC_CLZ_NAME = 'filter-order-desc';

/**
 * 顶部搜索条件
 * @type {Array}
 */
const OLD_ORDERS = [{
    orderBy: 'comment',
    order: 'desc',
    color: NORMAL_COLOR,
    clzName: ''
}, {
    orderBy: 'all_case',
    order: 'desc',
    color: NORMAL_COLOR,
    clzName: ''
}, {
    orderBy: 'work_start_year',
    order: 'asc',
    color: NORMAL_COLOR,
    clzName: ''
}];

var util = require('../../utils/util.js')
var anim = require('../../utils/anim.js');
var app = getApp();
var presenter = null;
var canMove = false;

/**
 * 是否经历过onShow这个生命周期
 * @type {Boolean}
 */
var hasLifeCycleOnShow = false;

/**
 * 上一次点击的排序索引
 * @type {Number}
 */
var prevOrderIndex = -1;

Page({
    data: {
        userInfo: {},
        list: [],
        showLoadingView: false,
        footerText: '正在加载...',
        right: 16,
        bottom: 16,

        isSearchVisible: false,

        currentCatIndex: 0,

        selections: [{
            name: '行业分类',
            sub: [{
                name: '移民',
                isSelected: false,
                id: 1
            }, {
                name: '留学',
                isSelected: false,
                id: 2
            }, {
                name: '置业',
                isSelected: false,
                id: 3
            }, {
                name: '健康',
                isSelected: false,
                id: 4
            }]
        }, {
            name: '从业年限',
            sub: [{
                name: '1年以下',
                isSelected: false,
                min: 0,
                max: 1
            }, {
                name: '1-5年',
                isSelected: false,
                min: 1,
                max: 5
            }, {
                name: '5-10年',
                isSelected: false,
                min: 5,
                max: 10
            }, {
                name: '10年以上',
                isSelected: false,
                min: 10,
                max: 100 /*不信有这种人存在*/
            }]
        }, {
            name: '服务范围',
            sub: []
        }],

        filterMap: [],

        /**
         * 工作年限和其他排序字段正好相反fuck
         * @type {Array}
         */
        orders: OLD_ORDERS.slice(),

        /**
         * 搜索关键字（竟然没有清空input输入内容的方法。。。）
         * @type {String}
         */
        keyWord: '',

        fabAnimation: {},

        coverAlphaAnim: {}

        // isAnimated: false
    },
    onLoad: function() {

        //调用应用实例的方法获取全局数据
        app.getUserInfo(function(userInfo) {
            //更新数据
            this.setData({
                userInfo: userInfo
            });

            presenter = new Presenter(this);

            // get consultant list after user info being gotten
            // var orderObj = this.data.orders[0];
            // presenter.byOrder(orderObj.orderBy, orderObj.order);
            presenter.refresh();
            // this.onShow();

        }.bind(this));

        wx.showNavigationBarLoading();

        // console.log(anim);

        // app.navigateForResult(this, 'details/details', 'hello world');
        
        // var anim = wx.createAnimation();
        // // console.log(anim['opacity']);

        // function doAnim(animName){
        //     var args = [];
        //     for(var i = 1, len = arguments.length; i < len; i ++){
        //         args[i-1] = arguments[i];
        //     }
        //     return anim[animName].call(anim, args);
        // }

        // var anim = doAnim('opacity', 1).step();
        // console.log(anim);

    },

    /**
     * [onShow description]
     * @return {[type]} [description]
     */
    onShow: function() {
        if (!hasLifeCycleOnShow) {
            hasLifeCycleOnShow = true;
            return;
        }

        var globalLikeState = getApp().globalData.likeState;

        var globalIndex = globalLikeState.index;
        if (globalIndex < 0) return;

        var list = this.data.list;
        var itemData = list[globalIndex];
        if (itemData.is_collects != globalLikeState.state) {
            itemData.is_collects = globalLikeState.state;
            var goodNum = parseInt(itemData.good_num);
            itemData.good_num = globalLikeState.state == 1 ? goodNum + 1 : goodNum - 1;
            this.setData({
                list: list
            });
        }

    },

    /**
     * 点击排序条件
     * @return {[type]} [description]
     */
    bindOrderTap: function(e) {
        // console.log(e);
        var orders = this.data.orders;
        var index = this.dataOf(e, 'index');
        if (prevOrderIndex == index) { // toggle order
            var order = orders[index];
            if (order.clzName == DESC_CLZ_NAME) {
                order.clzName = ASC_CLZ_NAME;
                order.order = index == 2 ? 'desc' : 'asc';
            } else {
                order.clzName = DESC_CLZ_NAME;
                order.order = index == 2 ? 'asc' : 'desc';
            }

        } else {
            prevOrderIndex = index;
            var orders = orders.map(function(value, i) {

                if (index == i) {
                    value.color = SELECTED_COLOR;
                    value.clzName = DESC_CLZ_NAME;
                } else {
                    value.color = NORMAL_COLOR;
                    value.clzName = '';
                }

                value.order = index == 2 ? 'asc' : 'desc';
                return value;
            });
        }

        var orderObj = orders[index];
        presenter.byOrder(orderObj.orderBy, orderObj.order);
        wx.showNavigationBarLoading();

        this.setData({
            orders: orders,
            footerText: '正在加载...'
        });
    },

    /**
     * 重置搜索条件
     * @return {[void]}
     */
    bindResetTap: function() {
        var selections = this.data.selections.map(function(item) {
            var newSub = item.sub.map(function(value) {
                value.isSelected = false;
                return value;
            });
            item.sub = newSub;
            return item;
        });
        this.setData({
            currentCatIndex: 0,
            selections: selections,
            filterMap: [],
            keyWord: ''
        });
    },

    /**
     * [bintSearchInput description]
     * @param  {[event]} e [description]
     * @return {[void]}   [description]
     */
    bintSearchInput: function(e) {
        this.setData({
            keyWord: e.detail.value
        })
    },

    /**
     * 搜索
     * @param  {[event]} e [description]
     * @return {[void]}   [description]
     */
    bindDoSearchTap: function(e) {
        var type = [],
            min = 0,
            max = 100,
            country = [];

        var selections = this.data.selections;

        selections.map(function(selection, index) {
            selection.sub.map(function(v) {
                if (!v.isSelected) return;
                switch (index) {
                    case 0:
                        type.push(v.id);
                        break;
                    case 1:
                        min = v.min;
                        max = v.max;
                        break;
                    case 2:
                        country.push(v.id);
                        break;
                }
            });
        });

        var extras = [];
        extras.push({ key: 'type', value: type.join(',') });
        extras.push({ key: 'min', value: min });
        extras.push({ key: 'max', value: max });
        extras.push({ key: 'country', value: country.join(',') });
        extras.push({ key: 'key', value: this.data.keyWord });

        // console.group('search');
        // console.table(extras);
        // console.groupEnd();

        presenter.resetUrl().appendParam('order', 'comment').setIsLoading(false);
        extras.map(function(e) {
            presenter.appendParam(e.key, e.value);
        });
        presenter.requestByPage(1);

        prevOrderIndex = -1;

        this.setData({
            isSearchVisible: false,
            orders: OLD_ORDERS.slice(),
            footerText: '正在加载...'
        });

        wx.showNavigationBarLoading();

    },

    /**
     * 改变tag的选中状态
     * @param  {[integer]} parentIndex [description]
     * @param  {[integer]} index       [description]
     * @param  {[boolean]} state       [description]
     * @return {[void]}             [description]
     */
    setTagSelectedState: function(parentIndex, index, state) {
        var selections = this.data.selections;
        selections[parentIndex].sub[index].isSelected = state;
        this.setData({
            selections: selections
        });
    },

    /**
     * 获取tag的选中状态
     * @param  {[integer]} parentIndex [description]
     * @param  {[integer]} index       [description]
     * @return {[void]}             [description]
     */
    getTagSelectedState: function(parentIndex, index) {
        return this.data.selections[parentIndex].sub[index].isSelected;
    },

    /**
     * [toggleTagSelectedState description]
     * @param  {[type]} parentIndex [description]
     * @param  {[type]} index       [description]
     * @return {[type]}             [description]
     */
    toggleTagSelectedState: function(e) {
        var currentCatIndex = this.data.currentCatIndex;
        currentCatIndex = currentCatIndex < 0 ? 0 : currentCatIndex;
        var index = this.dataOf(e, 'index');
        var isSelected = this.getTagSelectedState(currentCatIndex, index);
        this.setTagSelectedState(currentCatIndex, index, !isSelected);
    },

    /**
     * 搜索
     * @param  {[type]}
     * @return {[type]}
     */
    bindSearch: function(e) {
        // console.log('搜索');
        
        // var anim = wx.createAnimation({
        //     duration: 300,
        //     timingFunction: "ease-in",
        // });
        // anim.opacity(1).step();
        // 
        // console.log(anim.opacity());

        this.setData({
            isSearchVisible: true,
            // coverAlphaAnim: anim.opacity(1).export()
        });

        if (this.data.selections[2].sub.length) return; // 只加载一次国家列表

        presenter.getCountries();
    },

    /**
     * 点击遮罩层使搜索条件消失
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    bindCoverTap: function(e) {
        // var anim = wx.createAnimation({
        //     duration: 300,
        //     timingFunction: "ease-in",
        // });
        // anim.opacity(0).step();
        this.setData({
            isSearchVisible: false,
            // coverAlphaAnim: anim.export()
        });
    },


    /**
     * 点击标签删除
     * @param  {[Event]} e [description]
     * @return {[void]}   [description]
     */
    bindTagTap: function(e) {
        var filterMap = this.data.filterMap;
        filterMap.splice(this.dataOf(e, 'index'), 1);
        var selections = this.data.selections;
        selections[this.dataOf(e, 'pindex')].sub[this.dataOf(e, 'cindex')].isSelected = false;
        this.setData({
            filterMap: filterMap,
            selections: selections
        });
    },

    /**
     * 点击左边分类
     * @param  {[type]}
     * @return {[type]}
     */
    bindCatTap: function(e) {
        var index = this.dataOf(e, 'index');
        this.setData({
            currentCatIndex: index
        });
    },

    /**
     * 搜索子分类点击
     * @param  {[type]}
     * @return {[type]}
     */
    bindSubCatTap: function(e) {
        var index = this.dataOf(e, 'index');
        var filterMap = this.data.filterMap;
        var ccIndex = this.data.currentCatIndex;
        if (ccIndex < 0) { // 还没选总分类就选了子分类的情况下，选择第一个总分类
            this.setData({
                currentCatIndex: 0
            });
            ccIndex = 0;
        }


        if (ccIndex == 0 || ccIndex == 1) { // 单选

            var len = filterMap.length;
            var flag = true;
            for (var i = 0; i < len; i++) {
                var value = filterMap[i];
                if (value[0] == ccIndex) {
                    this.setTagSelectedState(value[0], value[1], false);
                    if (value[1] == index) {
                        filterMap.splice(i, 1);
                    } else {
                        filterMap[i] = [ccIndex, index];
                        this.setTagSelectedState(ccIndex, index, true);
                    }
                    flag = false;
                    break;
                }
            }
            if (flag || !len) {
                filterMap.push([ccIndex, index]);
                this.setTagSelectedState(ccIndex, index, true);
            }

        } else { // 不能多于4个

            var count = 0;
            for (var i = 0, len = filterMap.length; i < len; i++) {
                if (filterMap[i][0] != ccIndex) continue;
                if (filterMap[i][1] == index) break;
                if (++count >= 4) {
                    wx.showModal({
                        content: '最多只能选择四个服务范围',
                        showCancel: false
                    });
                    return;
                }
            }
            util.toggleValueOfArray(filterMap, [ccIndex, index]);
            this.toggleTagSelectedState(e);
        }

        this.setData({
            filterMap: filterMap
        });

    },

    /**
     * 下拉刷新
     * @return {[type]} [description]
     */
    onPullDownRefresh: function() {
        presenter && presenter.refresh();
        this.setData({
            orders: OLD_ORDERS.slice(),
            footerText: '加载更多'
        });
        // console.log('下拉刷新');
    },

    /**
     * 页面滑动到了底部，加载下一页数据
     * @return {[type]}
     */
    onReachBottom: function() {
        // console.log('BOTTOM!!!');
        presenter && presenter.requestNext();
    },

    /**
     * 重置数据
     * @param {[type]}
     */
    setList: function(data) {
        data = data.map(function(val) {
            val.create_tm = util.formatDate(val.create_tm);
            val.stars = val.nums == 0 ? 5 : parseInt(val.stars / val.nums);
            return val;
        });
        this.setData({
            list: data
        });
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
    },

    /**
     * 追加数据
     * @param  {[type]}
     * @return {[type]}
     */
    concatList: function(data) {
        var oldData = this.data.list;
        data = data.map(function(val) {
            val.create_tm = util.formatDate(val.create_tm);
            val.stars = val.nums == 0 ? 5 : parseInt(val.stars / val.nums);
            return val;
        });

        // console.table(data);

        this.setData({
            list: oldData.concat(data)
        });
    },

    /**
     * 点击顾问
     * @param  {[type]}
     * @return {[type]}
     */
    bindItem: function(e) {
        var index = this.dataOf(e, 'index');
        var itemData = this.data.list[index];
        var globalLikeState = getApp().globalData.likeState;
        globalLikeState.index = index;
        globalLikeState.state = itemData.is_collects;
        // console.log('item ' + index);
        var info = JSON.stringify(itemData);
        wx.navigateTo({
            url: 'details/details?info=' + info
        })

    },

    /**
     * like one consultant
     * @param  {Event}
     * @return {Void}
     */
    bindLike: function(e) {
        var index = this.dataOf(e, 'index');
        var itemData = this.data.list[index];
        var isCollected = (itemData.is_collects != 1);
        if (isCollected) {
            itemData.good_num = parseInt(itemData.good_num) + 1;
        } else {
            itemData.good_num = parseInt(itemData.good_num) - 1;
        }
        presenter.like(index, itemData.id, isCollected);
        this.toggleProp(index, 'is_collects');
    },

    /**
     * collect one consultant
     * @param  {Event}
     * @return {Void}
     */
    bindFav: function(e) {
        var index = this.dataOf(e, 'index');
        var itemData = this.data.list[index];
        presenter.fav(index, itemData.id, itemData.my_collects != 1);
        this.toggleProp(index, 'my_collects');
    },

    /**
     * toggle property
     * @param  {[Number]} index
     * @param  {[String]} property name
     * @return {[Void]}
     */
    toggleProp: function(index, propName) {
        var self = this;
        var itemData = this.data.list[index];
        itemData[propName] = itemData[propName] == '1' ? '0' : '1';
        this.setData({
            list: self.data.list
        });
    },

    /**
     * show loading view
     * @return {[void]}
     */
    showLoadingView: function() {
        this.setData({
            showLoadingView: true
        });
    },

    /**
     * hide loading view
     * @return {[void]}
     */
    hideLoadingView: function() {
        this.setData({
            showLoadingView: false
        });
    },

    /**
     * show no more view
     * @return {[void]}
     */
    showNoMoreData: function() {
        this.setData({
            footerText: '没有更多顾问'
        });
    },

    /**
     * 获取view的data属性，原生的写起来真的贼几把长
     * @param  {[Event]} event
     * @param  {[String]} data name
     * @return {[object]} data value
     */
    dataOf: function(e, name) {
        return e.currentTarget.dataset[name];
    },

    /**
     * @param  {[Event]}
     * @return {[void]}
     */
    bindTouchStart: function(e) {
        canMove = true;
        // var isAnimated = !this.data.isAnimated;
        // this.setData({
        //     isAnimated: isAnimated
        // });
        // var anim = wx.createAnimation({
        //     duration: 1000,
        //     timingFunction: 'ease-in'
        // });
        // anim.translate(-100, -100).step();
        // this.setData({
        //     fabAnimation: anim.export()
        // });
    },

    /**
     * @param  {[Event]}
     * @return {[void]}
     */
    bindTouchmove: function(e) {
        // console.log(e);
        if (!canMove) {
            return;
        }
        // this.setData({
        //     right: e.touches[0].clientX + 6,
        //     bottom: e.touches[0].clientY + 6
        // });
    },

    /**
     * @param  {[Event]}
     * @return {[void]}
     */
    bindTouchend: function(e) {
        canMove = false;
    },

    /**
     * @param  {[Event]}
     * @return {[void]}
     */
    bindTouchcancel: function(e) {
        canMove = false;
    },

    /**
     * 设置搜索国家
     * @param {[type]} countries [description]
     */
    setCountries: function(countries) {
        var selections = this.data.selections;
        var data = selections[2].sub;
        countries.map(function(c) {
            var country = {};
            country.id = c.id;
            country.name = c.tag_opt;
            country.isSelected = false;
            data.push(country);
        });
        this.setData({
            selections: selections
        });
    }

});

/**
 * @param {[Object]} the view
 */
var Presenter = function(view) {
    this.pageSize = 15;

    this.view = view;
    this.page = 1;
    this.isrefreshing = false;
    this.isloading = false;
    this.hasNoData = false;

    var globalUserInfo = getApp().globalData.userInfo;
    this.uid = globalUserInfo.uid;
    this.code = globalUserInfo.code;
    this.baseUrl = util.host + '/API/Program/consultant?uid=' + this.uid + '&man=1';
    this.url = this.baseUrl;
    this.likeUrl = util.host + '/api/Public/ajax_likes?uid=' + this.uid + '&code=' + this.code + '&man=1';
}

/**
 * List Presenter
 * @type {Object}
 */
Presenter.prototype = {

    /**
     * 刷新
     * @return {Void} 
     */
    refresh: function() {
        if (this.isrefreshing) return;
        this.isloading = false;
        this.page = 1;
        // this.requestByPage(this.page);
        this.isrefreshing = true;

        var url = this.url ;
        util.get(this, url, 'refresh');
    },

    /**
     * 加载下一个数据
     * @return {Void} 
     */
    requestNext: function() {
        if (this.isrefreshing || this.isloading) {
            return;
        }
        // console.log('request info of next page');
        this.requestByPage(++this.page);
    },

    /**
     * 根据页数加载数据
     * @param  {Number} page 页
     * @return {Void}    
     */
    requestByPage: function(page) {
        if (this.isrefreshing || this.isloading) {
            return;
        }
        this.isloading = true;
        this.page = page;
        var requestUrl = this.url + '&page=' + this.page;
        // this.model.get(requestUrl);
        util.get(this, requestUrl, 'list');
        this.view.showLoadingView();
        console.log('[[ url >> ' + requestUrl + ' ]]');
    },

    /**
     * 获取目前已经加载了几页数据
     * @return {Number} 当前加载的数据的页数
     */
    getPage: function() {
        return this.page;
    },

    /**
     * 获取到数据
     * @param  {Object} data 返回的数据
     * @param  {Object} tag  请求标记
     * @return {Void}      
     */
    onGetData: function(data, tag) {
        if (tag == 'countries') {
            this.view.setCountries(data);
        } else if (tag == 'list') {
            if (!data.length) {
                this.view.showNoMoreData();
                return;
            }
            this.isloading = false;
            if (this.page == 1) {
                this.view.setList(data);
                if (data.length < this.pageSize) {
                    this.view.showNoMoreData();
                }
            } else {
                this.view.concatList(data);
            }
            this.view.hideLoadingView();
        } else if (tag == 'refresh') {
            this.isrefreshing = false;
            var len = data.length;
            if (!len) {
                this.view.showNoMoreData();
                return;
            }
            this.view.setList(data);
            if (len < this.pageSize) {
                this.view.showNoMoreData();
            }
        }
    },

    /**
     * 设置加载状态
     * @param {[Boolean]} isloading 是否正在加载
     */
    setIsLoading: function(isloading) {
        this.isloading = isloading;
    },

    /**
     * 根据某种顺序加载数据
     * @param  {String} type  排序方式
     * @param  {String} order 正序还是倒序
     * @return {Void}      
     */
    byOrder: function(type, order) {
        var param = '&order=' + type + '&desc=' + order;
        this.url = this.baseUrl + param;
        // this.appendParam('order', type).appendParam('desc', order);
        this.requestByPage(1);
    },

    /**
     * 获取搜索用的国家
     * @return {[type]} [description]
     */
    getCountries: function() {
        var url = util.host + '/api/index/getCountryList.html?cid=0';
        util.get(this, url, 'countries');
    },

    /**
     * 重置url
     * @return {[type]} [description]
     */
    resetUrl: function() {
        this.url = this.baseUrl;
        return this;
    },

    /**
     * 追加param
     * @param  {[type]} key   [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    appendParam: function(key, value) {
        this.url += '&' + key + '=' + value;
        return this;
    },

    /**
     * [like description]
     * @param  {Number}  index        顾问在当前列表中的索引
     * @param  {String}  consultantId 要进行操作的顾问id
     * @param  {Boolean} isNegative   isNegative   true：点赞， false：取消赞
     * @return {Void} 
     */
    like: function(index, consultantId, isNegative) {
        var url = this.likeUrl + '&type=1&is=' + (isNegative ? '0' : '1') + '&sp_id=' + consultantId;
        util.get(this, url, 'like');
    },

    /**
     * [fav description]
     * @param  {Number}  index        顾问在当前列表中的索引
     * @param  {String}  consultantId 要进行操作的顾问id
     * @param  {Boolean} isNegative   true：收藏，false：取消收藏
     * @return {Void}
     */
    fav: function(index, consultantId, isNegative) {
        var url = this.likeUrl + '&type=2&is=' + (isNegative ? '0' : '1') + '&sp_id=' + consultantId;
        util.get(this, url, 'fav');
        console.log('fav url >>> ' + url);
    },

    getUrl: function() {
        return this.url;
    },

    /**
     * [onError description]
     * @param  {[type]} msg [description]
     * @param  {[type]} tag [description]
     * @return {[type]}     [description]
     */
    onError: function(msg, tag) {
        console.error(`error:[msg = ${msg}, tag = ${tag}]`);
    },

    /**
     * [onFail description]
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */
    onFail: function(e) {
        console.group('Error@' + Date.now());
        console.error(e);
        console.groupEnd(']');
    }
}