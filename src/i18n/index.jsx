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
