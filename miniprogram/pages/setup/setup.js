const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  solitaireActivation: function (e) {
    if (!e.detail.value) {
      wx.showToast({
        title: '请选择需要激活的记录',
        icon: 'none',
        duration: 2000,
        mask: true
      });

      this.solitaireQuery();
      return;
    }

    if (e.detail.value) {
      this.solitaireUpdate(e.currentTarget.dataset.id, true);
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
    this.setData({
      solitaireShow: true
    })
  },

  addCancel: function () {
    this.setData({
      solitaireShow: false
    })
  },


  onSubmit: function (e) {
    let name = e.detail.value.name.replace(/(^\s*)|(\s*$)/g, "");
    let roster = e.detail.value.roster.replace(/(^\s*)|(\s*$)/g, "");

    let flag = this.parameterJudge(name, roster);
    if (flag) {
      let nameArray = this.getNameArray(roster);

      this.solitaireAddDB(name, nameArray);

      this.setData({
        solitaireShow: false
      })
    }
  },

  solitaireDelete: function (e) {
    if (this.data.solitaireList.length > 1 && e.currentTarget.dataset.activation) {
      wx.showToast({
        title: '不能删除激活的记录',
        icon: 'none',
        duration: 2000,
        mask: true
      });
      return;
    }

    db.collection('solitaire').doc(e.currentTarget.dataset.id).remove({
      success: res => {
        this.solitaireQuery();
      },
      fail: err => {
        console.error('数据库删除失败：', err)
      }
    })
  },

  solitaireAddDB: function (name, nameArray) {
    let activation = false;
    if (this.data.solitaireSize == 0) {
      activation = true;
    }

    db.collection('solitaire').add({
      data: {
        name: name,
        nameArray: nameArray.sort((a, b) => a.localeCompare(b)),
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
    db.collection('solitaire').orderBy('create_date', 'asc').get({
      success: res => {
        let solitaireList = res.data;
        let solitaireActivationId = "";
        for (let x in solitaireList) {
          if (solitaireList[x].activation) {
            solitaireActivationId = solitaireList[x]._id;
            break;
          }
        }
        this.solitaireByIdQuery_sub(solitaireActivationId);

        this.setData({
          solitaireActivationId: solitaireActivationId,
          solitaireSize: res.data.length,
          solitaireList: res.data
        })

        if (solitaireList.length == 0) {
          this.setData({
            groupFlag: false
          })
        }
      }
    })
  },

  solitaireByIdQuery: function (e) {
    this.solitaireByIdQuery_sub(e.currentTarget.dataset.id);
  },


  solitaireByIdQuery_sub: function (id) {
    db.collection('solitaire').where({
      _id: id
    }).get({
      success: res => {
        let nameArray = res.data[0].nameArray;

        let nameList = [];
        let nameMap = {};
        let m = 0;
        for (let x in nameArray) {
          m = m + 1;
          if (m == 1) {
            nameMap['name1'] = nameArray[x];
          } else if (m == 2) {
            nameMap['name2'] = nameArray[x];
          } else if (m == 3) {
            nameMap['name3'] = nameArray[x];
          } else if (m == 4) {
            nameMap['name4'] = nameArray[x];
            nameList.push(nameMap);
            m = 0;
            nameMap = {};
          }
        }

        if (nameList.length * 4 < nameArray.length) {
          if (typeof (nameArray[nameList.length * 4]) != "undefined") {
            nameMap["name1"] = nameArray[nameList.length * 4];
          }

          if (typeof (nameArray[nameList.length * 4 + 1]) != "undefined") {
            nameMap["name2"] = nameArray[nameList.length * 4 + 1];
          }

          if (typeof (nameArray[nameList.length * 4 + 2]) != "undefined") {
            nameMap["name3"] = nameArray[nameList.length * 4 + 2];
          }

          if (typeof (nameArray[nameList.length * 4 + 3]) != "undefined") {
            nameMap["name4"] = nameArray[nameList.length * 4 + 3];
          }

          nameList.push(nameMap);
        }

        this.setData({
          nameList: nameList,
          total: nameArray.length,
          groupName: res.data[0].name,
          groupFlag: true
        })
      }
    })
  },

  addDB: function (name, roster) {
    // wx.cloud.callFunction({
    //   name: 'getUserInfo',
    //   complete: res => {
    //     let openid = res.result.openid;

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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.solitaireQuery();
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
    title: '查询未接龙的名单'
  },
  /**
   * 允许用户右上角分享到朋友圈
   */
  onShareTimeline: function () {
    title: '查询未接龙的名单'
  }

})