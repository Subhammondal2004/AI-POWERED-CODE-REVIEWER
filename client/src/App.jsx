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
  const [upload, setUpload] = useState(false);
  const [removefile, setRemovefile] = useState(true);

  useEffect(() => {
    prism.highlightAll()
  })

  async function reviewCode() {
    setReview('')
    setIsStreaming(true)
    setSuggestedCode('')
    setRemovefile(false)

    const response = await axios.post('http://localhost:3000/ai/get-response', { code })

    streamResponse(response.data)
    setSuggestedCode(extractRecommendedFix(response.data));

    console.log(code);
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

  function extractRecommendedFix(feedbackText) {
    const startMarker = "✅ Recommended Fix:";
    const endMarkerRegex = /(?:💡|✔️|❌|Additional Notes|By addressing|Further Hardening)/;

    const startIndex = feedbackText.indexOf(startMarker);
    if (startIndex === -1) return null;

    // Slice from start marker onward
    const slicedText = feedbackText.slice(startIndex + startMarker.length + 15);

    // Find the end marker
    const endMatch = endMarkerRegex.exec(slicedText);
    const endIndex = endMatch ? endMatch.index : slicedText.length;

    // Extract only the recommended fix section
    return slicedText.slice(0, endIndex-6).trim();
}


  function fixCode() {
    if (suggestedCode) {
      setCode(suggestedCode);
      setSuggestedCode('');
    }
  }

  function uploadFile() {
    setUpload(true);
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post('http://localhost:3000/user/upload-file', formData);
    setCode(res.data.content);
  };


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
        <div className="upload-file">
         { removefile ? <>{upload ? <input type="file" onChange={handleFileChange} />
            : <div onClick={uploadFile} className="upload">Upload File</div>
          }
         </>
          : <>+</>
         }
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
