import { ImageResponse } from 'next/og'

export const alt = 'Seatrans - Maritime Logistics Solutions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b1f2a',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: -1 }}>
          Seatrans
        </div>
        <div style={{ fontSize: 26, marginTop: 18 }}>
          Maritime Logistics Solutions
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    }
  )
}
