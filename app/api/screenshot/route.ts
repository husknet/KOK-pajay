// app/api/screenshot/route.ts
export const runtime = 'nodejs'   // ensure we’re in a Node Serverless function
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  console.log('📸 screenshot called for', url)
  if (!url) {
    console.error('❌ missing url param')
    return NextResponse.json({ error: 'Missing ?url=' }, { status: 400 })
  }

  let browser = null
  try {
    // load at runtime so webpack won’t bundle
    const chromium = require('@sparticuz/chromium')
    const puppeteer = require('puppeteer-core')

    // debug where chromium is pointing
    const execPath = await chromium.executablePath()
    console.log('🔍 chromium executablePath:', execPath)

    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      executablePath: execPath,
      headless: chromium.headless,
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 })
    const buffer = await page.screenshot({ fullPage: true })

    console.log('✅ screenshot taken, bytes:', buffer.byteLength)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (err: any) {
    console.error('🚨 screenshot error:', err)
    return NextResponse.json({ error: err.message || 'Screenshot failed' }, { status: 500 })
  } finally {
    if (browser) {
      try { await browser.close() } catch (_) {}
    }
  }
}
