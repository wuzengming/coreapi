const mta = require('../../vendor/mta_analysis.js');
const app = getApp();
const config = require('../../config.js');
const db = wx.cloud.database()
const store = db.collection('store');
const userInfo = db.collection('userInfo');

Page({

  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.map = wx.createMapContext('map')
    this.onChangeShowPosition(e)
  },
 
 	// 激活定位控件
   onChangeShowPosition (event) {
    let that = this 
		wx.getLocation({ 
      type: 'gcj02', 
      success: (res) => {
          console.log('成功：', res)
          that.setData({
            longitude: res.longitude,
            latitude: res.latitude,
            showPosition:true
          })
      },
      fail: (res) => {
          console.log('失败：', res)
      },
  })
		 
	},
  /**
   * 页面的初始数据
   */
  data: {
    
    windowHeight: 600,
    mapSubKey: config.mapSubKey,
    hideMe:true,
    showAdmin:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let showAdmin = config.show_admin?true:false;

    if (app.globalData.showAdmin) {
      showAdmin = true;
    }

    wx.showLoading({
      title: '数据加载中...',
    })
    mta.Page.init();
    store.get().then(res => {
      let data = res.data;
      // 将 _id 给 id ,确保 marker 事件的正确触发
      data.map(item => {
        item.id = item._id
      });
      this.setData({
        stores: res.data,
        windowHeight: app.globalData.windowHeight,
        hideMe:false,
        showAdmin: showAdmin,
        defaultScale: config.default_scale
      }, () => {
        wx.hideLoading();
        wx.showToast({
          title: '双指缩放可以调整地图可视区域.',
          icon: 'none'
        })
      })
    })

  },

  onShow: function () {
    // #10 添加完成后更新一下 map
    store.get().then(res => {
      let data = res.data;
      data.map(item => {
        item.id = item._id
      });
      this.setData({
        stores: res.data
      })
    })
  },

  viewAll: function () {
    wx.navigateTo({
      url: '../list/list',
    })
  },
  getUserInfo: function (e) {
    if (e.detail.userInfo){
      userInfo.get().then( res => {
        if (!res.data.length){
          userInfo.add({
            data: e.detail.userInfo
          })
        }
           app.globalData.is_administrator = true;
            wx.showModal({
              title: '管理员登陆成功',
              content: '管理员您好，是否要进入新增界面？',
              success: res => {
                if (res.cancel == false && res.confirm == true) {
                  wx.navigateTo({
                    url: '../add/add',
                  })
                } else {
                  wx.showToast({
                    title: '您可以点击下方查看全部按钮管理已有数据',
                    icon: 'none'
                  });
                }
              }
            })
          
        
      })
    }else{
      // 处理未授权的场景
      wx.showModal({
        title: '授权失败',
        content: '您尚未授权获取您的用户信息，是否开启授权界面？',
        success: res => {
          if (res.confirm) {
            wx.openSetting({})
          }
        }
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我在' + config.appName + '上发现了好吃的，你也看看吧！',
      path: '/pages/map/map?_mta_ref_id=group',
      imageUrl: "/images/share.jpg"
    }
  },
  onMarkerTap: function (event) {
    wx.navigateTo({
      url: '../info/info?id=' + event.markerId,
    })
  },
  getOpenID: function (event) {
    wx.cloud.callFunction({
      name: "getUserOpenId"
    }).then(res => {
      wx.setClipboardData({
        data: res.result.openid,
        success: res => {
          wx.showToast({
            title: 'openID已复制',
          })
        }
      })
    })
  },
  hideMe:function(res){
    this.setData({
      hideMe: true
    })
  },
  showAdmin:function(res){
    wx.setStorage({
      key: 'showAdmin',
      data: !this.data.showAdmin,
    })
    this.setData({
      showAdmin: !this.data.showAdmin
    })
  },
  search:function(){
    wx.navigateTo({
      url: '../search/search',
    })
  }
})