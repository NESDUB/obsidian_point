interface ObsidianLogoAssetProps {
  height?: number
  className?: string
}

export default function ObsidianLogoAsset({ height = 380, className = '' }: ObsidianLogoAssetProps) {
  const width = (150 / 210) * height

  const leftBodyMaterial = [
    'linear-gradient(160deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.05) 10%, transparent 24%)',
    'linear-gradient(138deg, rgba(244,239,230,.26) 0%, rgba(118,126,136,.16) 26%, rgba(34,39,45,.88) 52%, rgba(8,10,12,1) 100%)',
  ].join(', ')

  const rightBodyMaterial = [
    'linear-gradient(200deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.05) 10%, transparent 24%)',
    'linear-gradient(222deg, rgba(244,239,230,.26) 0%, rgba(118,126,136,.16) 26%, rgba(34,39,45,.88) 52%, rgba(8,10,12,1) 100%)',
  ].join(', ')

  const leftStripReflection = [
    'linear-gradient(154deg, transparent 0%, transparent 24%, rgba(255,255,255,.035) 31%, rgba(255,255,255,.09) 38%, rgba(232,238,245,.24) 46%, rgba(174,188,204,.28) 51%, rgba(103,121,141,.22) 57%, rgba(39,47,57,.13) 63%, transparent 74%)',
    'linear-gradient(28deg, transparent 0%, rgba(255,255,255,.045) 58%, rgba(255,255,255,.018) 62%, transparent 66%)',
    'radial-gradient(circle at 64% 14%, rgba(255,255,255,.24) 0%, rgba(255,255,255,.14) 14%, rgba(214,224,236,.09) 24%, transparent 40%)',
    'linear-gradient(180deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 78%, rgba(0,0,0,.12) 100%)',
    'linear-gradient(120deg, #1a1d21 0%, #0f1317 45%, #1b1f24 100%)',
  ].join(', ')

  const rightStripReflection = [
    'linear-gradient(136deg, transparent 0%, transparent 20%, rgba(255,255,255,.03) 29%, rgba(255,255,255,.075) 36%, rgba(230,236,243,.20) 45%, rgba(166,182,198,.28) 52%, rgba(101,120,142,.25) 58%, rgba(42,51,62,.14) 65%, transparent 77%)',
    'linear-gradient(42deg, transparent 0%, rgba(255,255,255,.04) 55%, rgba(255,255,255,.016) 60%, transparent 64%)',
    'radial-gradient(circle at 36% 14%, rgba(255,255,255,.20) 0%, rgba(255,255,255,.12) 13%, rgba(214,224,236,.08) 24%, transparent 40%)',
    'linear-gradient(180deg, rgba(255,255,255,.065) 0%, rgba(255,255,255,0) 18%, rgba(255,255,255,0) 78%, rgba(0,0,0,.12) 100%)',
    'linear-gradient(120deg, #1a1d21 0%, #0f1317 45%, #1b1f24 100%)',
  ].join(', ')

  const centerSpineMaterial = 'linear-gradient(90deg, #0d0f12 0%, #13171b 18%, #1b2026 50%, #13171b 82%, #0d0f12 100%)'

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width,
        height,
        filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.06)) drop-shadow(0 24px 36px rgba(0,0,0,.045))',
      }}
    >
      {/* Left monolith */}
      <div
        className="absolute left-0 top-0 h-full w-[44%]"
        style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 24% 54%)',
          backgroundImage: leftBodyMaterial,
          boxShadow: 'inset 1px 0 0 rgba(255,255,255,.34), inset -1px 0 0 rgba(255,255,255,.08)',
        }}
      />

      {/* Left seam */}
      <div
        className="absolute top-0 h-full w-[2.6667%]"
        style={{
          left: '44%',
          backgroundImage: leftStripReflection,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          boxShadow: 'inset 1px 0 0 rgba(255,255,255,.10), inset -1px 0 0 rgba(0,0,0,.18)',
        }}
      />

      {/* Center spine */}
      <div
        className="absolute top-0 h-full w-[6.6667%]"
        style={{
          left: '46.6667%',
          backgroundImage: centerSpineMaterial,
          boxShadow: '0 0 16px rgba(255,255,255,.08), inset 1px 0 0 rgba(255,255,255,.06), inset -1px 0 0 rgba(0,0,0,.32)',
        }}
      />

      {/* Right seam */}
      <div
        className="absolute top-0 h-full w-[2.6667%]"
        style={{
          left: '53.3334%',
          backgroundImage: rightStripReflection,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          boxShadow: 'inset 1px 0 0 rgba(255,255,255,.10), inset -1px 0 0 rgba(0,0,0,.18)',
        }}
      />

      {/* Right monolith */}
      <div
        className="absolute right-0 top-0 h-full w-[44%]"
        style={{
          clipPath: 'polygon(0 0, 100% 100%, 0 100%, 0 0, 76% 54%)',
          backgroundImage: rightBodyMaterial,
          boxShadow: 'inset -1px 0 0 rgba(255,255,255,.34), inset 1px 0 0 rgba(255,255,255,.08)',
        }}
      />
    </div>
  )
}
