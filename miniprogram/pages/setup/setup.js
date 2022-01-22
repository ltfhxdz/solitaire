const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  solitaireActivation: function (e) {
    console.log(e.detail.value);
    if (e.detail.value) {
      this.solitaireUpdate(e.currentTarget.dataset.id, true);
    } else {
      this.solitaireUpdate(e.currentTarget.dataset.id, false);
    }
  },

  solitaireUpdate: function (id, activation) {
    db.collection('solitaire').doc(id).update({
      data: {
        activation: activation
      },
      success: res => {
        db.collection('solitaire').doc(this.data.solitaireActivationId).update({
          data: {
            activation: false
          },
          success: res => {
            this.solitaireQuery();
          },
          fail: err => {
            console.error('数据库更新失败：', err)
          }
        })
      },
      fail: err => {
        console.error('数据库更新失败：', err)
      }
    })
  },

  add: function () {
    console.log(this.data.solitaireSize);
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
      let nameArray = this.getNameArray(roster);
      console.log(nameArray);

      this.solitaireAddDB(name, nameArray);

      this.setData({
        termShow: false
      })
    }
  },


  solitaireAddDB: function (name, nameArray) {
    let activation = false;
    if (this.data.solitaireSize == 0) {
      activation = true;
    }

    db.collection('solitaire').add({
      data: {
        name: name,
        nameArray: nameArray,
        activation: activation,
        create_date: db.serverDate()
      },
      success: res => {
        this.solitaireQuery();
      },
      fail: err => {
        console.error('数据库新增失败：', err)
      }
    })
  },


  solitaireQuery: function () {
    db.collection('solitaire').get({
      success: res => {
        console.log(res.data);
        let solitaireList = res.data;
        let solitaireActivationId = "";
        for (let x in solitaireList) {
          if (solitaireList[x].activation) {
            solitaireActivationId = solitaireList[x]._id;
            break;
          }
        }
        console.log(solitaireActivationId);
        this.setData({
          solitaireActivationId: solitaireActivationId,
          solitaireSize: res.data.length,
          solitaireList: res.data
        })
      }
    })
  },


  addDB: function (name, roster) {
    // wx.cloud.callFunction({
    //   name: 'getUserInfo',
    //   complete: res => {
    //     let openid = res.result.openid;
    //     console.log(openid);

    //     // wx.cloud.callFunction({
    //     //   name: 'statistics',
    //     //   data: {
    //     //     openid: openid
    //     //   },
    //     //   complete: res => {
    //     //     this.setData({
    //     //       statisticsList: res.result
    //     //     })
    //     //   }
    //     // })
    //   }
    // })
  },

  getNameArray: function (roster) {
    let rosterList = roster.split("\n");
    let m = -1;
    for (let x in rosterList) {
      m++;
      let name = rosterList[x].replace(/(^\s*)|(\s*$)/g, "");
      var start = name.indexOf("1.");
      if (start == 0) {
        break;
      }
    }

    rosterList.splice(0, m);
    console.log(rosterList);
    let nameArray = [];
    for (let x in rosterList) {
      let name = rosterList[x];
      let nameList = name.split(".");
      nameArray.push(nameList[1].replace(/(^\s*)|(\s*$)/g, ""));
    }

    return nameArray;
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
    this.solitaireQuery();
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