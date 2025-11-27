import { useMemo } from 'react'

/**
 * Simple syntax highlighter for JSON/XML with automatic detection
 * Supports dark mode through Tailwind classes
 */
export default function SyntaxHighlight({ code, language = 'auto' }) {
  const { detectedLang, highlighted } = useMemo(() => {
    if (!code || typeof code !== 'string') {
      return { detectedLang: 'text', highlighted: code || '' }
    }

    // Auto-detect language if not specified
    let lang = language
    if (language === 'auto') {
      const trimmed = code.trim()
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        lang = 'json'
      } else if (trimmed.startsWith('<')) {
        lang = 'xml'
      } else {
        lang = 'text'
      }
    }

    // Format JSON
    if (lang === 'json') {
      try {
        const parsed = typeof code === 'string' ? JSON.parse(code) : code
        const formatted = JSON.stringify(parsed, null, 2)
        const html = highlightJSON(formatted)
        return { detectedLang: 'json', highlighted: html }
      } catch (e) {
        return { detectedLang: 'text', highlighted: code }
      }
    }

    // Format XML
    if (lang === 'xml') {
      const html = highlightXML(code)
      return { detectedLang: 'xml', highlighted: html }
    }

    return { detectedLang: 'text', highlighted: code }
  }, [code, language])

  if (detectedLang === 'text') {
    return (
      <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap break-words">
        {highlighted}
      </pre>
    )
  }

  return (
    <pre
      className="text-xs font-mono whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

/**
 * Highlight JSON syntax with colors
 */
function highlightJSON(json) {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-gray-700 dark:text-gray-300' // default
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-blue-600 dark:text-blue-400' // key
          } else {
            cls = 'text-green-600 dark:text-green-400' // string value
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-600 dark:text-purple-400' // boolean
        } else if (/null/.test(match)) {
          cls = 'text-red-600 dark:text-red-400' // null
        } else {
          cls = 'text-orange-600 dark:text-orange-400' // number
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
}

/**
 * Highlight XML syntax with colors
 */
function highlightXML(xml) {
  return xml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /(&lt;\/?[\w\s="/.':;#-\/]+&gt;)/g,
      '<span class="text-blue-600 dark:text-blue-400">$1</span>'
    )
    .replace(
      /([\w-]+)=/g,
      '<span class="text-purple-600 dark:text-purple-400">$1</span>='
    )
    .replace(
      /="([^"]*)"/g,
      '=<span class="text-green-600 dark:text-green-400">"$1"</span>'
    )
}
