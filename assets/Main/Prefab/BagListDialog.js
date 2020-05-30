// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

let Common = require("../Kits/Common");
let WebApi = require("../Kits/WebApi");
let GameApi = require("../Kits/GameApi");

cc.Class({
  extends: cc.Component,

  ctor() {
    // 背包tab类型
    this.arrType = ['equipment', 'magic', 'medicine', 'consumables', 'pets'];
    // 介绍对话框
    this.m_dlgIntroduce = null;
    // 当前选中的按钮序号
    this.m_nSelectIndex = -1;
  },

  properties: {
    // 预制体 - List项Item
    m_prefabBagListItem: {
      type: cc.Prefab,
      default: null
    },
    // 预制体 - List项Item的介绍对话框
    m_prefabIntroduce: {
      type: cc.Prefab,
      default: null
    },
    // 模态对话框蒙板
    m_mask: {
      type: cc.Node,
      default: null
    }, 
    // Tab按钮 - 装备
    m_labelTabEquipment: {
      type: cc.Node,
      default: null
    },
    // Tab按钮 - 功法
    m_labelTabMagic: {
      type: cc.Node,
      default: null
    },
    // Tab按钮 - 丹药
    m_labelTabMedicine: {
      type: cc.Node,
      default: null
    },
    // Tab按钮 - 其他
    m_labelTabOther: {
      type: cc.Node,
      default: null
    },
    // 背包列表节点
    m_bagList: {
      type: cc.Node,
      default: null
    },
    // 空内容提示标识
    m_sprEmptyTip: {
      type: cc.Node,
      default: null
    }
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start () {
    this.queryBagListInfo(0);
  },

  onEnable () {
    console.log('BagDialog onEvable.');
    this.node.on('show-introduce-dlg', this.onShowIntroduceDlg, this);
    this.node.on('hide-introduce-dlg', this.onHideIntroduceDlg, this);
    this.node.on('submit-introduce-tip-dlg', this.onFuncBagPartsInfoUpdate, this);
    this.registerEvent();
  },

  onDisable () {
    console.log('BagDialog onDisable.');
    this.node.off('show-introduce-dlg', this.onShowIntroduceDlg, this);
    this.node.off('hide-introduce-dlg', this.onHideIntroduceDlg, this);
    this.node.off('submit-introduce-tip-dlg', this.onFuncBagPartsInfoUpdate, this);
    this.CancelEvent();
  },

  // update (dt) {},

  //////////////////////////////////////////////////
  // 交互事件
  //////////////////////////////////////////////////  
  // 注册事件
  registerEvent: function() {
    this.m_mask.on('touchstart', (event) => {
      event.stopPropagation();
    });
    this.m_mask.on('touchend', (event) => {
      event.stopPropagation();
    });
  },

  // 注销事件
  CancelEvent: function() {
    this.m_mask.off('touchstart', (event) => {
      event.stopPropagation();
    });
    this.m_mask.off('touchend', (event) => {
      event.stopPropagation();
    });
  },

  // 关闭对话框
  onBtnOKClick: function() {
    console.log('BagDialog onBtnOKClick.');
    this.node.dispatchEvent( new cc.Event.EventCustom('hide-bag-dlg', true) );
    this.node.active = false;
    this.node.removeFromParent();
  },

  // 筛选背包 - 按钮
  onBtnTabSwitchClick: function(e, param) {
    console.log('BagDialog onBtnTabSwitchClick');
    this.queryBagListInfo(parseInt(param));
  },

  // 显示介绍弹窗
  onShowIntroduceDlg: function(event) {
    const objBagListItemBase = event.getUserData();
    console.log('BagDialog onShowIntroduceDlg', event, objBagListItemBase);
    this.m_dlgIntroduce = cc.instantiate(this.m_prefabIntroduce);
    this.m_dlgIntroduce.getComponent('BagIntroduceDialog').setItemIntroduce(objBagListItemBase);
    this.node.addChild(this.m_dlgIntroduce);
  },

  // 隐藏介绍弹窗
  onHideIntroduceDlg: function() {
    console.log('BagDialog onHideIntroduceDlg');
    
  },

  // 实现对背包物品的处理
  onFuncBagPartsInfoUpdate: function(event) {
    const objParam = event.getUserData();
    console.log('BagDialog onFuncBagPartsInfoUpdate', event, objParam);
    switch (objParam.nCommand) {
      // 删除指定物品
      case 0:
        this.removeBagPartsInfo(objParam.objBagListItemComplete);
        break;
      // 装备指定物品
      case 1:
        this.equipBagPartsInfo(objParam.objBagListItemComplete);
        break;
      // 合成指定物品
      case 2:
        this.composeBagPartsInfo(objParam.objBagListItemComplete);
        break;
      // 分解指定物品
      case 3:
        this.decomposeBagPartsInfo(objParam.objBagListItemComplete);
        break;
      // 未知命令
      default:
        console.log('BagDialog onFuncBagPartsInfoUpdate 未知命令.');
        break;
    }
  },

  //////////////////////////////////////////////////
  // 自定义函数
  //////////////////////////////////////////////////
  // 改变按钮颜色
  switchButtonColor: function() {
    const colorMain = new cc.color(255, 0, 0, 255);
    const colorDesc = new cc.color(255, 255, 255, 255);
    
    this.m_labelTabEquipment.color = this.m_nSelectIndex === 0 ? colorMain : colorDesc;
    this.m_labelTabMagic.color = this.m_nSelectIndex === 1 ? colorMain : colorDesc;
    this.m_labelTabMedicine.color = this.m_nSelectIndex === 2 ? colorMain : colorDesc;
    this.m_labelTabOther.color = this.m_nSelectIndex === 3 ? colorMain : colorDesc;
    
  },

  // 创建一个预制体item
  createBagListItem: function(objItem, index) {
    let item = null;
    item = cc.instantiate(this.m_prefabBagListItem);
    item.getComponent('BagListItem').setBagListItemData(objItem);
    item.x = 0;
    item.y = -(index + 1) * 80;
    this.m_bagList.addChild(item);
  },

  // 背包排序
  sortBagListInfo: function(arrPartInfo) {
    arrPartInfo.sort((infoA, infoB) => {
      // 深拷贝字符串
      let strID_A = JSON.stringify(JSON.parse(infoA.id));
      let strID_B = JSON.stringify(JSON.parse(infoB.id));
      // 如果是碎片都放后面
      if (strID_A.slice(5, 6) === '0') {
        strID_A = `99${strID_A}`
      }
      if (strID_B.slice(5, 6) === '0') {
        strID_B = `99${strID_B}`
      }
      return strID_B - strID_A;
    })
  },

  // 刷新背包列表内容 - 本地刷新
  refreshBagListInfo_local: function() {
    // 清空列表
    this.m_bagList.removeAllChildren();
    const arrBagInfoList = g_objBagInfo[this.arrType[this.m_nSelectIndex]];
    
    if (arrBagInfoList && arrBagInfoList.length === 0) {
      this.m_sprEmptyTip.active = true;
    } else {
      this.m_sprEmptyTip.active = false;
      // 排序
      this.sortBagListInfo(arrBagInfoList);
      // 渲染
      arrBagInfoList.forEach((item, index) => {
        this.createBagListItem(item, index);
      });
      this.m_bagList.height = 80 * arrBagInfoList.length;
    }
  },

  // 查询背包列表内容(不存在！)
  queryBagListInfo: function(index) {
    console.log('BagDialog queryBagListInfo', index);
    if (this.m_nSelectIndex === index) {
      return ;
    }
    this.m_nSelectIndex = index;
    // 改变按钮颜色
    this.switchButtonColor();
    // 刷新背包列表
    this.refreshBagListInfo_local();
  },

  // 删除指定物品
  removeBagPartsInfo: function(objBagListItemComplete) {
    console.log('g_objBagInfo', g_objBagInfo[this.arrType[this.m_nSelectIndex]], 'objBagListItemComplete', objBagListItemComplete);
    // 查找对应物品
    const nIndex = g_objBagInfo[this.arrType[this.m_nSelectIndex]].findIndex((item) => { 
      return objBagListItemComplete._id === item._id;
    });
    // 找到则进行操作
    if (nIndex >= 0) {
      g_objBagInfo[this.arrType[this.m_nSelectIndex]].splice(nIndex, 1);
      console.log('BagDialog removeBagPartsInfo', nIndex, g_objBagInfo[this.arrType[this.m_nSelectIndex]]);

      // 先反馈，刷新背包列表
      this.refreshBagListInfo_local();
      // 后更新数据库
      const param = {
        partsInfo: g_objBagInfo[this.arrType[this.m_nSelectIndex]],
        partsType: this.arrType[this.m_nSelectIndex]
      };
      WebApi.updatePartsInfo(param).then((res) => {
        
      }).catch((err) => {
        console.log('BagDialog removeBagPartsInfo Fail.', err);
      });
    } else {
      console.log('BagDialog removeBagPartsInfo 未找到指定物品');
    }
  },

  // 获取指定位置的装备
  getPositionEquipment: function(nPosition) {
    let objTmp = {};
    switch (nPosition) {
      case 0:
        objTmp = g_objMemberInfo.equipment_hat;
        break;
      case 1:
        objTmp = g_objMemberInfo.equipment_shoulder;
        break;
      case 2:
        objTmp = g_objMemberInfo.equipment_jacket;
        break;
      case 3:
        objTmp = g_objMemberInfo.equipment_weapon;
        break;
      case 4:
        objTmp = g_objMemberInfo.equipment_jewelry;
        break;
      case 5:
        objTmp = g_objMemberInfo.equipment_shoes;
        break;
      default:
        objTmp = {};
        break;
    }
    return objTmp;
  },

  // 穿着指定位置的装备
  setPositionEquipment: function(nPosition, objEquipment) {
    switch (nPosition) {
      case 0:
        g_objMemberInfo.equipment_hat = objEquipment;
        break;
      case 1:
        g_objMemberInfo.equipment_shoulder = objEquipment;
        break;
      case 2:
        g_objMemberInfo.equipment_jacket = objEquipment;
        break;
      case 3:
        g_objMemberInfo.equipment_weapon = objEquipment;
        break;
      case 4:
        g_objMemberInfo.equipment_jewelry = objEquipment;
        break;
      case 5:
        g_objMemberInfo.equipment_shoes = objEquipment;
        break;
      default:
        break;
    }
  },

  // 装备指定物品
  equipBagPartsInfo: function(objBagListItemComplete) {
    console.log('g_objBagInfo', g_objBagInfo[this.arrType[this.m_nSelectIndex]], 'objBagListItemComplete', objBagListItemComplete);
    // 查找对应物品
    const nIndex = g_objBagInfo[this.arrType[this.m_nSelectIndex]].findIndex((item) => { 
      return objBagListItemComplete._id === item._id;
    });
    // 找到则进行操作
    if (nIndex >= 0) {
      // 背包中删除
      g_objBagInfo[this.arrType[this.m_nSelectIndex]].splice(nIndex, 1);
      // 找到对应装备
      const nPartsInfoPosition = GameApi.getPartsInfoType(objBagListItemComplete.id).nPosition;
      let objEquipPartsInfo = this.getPositionEquipment(nPartsInfoPosition);
      // 装备缓存备份
      let objTmpEquipPartsInfo = JSON.parse(JSON.stringify(objEquipPartsInfo));
      // 穿上装备
      this.setPositionEquipment(nPartsInfoPosition, objBagListItemComplete);
      // 如果原来穿着装备，则放回背包中
      if (!Common.isObjectEmpty(objTmpEquipPartsInfo)) {
        g_objBagInfo[this.arrType[this.m_nSelectIndex]].push(objTmpEquipPartsInfo);
      }

      // 先反馈，刷新背包列表
      this.refreshBagListInfo_local();
      // 配置参数：更新背包列表
      const param = {
        partsInfo: g_objBagInfo[this.arrType[this.m_nSelectIndex]],
        partsType: this.arrType[this.m_nSelectIndex]
      };
      // 服务器更新背包列表
      WebApi.updatePartsInfo(param).then((res) => {
        
      }).catch((err) => {
        console.log('BagDialog removeBagPartsInfo Fail.', err);
      });

      // 配置参数：更新人物属性全局变量
      const newMemberInfo = GameApi.funComputedMemberInfo(g_objMemberInfo.level);
      g_objMemberInfo = Common.destructuringAssignment(g_objMemberInfo, newMemberInfo);
      // 服务器更新人物属性
      const paramMemberInfo = {
        memberInfo: g_objMemberInfo
      };
      WebApi.updateMemberInfo(paramMemberInfo).then((res) => {
        console.log('BagDialog updateMemberInfo.success.', res);
      }).catch((err) => {
        console.log('BagDialog updateMemberInfo.fail.', err);
      });

    } else {
      console.log('BagDialog equipBagPartsInfo 未找到指定物品');
    }
  },

  // 合成指定物品 0为整装 1为碎片
  composeBagPartsInfo: function(objBagListItemComplete) {
    console.log('g_objBagInfo', g_objBagInfo[this.arrType[this.m_nSelectIndex]], 'objBagListItemComplete', objBagListItemComplete);
    // 查找对应碎片
    const nIndex1 = g_objBagInfo[this.arrType[this.m_nSelectIndex]].findIndex((item) => { 
      return objBagListItemComplete._id === item._id;
    });
    // 找到则进行操作
    if (nIndex1 >= 0) {
      g_objBagInfo[this.arrType[this.m_nSelectIndex]][nIndex1].total -= GameApi.getPartsInfoFragments(objBagListItemComplete.id);
      if (g_objBagInfo[this.arrType[this.m_nSelectIndex]][nIndex1].total === 0) {
        // 删除对应碎片
        g_objBagInfo[this.arrType[this.m_nSelectIndex]].splice(nIndex1, 1);
      }
      // 增加对应装备
      const strID0 = String(parseInt(objBagListItemComplete.id) - 1);
      const newPartsInfo = {
        _id: Common.getUUID(),
        id: strID0,
        name: GameApi.getPartsInfoComplete(strID0).name,
        time: new Date().getTime(),
        level: 1,
        total: 1,
      };
      g_objBagInfo[this.arrType[this.m_nSelectIndex]].push(newPartsInfo);

      // 先反馈，刷新背包列表
      this.refreshBagListInfo_local();
      // 后更新数据库
      const param = {
        partsInfo: g_objBagInfo[this.arrType[this.m_nSelectIndex]],
        partsType: this.arrType[parseInt(this.m_nSelectIndex)]
      };
      WebApi.updatePartsInfo(param).then((res) => {
        
      }).catch((err) => {
        console.log('BagDialog composeBagPartsInfo Fail.', err);
      });
    } else {
      console.log('BagDialog composeBagPartsInfo 未找到指定物品');
    }
  },

  // 分解指定物品 0为整装 1为碎片
  decomposeBagPartsInfo: function(objBagListItemComplete) {
    console.log('g_objBagInfo', g_objBagInfo[this.arrType[this.m_nSelectIndex]], 'objBagListItemComplete', objBagListItemComplete);
    // 查找对应物品
    const nIndex0 = g_objBagInfo[this.arrType[this.m_nSelectIndex]].findIndex((item) => { 
      return objBagListItemComplete._id === item._id;
    });
    // 找到则进行操作
    if (nIndex0 >= 0) {
      // 删除对应物品
      g_objBagInfo[this.arrType[this.m_nSelectIndex]].splice(nIndex0, 1);
      // 增加对应碎片
      const strID1 = String(parseInt(objBagListItemComplete.id) + 1);
      const nIndex1 = g_objBagInfo[this.arrType[this.m_nSelectIndex]].findIndex((item) => { 
        return strID1 === item.id;
      });
      if (nIndex1 === -1) {
        // 没找到，新建碎片
        const newPartsInfo = {
          _id: Common.getUUID(),
          id: strID1,
          name: GameApi.getPartsInfoComplete(strID1).name,
          time: new Date().getTime(),
          level: 1,
          total: GameApi.getPartsInfoFragments(objBagListItemComplete.id)
        };
        g_objBagInfo[this.arrType[this.m_nSelectIndex]].push(newPartsInfo);
      } else {
        // 找到，增加碎片数量
        g_objBagInfo[this.arrType[this.m_nSelectIndex]][nIndex1].total += GameApi.getPartsInfoFragments(objBagListItemComplete.id);
      }

      // 先反馈，刷新背包列表
      this.refreshBagListInfo_local();
      // 后更新数据库
      const param = {
        partsInfo: g_objBagInfo[this.arrType[this.m_nSelectIndex]],
        partsType: this.arrType[this.m_nSelectIndex]
      };
      WebApi.updatePartsInfo(param).then((res) => {
        
      }).catch((err) => {
        console.log('BagDialog decomposeBagPartsInfo Fail.', err);
      });
    } else {
      console.log('BagDialog decomposeBagPartsInfo 未找到指定物品');
    }
  }
});
