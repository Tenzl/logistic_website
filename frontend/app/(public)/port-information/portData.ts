export interface PortInfo {
  id: string
  name: string
  location: string
  pilotBoardingPosition: string
  accessChannel: string
  tideRegime: string
  mainBerths: string[]
  restrictions: string[]
  status?: 'ready' | 'updating'
}

export const PORTS: PortInfo[] = [
  {
    id: 'chu-lai',
    name: 'CHU LAI',
    location: `15deg29'24\"N - 108deg42'50\"E`,
    pilotBoardingPosition: `15deg29'45\"N - 108deg42'50\"E`,
    accessChannel: 'Length: 11 km (from Buoy Zero); width: 110 m; depth: 9.3 m',
    tideRegime: 'Semi-diurnal tides. Tidal range: 1.2 m',
    mainBerths: [
      'Berth no.1 - Length: 471 m / Depth at berth: -9.5 m',
      'Berth no.2 - Length: 365 m / Depth at berth: -11.6 m',
    ],
    restrictions: [
      'Night-time navigation allowed (restricted) subject to local weather conditions.',
      'Allowed vessel max approaching draft: restricted (official).',
    ],
    status: 'ready',
  },
  {
    id: 'hai-phong',
    name: 'HAI PHONG',
    location: 'Information is being updated',
    pilotBoardingPosition: 'Information is being updated',
    accessChannel: 'Information is being updated',
    tideRegime: 'Information is being updated',
    mainBerths: ['Detailed berth information is being updated.'],
    restrictions: ['Restriction details are being updated.'],
    status: 'updating',
  },
  {
    id: 'da-nang',
    name: 'DA NANG',
    location: 'Information is being updated',
    pilotBoardingPosition: 'Information is being updated',
    accessChannel: 'Information is being updated',
    tideRegime: 'Information is being updated',
    mainBerths: ['Detailed berth information is being updated.'],
    restrictions: ['Restriction details are being updated.'],
    status: 'updating',
  },
  {
    id: 'quy-nhon',
    name: 'QUY NHON',
    location: 'Information is being updated',
    pilotBoardingPosition: 'Information is being updated',
    accessChannel: 'Information is being updated',
    tideRegime: 'Information is being updated',
    mainBerths: ['Detailed berth information is being updated.'],
    restrictions: ['Restriction details are being updated.'],
    status: 'updating',
  },
  {
    id: 'ho-chi-minh',
    name: 'HO CHI MINH',
    location: 'Information is being updated',
    pilotBoardingPosition: 'Information is being updated',
    accessChannel: 'Information is being updated',
    tideRegime: 'Information is being updated',
    mainBerths: ['Detailed berth information is being updated.'],
    restrictions: ['Restriction details are being updated.'],
    status: 'updating',
  },
]

export const DEFAULT_PORT_ID = 'chu-lai'

export function getPortById(portId?: string) {
  if (!portId) {
    return PORTS.find((port) => port.id === DEFAULT_PORT_ID) ?? PORTS[0]
  }

  return PORTS.find((port) => port.id === portId) ?? PORTS.find((port) => port.id === DEFAULT_PORT_ID) ?? PORTS[0]
}
