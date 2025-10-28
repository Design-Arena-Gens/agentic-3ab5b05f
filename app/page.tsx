'use client'

import { useState } from 'react'

export default function Home() {
  const [topic, setTopic] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [tone, setTone] = useState('professional')
  const [wordCount, setWordCount] = useState('1000')
  const [loading, setLoading] = useState(false)
  const [blogContent, setBlogContent] = useState('')
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState<any>(null)

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const generateBlog = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setLoading(true)
    setError('')
    setBlogContent('')
    setMetrics(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          targetAudience,
          keywords,
          tone,
          wordCount: parseInt(wordCount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate blog')
      }

      setBlogContent(data.content)
      setMetrics(data.metrics)
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the blog')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(blogContent)
    alert('Blog content copied to clipboard!')
  }

  return (
    <div className="container">
      <div className="header">
        <h1>✍️ SEO Blog Writing Agent</h1>
        <p>Generate SEO-optimized blog posts powered by AI</p>
      </div>

      <div className="main-content">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="topic">Blog Topic *</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How to improve website performance"
            />
          </div>

          <div className="form-group">
            <label htmlFor="audience">Target Audience</label>
            <input
              id="audience"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Web developers, Small business owners"
            />
          </div>

          <div className="form-group">
            <label htmlFor="keywords">SEO Keywords</label>
            <div className="keyword-input">
              <input
                id="keywords"
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder="Enter a keyword and press Enter"
              />
              <button type="button" className="btn btn-secondary" onClick={addKeyword}>
                Add
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="keyword-list">
                {keywords.map((keyword) => (
                  <div key={keyword} className="keyword-tag">
                    {keyword}
                    <button onClick={() => removeKeyword(keyword)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tone">Tone</label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
              <option value="conversational">Conversational</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="wordCount">Target Word Count</label>
            <select
              id="wordCount"
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
            >
              <option value="500">500 words</option>
              <option value="750">750 words</option>
              <option value="1000">1000 words</option>
              <option value="1500">1500 words</option>
              <option value="2000">2000 words</option>
              <option value="2500">2500 words</option>
            </select>
          </div>

          {error && <div className="error">{error}</div>}

          <button
            className="btn btn-primary"
            onClick={generateBlog}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate SEO Blog Post'}
          </button>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Creating your SEO-optimized blog post...</p>
          </div>
        )}

        {blogContent && (
          <div className="result-section">
            {metrics && (
              <div className="seo-metrics">
                <div className="metric-card">
                  <h3>Word Count</h3>
                  <p>{metrics.wordCount}</p>
                </div>
                <div className="metric-card">
                  <h3>Reading Time</h3>
                  <p>{metrics.readingTime} min</p>
                </div>
                <div className="metric-card">
                  <h3>Keywords Used</h3>
                  <p>{metrics.keywordsUsed}</p>
                </div>
              </div>
            )}

            <h2>Generated Blog Post</h2>
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blogContent }}
            />
            <button className="btn copy-btn" onClick={copyToClipboard}>
              📋 Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
