import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import prism from "prismjs"
import Editor from "react-simple-code-editor"
import axios from "axios"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import './App.css'

function App() {
  const [code, setCode] = useState(``)
  const [review, setReview] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    prism.highlightAll()
  })

  async function reviewCode() {
    setReview('')
    setIsStreaming(true)

    const response = await axios.post('http://localhost:3000/ai/get-response', { code })

    streamResponse(response.data)
  }

  //function to print the response word by word like openai.
  function streamResponse(fullText) {
    const words = fullText.split(' ')
    let index = 0

    const interval = setInterval(() => {
      setReview(prev => prev + (index > 0 ? ' ' : '') + words[index])
      index++

      if (index >= words.length-1) {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 50)
  }

  return (
    <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={code => prism.highlight(code, prism.languages.javascript, 'javascript')}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              border: "1px solid #ddd",
              borderRadius: "5px",
              height: "100%",
              width: "100%",
            }}
          />
        </div>
        <div onClick={reviewCode} className="review">
          Review
        </div>
      </div>
      <div className="right">
        {isStreaming && <div className="typing">AI is typing...</div>}
        <Markdown remarkPlugins={[rehypeHighlight]}>
          {review}
        </Markdown>
      </div>
    </main>
  )
}

export default App
