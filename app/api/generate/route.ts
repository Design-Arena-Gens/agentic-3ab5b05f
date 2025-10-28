import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { topic, targetAudience, keywords, tone, wordCount } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert SEO blog writer. Create a comprehensive, SEO-optimized blog post with the following requirements:

Topic: ${topic}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${keywords.length > 0 ? `SEO Keywords to incorporate naturally: ${keywords.join(', ')}` : ''}
Tone: ${tone}
Target Word Count: ${wordCount} words

Requirements:
1. Write a compelling, SEO-friendly title (H1)
2. Include an engaging introduction that hooks the reader
3. Use proper heading hierarchy (H2, H3) for better SEO
4. Incorporate the keywords naturally throughout the content (avoid keyword stuffing)
5. Include relevant subheadings that break up the content
6. Write in a ${tone} tone
7. Aim for approximately ${wordCount} words
8. Include actionable insights and examples
9. End with a strong conclusion
10. Use HTML formatting: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>

Format the output as proper HTML markup that can be directly rendered. Make it SEO-optimized with:
- Natural keyword placement
- Good content structure
- Scannable formatting
- Valuable information
- Clear headings and subheadings

Generate the complete blog post now:`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    // Calculate metrics
    const wordCountActual = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCountActual / 200) // Average reading speed
    const keywordsUsed = keywords.filter((keyword: string) =>
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length

    return NextResponse.json({
      content,
      metrics: {
        wordCount: wordCountActual,
        readingTime,
        keywordsUsed,
      },
    })
  } catch (error: any) {
    console.error('Error generating blog:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate blog post' },
      { status: 500 }
    )
  }
}
