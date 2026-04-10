import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      return NextResponse.json({ error: 'Invalid file type. Accepted: jpg, png, webp' }, { status: 400 });
    }

    const ocrKey = process.env.ALIBABA_OCR_KEY;
    const ocrEndpoint = process.env.ALIBABA_OCR_ENDPOINT;

    if (!ocrKey || !ocrEndpoint) {
      // Demo mode: return placeholder message
      return NextResponse.json({
        text: '[OCR API未配置] 请在.env.local中配置 ALIBABA_OCR_KEY 和 ALIBABA_OCR_ENDPOINT\n\n示例识别结果:\n商品名称: 无线蓝牙耳机 Pro Max\n品牌: TechSound\n型号: TS-BT500\n特点: 主动降噪 / 40小时续航 / 蓝牙5.3\n价格: ¥299\n产地: 中国深圳',
        demo: true,
      });
    }

    // --- Real OCR integration (Alibaba Cloud OCR) ---
    // Uncomment and configure when ready:
    //
    // const imageBuffer = await image.arrayBuffer();
    // const base64Image = Buffer.from(imageBuffer).toString('base64');
    //
    // const response = await fetch(ocrEndpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${ocrKey}`,
    //   },
    //   body: JSON.stringify({
    //     image: base64Image,
    //     // For Alibaba Cloud OCR (RecognizeGeneral):
    //     // url: undefined,  // or use URL instead of base64
    //     // output_type: 'json',
    //   }),
    // });
    //
    // if (!response.ok) {
    //   const errorText = await response.text();
    //   return NextResponse.json({ error: `OCR API error: ${errorText}` }, { status: 500 });
    // }
    //
    // const data = await response.json();
    //
    // // Alibaba Cloud OCR response parsing:
    // // const words = data.data?.content || '';
    // // return NextResponse.json({ text: words });
    //
    // // Baidu OCR alternative:
    // // const words = data.words_result?.map((w: { words: string }) => w.words).join('\n') || '';
    // // return NextResponse.json({ text: words });
    //
    // return NextResponse.json({ text: data.text || '' });
    // --- End real OCR integration ---

    return NextResponse.json({ text: '', error: 'OCR not configured' }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { error: `OCR request failed: ${error instanceof Error ? error.message : 'unknown error'}` },
      { status: 500 }
    );
  }
}
