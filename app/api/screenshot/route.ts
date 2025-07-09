import { NextRequest, NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing ?url=' }, { status: 400 })
  }

  let browser = null
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2' })
    const buffer = await page.screenshot({ fullPage: true })

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (err) {
    console.error('Screenshot error:', err)
    return NextResponse.json({ error: 'Screenshot failed' }, { status: 500 })
  } finally {
    if (browser) await browser.close()
  }
}
