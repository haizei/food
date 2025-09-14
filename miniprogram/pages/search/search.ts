// search.ts
interface FoodItem {
  id: number
  name: string
  description: string
  calories: number
  protein: number
  fat: number
  carbs: number
  image: string
  category: string
}

interface FoodCategory {
  key: string
  name: string
  icon: string
}

Page({
  data: {
    // 搜索相关
    searchKeyword: '',
    isSearching: false,
    searchResults: [] as FoodItem[],
    
    // 分类筛选
    selectedCategory: 'all',
    foodCategories: [
      { key: 'all', name: '全部', icon: '🍽️' },
      { key: 'staple', name: '主食', icon: '🍚' },
      { key: 'meat', name: '肉类', icon: '🥩' },
      { key: 'vegetable', name: '蔬菜', icon: '🥬' },
      { key: 'fruit', name: '水果', icon: '🍎' },
      { key: 'dairy', name: '乳制品', icon: '🥛' },
      { key: 'snack', name: '零食', icon: '🍿' }
    ] as FoodCategory[],
    
    // 搜索历史和热门
    searchHistory: [] as string[],
    hotKeywords: ['米饭', '鸡蛋', '苹果', '香蕉', '鸡胸肉', '牛奶', '面包', '酸奶'],
    
    // 常用食物
    commonFoods: [] as FoodItem[],
    
    // 食物详情弹窗
    showFoodDetail: false,
    selectedFood: null as FoodItem | null,
    foodWeight: 100,
    mealTypes: ['早餐', '午餐', '晚餐', '加餐'],
    selectedMealIndex: 0,
    calculatedNutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    
    // 页面参数
    mealType: ''
  },

  onLoad(options: any) {
    console.log('Search page loaded')
    const mealType = options.mealType || ''
    this.setData({ mealType })
    
    if (mealType) {
      const mealIndex = this.data.mealTypes.findIndex(meal => meal === mealType)
      if (mealIndex !== -1) {
        this.setData({ selectedMealIndex: mealIndex })
      }
    }
    
    this.initPage()
  },

  onShow() {
    this.loadSearchHistory()
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.loadCommonFoods()
    this.loadSearchHistory()
  },

  /**
   * 加载常用食物
   */
  loadCommonFoods() {
    // 模拟常用食物数据
    const commonFoods: FoodItem[] = [
      { id: 1, name: '米饭', description: '白米饭，主食', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, image: '../../static/rice.png', category: 'staple' },
      { id: 2, name: '鸡蛋', description: '鸡蛋，营养丰富', calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8, image: '../../static/egg.png', category: 'meat' },
      { id: 3, name: '苹果', description: '新鲜苹果', calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8, image: '../../static/apple.png', category: 'fruit' },
      { id: 4, name: '香蕉', description: '新鲜香蕉', calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8, image: '../../static/banana.png', category: 'fruit' },
      { id: 5, name: '鸡胸肉', description: '去皮鸡胸肉', calories: 165, protein: 31.0, fat: 3.6, carbs: 0, image: '../../static/chicken.png', category: 'meat' },
      { id: 6, name: '牛奶', description: '全脂牛奶', calories: 54, protein: 3.0, fat: 3.2, carbs: 3.4, image: '../../static/milk.png', category: 'dairy' },
      { id: 7, name: '面包', description: '白面包', calories: 265, protein: 9.0, fat: 3.2, carbs: 49.0, image: '../../static/bread.png', category: 'staple' },
      { id: 8, name: '酸奶', description: '原味酸奶', calories: 62, protein: 3.5, fat: 3.3, carbs: 4.7, image: '../../static/yogurt.png', category: 'dairy' },
      { id: 9, name: '西兰花', description: '新鲜西兰花', calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, image: '../../static/broccoli.png', category: 'vegetable' }
    ]
    
    this.setData({ commonFoods })
  },

  /**
   * 加载搜索历史
   */
  loadSearchHistory() {
    try {
      const history = wx.getStorageSync('searchHistory') || []
      this.setData({ searchHistory: history.slice(0, 10) })
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  },

  /**
   * 搜索输入
   */
  onSearchInput(e: any) {
    const keyword = e.detail.value.trim()
    this.setData({ searchKeyword: keyword })
    
    // 实时搜索
    if (keyword) {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.performSearch()
      }, 500)
    } else {
      this.setData({ searchResults: [] })
    }
  },

  searchTimer: 0,

  /**
   * 搜索确认
   */
  onSearchConfirm() {
    this.performSearch()
  },

  /**
   * 执行搜索
   */
  performSearch() {
    const keyword = this.data.searchKeyword.trim()
    if (!keyword) return
    
    this.setData({ isSearching: true })
    
    // 添加到搜索历史
    this.addToSearchHistory(keyword)
    
    // 模拟搜索过程
    setTimeout(() => {
      const results = this.searchFood(keyword)
      this.setData({
        searchResults: results,
        isSearching: false
      })
    }, 800)
  },

  /**
   * 搜索食物
   */
  searchFood(keyword: string): FoodItem[] {
    // 扩展食物数据库用于搜索
    const foodDatabase: FoodItem[] = [
      ...this.data.commonFoods,
      { id: 10, name: '白粥', description: '大米熬制的粥', calories: 30, protein: 0.6, fat: 0.1, carbs: 6.2, image: '../../static/porridge.png', category: 'staple' },
      { id: 11, name: '牛肉', description: '新鲜牛肉', calories: 250, protein: 26.0, fat: 15.0, carbs: 0, image: '../../static/beef.png', category: 'meat' },
      { id: 12, name: '猪肉', description: '新鲜猪肉', calories: 242, protein: 17.0, fat: 18.0, carbs: 0, image: '../../static/pork.png', category: 'meat' },
      { id: 13, name: '青菜', description: '新鲜青菜', calories: 15, protein: 1.5, fat: 0.3, carbs: 2.2, image: '../../static/vegetable.png', category: 'vegetable' },
      { id: 14, name: '土豆', description: '新鲜土豆', calories: 77, protein: 2.0, fat: 0.1, carbs: 17.5, image: '../../static/potato.png', category: 'vegetable' },
      { id: 15, name: '橙子', description: '新鲜橙子', calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8, image: '../../static/orange.png', category: 'fruit' }
    ]
    
    // 简单的模糊搜索
    const results = foodDatabase.filter(food => 
      food.name.includes(keyword) || 
      food.description.includes(keyword) ||
      keyword.includes(food.name)
    )
    
    // 按相关性排序（名称完全匹配优先）
    return results.sort((a, b) => {
      if (a.name === keyword && b.name !== keyword) return -1
      if (b.name === keyword && a.name !== keyword) return 1
      if (a.name.includes(keyword) && !b.name.includes(keyword)) return -1
      if (b.name.includes(keyword) && !a.name.includes(keyword)) return 1
      return 0
    }).slice(0, 20)
  },

  /**
   * 添加到搜索历史
   */
  addToSearchHistory(keyword: string) {
    try {
      let history = wx.getStorageSync('searchHistory') || []
      
      // 移除已存在的相同关键词
      history = history.filter((item: string) => item !== keyword)
      
      // 添加到开头
      history.unshift(keyword)
      
      // 保留最多20个
      history = history.slice(0, 20)
      
      wx.setStorageSync('searchHistory', history)
      this.setData({ searchHistory: history.slice(0, 10) })
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  },

  /**
   * 清除搜索
   */
  clearSearch() {
    this.setData({ 
      searchKeyword: '',
      searchResults: []
    })
  },

  /**
   * 选择分类
   */
  selectCategory(e: any) {
    const category = e.currentTarget.dataset.category
    this.setData({ selectedCategory: category })
    
    if (category === 'all') {
      this.loadCommonFoods()
    } else {
      const filtered = this.data.commonFoods.filter(food => food.category === category)
      this.setData({ commonFoods: filtered })
    }
  },

  /**
   * 清除历史记录
   */
  clearHistory() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('searchHistory')
            this.setData({ searchHistory: [] })
            wx.showToast({
              title: '已清除',
              icon: 'success'
            })
          } catch (error) {
            console.error('Failed to clear history:', error)
          }
        }
      }
    })
  },

  /**
   * 选择历史关键词
   */
  selectHistoryKeyword(e: any) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchKeyword: keyword })
    this.performSearch()
  },

  /**
   * 选择热门关键词
   */
  selectHotKeyword(e: any) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchKeyword: keyword })
    this.performSearch()
  },

  /**
   * 选择食物
   */
  selectFood(e: any) {
    const food = e.currentTarget.dataset.food
    this.setData({
      selectedFood: food,
      showFoodDetail: true,
      foodWeight: 100
    })
    this.calculateNutrition()
  },

  /**
   * 隐藏食物详情
   */
  hideFoodDetail() {
    this.setData({ 
      showFoodDetail: false,
      selectedFood: null
    })
  },

  /**
   * 重量输入
   */
  onWeightInput(e: any) {
    const weight = parseInt(e.detail.value) || 0
    this.setData({ foodWeight: weight })
    this.calculateNutrition()
  },

  /**
   * 餐次选择
   */
  onMealChange(e: any) {
    const index = parseInt(e.detail.value)
    this.setData({ selectedMealIndex: index })
  },

  /**
   * 计算营养成分
   */
  calculateNutrition() {
    const food = this.data.selectedFood
    const weight = this.data.foodWeight
    
    if (!food || !weight) return
    
    const ratio = weight / 100 // 营养成分通常按100g计算
    
    const calculatedNutrition = {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10
    }
    
    this.setData({ calculatedNutrition })
  },

  /**
   * 添加食物记录
   */
  addFoodRecord() {
    const food = this.data.selectedFood
    const nutrition = this.data.calculatedNutrition
    const weight = this.data.foodWeight
    const mealType = this.data.mealTypes[this.data.selectedMealIndex]
    
    if (!food || !weight) {
      wx.showToast({
        title: '请输入重量',
        icon: 'error'
      })
      return
    }
    
    // 构建记录数据
    const recordData = {
      id: Date.now() + Math.random(),
      name: food.name,
      weight: weight,
      calories: nutrition.calories,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbs: nutrition.carbs,
      mealType: mealType,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      imagePath: food.image
    }
    
    try {
      const records = wx.getStorageSync('dietRecords') || []
      records.unshift(recordData)
      wx.setStorageSync('dietRecords', records)
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
      
      this.hideFoodDetail()
      
      // 如果是从饮食记录页面跳转过来的，返回上一页
      if (this.data.mealType) {
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to add food record:', error)
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      })
    }
  },

  /**
   * 前往拍照页面
   */
  gotoCamera() {
    wx.switchTab({
      url: '/pages/camera/camera'
    })
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击事件向上冒泡
  }
})