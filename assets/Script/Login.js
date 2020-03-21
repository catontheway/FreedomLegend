// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

let WebApi = require("../Kits/WebApi");
let AuthApi = require("../Kits/AuthApi");

cc.Class({
  extends: cc.Component,

  ctor() {
    // 游戏概况信息
    this.objGameDetail = {
      name: '',
      notice: '',
      version: '',
    };
  },

  properties: {
    // 画布对象
    m_canvas: {
      type: cc.Node,
      default: null
    },
    // 预制体-对话框
    m_prefabDlg: {
      type: cc.Prefab,
      default: null
    },
    // 登录按钮
    m_btnLogin: {
      type: cc.Node,
      default: null
    },
    // 公告按钮
    m_btnNotice: {
      type: cc.Node,
      default: null
    },
    // 用户信息组件
    m_memberInfo: {
      type: cc.Node,
      default: null
    },
    // 头像精灵
    m_sprAvatar: {
      type: cc.Node,
      default: null
    },
    // 昵称文字
    m_labelName: {
      type: cc.Node,
      default: null
    },
    // 版本号
    m_labelVersion: {
      type: cc.Node,
      default: null
    }
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start () {
    console.log('start');

    // 注册函数
    this.registerInit();
    
    // 自定义初始化函数
    this.init();
  },

  onEnable () {
    console.log('Login onEnable');
  },

  onDisable () {
    console.log('Login onDisEnable');
  },

  // update (dt) {},

  //////////////////////////////////////////////////
  // 交互事件
  //////////////////////////////////////////////////
  // 测试点击函数
  onBtnClick: function(e, param) {
    console.log('Login onBtnClick');
  },

  // 点击公告按钮消息事件
  onBtnNoticeClick: function(e, param) {
    // 获取用户信息
    console.log('Login onBtnNoticeClick');
    this.showNocticeDlg();
  },

  // 点击登录按钮消息事件
  onBtnLoginClick: function(e, param) {
    console.log('Login onBtnLoginClick');
    // 获取用户信息
    this.getUserInfo();    
  },

  //////////////////////////////////////////////////
  // 自定义函数
  //////////////////////////////////////////////////
  // 注册初始化
  registerInit: function() {
    // 初始化微信云函数
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      wx.cloud.init({env:'develop-8ouxt'});
    }
  },

  init: function() {
    // 获取游戏的公告等信息
    WebApi.queryGameDetail().then((res) => {
      // 1.接口读取到的信息转义
      console.log('Login init success.', res);
      if (res && res.result && res.result.result && res.result.result.data && res.result.result.data[0]) {
        this.objGameDetail = res.result.result.data[0]
        this.objGameDetail.strNotice = this.objGameDetail.notice.join('\n');
      }
      console.log('Login queryGameDetail', this.objGameDetail);
      return new Promise((resolve, reject) => {
        resolve();
      });
    }).then((res)=> {
      // 2.通过转义后的信息，对页面进行渲染
      console.log('Login 转义后的信息', this.objGameDetail);

      // 渲染
      this.m_labelVersion.getComponent(cc.Label).string = this.objGameDetail.version;

      // 打开公告栏
      this.showNocticeDlg();
      
    }).catch((err) => {
      // 报错
      console.log('Login init fail.', err);
    });
  },

  // 获取用户信息授权流程
  getUserInfo: function() {
    console.log('Login getUserInfo');
    AuthApi.authUserInfo().then((res) => {
      // 渲染用户信息
      this.setMemberInfo(res);
      this.m_memberInfo.active = true;

    }).catch((err) => {
      // 报错
      console.log('Login init fail.', err);
    })
  },

  // 渲染用户信息
  setMemberInfo: function(res) {
    console.log(res.userInfo);
    // 更新头像
    cc.loader.load({url: res.userInfo.avatarUrl, type: 'png'}, (err, img) => {
      console.log('Login getUserInfo', img);
      this.m_sprAvatar.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(img);
    });
    // 更新昵称
    this.m_labelName.getComponent(cc.Label).string = `${res.userInfo.nickName}，欢迎你回来~`;
  },


  // 显示公告对话框 
  showNocticeDlg: function() {
    this.m_dlgNotice = cc.instantiate(this.m_prefabDlg);
    this.m_dlgNotice.getComponent('ModuleDialog').setNoticeContent(this.objGameDetail.strNotice);
    this.m_canvas.addChild(this.m_dlgNotice);
  }

});

