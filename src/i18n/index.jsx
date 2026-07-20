import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// 中文字典
const ZH = {
  brand: {
    mono: 'USELESS//TOOL',
    name: '无用',
    accent: '工具',
    tagline: '专门收录',
    hl: '没有用',
    taglineEnd: '的功能。',
    serious: '认真的，没用。',
  },
  sidebar: {
    categories: 'CATEGORIES',
    soon: 'SOON',
    version: 'v0.0.1 · still useless',
    footer: '© 你正在浪费时间',
  },
  cats: {
    'time-machine': { name: '时光机', desc: '把等待包装成穿越' },
    'discipline': { name: '自律神器', desc: '学习 100 倍速，骗自己很努力' },
    phantom: { name: '薛定谔的猫', desc: '不看就活着' },
    echo: { name: '回音壁', desc: '对空气说话' },
    void: { name: '黑洞回收站', desc: '删了就是没了' },
    dice: { name: '人生骰子', desc: '交给概率' },
  },
  lang: { switch: 'EN', label: 'English' },
  home: {
    welcome: 'WELCOME · 请慎重使用本工具',
    hero1: '无用',
    hero2: '工具箱',
    body1: '这里没有任何能提高效率的东西。',
    body2: '但我们有一颗',
    body3: '穿越时空',
    body4: '的按钮，',
    body5: '按下去，',
    body6: '你就真的会穿越',
    body7: '。',
    cta: '启动时光机',
    ctaMono: 'ENTER TIME MACHINE →',
    sideEffect: '* 副作用：会被偷走一段时间，且找不回来。',
    stats: { tools: '已上线工具', waste: '浪费时间潜力', productivity: '生产力提升' },
  },
  aid: {
    mono: 'AI//DETECT',
    title1: 'AI 智能',
    title2: '检测',
    intro: '召唤当前地球最强模型矩阵，对你的手机进行',
    introHl: '深度多模态神经推理',
    introEnd: '。耗时 5 秒，结论绝对权威。',
    start: '启动神经推理',
    startMono: 'RUN NEURAL SCAN →',
    note: '* 副作用：看起来极其硬核，其实什么都没检测。',
    scanningMono: 'NEURAL//INFERENCE',
    remain: '推理进度',
    analyzing: '推理中',
    resultMono: 'DIAGNOSIS//COMPLETE',
    result1: '手机',
    result2: '有电',
    resultDesc: '可以正常使用。',
    confidence: '置信度',
    battery: '电量状态',
    status: '运行状态',
    powered: '有电',
    normal: '正常',
    again: '再检测一次',
    close: '关闭',
  },
  // AI 检测中滚动的唬人术语
  aidSteps: [
    '初始化 Transformer-7 神经主干……',
    '加载 GPT-5 Turbo Pro Max Ultra（参数量 1.8T）',
    '调用 Claude 4 Opus 第 7 代推理核心',
    '激活 Gemini Ultra 3.0 量子推理引擎',
    '部署 LLaMA-5 405B 多模态架构',
    '唤醒 文心一言 5.0 Turbo 神经元',
    '对齐 通义千问 Max Pro 注意力头',
    '构建神经辐射场 NeRF-XL 三维表征',
    '启动 SAM-3 万物分割引擎',
    '融合 Diffusion-XL 生成式先验',
    '联邦图神经网络收敛中（loss=0.0001）',
    '多模态注意力对齐，自监督校准',
    '梯度回传完成，推理结果聚合',
    '量子化 Transformer 架构稳定运行',
    'BERT-9 双向编码器加载完毕',
    '对比学习表征空间对齐 99.97%',
  ],
  // 检测成功后的自嘲文案
  aidVerdicts: [
    '经过 16 个大模型联合推理，结论十分确凿。',
    '消耗算力约等于训练三个 GPT，只为告诉你这件事。',
    '本结果已通过 AGI 安全审查，请放心使用。',
    '神经网络的最终判断：它在，且亮着。',
  ],
  tm: {
    mono: 'TIME//MACHINE',
    back: '← 返回',
    title1: '设定',
    title2: '穿越时长',
    intro: '选择你想被偷走的时间。设定后我们将启动时空隧道，',
    introHl: '真的让你等这么久',
    introEnd: '，然后宣布你穿越成功。',
    target: '目标等待',
    rangeStart: '5 秒',
    rangeEnd: '24 小时',
    launch: '确认穿越',
    launchMono: 'LAUNCH →',
    note: '* 一旦启动无法退款。穿越期间请保持呼吸。',
    // 预设按钮
    preset: { s5: '5 秒', s30: '30 秒', m1: '1 分钟', m10: '10 分钟', h1: '1 小时', h24: '24 小时' },
    // 单位
    unit: { h: '小时', m: '分', s: '秒' },
    travelingMono: 'SPACETIME//TRAVELING',
    remain: '剩余等待 · 距抵达',
    abort: '中止穿越（懦夫选项）',
    arrivalMono: 'ARRIVAL//CONFIRMED',
    success: '穿越',
    successAccent: '成功',
    departure: 'DEPARTURE',
    arrival: 'ARRIVAL',
    again: '再穿越一次',
    home: '回到首页',
  },
  // 穿越中滚动的荒诞日志
  travelLogs: [
    '正在校准时空曲率……',
    '与第 4 维度握手成功',
    '注意：前方有蝴蝶效应',
    '正在绕开祖父悖论检查站',
    '检测到平行宇宙，已自动忽略',
    '与路过的光子打招呼',
    '提醒：穿越期间请勿改变历史',
    '时空隧道轻微拥堵，耐心等候',
    '正在给熵增充值',
    '检测到你刚才眨了一下眼，已记录',
    '快了。也可能没快。',
    '时间是个圈，圈，圈……',
  ],
  // 成功后的自嘲文案
  successLines: [
    '你确实穿越了。证据：你比刚才老了。',
    '恭喜，你已抵达「未来」。和五秒前没区别。',
    '时空管理局认证：穿越成功（虽然没人会查）',
    '你刚刚证明了相对论：等待会让你变老。',
    '别看了，你已经到未来了。没什么变化吧？',
  ],
  // === 自律神器 ===
  disc: {
    mono: 'DISCIPLINE//CORE',
    back: '← 返回',
    currentSession: '当前会话',
    speed: '速率',
    startStudy: '开始学习',
    startRest: '开始休息',
    pause: '暂停',
    resume: '继续',
    stop: '结束会话',
    resetAll: '清零累计',
    resetConfirm: '确定要清空所有累计时长吗？这份虚荣心将一并清零。',
    hintIdle: '选择一个模式开始你的「自律」之旅。建议从学习开始——时间会飞速流逝，成就感瞬间拉满。',
    hintStudy: '正在「学习」中……时间正以离谱的速度飞奔而去。你看起来比谁都努力，虽然现实里你只是在盯着屏幕发呆。',
    hintRest: '正在休息，时间按真实速度缓缓流动。这一栏很诚实，也正因为诚实，所以格外残忍。',
    cumulativeMono: 'CUMULATIVE · 累计时长',
    statStudyVirtual: '虚拟学习时长',
    statStudyVirtualTip: '100 倍膨胀后的「成就」',
    statStudyReal: '真实学习时长',
    statStudyRealTip: '不掺水的现实',
    statRest: '累计休息时长',
    statRestTip: '诚实记录',
    statDiscipline: '自律指数',
    statDisciplineTip: '虚拟学习 ÷ (虚拟学习+休息)',
    disclaimer: '* 自律指数由本工具精心美化，仅供自我感动，不具备任何现实参考价值。',
    phase: {
      idle: 'STANDBY · 待机中',
      study: 'GRINDING · 学习中',
      rest: 'CHILLING · 休息中',
      paused: 'PAUSED · 已暂停',
    },
  },
}

