const mta = require('../../vendor/mta_analysis.js');
const app = getApp();
const db = wx.cloud.database()
const store = db.collection('store');
let uploadTask = Array;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uploaderList: [],
    uploaderNum: 0,
    showUpload: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init();
  },
  chooseLocation: function (event) {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: res => {
              wx.chooseLocation({
                success: res => {
                  this.setData({
                    address: res.address,
                    latitude: res.latitude,
                    longitude: res.longitude,
                    name: res.name
                  })
                }
              })
            }
          })
        } else {
          wx.chooseLocation({
            success: res => {
              this.setData({
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude,
                name: res.name
              })
            }
          })
        }
      }
    })

  },
  createItem: function (event) {
    wx.showLoading({
      title: '上传数据中...',
    })
    Promise.all(uploadTask).then(result => {

      let urls = [];
      for (const file of result) {
        urls.push(file.fileID);
      }
      this.setData({
        images: urls
      }, res => {
        wx.hideLoading();
        wx.showToast({
          title: '上传图片成功',
          icon: 'success'
        })
      })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({
        title: '上传图片错误',
        icon: 'error'
      })
    })
    let value = event.detail.value
    store.add({
      data: {
        ...value,
        thumbs_up: 1,
        iconPath: "/images/food.png",
        longitude: this.data.longitude,
        latitude: this.data.latitude,
        label: {
          content: value.title
        },
        images: this.data.images
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '创建成功！',
        icon: 'success',
        success: res => {
          wx.navigateBack({})
        }
      })
    }).catch(error => {
      console.error(error);
    })
  },

  uploadImage: function (e) {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {

        wx.showLoading({
          title: '上传中'
        })
        let tempFilePaths = res.tempFilePaths
        let items = [];
        for (const tempFilePath of tempFilePaths) {
          items.push({
            src: tempFilePath
          })
        }
         uploadTask = items.map(item => this.uploadPhoto(item.src))



        this.setData({
          tempPhoto: items
        })
      }
    })
  },
  uploadPhoto(filePath) {
    return wx.cloud.uploadFile({
      cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
      filePath
    })
  },
  // 删除图片
  clearImg: function (e) {
    var nowList = []; //新数据
    var uploaderList = this.data.uploaderList; //原数据

    for (let i = 0; i < uploaderList.length; i++) {
      if (i == e.currentTarget.dataset.index) {
        continue;
      } else {
        nowList.push(uploaderList[i])
      }
    }
    this.setData({
      uploaderNum: this.data.uploaderNum - 1,
      uploaderList: nowList,
      showUpload: true
    })
  },
  //展示图片
  showImg: function (e) {
    var that = this;
    wx.previewImage({
      urls: that.data.uploaderList,
      current: that.data.uploaderList[e.currentTarget.dataset.index]
    })
  },
  upload: function (e) {
    var that = this;
    wx.chooseImage({
      count: 9 - that.data.uploaderNum, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res)
        let tempFilePaths = res.tempFilePaths

        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

        let uploaderList = that.data.uploaderList.concat(tempFilePaths);
        if (uploaderList.length == 9) {
          that.setData({
            showUpload: false
          })
        }
        that.setData({
          uploaderList: uploaderList,
          uploaderNum: uploaderList.length,
        })
        let items = [];
        for (const tempFilePath of tempFilePaths) {
          items.push({
            src: tempFilePath
          })
        }
        console.log(item.src);

         uploadTask = items.map(item => this.uploadPhoto(item.src))
        this.setData({
          tempPhoto: items
        })
      }
    })
  }
})