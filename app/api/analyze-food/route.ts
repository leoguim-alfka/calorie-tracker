import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'OPENAI_API_KEY is missing from .env.local',
        },
        {
          status: 500,
        }
      )
    }

    const openai = new OpenAI({
      apiKey,
    })

    const formData = await request.formData()

    const image = formData.get('image')

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: 'No image was received.',
        },
        {
          status: 400,
        }
      )
    }

    console.log('Image name:', image.name)
    console.log('Image type:', image.type)
    console.log('Image size:', image.size)

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]

    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          error:
            `Unsupported image type: ${image.type}. ` +
            'Please use JPG, PNG, WEBP, or GIF.',
        },
        {
          status: 400,
        }
      )
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'Image is larger than 10 MB.',
        },
        {
          status: 400,
        }
      )
    }

    const arrayBuffer = await image.arrayBuffer()

    const base64 =
      Buffer.from(arrayBuffer).toString('base64')

    const dataUrl =
      `data:${image.type};base64,${base64}`

    console.log('Calling OpenAI...')

    const response = await openai.responses.create({
      model: 'gpt-6-luna',

      input: [
        {
          role: 'user',

          content: [
            {
              type: 'input_text',

              text: `
Analyze this meal photo.

Identify each visible food item.

Estimate:
- food name
- serving quantity
- calories
- protein in grams
- carbohydrates in grams
- fat in grams

These are estimates based on the photo.

Return ONLY JSON in exactly this format:

{
  "items": [
    {
      "food_name": "Grilled chicken breast",
      "quantity": "6 oz",
      "calories": 280,
      "protein": 52,
      "carbs": 0,
      "fat": 6
    }
  ]
}
              `,
            },

            {
              type: 'input_image',
              image_url: dataUrl,
              detail: 'auto',
            },
          ],
        },
      ],
    })

    console.log('OpenAI response received')

    const outputText =
      response.output_text?.trim()

    console.log(
      'OpenAI output:',
      outputText
    )

    if (!outputText) {
      return NextResponse.json(
        {
          error: 'OpenAI returned no text output.',
        },
        {
          status: 500,
        }
      )
    }

    let cleaned = outputText
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim()

    let parsed

    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error(
        'Invalid OpenAI JSON:',
        cleaned
      )

      return NextResponse.json(
        {
          error:
            'OpenAI returned text that was not valid JSON.',
          raw:
            cleaned.substring(
              0,
              500
            ),
        },
        {
          status: 500,
        }
      )
    }

    if (!Array.isArray(parsed.items)) {
      return NextResponse.json(
        {
          error:
            'OpenAI response did not include an items array.',
        },
        {
          status: 500,
        }
      )
    }

    const items =
      parsed.items.map(
        (item: any) => ({
          food_name:
            String(
              item.food_name ??
                'Unknown food'
            ),

          quantity:
            String(
              item.quantity ??
                'Estimated portion'
            ),

          calories:
            Number(
              item.calories ?? 0
            ),

          protein:
            Number(
              item.protein ?? 0
            ),

          carbs:
            Number(
              item.carbs ?? 0
            ),

          fat:
            Number(
              item.fat ?? 0
            ),
        })
      )

    return NextResponse.json({
      items,
    })
  } catch (error: any) {
    console.error(
      'ANALYZE FOOD ERROR'
    )

    console.error(error)

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Unknown server error',
      },
      {
        status: 500,
      }
    )
  }
}