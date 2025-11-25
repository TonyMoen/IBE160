import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { LyricGenerationResponse } from '@/types/song'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse<LyricGenerationResponse>> {
  try {
    const { concept, genre } = await request.json()

    // Validate inputs
    if (!concept || typeof concept !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CONCEPT',
            message: 'Konsept er påkrevd'
          }
        },
        { status: 400 }
      )
    }

    if (concept.length < 10) {
      return NextResponse.json(
        {
          error: {
            code: 'CONCEPT_TOO_SHORT',
            message: 'Konseptet må være minst 10 tegn'
          }
        },
        { status: 400 }
      )
    }

    if (concept.length > 500) {
      return NextResponse.json(
        {
          error: {
            code: 'CONCEPT_TOO_LONG',
            message: 'Konseptet kan ikke være mer enn 500 tegn'
          }
        },
        { status: 400 }
      )
    }

    if (!genre || typeof genre !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_GENRE',
            message: 'Sjanger er påkrevd'
          }
        },
        { status: 400 }
      )
    }

    // Generate lyrics with GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `Du er en norsk låtskriver som lager autentiske norske tekster i ${genre} stil.
Skriv 4-8 korte verslinjer på norsk bokmål med referanser til norsk kultur og humor.
Ikke bruk anførselstegn eller formatering - bare rene tekstlinjer.
Linjene skal være morsomme, personlige og passe til sjangeren.`
        },
        {
          role: 'user',
          content: `Lag en ${genre} sang om: ${concept}`
        }
      ],
      max_tokens: 200
    })

    const lyrics = completion.choices[0]?.message?.content?.trim() || ''

    if (!lyrics) {
      return NextResponse.json(
        {
          error: {
            code: 'GENERATION_FAILED',
            message: 'Kunne ikke generere tekst. Prøv igjen.'
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: { lyrics }
    })
  } catch (error) {
    console.error('Lyric generation failed:', error)

    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        {
          error: {
            code: 'API_KEY_ERROR',
            message: 'Kunne ikke koble til AI-tjenesten. Vennligst prøv igjen senere.'
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: {
          code: 'GENERATION_FAILED',
          message: 'Kunne ikke generere tekst. Prøv igjen.'
        }
      },
      { status: 500 }
    )
  }
}
