// === 赛博玄学馆 · 8 件法器的元数据 ===
// 内核：用最硬核的科幻 UI 做最没用的玄学功能，仪式感拉满，价值为 0
// 三大门派：bless=aura（祈福许愿）/ divine=frost（检测占卜）/ heal=acid（能量疗愈）

import WishDelivery from './tools/WishDelivery.jsx'
import IncenseAltar from './tools/IncenseAltar.jsx'
import PersonaScanner from './tools/PersonaScanner.jsx'
import FateRadar from './tools/FateRadar.jsx'
import FortuneGauge from './tools/FortuneGauge.jsx'
import NegExtractor from './tools/NegExtractor.jsx'
import MentalCharger from './tools/MentalCharger.jsx'
import Firewall from './tools/Firewall.jsx'

// 门派配色：决定法器身份色
export const MYSTIC_CAT = {
  bless: { color: 'aura', hex: '#ffc857', code: 'BLESS' },
  divine: { color: 'frost', hex: '#7afcff', code: 'DIVINE' },
  heal: { color: 'acid', hex: '#d4ff3a', code: 'HEAL' },
}

// 8 件法器：id 唯一 / icon 单字符 / cat 决定配色 / codename 军事化代号 / Comp 触发后渲染
export const MYSTIC_TOOLS = [
  // === 祈福许愿系 ===
  { id: 'wish', icon: '📡', cat: 'bless', codename: 'COSMIC_MAIL', Comp: WishDelivery },
  { id: 'incense', icon: '🕯️', cat: 'bless', codename: 'E_INCENSE', Comp: IncenseAltar },
  // === 检测占卜系 ===
  { id: 'persona', icon: '🧠', cat: 'divine', codename: 'NEURAL_SCAN', Comp: PersonaScanner },
  { id: 'radar', icon: '🛰️', cat: 'divine', codename: 'FATE_RADAR', Comp: FateRadar },
  { id: 'fortune', icon: '🚦', cat: 'divine', codename: 'LUCK_GAUGE', Comp: FortuneGauge },
  // === 能量疗愈系 ===
  { id: 'extract', icon: '🧪', cat: 'heal', codename: 'NEG_DRAIN', Comp: NegExtractor },
  { id: 'charge', icon: '🔋', cat: 'heal', codename: 'SOUL_CHARGE', Comp: MentalCharger },
  { id: 'firewall', icon: '🛡️', cat: 'heal', codename: 'RETRO_SHIELD', Comp: Firewall },
]

// 门派 -> 中文标签的 i18n key 映射（供 hub 分组标题用）
export const MYSTIC_CAT_ORDER = ['bless', 'divine', 'heal']
