import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/shared/config/api.config'

export const dynamic = 'force-dynamic'

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const search = new URL(req.url).search
  const targetPath = pathSegments.join('/')
  const targetUrl = `${API_CONFIG.API_URL}/${targetPath}${search}`

  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.set('x-forwarded-host', req.headers.get('host') || '')
  headers.set('x-forwarded-proto', req.headers.get('x-forwarded-proto') || 'https')

  const method = req.method.toUpperCase()
  const hasBody = !['GET', 'HEAD'].includes(method)
  const body = hasBody ? await req.arrayBuffer() : undefined

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
    })

    const responseHeaders = new Headers(upstream.headers)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('transfer-encoding')

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    })
  } catch (error: any) {
    const message = error?.message || 'Proxy request failed'
    return NextResponse.json({ success: false, message }, { status: 502 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return proxyRequest(req, params.path || [])
}

export async function POST(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return proxyRequest(req, params.path || [])
}

export async function PUT(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return proxyRequest(req, params.path || [])
}

export async function PATCH(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return proxyRequest(req, params.path || [])
}

export async function DELETE(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return proxyRequest(req, params.path || [])
}

export async function OPTIONS(req: NextRequest, { params }: { params: { path?: string[] } }) {
  return proxyRequest(req, params.path || [])
}
