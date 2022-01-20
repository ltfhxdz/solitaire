const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },


  add: function () {
    this.setData({
      termShow: true
    })
  },

  addCancel: function () {
    this.setData({
      termShow: false
    })
  },


  onSubmit: function (e) {
    let name = e.detail.value.name.replace(/(^\s*)|(\s*$)/g, "");
    let roster = e.detail.value.roster.replace(/(^\s*)|(\s*$)/g, "");

    let flag = this.parameterJudge(name, roster);
    if (flag) {

      this.addDB(name, roster);

      this.setData({
        termShow: false
      })
    }


  },


  addDB: function (name, roster) {
    wx.cloud.callFunction({
      name: 'getUserInfo',
      complete: res => {
        let openid = res.result.openid;
        console.log(openid);

        // wx.cloud.callFunction({
        //   name: 'statistics',
        //   data: {
        //     openid: openid
        //   },
        //   complete: res => {
        //     this.setData({
        //       statisticsList: res.result
        //     })
        //   }
        // })
      }
    })
  },

  parameterJudge: function (name, roster) {
    let flag = true;
    if (name == "") {
      flag = false;
      wx.showToast({
        title: '群组名称不能为空',
        icon: 'none',
        duration: 2000,
        mask: true
      })
    } else {
      if (roster == "") {
        flag = false;
        wx.showToast({
          title: '全员名单不能为空',
          icon: 'none',
          duration: 2000,
          mask: true
        })
      }
    }
    return flag;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.add();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 允许用户点击右上角分享给朋友
   */
  onShareAppMessage: function () {
    title: '强身打卡：记录每一次健身，给增肌提供数据。'
  },
  /**
   * 允许用户右上角分享到朋友圈
   */
  onShareTimeline: function () {
    title: '强身打卡：记录每一次健身，给增肌提供数据。'
  }

})