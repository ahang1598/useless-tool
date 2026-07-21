// === 赛博瑞士军刀 · 20 把刀刃的元数据 ===
// 每片刀刃是一个"即开即用即收"的整蛊玩具触发器
// 按门派分色：hardware=acid（硬件假装）/ visual=plasma（视觉整蛊）/ torture=frost（交互折磨）

import Flashlight from './tools/Flashlight.jsx'
import Massager from './tools/Massager.jsx'
import Megaphone from './tools/Megaphone.jsx'
import QuantumCompass from './tools/QuantumCompass.jsx'
import PowerDrainer from './tools/PowerDrainer.jsx'
import FakeCamera from './tools/FakeCamera.jsx'
import BlueScreen from './tools/BlueScreen.jsx'
import EternalLoading from './tools/EternalLoading.jsx'
import InvertFilter from './tools/InvertFilter.jsx'
import ScreenSmash from './tools/ScreenSmash.jsx'
import MatrixRain from './tools/MatrixRain.jsx'
import Earthquake from './tools/Earthquake.jsx'
import MouseTrail from './tools/MouseTrail.jsx'
import ShyButton from './tools/ShyButton.jsx'
import ConfirmHell from './tools/ConfirmHell.jsx'
import CaptchaHell from './tools/CaptchaHell.jsx'
import DecisionRoulette from './tools/DecisionRoulette.jsx'
import FakeDownload from './tools/FakeDownload.jsx'
import FortuneTeller from './tools/FortuneTeller.jsx'
import AnxietyMachine from './tools/AnxietyMachine.jsx'

// 分类：决定刀刃配色
export const CATEGORY = {
  hardware: { color: 'acid', hex: '#d4ff3a', code: 'HARDWARE' },
  visual: { color: 'plasma', hex: '#ff2d75', code: 'VISUAL' },
  torture: { color: 'frost', hex: '#7afcff', code: 'TORTURE' },
}

// 20 把刀刃：id 唯一 / icon 单字符 / cat 决定配色 / codename 军事化命令名 / Comp 触发后渲染的组件
export const TOOLS = [
  // === 硬件假装系 ===
  { id: 'flashlight', icon: '🔦', cat: 'hardware', codename: 'FLASHBANG', Comp: Flashlight },
  { id: 'massager', icon: '📳', cat: 'hardware', codename: 'MASSAGER_V3', Comp: Massager },
  { id: 'megaphone', icon: '🔊', cat: 'hardware', codename: 'TEST_TONE_1KHZ', Comp: Megaphone },
  { id: 'compass', icon: '🧭', cat: 'hardware', codename: 'QUANTUM_NAV', Comp: QuantumCompass },
  { id: 'drainer', icon: '🔋', cat: 'hardware', codename: 'BATTERY_KILLER', Comp: PowerDrainer },
  { id: 'camera', icon: '📷', cat: 'hardware', codename: 'NEVER_FOCUS', Comp: FakeCamera },
  // === 视觉整蛊系 ===
  { id: 'bluescreen', icon: '💀', cat: 'visual', codename: 'KERNEL_PANIC', Comp: BlueScreen },
  { id: 'loading', icon: '⏳', cat: 'visual', codename: 'ETERNAL_99', Comp: EternalLoading },
  { id: 'invert', icon: '🌈', cat: 'visual', codename: 'COLOR_INVERT', Comp: InvertFilter },
  { id: 'smash', icon: '🔨', cat: 'visual', codename: 'GLASS_BREAKER', Comp: ScreenSmash },
  { id: 'matrix', icon: '💻', cat: 'visual', codename: 'BREACH_PENTAGON', Comp: MatrixRain },
  { id: 'quake', icon: '🎢', cat: 'visual', codename: 'SEISMIC_7.2', Comp: Earthquake },
  { id: 'trail', icon: '👻', cat: 'visual', codename: 'GHOST_TRAIL', Comp: MouseTrail },
  // === 交互折磨系 ===
  { id: 'shy', icon: '🙈', cat: 'torture', codename: 'CATCH_ME', Comp: ShyButton },
  { id: 'confirm', icon: '🔁', cat: 'torture', codename: 'CONFIRM_HELL', Comp: ConfirmHell },
  { id: 'captcha', icon: '🤖', cat: 'torture', codename: 'HUMAN_CHECK', Comp: CaptchaHell },
  { id: 'decision', icon: '🎰', cat: 'torture', codename: 'BAD_DECIDER', Comp: DecisionRoulette },
  { id: 'download', icon: '📡', cat: 'torture', codename: 'FAKE_DL_1TB', Comp: FakeDownload },
  { id: 'fortune', icon: '🔮', cat: 'torture', codename: 'ORACLE_FAKE', Comp: FortuneTeller },
  { id: 'anxiety', icon: '💭', cat: 'torture', codename: 'ANXIETY_BOMB', Comp: AnxietyMachine },
]