// 英文字典
const EN = {
  brand: {
    mono: 'USELESS//TOOL',
    name: 'Useless',
    accent: 'Tool',
    tagline: 'A collection of things that are',
    hl: 'completely useless',
    taglineEnd: '.',
    serious: 'Seriously, useless.',
  },
  sidebar: {
    categories: 'CATEGORIES',
    soon: 'SOON',
    version: 'v0.0.1 · still useless',
    footer: '© You are wasting time',
  },
  cats: {
    'time-machine': { name: 'Time Machine', desc: 'Waiting, repackaged as travel' },
    'discipline': { name: 'Discipline', desc: 'Study at 100x speed, fake productivity' },
    phantom: { name: "Schrödinger's Cat", desc: "Alive until you check" },
    echo: { name: 'Echo Wall', desc: 'Talk to the air' },
    void: { name: 'Black Hole', desc: 'Deleted means gone' },
    dice: { name: 'Life Dice', desc: 'Leave it to chance' },
  },
  lang: { switch: '中', label: '中文' },
  home: {
    welcome: 'WELCOME · Use at your own risk',
    hero1: 'Useless',
    hero2: 'Toolbox',
    body1: 'Nothing here will make you productive.',
    body2: 'But we do have a',
    body3: 'time-travel',
    body4: 'button.',
    body5: 'Press it, and',
    body6: 'you actually travel',
    body7: '.',
    cta: 'Start Time Machine',
    ctaMono: 'ENTER TIME MACHINE →',
    sideEffect: '* Side effect: a chunk of time goes missing, forever.',
    stats: { tools: 'Tools shipped', waste: 'Waste potential', productivity: 'Productivity gain' },
  },
  aid: {
    mono: 'AI//DETECT',
    title1: 'AI Smart',
    title2: 'Scan',
    intro: 'Summon the strongest model matrix on Earth to run a',
    introHl: 'deep multimodal neural inference',
    introEnd: ' on your phone. 5 seconds, fully authoritative.',
    start: 'Run Neural Inference',
    startMono: 'RUN NEURAL SCAN →',
    note: '* Side effect: looks hardcore, detects absolutely nothing.',
    scanningMono: 'NEURAL//INFERENCE',
    remain: 'inference progress',
    analyzing: 'inferring',
    resultMono: 'DIAGNOSIS//COMPLETE',
    result1: 'Your phone',
    result2: 'has power',
    resultDesc: 'It works normally.',
    confidence: 'confidence',
    battery: 'battery state',
    status: 'runtime status',
    powered: 'powered',
    normal: 'normal',
    again: 'Scan Again',
    close: 'Close',
  },
  aidSteps: [
    'Initializing Transformer-7 neural backbone…',
    'Loading GPT-5 Turbo Pro Max Ultra (1.8T params)',
    'Calling Claude 4 Opus Gen-7 inference core',
    'Activating Gemini Ultra 3.0 quantum engine',
    'Deploying LLaMA-5 405B multimodal stack',
    'Waking ERNIE 5.0 Turbo neurons',
    'Aligning Qwen Max Pro attention heads',
    'Building NeRF-XL 3D representation',
    'Starting SAM-3 anything-segmentation engine',
    'Fusing Diffusion-XL generative priors',
    'Federated GNN converging (loss=0.0001)',
    'Multimodal attention alignment, self-supervised',
    'Backprop complete, aggregating inference',
    'Quantized Transformer architecture stable',
    'BERT-9 bidirectional encoder loaded',
    'Contrastive representation aligned 99.97%',
  ],
  aidVerdicts: [
    'Joint inference by 16 foundation models. Verdict: solid.',
    'Burned roughly three GPTs of compute to tell you this.',
    'Passed AGI safety review. You may proceed.',
    'The network has spoken: it is on, and it glows.',
  ],
  tm: {
    mono: 'TIME//MACHINE',
    back: '← Back',
    title1: 'Set',
    title2: 'Travel Duration',
    intro: 'Pick how much time you want stolen. We then open a spacetime tunnel,',
    introHl: 'actually make you wait that long',
    introEnd: ', then declare the trip a success.',
    target: 'target wait',
    rangeStart: '5s',
    rangeEnd: '24h',
    launch: 'Confirm Travel',
    launchMono: 'LAUNCH →',
    note: '* Non-refundable. Keep breathing during travel.',
    preset: { s5: '5s', s30: '30s', m1: '1m', m10: '10m', h1: '1h', h24: '24h' },
    unit: { h: 'h', m: 'm', s: 's' },
    travelingMono: 'SPACETIME//TRAVELING',
    remain: 'remaining · until arrival',
    abort: 'Abort (coward mode)',
    arrivalMono: 'ARRIVAL//CONFIRMED',
    success: 'Arrival',
    successAccent: 'Confirmed',
    departure: 'DEPARTURE',
    arrival: 'ARRIVAL',
    again: 'Travel Again',
    home: 'Back Home',
  },
  travelLogs: [
    'Calibrating spacetime curvature…',
    'Handshake with the 4th dimension OK',
    'Warning: butterfly effect ahead',
    'Detouring the grandfather-paradox checkpoint',
    'Parallel universe detected, ignored',
    'Waving at a passing photon',
    'Reminder: do not change history mid-trip',
    'Light congestion in the tunnel, hold on',
    'Topping up entropy credits',
    'Logged: you just blinked.',
    'Almost there. Or not.',
    'Time is a loop, loop, loop…',
  ],
  successLines: [
    'You did travel. Proof: you are now older.',
    'Congrats, you have arrived at "the future". Same as before.',
    'Certified by the Spacetime Authority (nobody checks).',
    'Relativity confirmed: waiting ages you.',
    "Stop looking. You're in the future. Notice anything different?",
  ],
  // === Discipline Timer ===
  disc: {
    mono: 'DISCIPLINE//CORE',
    back: '← Back',
    currentSession: 'current session',
    speed: 'speed',
    startStudy: 'Start Study',
    startRest: 'Start Rest',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'End Session',
    resetAll: 'Reset All',
    resetConfirm: 'Reset all accumulated time? Your vanity stats will be wiped too.',
    hintIdle: 'Pick a mode to start your "discipline" journey. We recommend Study first — time will rush by and the dopamine hits instantly.',
    hintStudy: 'Studying… time is sprinting away at an absurd pace. You look incredibly productive, even though in reality you are just staring at the screen.',
    hintRest: 'Resting. Time flows at a slow, honest pace. This column is brutally honest.',
    cumulativeMono: 'CUMULATIVE · total time',
    statStudyVirtual: 'Virtual Study',
    statStudyVirtualTip: '100x inflated "achievement"',
    statStudyReal: 'Real Study',
    statStudyRealTip: 'unfiltered reality',
    statRest: 'Total Rest',
    statRestTip: 'honest record',
    statDiscipline: 'Discipline Index',
    statDisciplineTip: 'virtual ÷ (virtual + rest)',
    disclaimer: '* The discipline index is artistically inflated. For self-emotional-use only, not valid as reality.',
    phase: {
      idle: 'STANDBY · idle',
      study: 'GRINDING · studying',
      rest: 'CHILLING · resting',
      paused: 'PAUSED · on hold',
    },
  },
}

const DICT = { zh: ZH, en: EN }

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'zh'
    return localStorage.getItem('ut-lang') || 'zh'
  })

  useEffect(() => {
    localStorage.setItem('ut-lang', lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const t = useCallback(
    (path) => {
      const segs = path.split('.')
      let cur = DICT[lang]
      for (const s of segs) {
        if (cur == null) return path
        cur = cur[s]
      }
      return cur ?? path
    },
    [lang]
  )

  const toggle = useCallback(() => {
    setLang((l) => (l === 'zh' ? 'en' : 'zh'))
  }, [])

  return (
    <I18nContext.Provider value={{ lang, t, toggle }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
