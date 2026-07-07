import React from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null

  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g)

  const renderTextWithInlineFormatting = (text: string) => {
    // Bold: **text** -> strong
    // Italic: *text* -> em
    // Inline code: `code` -> code
    const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
    const splitText = text.split(tokenRegex)

    return splitText.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-gray-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-gray-800 dark:text-gray-200">
            {part.slice(1, -1)}
          </em>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="bg-gray-200 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-xs font-mono"
          >
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
      {parts.map((part, partIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.split('\n')
          const language = lines[0].slice(3).trim()
          const code = lines.slice(1, -1).join('\n')
          return (
            <pre
              key={partIdx}
              className="bg-gray-950 text-gray-100 p-3 rounded-lg overflow-x-auto font-mono text-xs my-3 border border-gray-800"
            >
              {language && (
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-sans mb-1 border-b border-gray-800 pb-1 font-semibold">
                  {language}
                </div>
              )}
              <code>{code}</code>
            </pre>
          )
        }

        // Processing regular paragraph lines
        const lines = part.split('\n')
        let inList = false
        const elements: React.ReactNode[] = []
        let currentListItems: React.ReactNode[] = []

        lines.forEach((line, lineIdx) => {
          const trimmed = line.trim()

          // Headers
          if (trimmed.startsWith('### ')) {
            if (inList) {
              elements.push(
                <ul key={`list-${lineIdx}`} className="list-disc list-inside ml-4 space-y-1 my-2">
                  {...currentListItems}
                </ul>
              )
              currentListItems = []
              inList = false
            }
            elements.push(
              <h4 key={lineIdx} className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1">
                {renderTextWithInlineFormatting(trimmed.substring(4))}
              </h4>
            )
          } else if (trimmed.startsWith('## ')) {
            if (inList) {
              elements.push(
                <ul key={`list-${lineIdx}`} className="list-disc list-inside ml-4 space-y-1 my-2">
                  {...currentListItems}
                </ul>
              )
              currentListItems = []
              inList = false
            }
            elements.push(
              <h3 key={lineIdx} className="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2">
                {renderTextWithInlineFormatting(trimmed.substring(3))}
              </h3>
            )
          } else if (trimmed.startsWith('# ')) {
            if (inList) {
              elements.push(
                <ul key={`list-${lineIdx}`} className="list-disc list-inside ml-4 space-y-1 my-2">
                  {...currentListItems}
                </ul>
              )
              currentListItems = []
              inList = false
            }
            elements.push(
              <h2 key={lineIdx} className="text-lg font-bold text-gray-900 dark:text-white mt-5 mb-2">
                {renderTextWithInlineFormatting(trimmed.substring(2))}
              </h2>
            )
          }
          // Bullet list items
          else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            inList = true
            currentListItems.push(
              <li key={lineIdx} className="text-gray-700 dark:text-gray-300">
                {renderTextWithInlineFormatting(trimmed.substring(2))}
              </li>
            )
          }
          // Empty line
          else if (trimmed === '') {
            if (inList) {
              elements.push(
                <ul key={`list-${lineIdx}`} className="list-disc list-inside ml-4 space-y-1 my-2">
                  {...currentListItems}
                </ul>
              )
              currentListItems = []
              inList = false
            }
          }
          // Normal text line
          else {
            if (inList) {
              elements.push(
                <ul key={`list-${lineIdx}`} className="list-disc list-inside ml-4 space-y-1 my-2">
                  {...currentListItems}
                </ul>
              )
              currentListItems = []
              inList = false
            }
            elements.push(
              <p key={lineIdx} className="text-gray-800 dark:text-gray-200 min-h-[0.5rem]">
                {renderTextWithInlineFormatting(line)}
              </p>
            )
          }
        })

        // Clean up remaining list
        if (inList && currentListItems.length > 0) {
          elements.push(
            <ul key={`list-end-${partIdx}`} className="list-disc list-inside ml-4 space-y-1 my-2">
              {...currentListItems}
            </ul>
          )
        }

        return <React.Fragment key={partIdx}>{elements}</React.Fragment>
      })}
    </div>
  )
}
