import { NextRequest, NextResponse } from 'next/server';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: '请上传需要识别的图片。' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      return NextResponse.json({ error: '仅支持 JPG、PNG 或 WebP 图片。' }, { status: 400 });
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: '文件较大，建议压缩到 5MB 以内后重新上传，保证识别速度。', code: 'IMAGE_TOO_LARGE' },
        { status: 413 },
      );
    }

    const ocrKey = process.env.ALIBABA_OCR_KEY;
    const ocrEndpoint = process.env.ALIBABA_OCR_ENDPOINT;

    if (!ocrKey || !ocrEndpoint) {
      return NextResponse.json(
        { error: '图片识别服务尚未连接。当前请上传 CSV 或手动粘贴文本继续使用核心工作流。', code: 'OCR_PROVIDER_NOT_CONFIGURED' },
        { status: 503 },
      );
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

    return NextResponse.json(
      { error: '图片识别服务尚未完成连接，请上传 CSV 或手动粘贴文本继续。', code: 'OCR_PROVIDER_NOT_CONNECTED' },
      { status: 503 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: `图片识别请求失败：${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}
