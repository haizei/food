// index.ts
interface DietRecord {
  id: number
  name: string
  weight: number
  calories: number
  protein: number
  fat: number
  carbs: number
  mealType: string
  date: string
  time: string
  imagePath?: string
}

interface TodaySummary {
  calories: number
  records: number
}

interface DailyGoal {
  calories: number
  protein: number
  fat: number
  carbs: number
}

interface RecognitionResult {
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
}

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    // 用户信息
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    greeting: '早上好',
    
    // 今日统计
    todaySummary: {
      calories: 0,
      records: 0
    } as TodaySummary,
    
    todayNutrition: {
      protein: 0,
      fat: 0,
      carbs: 0
    },
    
    // 每日目标
    dailyGoal: {
      calories: 2000,
      protein: 150,
      fat: 67,
      carbs: 250
    } as DailyGoal,
    
    // 今日记录
    todayRecords: [] as DietRecord[],
    
    // 识别结果
    showResult: false,
    isRecognizing: false,
    recognitionResults: [] as RecognitionResult[]
  },

  onLoad() {
    console.log('Index page loaded')
    this.initPage()
  },

  onShow() {
    this.loadUserInfo()
    this.loadTodayData()
    this.updateGreeting()
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.loadUserInfo()
    this.loadUserGoal()
    this.loadTodayData()
    this.updateGreeting()
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
    } catch (error) {
      console.error('Failed to load user goal:', error)
    }
  },

  /**
   * 加载今日数据
   */
  loadTodayData() {
    try {
      const records = wx.getStorageSync('dietRecords') || []
      const today = new Date().toISOString().split('T')[0]
      
      // 过滤今日记录
      const todayRecords = records
        .filter((record: DietRecord) => record.date === today)
        .sort((a: DietRecord, b: DietRecord) => b.time.localeCompare(a.time))
        .slice(0, 3) // 显示最新3条
      
      // 计算今日统计
      const allTodayRecords = records.filter((record: DietRecord) => record.date === today)
      const todaySummary = allTodayRecords.reduce((total, record) => ({
        calories: total.calories + record.calories,
        records: total.records + 1
      }), { calories: 0, records: 0 })
      
      const todayNutrition = allTodayRecords.reduce((total, record) => ({
        protein: Math.round((total.protein + record.protein) * 10) / 10,
        fat: Math.round((total.fat + record.fat) * 10) / 10,
        carbs: Math.round((total.carbs + record.carbs) * 10) / 10
      }), { protein: 0, fat: 0, carbs: 0 })
      
      this.setData({
        todayRecords,
        todaySummary,
        todayNutrition
      })
    } catch (error) {
      console.error('Failed to load today data:', error)
    }
  },

  /**
   * 更新问候语
   */
  updateGreeting() {
    const hour = new Date().getHours()
    let greeting = '早上好'
    
    if (hour < 6) {
      greeting = '夜深了'
    } else if (hour < 12) {
      greeting = '早上好'
    } else if (hour < 14) {
      greeting = '中午好'
    } else if (hour < 18) {
      greeting = '下午好'
    } else if (hour < 22) {
      greeting = '晚上好'
    } else {
      greeting = '夜深了'
    }
    
    this.setData({ greeting })
  },

  /**
   * 前往拍照识别
   */
  gotoCamera() {
    wx.switchTab({
      url: '/pages/camera/camera'
    })
  },

  /**
   * 从相册选择
   */
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const imagePath = res.tempFiles[0].tempFilePath
        this.recognizeFood(imagePath)
      },
      fail: (error) => {
        console.error('Choose from album failed:', error)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })
  },

  /**
   * 识别食物
   */
  recognizeFood(imagePath: string) {
    this.setData({ isRecognizing: true })
    
    // 模拟识别过程
    setTimeout(() => {
      const results = this.generateMockResults()
      this.setData({
        isRecognizing: false,
        recognitionResults: results,
        showResult: true
      })
    }, 2000)
  },

  /**
   * 生成模拟识别结果
   */
  generateMockResults(): RecognitionResult[] {
    const foods = [
      { name: '米饭', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9 },
      { name: '鸡蛋', calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8 },
      { name: '苹果', calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8 }
    ]
    
    return foods.slice(0, Math.floor(Math.random() * 2) + 1)
  },

  /**
   * 添加食物记录
   */
  addFoodRecord(e: any) {
    const food = e.currentTarget.dataset.food
    
    // 构建记录数据
    const recordData = {
      id: Date.now() + Math.random(),
      name: food.name,
      weight: 100,
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
      mealType: this.getMealTypeByTime(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0]
    }
    
    try {
      const records = wx.getStorageSync('dietRecords') || []
      records.unshift(recordData)
      wx.setStorageSync('dietRecords', records)
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
      
      this.hideResult()
      this.loadTodayData()
    } catch (error) {
      console.error('Failed to add record:', error)
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      })
    }
  },

  /**
   * 根据时间判断餐次
   */
  getMealTypeByTime(): string {
    const hour = new Date().getHours()
    
    if (hour >= 6 && hour < 10) return '早餐'
    if (hour >= 10 && hour < 14) return '午餐'
    if (hour >= 14 && hour < 18) return '下午茶'
    if (hour >= 18 && hour < 22) return '晚餐'
    return '夜宵'
  },

  /**
   * 隐藏识别结果
   */
  hideResult() {
    this.setData({ 
      showResult: false,
      recognitionResults: []
    })
  },

  /**
   * 跳转到其他页面
   */
  gotoRecord() {
    wx.switchTab({
      url: '/pages/record/record'
    })
  },

  gotoSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  gotoAnalytics() {
    wx.switchTab({
      url: '/pages/analytics/analytics'
    })
  },

  gotoProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  /**
   * 显示健康贴士
   */
  showTips() {
    const tips = [
      '每天喝8杯水有助于新陈代谢',
      '少食多餐有助于控制食欲',
      '深色蔬菜含有更多营养素',
      '适量运动配合健康饮食效果更佳'
    ]
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)]
    
    wx.showModal({
      title: '💡 健康贴士',
      content: randomTip,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击事件向上冒泡
  }
})
