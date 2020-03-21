//////////////////////////////////////////////////
// mylog
// 测试打印
// param: str
// return: log
//////////////////////////////////////////////////
function mylog(str) {
  console.log('WebApi.mylog', str);
}

//////////////////////////////////////////////////
// queryGameDetail
// 查询游戏的全局信息
// param:
// return: member/game
// 
//////////////////////////////////////////////////
function queryGameDetail() {
  return new Promise((resolve, reject) => {
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      wx.cloud.callFunction({
        name: 'queryGameDetail',
        success: (res) => {
          console.log('WebApi.queryGameDetail', res);
          resolve(res);
        },
        fail: (err) => {
          console.log('WebApi.queryGameDetail', err);
          reject(err);
        }
      });
    } else {
      reject();
    }
  });
}

//////////////////////////////////////////////////
// updateMemeber
// 查询游戏的全局信息
// param:
//////////////////////////////////////////////////
function updateMemeber() {
  return new Promise((resolve, reject) => {
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      wx.cloud.callFunction({
        name: 'updateMemeber',
        success: (res) => {
          console.log('WebApi.updateMemeber', res);
          resolve(res);
        },
        fail: (err) => {
          console.log('WebApi.updateMemeber', err);
          reject(err);
        }
      });
    } else {
      reject();
    }
  });
}

export default {
  mylog,
  queryGameDetail,
  updateMemeber,
}