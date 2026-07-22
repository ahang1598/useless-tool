// 临时特效池元数据。id 与 i18n `egg.effects.{id}` 对应
export const EFFECTS = [
  { id: 'rainbow-trail', duration: 4000 },
  { id: 'screen-shake', duration: 3000 },
  { id: 'color-noise', duration: 4000 },
  { id: 'tilt-world', duration: 4000 },
  { id: 'bubble-pop', duration: 4000 },
]

export const randomEffect = () => EFFECTS[Math.floor(Math.random() * EFFECTS.length)]
