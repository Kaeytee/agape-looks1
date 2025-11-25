/**
 * Structured Data Component
 * Renders JSON-LD structured data for SEO
 * @module components/seo/structured-data
 */

import * as React from 'react'

interface StructuredDataProps {
  data: Record<string, any>
}

/**
 * StructuredData Component
 * Renders JSON-LD script tag for structured data
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Multiple Structured Data Component
 * Renders multiple JSON-LD scripts
 */
export function MultipleStructuredData({ data }: { data: Record<string, any>[] }) {
  return (
    <>
      {data.map((item, index) => (
        <StructuredData key={index} data={item} />
      ))}
    </>
  )
}
