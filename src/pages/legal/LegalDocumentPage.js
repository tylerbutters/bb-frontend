import { Navigate } from "react-router-dom"
import { legalDocuments } from "./legalDocuments"
import "./LegalDocumentPage.css"

function slugify(text) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
}

function renderInlineText(text) {
	const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g).filter(Boolean)

	return parts.map((part, index) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return <strong key={index}>{part.slice(2, -2)}</strong>
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

function createBlocks(markdown) {
	const blocks = []
	const lines = markdown.trim().split("\n")
	let paragraph = []
	let list = []

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

	lines.forEach((line) => {
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
			blocks.push({
				type: "heading",
				level: heading[1].length,
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

function LegalBlock({ block, documentKey }) {
	if (block.type === "list") {
		return (
			<ul className="legalList">
				{block.items.map((item, index) => (
					<li key={index}>{renderInlineText(item)}</li>
				))}
			</ul>
		)
	}

	if (block.type === "heading") {
		const Heading = `h${block.level}`
		const headingId = block.level === 1 ? `${documentKey}-heading` : slugify(block.text)

		return (
			<Heading id={headingId} className="legalHeading">
				{renderInlineText(block.text)}
			</Heading>
		)
	}

	return <p>{renderInlineText(block.text)}</p>
}

export default function LegalDocumentPage({ documentKey }) {
	const document = legalDocuments[documentKey]

	if (!document) return <Navigate to="/" replace />

	return (
		<div className="app legalPage">
			<main className="legalContent" aria-labelledby={`${documentKey}-heading`}>
				{createBlocks(document).map((block, index) => (
					<LegalBlock block={block} documentKey={documentKey} key={index} />
				))}
			</main>
		</div>
	)
}
