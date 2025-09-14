// analytics.ts
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

interface ChartDataItem {
  date: string
  label: string
  calories: number
  actualPercent: number
}

interface NutritionItem {
  current: number
  target: number
  percent: number
  status: 'normal' | 'low' | 'high'
  statusText: string
}

interface NutritionAnalysis {
  protein: NutritionItem
  fat: NutritionItem
  carbs: NutritionItem
}

interface Overview {
  avgCalories: number
  totalDays: number
  targetReachedDays: number
  completionRate: number
}

interface HabitsAnalysis {
  mealRegularity: number
  mealRegularityDesc: string
  recordFrequency: number
  recordFrequencyDesc: string
  foodDiversity: number
  foodDiversityDesc: string
}

interface HealthSuggestion {
  type: 'warning' | 'success' | 'info'
  icon: string
  title: string
  description: string
}

Page({
  data: {
    // 时间范围
    timeRange: 'day' as 'day' | 'week' | 'month',
    currentPeriod: new Date(),
    currentPeriodText: '',
    
    // 图表数据
    chartData: [] as ChartDataItem[],
    yAxisLabels: ['0', '500', '1000', '1500', '2000'],
    targetLinePosition: 50, // 目标线位置百分比
    
    // 概览数据
    overview: {
      avgCalories: 0,
      totalDays: 0,
      targetReachedDays: 0,
      completionRate: 0
    } as Overview,
    
    // 营养分析
    nutritionAnalysis: {
      protein: { current: 0, target: 150, percent: 0, status: 'normal', statusText: '正常' },
      fat: { current: 0, target: 67, percent: 0, status: 'normal', statusText: '正常' },
      carbs: { current: 0, target: 250, percent: 0, status: 'normal', statusText: '正常' }
    } as NutritionAnalysis,
    
    // 习惯分析
    habitsAnalysis: {
      mealRegularity: 0,
      mealRegularityDesc: '',
      recordFrequency: 0,
      recordFrequencyDesc: '',
      foodDiversity: 0,
      foodDiversityDesc: ''
    } as HabitsAnalysis,
    
    // 健康建议
    healthSuggestions: [] as HealthSuggestion[],
    
    // 用户目标
    dailyTarget: {
      calories: 2000,
      protein: 150,
      fat: 67,
      carbs: 250
    },
    
    // 所有记录
    allRecords: [] as DietRecord[]
  },

  onLoad() {
    console.log('Analytics page loaded')
    this.initPage()
  },

  onShow() {
    this.loadData()
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.loadUserTarget()
    this.updatePeriodText()
    this.loadData()
  },

  /**
   * 加载用户目标
   */
  loadUserTarget() {
    try {
      const userTarget = wx.getStorageSync('userTarget')
      if (userTarget) {
        this.setData({
          dailyTarget: userTarget,
          'nutritionAnalysis.protein.target': userTarget.protein,
          'nutritionAnalysis.fat.target': userTarget.fat,
          'nutritionAnalysis.carbs.target': userTarget.carbs
        })
      }
    } catch (error) {
      console.error('Failed to load user target:', error)
    }
  },

  /**
   * 更新周期文本
   */
  updatePeriodText() {
    const period = this.data.currentPeriod
    let text = ''
    
    switch (this.data.timeRange) {
      case 'day':
        const today = new Date()
        if (this.isSameDay(period, today)) {
          text = '今天'
        } else {
          text = `${period.getMonth() + 1}月${period.getDate()}日`
        }
        break
      case 'week':
        const weekStart = this.getWeekStart(period)
        const weekEnd = this.getWeekEnd(period)
        text = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`
        break
      case 'month':
        text = `${period.getFullYear()}年${period.getMonth() + 1}月`
        break
    }
    
    this.setData({ currentPeriodText: text })
  },

  /**
   * 切换时间范围
   */
  switchTimeRange(e: any) {
    const range = e.currentTarget.dataset.range as 'day' | 'week' | 'month'
    this.setData({ 
      timeRange: range,
      currentPeriod: new Date()
    })
    this.updatePeriodText()
    this.loadData()
  },

  /**
   * 上一个周期
   */
  previousPeriod() {
    const current = new Date(this.data.currentPeriod)
    
    switch (this.data.timeRange) {
      case 'day':
        current.setDate(current.getDate() - 1)
        break
      case 'week':
        current.setDate(current.getDate() - 7)
        break
      case 'month':
        current.setMonth(current.getMonth() - 1)
        break
    }
    
    this.setData({ currentPeriod: current })
    this.updatePeriodText()
    this.loadData()
  },

  /**
   * 下一个周期
   */
  nextPeriod() {
    const current = new Date(this.data.currentPeriod)
    
    switch (this.data.timeRange) {
      case 'day':
        current.setDate(current.getDate() + 1)
        break
      case 'week':
        current.setDate(current.getDate() + 7)
        break
      case 'month':
        current.setMonth(current.getMonth() + 1)
        break
    }
    
    this.setData({ currentPeriod: current })
    this.updatePeriodText()
    this.loadData()
  },

  /**
   * 加载数据
   */
  loadData() {
    try {
      const records = wx.getStorageSync('dietRecords') || []
      const filteredRecords = this.filterRecordsByPeriod(records)
      
      this.setData({ allRecords: filteredRecords })
      this.calculateOverview(filteredRecords)
      this.generateChartData(filteredRecords)
      this.calculateNutritionAnalysis(filteredRecords)
      this.calculateHabitsAnalysis(filteredRecords)
      this.generateHealthSuggestions(filteredRecords)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    }
  },

  /**
   * 根据周期过滤记录
   */
  filterRecordsByPeriod(records: DietRecord[]): DietRecord[] {
    const period = this.data.currentPeriod
    
    return records.filter(record => {
      const recordDate = new Date(record.date)
      
      switch (this.data.timeRange) {
        case 'day':
          return this.isSameDay(recordDate, period)
        case 'week':
          const weekStart = this.getWeekStart(period)
          const weekEnd = this.getWeekEnd(period)
          return recordDate >= weekStart && recordDate <= weekEnd
        case 'month':
          return recordDate.getFullYear() === period.getFullYear() && 
                 recordDate.getMonth() === period.getMonth()
        default:
          return false
      }
    })
  },

  /**
   * 计算概览数据
   */
  calculateOverview(records: DietRecord[]) {
    if (records.length === 0) {
      this.setData({
        overview: { avgCalories: 0, totalDays: 0, targetReachedDays: 0, completionRate: 0 }
      })
      return
    }
    
    // 按日期分组
    const dailyData = new Map<string, number>()
    records.forEach(record => {
      const current = dailyData.get(record.date) || 0
      dailyData.set(record.date, current + record.calories)
    })
    
    const totalDays = dailyData.size
    const totalCalories = Array.from(dailyData.values()).reduce((sum, cal) => sum + cal, 0)
    const avgCalories = Math.round(totalCalories / totalDays)
    
    const targetReachedDays = Array.from(dailyData.values())
      .filter(calories => calories >= this.data.dailyTarget.calories * 0.8).length
    
    const completionRate = Math.round((targetReachedDays / totalDays) * 100)
    
    this.setData({
      overview: { avgCalories, totalDays, targetReachedDays, completionRate }
    })
  },

  /**
   * 生成图表数据
   */
  generateChartData(records: DietRecord[]) {
    const chartData: ChartDataItem[] = []
    const maxCalories = this.data.dailyTarget.calories * 1.5
    
    if (this.data.timeRange === 'day') {
      // 单日显示每餐数据
      const meals = ['早餐', '午餐', '晚餐', '加餐']
      meals.forEach(meal => {
        const mealRecords = records.filter(record => record.mealType === meal)
        const totalCalories = mealRecords.reduce((sum, record) => sum + record.calories, 0)
        
        chartData.push({
          date: meal,
          label: meal,
          calories: totalCalories,
          actualPercent: Math.min(100, (totalCalories / maxCalories) * 100)
        })
      })
    } else {
      // 周/月显示每日数据
      const dailyData = new Map<string, number>()
      
      records.forEach(record => {
        const current = dailyData.get(record.date) || 0
        dailyData.set(record.date, current + record.calories)
      })
      
      // 生成日期范围
      const dates = this.generateDateRange()
      
      dates.forEach(dateStr => {
        const calories = dailyData.get(dateStr) || 0
        const date = new Date(dateStr)
        
        chartData.push({
          date: dateStr,
          label: this.data.timeRange === 'week' ? 
            `${date.getMonth() + 1}/${date.getDate()}` : 
            `${date.getDate()}`,
          calories,
          actualPercent: Math.min(100, (calories / maxCalories) * 100)
        })
      })
    }
    
    // 计算目标线位置
    const targetLinePosition = (this.data.dailyTarget.calories / maxCalories) * 100
    
    this.setData({ 
      chartData,
      targetLinePosition,
      yAxisLabels: this.generateYAxisLabels(maxCalories)
    })
  },

  /**
   * 计算营养分析
   */
  calculateNutritionAnalysis(records: DietRecord[]) {
    if (records.length === 0) {
      const emptyAnalysis = {
        protein: { ...this.data.nutritionAnalysis.protein, current: 0, percent: 0, status: 'low', statusText: '不足' },
        fat: { ...this.data.nutritionAnalysis.fat, current: 0, percent: 0, status: 'low', statusText: '不足' },
        carbs: { ...this.data.nutritionAnalysis.carbs, current: 0, percent: 0, status: 'low', statusText: '不足' }
      }
      this.setData({ nutritionAnalysis: emptyAnalysis })
      return
    }
    
    // 计算平均每日营养素
    const dailyData = new Map<string, { protein: number, fat: number, carbs: number }>()
    
    records.forEach(record => {
      const current = dailyData.get(record.date) || { protein: 0, fat: 0, carbs: 0 }
      dailyData.set(record.date, {
        protein: current.protein + record.protein,
        fat: current.fat + record.fat,
        carbs: current.carbs + record.carbs
      })
    })
    
    const totalDays = dailyData.size
    const totalNutrition = Array.from(dailyData.values()).reduce((total, day) => ({
      protein: total.protein + day.protein,
      fat: total.fat + day.fat,
      carbs: total.carbs + day.carbs
    }), { protein: 0, fat: 0, carbs: 0 })
    
    const avgNutrition = {
      protein: Math.round((totalNutrition.protein / totalDays) * 10) / 10,
      fat: Math.round((totalNutrition.fat / totalDays) * 10) / 10,
      carbs: Math.round((totalNutrition.carbs / totalDays) * 10) / 10
    }
    
    const nutritionAnalysis: NutritionAnalysis = {
      protein: this.analyzeNutrient(avgNutrition.protein, this.data.dailyTarget.protein),
      fat: this.analyzeNutrient(avgNutrition.fat, this.data.dailyTarget.fat),
      carbs: this.analyzeNutrient(avgNutrition.carbs, this.data.dailyTarget.carbs)
    }
    
    this.setData({ nutritionAnalysis })
  },

  /**
   * 分析单个营养素
   */
  analyzeNutrient(current: number, target: number): NutritionItem {
    const percent = Math.min(100, Math.round((current / target) * 100))
    let status: 'normal' | 'low' | 'high' = 'normal'
    let statusText = '正常'
    
    if (current < target * 0.8) {
      status = 'low'
      statusText = '不足'
    } else if (current > target * 1.2) {
      status = 'high'  
      statusText = '过量'
    }
    
    return { current, target, percent, status, statusText }
  },

  /**
   * 计算饮食习惯分析
   */
  calculateHabitsAnalysis(records: DietRecord[]) {
    if (records.length === 0) {
      const emptyHabits = {
        mealRegularity: 0,
        mealRegularityDesc: '暂无数据',
        recordFrequency: 0,
        recordFrequencyDesc: '暂无数据',
        foodDiversity: 0,
        foodDiversityDesc: '暂无数据'
      }
      this.setData({ habitsAnalysis: emptyHabits })
      return
    }
    
    // 计算用餐规律性
    const dailyMeals = new Map<string, Set<string>>()
    records.forEach(record => {
      if (!dailyMeals.has(record.date)) {
        dailyMeals.set(record.date, new Set())
      }
      dailyMeals.get(record.date)!.add(record.mealType)
    })
    
    const regularMealDays = Array.from(dailyMeals.values())
      .filter(meals => meals.has('早餐') && meals.has('午餐') && meals.has('晚餐')).length
    const mealRegularity = Math.round((regularMealDays / dailyMeals.size) * 100)
    
    // 计算记录频率
    const totalPossibleDays = this.getTotalPossibleDays()
    const recordFrequency = Math.round((dailyMeals.size / totalPossibleDays) * 100)
    
    // 计算食物多样性
    const uniqueFoods = new Set(records.map(record => record.name))
    const foodDiversity = uniqueFoods.size
    
    const habitsAnalysis: HabitsAnalysis = {
      mealRegularity,
      mealRegularityDesc: mealRegularity >= 80 ? '规律性很好' : mealRegularity >= 60 ? '规律性一般' : '需要改善',
      recordFrequency,
      recordFrequencyDesc: recordFrequency >= 80 ? '记录很完整' : recordFrequency >= 60 ? '记录较完整' : '需要坚持记录',
      foodDiversity,
      foodDiversityDesc: foodDiversity >= 20 ? '食物多样性很好' : foodDiversity >= 10 ? '食物多样性一般' : '建议增加食物种类'
    }
    
    this.setData({ habitsAnalysis })
  },

  /**
   * 生成健康建议
   */
  generateHealthSuggestions(records: DietRecord[]) {
    const suggestions: HealthSuggestion[] = []
    const nutrition = this.data.nutritionAnalysis
    const habits = this.data.habitsAnalysis
    
    // 营养建议
    if (nutrition.protein.status === 'low') {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: '蛋白质摄入不足',
        description: '建议增加瘦肉、鸡蛋、豆类等高蛋白食物的摄入'
      })
    }
    
    if (nutrition.fat.status === 'high') {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: '脂肪摄入过量',
        description: '建议减少油炸食品和高脂肪食物，选择健康脂肪来源'
      })
    }
    
    // 习惯建议
    if (habits.mealRegularity < 60) {
      suggestions.push({
        type: 'info',
        icon: 'ℹ️',
        title: '用餐不规律',
        description: '建议按时吃三餐，保持规律的用餐时间'
      })
    }
    
    if (habits.recordFrequency < 60) {
      suggestions.push({
        type: 'info', 
        icon: 'ℹ️',
        title: '记录不够完整',
        description: '坚持每日记录饮食有助于更好地管理健康'
      })
    }
    
    // 积极反馈
    if (suggestions.length === 0 || this.data.overview.completionRate >= 80) {
      suggestions.push({
        type: 'success',
        icon: '✅',
        title: '饮食管理很棒',
        description: '继续保持良好的饮食习惯和记录习惯'
      })
    }
    
    this.setData({ healthSuggestions: suggestions })
  },

  /**
   * 前往目标设置
   */
  gotoGoalSetting() {
    wx.navigateTo({
      url: '/pages/profile/profile?tab=goal'
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  },

  // 工具方法
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString()
  },

  getWeekStart(date: Date): Date {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    start.setHours(0, 0, 0, 0)
    return start
  },

  getWeekEnd(date: Date): Date {
    const end = this.getWeekStart(date)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  },

  generateDateRange(): string[] {
    const dates: string[] = []
    const period = this.data.currentPeriod
    
    if (this.data.timeRange === 'week') {
      const start = this.getWeekStart(period)
      for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
    } else if (this.data.timeRange === 'month') {
      const year = period.getFullYear()
      const month = period.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i)
        dates.push(date.toISOString().split('T')[0])
      }
    }
    
    return dates
  },

  generateYAxisLabels(maxValue: number): string[] {
    const labels: string[] = []
    const step = maxValue / 4
    
    for (let i = 0; i <= 4; i++) {
      labels.push(Math.round(i * step).toString())
    }
    
    return labels
  },

  getTotalPossibleDays(): number {
    const today = new Date()
    
    switch (this.data.timeRange) {
      case 'day':
        return 1
      case 'week':
        return 7
      case 'month':
        return new Date(this.data.currentPeriod.getFullYear(), this.data.currentPeriod.getMonth() + 1, 0).getDate()
      default:
        return 1
    }
  }
})