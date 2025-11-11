import { NextResponse } from 'next/server'
import { Person } from '@/types/family'
import { generateSystemPrompt } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const { message, person, role } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!person || !role) {
      return NextResponse.json(
        { error: 'Person and role are required' },
        { status: 400 }
      )
    }

    const systemPrompt = generateSystemPrompt(person as Person, role as string)

    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: 'Failed to get response from Mistral', details: errorData },
        { status: res.status }
      )
    }

    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
