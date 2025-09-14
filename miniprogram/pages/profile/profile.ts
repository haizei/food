// profile.ts
interface UserInfo {
  nickName: string
  avatarUrl: string
}

interface UserStats {
  recordDays: number
  avgCalories: number
  goalReached: number
}

interface DailyGoal {
  calories: number
  protein: number
  fat: number
  carbs: number
}

interface TodayIntake {
  calories: number
  protein: number
  fat: number
  carbs: number
}

interface EditGoal {
  height: number
  weight: number
  age: number
  genderIndex: number
  activityLevel: string
  healthGoal: string
}

interface CalculatedGoals {
  calories: number
  protein: number
  fat: number
  carbs: number
}

Page({
  data: {
    // 用户信息
    userInfo: {
      nickName: '',
      avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    } as UserInfo,
    userDesc: '健康生活，从记录开始',
    
    // 用户统计
    userStats: {
      recordDays: 0,
      avgCalories: 0,
      goalReached: 0
    } as UserStats,
    
    // 目标和摄入
    dailyGoal: {
      calories: 2000,
      protein: 150,
      fat: 67,
      carbs: 250
    } as DailyGoal,
    
    todayIntake: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    } as TodayIntake,
    
    // 目标设置弹窗
    showGoalModal: false,
    editGoal: {
      height: 170,
      weight: 65,
      age: 25,
      genderIndex: 0,
      activityLevel: 'moderate',
      healthGoal: 'maintain'
    } as EditGoal,
    
    calculatedGoals: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    } as CalculatedGoals,
    
    // 选项数据
    genderOptions: ['男', '女'],
    activityLevels: [
      { value: 'sedentary', name: '久坐', desc: '办公室工作，很少运动' },
      { value: 'light', name: '轻度活动', desc: '每周1-3次轻度运动' },
      { value: 'moderate', name: '中度活动', desc: '每周3-5次中等强度运动' },
      { value: 'active', name: '高度活动', desc: '每周6-7次高强度运动' },
      { value: 'extra', name: '极度活动', desc: '每日高强度运动或体力劳动' }
    ],
    healthGoals: [
      { value: 'lose', name: '减重', desc: '减少体重和脂肪', icon: '⬇️' },
      { value: 'maintain', name: '保持', desc: '维持当前体重', icon: '➡️' },
      { value: 'gain', name: '增重', desc: '增加体重和肌肉', icon: '⬆️' },
      { value: 'muscle', name: '增肌', desc: '增加肌肉量', icon: '💪' }
    ]
  },

  onLoad(options: any) {
    console.log('Profile page loaded')
    const tab = options.tab
    if (tab === 'goal') {
      // 如果是从其他页面跳转来设置目标，直接显示目标设置弹窗
      setTimeout(() => {
        this.editGoal()
      }, 500)
    }
    this.initPage()
  },

  onShow() {
    this.loadUserData()
    this.calculateTodayIntake()
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.loadUserInfo()
    this.loadUserGoal()
    this.loadUserData()
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({ userInfo })
      }
    } catch (error) {
      console.error('Failed to load user info:', error)
    }
  },

  /**
   * 加载用户目标
   */
  loadUserGoal() {
    try {
      const userTarget = wx.getStorageSync('userTarget')
      if (userTarget) {
        this.setData({ dailyGoal: userTarget })
      }
      
      const userProfile = wx.getStorageSync('userProfile')
      if (userProfile) {
        this.setData({ editGoal: userProfile })
      }
    } catch (error) {
      console.error('Failed to load user goal:', error)
    }
  },

  /**
   * 加载用户数据统计
   */
  loadUserData() {
    try {
      const records = wx.getStorageSync('dietRecords') || []
      
      if (records.length === 0) {
        this.setData({
          userStats: { recordDays: 0, avgCalories: 0, goalReached: 0 }
        })
        return
      }
      
      // 计算记录天数
      const uniqueDates = new Set(records.map((record: any) => record.date))
      const recordDays = uniqueDates.size
      
      // 计算平均热量
      const dailyCalories = new Map<string, number>()
      records.forEach((record: any) => {
        const current = dailyCalories.get(record.date) || 0
        dailyCalories.set(record.date, current + record.calories)
      })
      
      const totalCalories = Array.from(dailyCalories.values()).reduce((sum, cal) => sum + cal, 0)
      const avgCalories = Math.round(totalCalories / recordDays)
      
      // 计算目标达成率
      const targetCalories = this.data.dailyGoal.calories
      const reachedDays = Array.from(dailyCalories.values())
        .filter(calories => calories >= targetCalories * 0.8).length
      const goalReached = Math.round((reachedDays / recordDays) * 100)
      
      this.setData({
        userStats: { recordDays, avgCalories, goalReached }
      })
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  },

  /**
   * 计算今日摄入
   */
  calculateTodayIntake() {
    try {
      const records = wx.getStorageSync('dietRecords') || []
      const today = new Date().toISOString().split('T')[0]
      
      const todayRecords = records.filter((record: any) => record.date === today)
      
      const todayIntake = todayRecords.reduce((total: any, record: any) => ({
        calories: total.calories + record.calories,
        protein: Math.round((total.protein + record.protein) * 10) / 10,
        fat: Math.round((total.fat + record.fat) * 10) / 10,
        carbs: Math.round((total.carbs + record.carbs) * 10) / 10
      }), { calories: 0, protein: 0, fat: 0, carbs: 0 })
      
      this.setData({ todayIntake })
    } catch (error) {
      console.error('Failed to calculate today intake:', error)
    }
  },

  /**
   * 编辑目标
   */
  editGoal() {
    this.setData({ showGoalModal: true })
    this.calculateGoals()
  },

  /**
   * 隐藏目标弹窗
   */
  hideGoalModal() {
    this.setData({ showGoalModal: false })
  },

  /**
   * 计算推荐目标
   */
  calculateGoals() {
    const { height, weight, age, genderIndex, activityLevel, healthGoal } = this.data.editGoal
    
    if (!height || !weight || !age) {
      return
    }
    
    // 基础代谢率计算 (Mifflin-St Jeor Equation)
    let bmr = 0
    if (genderIndex === 0) { // 男性
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    } else { // 女性
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    }
    
    // 活动系数
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra: 1.9
    }
    
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55)
    
    // 根据目标调整热量
    let targetCalories = tdee
    switch (healthGoal) {
      case 'lose':
        targetCalories = tdee * 0.8 // 减少20%
        break
      case 'gain':
      case 'muscle':
        targetCalories = tdee * 1.15 // 增加15%
        break
    }
    
    // 计算营养素分配
    const protein = Math.round(weight * 2.0) // 每公斤体重2g蛋白质
    const fat = Math.round((targetCalories * 0.25) / 9) // 25%来自脂肪
    const carbs = Math.round((targetCalories - protein * 4 - fat * 9) / 4) // 剩余来自碳水
    
    const calculatedGoals = {
      calories: Math.round(targetCalories),
      protein,
      fat,
      carbs
    }
    
    this.setData({ calculatedGoals })
  },

  /**
   * 表单输入事件
   */
  onHeightChange(e: any) {
    this.setData({ 'editGoal.height': parseInt(e.detail.value) || 0 })
    this.calculateGoals()
  },

  onWeightChange(e: any) {
    this.setData({ 'editGoal.weight': parseInt(e.detail.value) || 0 })
    this.calculateGoals()
  },

  onAgeChange(e: any) {
    this.setData({ 'editGoal.age': parseInt(e.detail.value) || 0 })
    this.calculateGoals()
  },

  onGenderChange(e: any) {
    this.setData({ 'editGoal.genderIndex': parseInt(e.detail.value) })
    this.calculateGoals()
  },

  selectActivityLevel(e: any) {
    const level = e.currentTarget.dataset.level
    this.setData({ 'editGoal.activityLevel': level })
    this.calculateGoals()
  },

  selectHealthGoal(e: any) {
    const goal = e.currentTarget.dataset.goal
    this.setData({ 'editGoal.healthGoal': goal })
    this.calculateGoals()
  },

  /**
   * 保存目标
   */
  saveGoal() {
    const { calculatedGoals, editGoal } = this.data
    
    if (calculatedGoals.calories === 0) {
      wx.showToast({
        title: '请完善信息',
        icon: 'error'
      })
      return
    }
    
    try {
      // 保存用户资料
      wx.setStorageSync('userProfile', editGoal)
      
      // 保存营养目标
      wx.setStorageSync('userTarget', calculatedGoals)
      
      // 更新页面数据
      this.setData({ 
        dailyGoal: calculatedGoals,
        showGoalModal: false 
      })
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 重新加载数据
      this.loadUserData()
    } catch (error) {
      console.error('Failed to save goal:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  /**
   * 菜单点击事件
   */
  gotoGoalSetting() {
    this.editGoal()
  },

  gotoBodyInfo() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  gotoHealthReport() {
    wx.switchTab({ url: '/pages/analytics/analytics' })
  },

  gotoReminderSetting() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  gotoDataManage() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  gotoPrivacySetting() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  gotoHelp() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  gotoFeedback() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  gotoAbout() {
    wx.showModal({
      title: '关于应用',
      content: '智能识别食物热量小程序 v1.0\n基于AI技术的健康管理工具',
      showCancel: false
    })
  },

  /**
   * 快速操作
   */
  exportData() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  shareApp() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  rateApp() {
    wx.showToast({ title: '感谢支持', icon: 'success' })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadUserData()
    this.calculateTodayIntake()
    wx.stopPullDownRefresh()
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击事件向上冒泡
  }
})