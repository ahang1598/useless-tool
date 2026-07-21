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

// 20 把刀刃：id 唯一 / icon 单字符 / cat 决定配色 / Comp 触发后渲染的组件
export const TOOLS = [
  // === 硬件假装系 ===
  { id: 'flashlight', icon: '🔦', cat: 'hardware', Comp: Flashlight },
  { id: 'massager', icon: '📳', cat: 'hardware', Comp: Massager },
  { id: 'megaphone', icon: '🔊', cat: 'hardware', Comp: Megaphone },
  { id: 'compass', icon: '🧭', cat: 'hardware', Comp: QuantumCompass },
  { id: 'drainer', icon: '🔋', cat: 'hardware', Comp: PowerDrainer },
  { id: 'camera', icon: '📷', cat: 'hardware', Comp: FakeCamera },
  // === 视觉整蛊系 ===
  { id: 'bluescreen', icon: '💀', cat: 'visual', Comp: BlueScreen },
  { id: 'loading', icon: '⏳', cat: 'visual', Comp: EternalLoading },
  { id: 'invert', icon: '🌈', cat: 'visual', Comp: InvertFilter },
  { id: 'smash', icon: '🔨', cat: 'visual', Comp: ScreenSmash },
  { id: 'matrix', icon: '💻', cat: 'visual', Comp: MatrixRain },
  { id: 'quake', icon: '🎢', cat: 'visual', Comp: Earthquake },
  { id: 'trail', icon: '👻', cat: 'visual', Comp: MouseTrail },
  // === 交互折磨系 ===
  { id: 'shy', icon: '🙈', cat: 'torture', Comp: ShyButton },
  { id: 'confirm', icon: '🔁', cat: 'torture', Comp: ConfirmHell },
  { id: 'captcha', icon: '🤖', cat: 'torture', Comp: CaptchaHell },
  { id: 'decision', icon: '🎰', cat: 'torture', Comp: DecisionRoulette },
  { id: 'download', icon: '📡', cat: 'torture', Comp: FakeDownload },
  { id: 'fortune', icon: '🔮', cat: 'torture', Comp: FortuneTeller },
  { id: 'anxiety', icon: '💭', cat: 'torture', Comp: AnxietyMachine },
]
