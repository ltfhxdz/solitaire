import pinyin from "wl-pinyin"
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  sortChinese: function (arr) {
    let length = arr.length;
    for (let i = 0; i < length - 1; i++) {
      for (let j = 0; j < length - 1; j++) {
        let x1 = pinyin.getPinyin(arr[j]);
        let x2 = pinyin.getPinyin(arr[j + 1]);
        if (x1 > x2) {
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
        }
      }
    }
    return arr;
  },

  onSubmit: function (e) {
    let name = e.detail.value.name.replace(/(^\s*)|(\s*$)/g, "");
    let roster = e.detail.value.roster.replace(/(^\s*)|(\s*$)/g, "");

    let flag = this.parameterJudge(name, roster);
    if (flag) {
      let nameArray = this.getNameArray(roster);

      this.solitaireAddDB(name, nameArray);

      this.setData({
        name: name,
        solitaireShow: false,
        initShow: false
      })
    }
  },

  query: function () {
    this.setData({
      noSolitaireFlag: false,
      solitaireShow: true,
      initShow: false,
      groupFlag: false
    })
  },

  solitaireAddDB: function (name, nameArray) {
    db.collection('solitaire').add({
      data: {
        name: name,
        nameArray: this.sortChinese(nameArray),
        activation: true,
        create_date: db.serverDate()
      },
      success: res => {
        this.solitaireByIdQuery_sub(res._id);
      },
      fail: err => {
        console.error('数据库新增失败：', err)
      }
    })
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


  addCancel: function () {
    this.setData({
      initName: "",
      initRoster: ""
    })
  },


  cancel: function () {
    this.setData({
      groupValue: "",
      noSolitaireFlag: false
    })
  },

  onQuery: function (e) {
    let roster = e.detail.value.QueryRoster.replace(/(^\s*)|(\s*$)/g, "");

    let flag = this.queryParameterJudge(roster);
    if (flag) {
      let nameArray = this.getQueryNameArray(roster);
      let nameServerArray = this.data.nameServerArray;

      let noSolitaireArray = [];
      for (let x in nameServerArray) {
        let flag = false;
        for (let y in nameArray) {
          if (nameArray[y].indexOf(nameServerArray[x]) != -1) {
            flag = true;
            break;
          }
        }

        if (!flag) {
          noSolitaireArray.push(nameServerArray[x]);
        }
      }

      this.arraySwitch(noSolitaireArray);

      this.setData({
        noSolitaireFlag: true,
        solitaireShow: false
      })
    }
  },

  queryParameterJudge: function (roster) {
    let flag = true;
    if (roster == "") {
      flag = false;
      wx.showToast({
        title: '查询数据不能为空',
        icon: 'none',
        duration: 2000,
        mask: true
      })
    }
    return flag;
  },

  solitaireQuery: function () {
    db.collection('solitaire').where({
      activation: true
    }).get({
      success: res => {
        let solitaireList = res.data;
        if (solitaireList.length == 0) {
          this.setData({
            noSolitaireFlag: false,
            initShow: true,
            solitaireShow: false,
            groupFlag: false
          })
        } else {
          if (this.data.noSolitaireFlag) {
            this.setData({
              noSolitaireFlag: true
            })
          } else {
            this.setData({
              noSolitaireFlag: false,
              name: solitaireList[0].name,
              nameServerArray: solitaireList[0].nameArray,
              solitaireShow: true,
              groupFlag: false
            })
          }

        }

      }
    })
  },

  arraySwitch: function (nameArray) {
    let nameList = [];
    let nameMap = {};
    let m = 0;
    // nameArray = nameArray.sort((a, b) => a.localeCompare(b));
    nameArray = this.sortChinese(nameArray);

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
      noSolitaireNameList: nameList,
      noSolitaireTotal: nameArray.length
    })
  },


  getQueryNameArray: function (roster) {
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