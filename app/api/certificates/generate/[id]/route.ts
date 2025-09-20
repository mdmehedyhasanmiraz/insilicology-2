import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
// @ts-expect-error - qrcode doesn't have types
import QRCode from 'qrcode'
import fs from 'fs/promises'
import path from 'path'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Debug information
  const debugInfo = {
    workingDirectory: process.cwd(),
    fontPaths: {
      unifraktur: path.join(process.cwd(), 'public', 'fonts', 'UnifrakturMaguntia-Regular.ttf'),
      delafield: path.join(process.cwd(), 'public', 'fonts', 'ImperialScript-Regular.ttf')
    },
    fontLoading: {
      unifraktur: { loaded: false, error: null as string | null, fileSize: 0, source: '' },
      delafield: { loaded: false, error: null as string | null, fileSize: 0, source: '' },
      titleUsingCustom: false,
      nameUsingCustom: false
    }
  }

  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: certId } = await params
    if (!certId) return NextResponse.json({ error: 'Certificate id required' }, { status: 400 })

    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })

    const { data: certificate, error } = await supabaseAdmin
      .from('certificates')
      .select('id, user_id, title, tracking_code, certificate_type, entity_type, entity_id, issued_at, users:users!inner(id, name, email)')
      .eq('id', certId)
      .single()

    if (error || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Create PDF with fontkit
    const pdf = await PDFDocument.create()
    pdf.registerFontkit(fontkit)
    const page = pdf.addPage([842, 595]) // A4 landscape: 842x595
    const { width, height } = page.getSize()

    // // Background image
    // try {
    //   const bgPath = path.join(process.cwd(), 'public', 'certificates', 'CERTIFIED.png')
    //   const bgBuffer = await fs.readFile(bgPath)
    //   const bgImage = await pdf.embedPng(bgBuffer)
    //   page.drawImage(bgImage, {
    //     x: 0,
    //     y: 0,
    //     width: width,
    //     height: height,
    //     opacity: 1.0
    //   })
    //   debugInfo.backgroundImage = { loaded: true, path: bgPath, size: bgBuffer.length }
    // } catch (e) {
    //   // Fallback to clean background if image not found
    //   page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) })
    //   page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: rgb(0.98, 0.99, 1) })
    //   debugInfo.backgroundImage = { loaded: false, error: e.message, path: path.join(process.cwd(), 'public', 'certificates', 'CERTIFIED.png') }
    // }

    // // Light bluish grey background for upper 28%
    // const upperSectionHeight = height * 0.28
    // page.drawRectangle({ 
    //   x: 0, 
    //   y: height - upperSectionHeight, 
    //   width: width, 
    //   height: upperSectionHeight, 
    //   color: rgb(0.9, 0.92, 0.95) 
    // })

    // Clean border
    page.drawRectangle({ x: 30, y: 30, width: width - 60, height: height - 60, borderColor: rgb(1, 0.788, 0), borderWidth: 2 })

    // Simplified background pattern for better performance
    const patternSize = 20 // Larger pattern size for fewer iterations
    const patternOpacity = 0.08 // Slightly more subtle
    
    // Create a simplified geometric pattern
    for (let x = 0; x < width; x += patternSize) {
      for (let y = 0; y < height; y += patternSize) {
        const centerX = x + patternSize / 2
        const centerY = y + patternSize / 2
        
        // Draw horizontal lines
        page.drawRectangle({
          x: x + 3,
          y: centerY - 0.5,
          width: patternSize - 6,
          height: 1,
          color: rgb(1, 0.878, 0.49),
          opacity: patternOpacity
        })
        
        // Draw vertical lines
        page.drawRectangle({
          x: centerX - 0.5,
          y: y + 3,
          width: 1,
          height: patternSize - 6,
          color: rgb(1, 0.878, 0.49),
          opacity: patternOpacity
        })
        
        // Draw center dot
        page.drawRectangle({
          x: centerX - 1,
          y: centerY - 1,
          width: 2,
          height: 2,
          color: rgb(1, 0.878, 0.49),
          opacity: patternOpacity
        })
      }
    }

    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique)
    
    // Try to load custom fonts from local files
    let titleFont = fontBold
    let nameFont = fontBold
    
    try {
      // Load UnifrakturMaguntia for title using fontkit
      const unifrakturPath = path.join(process.cwd(), 'public', 'fonts', 'UnifrakturMaguntia-Regular.ttf')
      const unifrakturBuffer = await fs.readFile(unifrakturPath)
      debugInfo.fontLoading.unifraktur.fileSize = unifrakturBuffer.length
      
      if (unifrakturBuffer.length > 0) {
        titleFont = await pdf.embedFont(unifrakturBuffer)
        debugInfo.fontLoading.unifraktur.loaded = true
        debugInfo.fontLoading.unifraktur.source = 'local_fontkit'
      } else {
        debugInfo.fontLoading.unifraktur.error = 'Font file is empty'
      }
    } catch (e) {
      debugInfo.fontLoading.unifraktur.error = (e as Error).message
    }
    
    try {
      // Load ImperialScript-Regular for name using fontkit
      const delafieldPath = path.join(process.cwd(), 'public', 'fonts', 'ImperialScript-Regular.ttf')
      const delafieldBuffer = await fs.readFile(delafieldPath)
      debugInfo.fontLoading.delafield.fileSize = delafieldBuffer.length
      
      if (delafieldBuffer.length > 0) {
        nameFont = await pdf.embedFont(delafieldBuffer)
        debugInfo.fontLoading.delafield.loaded = true
        debugInfo.fontLoading.delafield.source = 'local_fontkit'
        console.log('Successfully loaded ImperialScript-Regular font for name')
      } else {
        debugInfo.fontLoading.delafield.error = 'Font file is empty'
        console.log('ImperialScript-Regular font file is empty')
      }
    } catch (e) {
      debugInfo.fontLoading.delafield.error = (e as Error).message
      console.log('Failed to load ImperialScript-Regular font:', (e as Error).message)
    }

    // Alternative: Try to download fonts from Google Fonts if local files fail
    if (!debugInfo.fontLoading.unifraktur.loaded) {
      try {
        const response = await fetch('https://fonts.gstatic.com/s/unifrakturmaguntia/v21/WWXnjgeZ3WnJcHG8mtEobIAWwx_8BWZQdBPFY3RKeYQ.ttf')
        if (response.ok) {
          const fontBuffer = await response.arrayBuffer()
          titleFont = await pdf.embedFont(fontBuffer)
          debugInfo.fontLoading.unifraktur.loaded = true
          debugInfo.fontLoading.unifraktur.source = 'google_fonts_fontkit'
        }
      } catch (e) {
        debugInfo.fontLoading.unifraktur.error = (e as Error).message
      }
    }

    if (!debugInfo.fontLoading.delafield.loaded) {
      try {
        const response = await fetch('https://fonts.gstatic.com/s/ImperialScript-Regular/v22/w8gaH2Qx6KQ.ttf')
        if (response.ok) {
          const fontBuffer = await response.arrayBuffer()
          nameFont = await pdf.embedFont(fontBuffer)
          debugInfo.fontLoading.delafield.loaded = true
          debugInfo.fontLoading.delafield.source = 'google_fonts_fontkit'
        }
      } catch (e) {
        debugInfo.fontLoading.delafield.error = (e as Error).message
      }
    }

    // Try to embed logo (PNG)
    let usedLogo = false
    try {
      const logoCandidates = [
        path.join(process.cwd(), 'public', 'logos', 'logo-insilicology.svg'),
        path.join(process.cwd(), 'public', 'logos', 'icon-insilicology.svg')
      ]
      for (const p of logoCandidates) {
        try {
          const buf = await fs.readFile(p)
          if (buf && buf.length > 0) {
            const png = await pdf.embedPng(buf)
            const imgW = 90
            const imgH = (png.height / png.width) * imgW
            page.drawImage(png, { x: 50, y: height - 75, width: imgW, height: imgH })
            usedLogo = true
            break
          }
        } catch {}
      }
    } catch {}

    // Header fallback text if logo missing
    if (!usedLogo) {
      const header = 'Insilicology'
      const headerWidth = fontBold.widthOfTextAtSize(header, 32)
      page.drawText(header, { x: (width - headerWidth) / 2, y: height - 80, size: 32, font: fontBold, color: rgb(0.22, 0.18, 0.45) })
    }

    // Title with custom font (UnifrakturMaguntia)
    const title = `Certificate of ${certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)}`
    debugInfo.fontLoading.titleUsingCustom = titleFont !== fontBold
    const titleWidth = titleFont.widthOfTextAtSize(title, 48)
    page.drawText(title, { x: (width - titleWidth) / 2, y: height - 150, size: 48, font: titleFont, color: rgb(0.4, 0.1, 0.9) })

    // Certificate of completion message
    const addressMsg = "This certificate is presented to"
    const addressWidth = font.widthOfTextAtSize(addressMsg, 16)
    page.drawText(addressMsg, { x: (width - addressWidth) / 2, y: height - 200, size: 16, font, color: rgb(0.3, 0.3, 0.5) })

    // Recipient name with custom font (ImperialScript-Regular) and underline
    const name = (certificate.users as unknown as { name: string | null })?.name || 'Student'
    debugInfo.fontLoading.nameUsingCustom = nameFont !== fontBold
    const nameWidth = nameFont.widthOfTextAtSize(name, 42)
    const nameX = (width - nameWidth) / 2
    const nameY = height - 260
    
    // Draw the name
    page.drawText(name, { x: nameX, y: nameY, size: 42, font: nameFont, color: rgb(0, 0, 0) })
    
    // // Draw underline below the name
    // const underlineWidth = nameWidth + 40
    // const underlineX = (width - underlineWidth) / 2
    // const underlineY = nameY - 15
    // page.drawRectangle({ x: underlineX, y: underlineY, width: underlineWidth, height: 2, color: rgb(0.5, 0.2, 0.8) })

    // Success message - determine if it's a workshop or course
    const entityType = certificate.entity_type === 'workshop' ? 'workshop' : 'course'
    const bodyMsg = `for successfully completing the ${entityType}`
    const bodyWidth = font.widthOfTextAtSize(bodyMsg, 15)
    page.drawText(bodyMsg, { x: (width - bodyWidth) / 2, y: height - 310, size: 15, font, color: rgb(0.3, 0.3, 0.5) })

    // Body text with better spacing - make course name bold
    const body2 = `${certificate.title}`
    const body2Width = fontBold.widthOfTextAtSize(body2, 15)
    page.drawText(body2, { x: (width - body2Width) / 2, y: height - 340, size: 15, font: fontBold, color: rgb(0.4, 0.1, 0.9) })

    // Success message
    const successMsg = "with dedication and commitment to advancing knowledge."
    const successWidth = font.widthOfTextAtSize(successMsg, 15)
    page.drawText(successMsg, { x: (width - successWidth) / 2, y: height - 370, size: 15, font, color: rgb(0.3, 0.3, 0.5) })

    // Success message
    const wishMsg = "We wish you continued success in your learning journey!"
    const wishWidth = font.widthOfTextAtSize(wishMsg, 15)
    page.drawText(wishMsg, { x: (width - wishWidth) / 2, y: height - 400, size: 15, font: fontItalic, color: rgb(0.3, 0.3, 0.5) })

    // // SVG watermark background
    // try {
    //   const svgPath = path.join(process.cwd(), 'public', 'logos', 'icon-insilicology.svg')
    //   const svgBuffer = await fs.readFile(svgPath)
      
    //   // Convert SVG to PNG using Sharp
    //   const pngBuffer = await sharp(svgBuffer)
    //     .resize(400, 400) // Large size for watermark
    //     .png()
    //     .toBuffer()
      
    //   const watermarkPng = await pdf.embedPng(pngBuffer)
    //   const wmSize = 500
    //   page.drawImage(watermarkPng, {
    //     x: (width - wmSize) / 2,
    //     y: (height - wmSize) / 2,
    //     width: wmSize,
    //     height: wmSize,
    //     opacity: 0.07
    //   })
    // } catch (e) {
    //   console.log('Could not load SVG watermark, using text fallback:', e)
    //   // Fallback watermark
    //   const wm = 'INSILICOLOGY'
    //   const wmSize = 90
    //   const wmWidth = fontBold.widthOfTextAtSize(wm, wmSize)
    //   page.drawText(wm, {
    //     x: (width - wmWidth) / 2,
    //     y: height / 2 - 50,
    //     size: wmSize,
    //     font: fontBold,
    //     color: rgb(0.92, 0.92, 0.98),
    //     opacity: 0.15
    //   })
    // }

    // Date of Issue at right upper corner
    console.log('Certificate issued_at:', certificate.issued_at, typeof certificate.issued_at)
    
    let issueDate
    if (certificate.issued_at) {
      const date = new Date(certificate.issued_at)
      if (isNaN(date.getTime())) {
        console.log('Invalid date, using current date')
        issueDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      } else {
        issueDate = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }
    } else {
      console.log('No issued_at, using current date')
      issueDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
    const dateText = `Issued on: ${issueDate}`
    const dateWidth = font.widthOfTextAtSize(dateText, 12)
    page.drawText(dateText, { 
      x: width - dateWidth - 40, 
      y: height - 65, 
      size: 11, 
      font, 
      color: rgb(0.2, 0.2, 0.3) 
    })

    // QR and verification info
    const verifyUrl = `https://insilicology.org/verify/${certificate.tracking_code}`
    const qrDataUrl = await QRCode.toDataURL(verifyUrl)
    const qrPng = await pdf.embedPng(qrDataUrl)
    page.drawImage(qrPng, { x: width - 130, y: 50, width: 85, height: 85 })

    page.drawText('Code:', { x: 50, y: 75, size: 10, font, color: rgb(0.2, 0.2, 0.3) })
    page.drawText(`${certificate.tracking_code}`, { x: 84, y: 75, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.3) })
    page.drawText('Verify:', { x: 50, y: 60, size: 10, font, color: rgb(0.2, 0.2, 0.3) })
    page.drawText(verifyUrl, { x: 84, y: 60, size: 10, font, color: rgb(0.2, 0.2, 0.3) })

    // Centered signature section
    const sigWidth = 180
    const sigX = (width - sigWidth) / 2
    const sigY = 100

    // Draw signature line
    page.drawRectangle({ x: sigX, y: sigY, width: sigWidth, height: 1, color: rgb(0.2, 0.2, 0.3) })

    // Try to load signature image above the line
    try {
      const signaturePath = path.join(process.cwd(), 'public', 'images', 'Mehedy.png')
      const signatureBuffer = await fs.readFile(signaturePath)
      const signaturePng = await pdf.embedPng(signatureBuffer)
      
      // Calculate dimensions maintaining aspect ratio
      const maxWidth = 120
      const maxHeight = 120
      const aspectRatio = signaturePng.width / signaturePng.height
      
      let sigImgWidth = maxWidth
      let sigImgHeight = maxWidth / aspectRatio
      
      // If height exceeds max, scale down
      if (sigImgHeight > maxHeight) {
        sigImgHeight = maxHeight
        sigImgWidth = maxHeight * aspectRatio
      }
      
      // Center the image above the line
      const sigImgX = (width - sigImgWidth) / 2
      const sigImgY = sigY - 5 // Position above the line
      
      // Draw signature image
      page.drawImage(signaturePng, {
        x: sigImgX,
        y: sigImgY,
        width: sigImgWidth,
        height: sigImgHeight
      })
      
      console.log('Successfully loaded signature image')
    } catch (e) {
      console.log('Failed to load signature image:', (e as Error).message)
    }

    page.drawRectangle({ x: sigX, y: sigY, width: sigWidth, height: 1, color: rgb(0, 0, 0) })
    const sigLabel = 'Md Mehedy Hasan Miraz'
    const sigLabel2 = 'Founder & CEO, Insilicology'
    const sigLabelW = font.widthOfTextAtSize(sigLabel, 13.5)
    page.drawText(sigLabel, { x: sigX + (sigWidth - sigLabelW) / 2, y: sigY - 17, size: 13, font: fontBold, color: rgb(0, 0, 0) })
    const sigLabelW2 = font.widthOfTextAtSize(sigLabel2, 11)
    page.drawText(sigLabel2, { x: sigX + (sigWidth - sigLabelW2) / 2, y: sigY - 35, size: 11, font, color: rgb(0.3, 0.3, 0.5) })

    // Finalize PDF and return directly
    const pdfBytes = await pdf.save()
    const fileName = `certificate-${certificate.tracking_code}-insilicology.pdf`
    
    // For debugging, return JSON with debug info instead of PDF
    if (_req.url.includes('debug=true')) {
      return NextResponse.json({ 
        debug: debugInfo,
        message: 'Debug mode - fonts loaded successfully' 
      })
    }
    
    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`
      }
    })
  } catch (e) {
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : 'Unknown error',
      debug: debugInfo || {}
    }, { status: 500 })
  }
}


