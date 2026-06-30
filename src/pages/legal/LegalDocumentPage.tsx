import { useEffect, useState } from "react"
import type { ElementType, ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { legalDocuments } from "./legalDocuments"
import "./LegalDocumentPage.css"

type LegalDocumentKey = keyof typeof legalDocuments

function publicDocumentPath(path: string) {
	return `${process.env.PUBLIC_URL || ""}${path}`
}

function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
}

function renderInlineText(text: string): ReactNode[] {
	const parts = text
		.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s)]+)/g)
		.filter(Boolean)

	return parts.map((part: string, index: number) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return <strong key={index}>{part.slice(2, -2)}</strong>
		}

		if (part.startsWith("`") && part.endsWith("`")) {
			return <code key={index}>{part.slice(1, -1)}</code>
		}

		if (part.startsWith("http://") || part.startsWith("https://")) {
			return (
				<a key={index} href={part} rel="noreferrer" target="_blank">
					{part}
				</a>
			)
		}

		return part
	})
}

function createBlocks(markdown: string): LegalBlockData[] {
	const blocks: LegalBlockData[] = []
	const lines = markdown.trim().split("\n")
	let paragraph: string[] = []
	let list: string[] = []

	function flushParagraph() {
		if (paragraph.length === 0) return
		blocks.push({
			type: "paragraph",
			text: paragraph.join(" "),
		})
		paragraph = []
	}

	function flushList() {
		if (list.length === 0) return
		blocks.push({
			type: "list",
			items: list,
		})
		list = []
	}

	lines.forEach((line: string) => {
		const trimmedLine = line.trim()

		if (!trimmedLine) {
			flushParagraph()
			flushList()
			return
		}

		const heading = trimmedLine.match(/^(#{1,3})\s+(.+)$/)
		if (heading) {
			flushParagraph()
			flushList()
			const level = heading[1].length as 1 | 2 | 3
			blocks.push({
				type: "heading",
				level,
				text: heading[2],
			})
			return
		}

		if (trimmedLine.startsWith("- ")) {
			flushParagraph()
			list.push(trimmedLine.slice(2))
			return
		}

		flushList()
		paragraph.push(trimmedLine)
	})

	flushParagraph()
	flushList()

	return blocks
}

interface LegalBlockData {
	type: "paragraph" | "list" | "heading"
	text?: string
	items?: string[]
	level?: 1 | 2 | 3
}

function LegalBlock({ block, documentKey }: { block: LegalBlockData; documentKey: string }) {
	if (block.type === "list") {
		return (
			<ul className="legalList">
				{(block.items || []).map((item, index) => (
					<li key={index}>{renderInlineText(item)}</li>
				))}
			</ul>
		)
	}

	if (block.type === "heading") {
		const Heading = `h${block.level || 2}` as ElementType<{ children: ReactNode; id: string; className: string }>
		const headingText = block.text || ""
		const headingId = block.level === 1 ? `${documentKey}-heading` : slugify(headingText)

		return (
			<Heading id={headingId} className="legalHeading">
				{renderInlineText(headingText)}
			</Heading>
		)
	}

	return <p>{renderInlineText(block.text || "")}</p>
}

export default function LegalDocumentPage({ documentKey }: { documentKey: LegalDocumentKey }) {
	const document = legalDocuments[documentKey]
	const [markdown, setMarkdown] = useState("")
	const [status, setStatus] = useState("loading")

	useEffect(() => {
		if (!document) {
			setMarkdown("")
			setStatus("missing")
			return undefined
		}

		const controller = new AbortController()

		setMarkdown("")
		setStatus("loading")

		fetch(publicDocumentPath(document.path), {
			signal: controller.signal,
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Legal document request failed with ${response.status}`)
				}

				return response.text()
			})
			.then((text) => {
				setMarkdown(text)
				setStatus("ready")
			})
			.catch((error) => {
				if (error.name === "AbortError") return

				setMarkdown("")
				setStatus("error")
			})

		return () => controller.abort()
	}, [document])

	if (!document) return <Navigate to="/" replace />

	const isLoading = status === "loading"
	const hasError = status === "error"

	return (
		<div className="app legalPage">
			<main
				className="legalContent"
				aria-busy={isLoading ? "true" : undefined}
				aria-labelledby={`${documentKey}-heading`}
			>
				{isLoading && <p>Loading legal document...</p>}
				{hasError && <p role="alert">Legal document could not be loaded.</p>}
				{!isLoading &&
					!hasError &&
					createBlocks(markdown).map((block, index) => (
						<LegalBlock block={block} documentKey={documentKey} key={index} />
					))}
			</main>
		</div>
	)
}
