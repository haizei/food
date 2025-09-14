// record.ts
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

interface MealSection {
  type: string
  name: string
  foods: DietRecord[]
  totalCalories: number
}

interface DailyTarget {
  calories: number
  protein: number
  fat: number
  carbs: number
}

interface TodayNutrition {
  calories: number
  protein: number
  fat: number
  carbs: number
}

Page({
  data: {
    // 日期相关
    selectedDate: '',
    dateDisplay: '',
    weekday: '',
    
    // 营养目标和统计
    dailyTarget: {
      calories: 2000,
      protein: 150,
      fat: 67,
      carbs: 250
    } as DailyTarget,
    
    todayNutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    } as TodayNutrition,
    
    caloriesProgress: 0,
    
    // 餐次数据
    mealSections: [] as MealSection[],
    mealTypes: ['早餐', '午餐', '晚餐', '加餐'],
    
    // 弹窗状态
    showAddFood: false,
    showEditFood: false,
    currentMealType: '',
    
    // 编辑相关
    editingFood: null as (DietRecord & { mealIndex: number }) | null,
    
    // 所有记录
    allRecords: [] as DietRecord[]
  },

  onLoad() {
    console.log('Record page loaded')
    this.initPage()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadRecords()
  },

  /**
   * 初始化页面
   */
  initPage() {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    
    this.setData({
      selectedDate: dateStr
    })
    
    this.updateDateDisplay(dateStr)
    this.loadUserTarget()
    this.loadRecords()
  },

  /**
   * 更新日期显示
   */
  updateDateDisplay(dateStr: string) {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    let dateDisplay = ''
    if (dateStr === today.toISOString().split('T')[0]) {
      dateDisplay = '今天'
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      dateDisplay = '昨天'
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      dateDisplay = '明天'
    } else {
      dateDisplay = `${date.getMonth() + 1}月${date.getDate()}日`
    }
    
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[date.getDay()]
    
    this.setData({
      dateDisplay,
      weekday
    })
  },

  /**
   * 加载用户目标
   */
  loadUserTarget() {
    try {
      const userTarget = wx.getStorageSync('userTarget')
      if (userTarget) {
        this.setData({ dailyTarget: userTarget })
      }
    } catch (error) {
      console.error('Failed to load user target:', error)
    }
  },

  /**
   * 加载饮食记录
   */
  loadRecords() {
    try {
      const records = wx.getStorageSync('dietRecords') || []
      const selectedDate = this.data.selectedDate
      
      // 过滤当前日期的记录
      const todayRecords = records.filter((record: DietRecord) => record.date === selectedDate)
      
      this.setData({ allRecords: todayRecords })
      this.calculateNutrition(todayRecords)
      this.organizeMealSections(todayRecords)
    } catch (error) {
      console.error('Failed to load records:', error)
    }
  },

  /**
   * 计算营养统计
   */
  calculateNutrition(records: DietRecord[]) {
    const nutrition = records.reduce((total, record) => ({
      calories: total.calories + record.calories,
      protein: Math.round((total.protein + record.protein) * 10) / 10,
      fat: Math.round((total.fat + record.fat) * 10) / 10,
      carbs: Math.round((total.carbs + record.carbs) * 10) / 10
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 })
    
    const caloriesProgress = Math.min(314, (nutrition.calories / this.data.dailyTarget.calories) * 314)
    
    this.setData({
      todayNutrition: nutrition,
      caloriesProgress
    })
  },

  /**
   * 组织餐次数据
   */
  organizeMealSections(records: DietRecord[]) {
    const mealTypes = ['早餐', '午餐', '晚餐', '加餐']
    const sections: MealSection[] = []
    
    mealTypes.forEach(mealType => {
      const mealRecords = records.filter(record => record.mealType === mealType)
      const totalCalories = mealRecords.reduce((sum, record) => sum + record.calories, 0)
      
      sections.push({
        type: mealType,
        name: mealType,
        foods: mealRecords.sort((a, b) => b.time.localeCompare(a.time)),
        totalCalories
      })
    })
    
    this.setData({ mealSections: sections })
  },

  /**
   * 上一天
   */
  previousDay() {
    const currentDate = new Date(this.data.selectedDate)
    currentDate.setDate(currentDate.getDate() - 1)
    const newDateStr = currentDate.toISOString().split('T')[0]
    
    this.setData({ selectedDate: newDateStr })
    this.updateDateDisplay(newDateStr)
    this.loadRecords()
  },

  /**
   * 下一天
   */
  nextDay() {
    const currentDate = new Date(this.data.selectedDate)
    currentDate.setDate(currentDate.getDate() + 1)
    const newDateStr = currentDate.toISOString().split('T')[0]
    
    this.setData({ selectedDate: newDateStr })
    this.updateDateDisplay(newDateStr)
    this.loadRecords()
  },

  /**
   * 日期选择变化
   */
  onDateChange(e: any) {
    const selectedDate = e.detail.value
    this.setData({ selectedDate })
    this.updateDateDisplay(selectedDate)
    this.loadRecords()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadRecords()
    wx.stopPullDownRefresh()
  },

  /**
   * 添加食物
   */
  addFood(e: any) {
    const mealType = e.currentTarget.dataset.meal
    this.setData({
      currentMealType: mealType,
      showAddFood: true
    })
  },

  /**
   * 隐藏添加食物弹窗
   */
  hideAddFood() {
    this.setData({ showAddFood: false })
  },

  /**
   * 前往拍照页面
   */
  gotoCamera() {
    this.hideAddFood()
    wx.switchTab({
      url: '/pages/camera/camera'
    })
  },

  /**
   * 前往搜索页面
   */
  gotoSearch() {
    this.hideAddFood()
    wx.navigateTo({
      url: '/pages/search/search?mealType=' + this.data.currentMealType
    })
  },

  /**
   * 显示常用食物
   */
  showCommonFoods() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  /**
   * 显示自定义食物
   */
  showCustomFood() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  /**
   * 编辑食物
   */
  editFood(e: any) {
    const foodId = e.currentTarget.dataset.foodId
    const food = this.data.allRecords.find(record => record.id === foodId)
    
    if (food) {
      const mealIndex = this.data.mealTypes.findIndex(meal => meal === food.mealType)
      
      this.setData({
        editingFood: { ...food, mealIndex },
        showEditFood: true
      })
    }
  },

  /**
   * 隐藏编辑食物弹窗
   */
  hideEditFood() {
    this.setData({ 
      showEditFood: false,
      editingFood: null
    })
  },

  /**
   * 编辑食物名称
   */
  onEditName(e: any) {
    const editingFood = this.data.editingFood
    if (editingFood) {
      editingFood.name = e.detail.value
      this.setData({ editingFood })
    }
  },

  /**
   * 编辑食物重量
   */
  onEditWeight(e: any) {
    const editingFood = this.data.editingFood
    if (editingFood) {
      const weight = parseInt(e.detail.value) || 0
      const originalWeight = 100 // 假设原始重量为100g
      const ratio = weight / originalWeight
      
      editingFood.weight = weight
      editingFood.calories = Math.round(editingFood.calories * ratio)
      editingFood.protein = Math.round(editingFood.protein * ratio * 10) / 10
      editingFood.fat = Math.round(editingFood.fat * ratio * 10) / 10
      editingFood.carbs = Math.round(editingFood.carbs * ratio * 10) / 10
      
      this.setData({ editingFood })
    }
  },

  /**
   * 编辑餐次
   */
  onEditMeal(e: any) {
    const editingFood = this.data.editingFood
    if (editingFood) {
      const mealIndex = parseInt(e.detail.value)
      editingFood.mealIndex = mealIndex
      editingFood.mealType = this.data.mealTypes[mealIndex]
      this.setData({ editingFood })
    }
  },

  /**
   * 保存编辑的食物
   */
  saveEditFood() {
    const editingFood = this.data.editingFood
    if (!editingFood) return
    
    try {
      const allRecords = wx.getStorageSync('dietRecords') || []
      const recordIndex = allRecords.findIndex((record: DietRecord) => record.id === editingFood.id)
      
      if (recordIndex !== -1) {
        // 移除mealIndex属性，只保存DietRecord需要的字段
        const { mealIndex, ...recordData } = editingFood
        allRecords[recordIndex] = recordData
        
        wx.setStorageSync('dietRecords', allRecords)
        
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
        
        this.hideEditFood()
        this.loadRecords()
      }
    } catch (error) {
      console.error('Failed to save edited food:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  /**
   * 删除食物
   */
  deleteFood(e: any) {
    const foodId = e.currentTarget.dataset.foodId
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条饮食记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteFood(foodId)
        }
      }
    })
  },

  /**
   * 执行删除食物
   */
  performDeleteFood(foodId: number) {
    try {
      const allRecords = wx.getStorageSync('dietRecords') || []
      const filteredRecords = allRecords.filter((record: DietRecord) => record.id !== foodId)
      
      wx.setStorageSync('dietRecords', filteredRecords)
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      
      this.loadRecords()
    } catch (error) {
      console.error('Failed to delete food:', error)
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击事件向上冒泡
  }
})