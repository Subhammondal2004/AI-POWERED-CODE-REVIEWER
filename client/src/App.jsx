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
  const [code, setCode] = useState(``);
  const [review, setReview] = useState(``);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState(``);

  useEffect(() => {
    prism.highlightAll()
  })

  async function reviewCode() {
    setReview('')
    setIsStreaming(true)
    setSuggestedCode('')

    const response = await axios.post('http://localhost:3000/ai/get-response', { code })

    streamResponse(response.data)
    setSuggestedCode(extractFixedCode(response.data));
  }

  //function to print the response word by word like openai.
  function streamResponse(fullText) {
    const words = fullText.split(' ')
    let index = 0

    const interval = setInterval(() => {
      setReview(prev => prev + (index > 0 ? ' ' : '') + words[index])
      index++

      if (index >= words.length - 1) {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 50)
  }

  function extractFixedCode(reviewResponse) {
    // Look for code between the "Recommended Fix:" section and the next section
    const recommendedFixPattern = /✅\s*Recommended\s*Fix:[\s\S]*?```(?:javascript|js)?\s*([\s\S]*?)```/i;

    const match = reviewResponse.match(recommendedFixPattern);

    if (match && match[1]) {
      return match[1].trim();
    }
    return "";
  }

  function fixCode() {
    if (suggestedCode) {
      setCode(suggestedCode);
      setSuggestedCode('');
    }
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
              minHeight: "100%",
              width: "100%",
            }}
          />
        </div>
        <div onClick={reviewCode} className="review">
          Review
        </div>
        {suggestedCode ? <div onClick={fixCode} className="fix">
          Apply Fix
        </div>
          : ''
        }
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
