//app.js

var util = require('utils/util.js');


App({
    onLaunch: function() {      
        var userInfo = wx.getStorageSync('userInfo');   // 从缓存中读取用户信息
        if(userInfo){
            this.globalData.userInfo = userInfo;
        }
    },
    getUserInfo: function(cb) {
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function(e) {                    
                    var code = e.code;
                    wx.getUserInfo({
                        success: function(res) {
                            that.globalData.userInfo = res.userInfo;
                            var head = res.userInfo.avatarUrl;
                            var nickname = res.userInfo.nickName;

                            var params = 'code=' + code + '&head=' + head + '&nickname=' + nickname
                            // console.log(params);
                            // console.log(code);
                            
                            var url = util.host + '/api/User/wxAppLogin?' + params;

                            wx.request({
                                url: url,
                                success: function(e){
                                    var res = e.data;
                                    // console.log(e);
                                    if(res.state == 1){
                                        // console.log(res);
                                        // 成功
                                        var data = res.data;
                                        console.log('uid=' + data.uid +', code=' + data.code);
                                        var globalUserInfo = that.globalData.userInfo;
                                        globalUserInfo.uid = data.uid;
                                        globalUserInfo.code = data.code;

                                        wx.setStorageSync('userInfo', globalUserInfo)

                                        typeof cb == "function" && cb(globalUserInfo)
                                    } 
                                },
                                fail: function(e){
                                    console.error(e);
                                    wx.showModal({
                                        content: e.errMsg
                                    });
                                }
                            });
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                },
                fail: function(e){
                    console.error('login failed ' + e);
                },
                complete: function(e){
                    console.log('login complete ' + e);
                }
            })
        }
    },
    globalData: {
        userInfo: null,
        /**
         * 点赞状态
         * @type {Object}
         */
        likeState: {
            index: -1,
            state: 0
        }
    },

    navigateForResult: function(page, url, req){
        wx.navigateTo({
            url: url
        });

        page.onShow = function(){
            page.onResult && page.onResult(req);
        }

    }
})
