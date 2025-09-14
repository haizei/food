// camera.ts
interface RecognitionResult {
  name: string
  confidence: number
  estimatedWeight: number
  weight: number
  calories: number
  protein: number
  fat: number
  carbs: number
  selectedMeal: number
}

Page({
  data: {
    // 相机设置
    cameraPosition: 'back' as 'front' | 'back',
    flashMode: 'auto' as 'auto' | 'on' | 'off' | 'torch',
    frameSize: 'medium' as 'small' | 'medium' | 'large',
    
    // 识别状态
    isRecognizing: false,
    isCapturing: false,
    showResult: false,
    
    // 识别结果
    recognitionResults: [] as RecognitionResult[],
    
    // 餐次选项
    mealTypes: ['早餐', '午餐', '晚餐', '加餐'],
    
    // 当前选中的图片
    currentImagePath: ''
  },

  onLoad() {
    console.log('Camera page loaded')
    this.initCamera()
  },

  onShow() {
    // 页面显示时重置状态
    this.setData({
      showResult: false,
      isRecognizing: false
    })
  },

  /**
   * 初始化相机
   */
  initCamera() {
    // 检查相机权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log('Camera permission granted')
            },
            fail: () => {
              wx.showModal({
                title: '权限申请',
                content: '需要使用相机权限来识别食物，请在设置中开启',
                showCancel: false,
                success: () => {
                  wx.openSetting()
                }
              })
            }
          })
        }
      }
    })
  },

  /**
   * 相机准备就绪
   */
  onCameraReady() {
    console.log('Camera is ready')
  },

  /**
   * 相机错误处理
   */
  error(e: any) {
    console.error('Camera error:', e)
    wx.showToast({
      title: '相机启动失败',
      icon: 'error'
    })
  },

  /**
   * 拍照
   */
  takePhoto() {
    if (this.data.isRecognizing) {
      return
    }

    this.setData({ isCapturing: true })
    
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log('Photo taken:', res.tempImagePath)
        this.setData({ 
          currentImagePath: res.tempImagePath,
          isCapturing: false 
        })
        this.recognizeFood(res.tempImagePath)
      },
      fail: (err) => {
        console.error('Take photo failed:', err)
        this.setData({ isCapturing: false })
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        })
      }
    })
  },

  /**
   * 从相册选择图片
   */
  chooseImage() {
    if (this.data.isRecognizing) {
      return
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempImagePath = res.tempFiles[0].tempFilePath
        console.log('Image chosen from album:', tempImagePath)
        this.setData({ currentImagePath: tempImagePath })
        this.recognizeFood(tempImagePath)
      },
      fail: (err) => {
        console.error('Choose image failed:', err)
        wx.showToast({
          title: '选择图片失败',
          icon: 'error'
        })
      }
    })
  },

  /**
   * 切换闪光灯
   */
  toggleFlash() {
    const flashModes: ('auto' | 'on' | 'off' | 'torch')[] = ['auto', 'on', 'off']
    const currentIndex = flashModes.indexOf(this.data.flashMode)
    const nextIndex = (currentIndex + 1) % flashModes.length
    
    this.setData({
      flashMode: flashModes[nextIndex]
    })
    
    const modeTexts = { auto: '自动', on: '开启', off: '关闭' }
    wx.showToast({
      title: `闪光灯${modeTexts[flashModes[nextIndex]]}`,
      icon: 'none'
    })
  },

  /**
   * 识别食物
   */
  recognizeFood(imagePath: string) {
    this.setData({ isRecognizing: true })
    
    // 模拟AI识别过程
    setTimeout(() => {
      // 这里应该调用真实的AI识别接口
      // 现在使用模拟数据
      const mockResults = this.generateMockResults()
      
      this.setData({
        isRecognizing: false,
        recognitionResults: mockResults,
        showResult: true
      })
    }, 2000)
  },

  /**
   * 生成模拟识别结果
   */
  generateMockResults(): RecognitionResult[] {
    const mockFoods = [
      { name: '米饭', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9 },
      { name: '鸡蛋', calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8 },
      { name: '西兰花', calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6 },
      { name: '牛肉', calories: 250, protein: 26, fat: 15, carbs: 0 },
      { name: '苹果', calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8 }
    ]
    
    // 随机选择1-3种食物
    const selectedFoods = mockFoods.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1)
    
    return selectedFoods.map(food => ({
      name: food.name,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      estimatedWeight: Math.floor(Math.random() * 200) + 50, // 50-250g
      weight: Math.floor(Math.random() * 200) + 50,
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
      selectedMeal: 0
    }))
  },

  /**
   * 重量输入变化
   */
  onWeightChange(e: any) {
    const { index } = e.currentTarget.dataset
    const weight = parseInt(e.detail.value) || 0
    const results = this.data.recognitionResults
    
    if (results[index]) {
      const baseCalories = results[index].calories
      const baseWeight = results[index].estimatedWeight
      
      // 根据重量调整营养数据
      const ratio = weight / baseWeight
      results[index].weight = weight
      results[index].calories = Math.round(baseCalories * ratio)
      results[index].protein = Math.round(results[index].protein * ratio * 10) / 10
      results[index].fat = Math.round(results[index].fat * ratio * 10) / 10
      results[index].carbs = Math.round(results[index].carbs * ratio * 10) / 10
      
      this.setData({ recognitionResults: results })
    }
  },

  /**
   * 餐次选择变化
   */
  onMealChange(e: any) {
    const { index } = e.currentTarget.dataset
    const mealIndex = parseInt(e.detail.value)
    const results = this.data.recognitionResults
    
    if (results[index]) {
      results[index].selectedMeal = mealIndex
      this.setData({ recognitionResults: results })
    }
  },

  /**
   * 添加到饮食记录
   */
  addToRecord(e: any) {
    const { index } = e.currentTarget.dataset
    const result = this.data.recognitionResults[index]
    
    if (!result) return
    
    // 构建记录数据
    const recordData = {
      id: Date.now() + Math.random(),
      name: result.name,
      weight: result.weight,
      calories: result.calories,
      protein: result.protein,
      fat: result.fat,
      carbs: result.carbs,
      mealType: this.data.mealTypes[result.selectedMeal],
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      imagePath: this.data.currentImagePath
    }
    
    // 保存到本地存储
    const records = wx.getStorageSync('dietRecords') || []
    records.unshift(recordData)
    wx.setStorageSync('dietRecords', records)
    
    wx.showToast({
      title: '已添加到记录',
      icon: 'success'
    })
    
    // 移除已添加的结果
    const results = this.data.recognitionResults
    results.splice(index, 1)
    
    this.setData({ recognitionResults: results })
    
    // 如果没有更多结果，关闭弹窗
    if (results.length === 0) {
      this.hideResult()
    }
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
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击事件向上冒泡
  },

  /**
   * 页面卸载
   */
  onUnload() {
    // 清理资源
    this.setData({
      isRecognizing: false,
      showResult: false
    })
  }
})