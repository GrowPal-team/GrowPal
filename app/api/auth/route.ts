import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/session-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const requiredRole =
      typeof body?.requiredRole === 'string' && body.requiredRole.trim() !== ''
        ? body.requiredRole.trim().toLowerCase()
        : null
    
    // Forward request to PHP API
    const phpApiUrl = 'http://localhost/GrowPal/api/auth.php'
    
    const response = await fetch(phpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const contentType = response.headers.get('content-type') || ''
    const text = await response.text()
    
    if (!contentType.includes('application/json')) {
      console.error('PHP API returned non-JSON. Response starts with:', text.substring(0, 200))
      return NextResponse.json(
        {
          success: false,
          message: 'Backend API returned HTML instead of JSON. Is Apache/XAMPP running? Make sure the project is in htdocs/GrowPal/ and visit http://localhost/GrowPal/api/auth.php to verify.',
        },
        { status: 502 }
      )
    }
    
    const data = JSON.parse(text)

    if (body?.action === 'login' && data?.success && data?.user) {
      const userRole = String(data.user.role || 'user').trim().toLowerCase()

      if (requiredRole && userRole !== requiredRole) {
        return NextResponse.json(
          {
            success: false,
            message: 'This account does not have access to this area.',
          },
          { status: 403 }
        )
      }

      const nextResponse = NextResponse.json(data, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })

      nextResponse.cookies.set(
        SESSION_COOKIE_NAME,
        createSessionToken({
          id: Number(data.user.id),
          name: String(data.user.name || ''),
          email: String(data.user.email || ''),
          role: userRole,
        }),
        getSessionCookieOptions()
      )

      return nextResponse
    }
    
    // Return the response with proper CORS headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error: any) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred while processing your request',
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
