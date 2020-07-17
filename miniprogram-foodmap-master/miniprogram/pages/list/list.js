const mta = require('../../vendor/mta_analysis.js');
const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=3175633703,3855171020&fm=27&gp=0.jpg',
    numbers: 0,
    stores: [],
    photoWidth: wx.getSystemInfoSync().windowWidth / 5
    
  },
  switchNav: function (e) { var id = e.currentTarget.id; this.setData({ currentTab: id }); },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    mta.Page.init();
    this.loadData();
  },
  loadData: function () {
    store.skip(this.data.numbers).get().then(res => {
      /**
       * 如果没有数据，返回。
       */
      if (res.data.length == 0) {
        wx.showToast({
          title: '没有了！',
          icon: 'none'
        });
        return;
      }
      this.setData({
        stores: this.data.stores.concat(res.data),
        numbers: this.data.numbers + res.data.length
      });
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadData();
  },
  navigateToSearch: function (e) {
    wx.redirectTo({
      url: '../search/search',
    })
  },
  // 点击图片进行大图查看
  LookPhoto: function (e) {
    console.log(e)
    wx.previewImage({
      current: e.currentTarget.dataset.photurl,


      urls: this.data.stores[e.currentTarget.dataset.index].images,
    })
  }
})