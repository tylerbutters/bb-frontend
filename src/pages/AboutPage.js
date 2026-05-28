import { Link } from "react-router-dom"
import "./TopRightButton.css"
import "./AboutPage.css"

export default function AboutPage() {
	return (
		<div className="app aboutPage">
			<Link className="topRightButton" to="/">
				Back
			</Link>

			<main className="aboutContent" aria-labelledby="about-heading">
				<h1 id="about-heading">About Bunsho Builder</h1>
				<p>
					Bunsho Builder helps Japanese learners practice sentence structure by building
					sentences from words, particles, conjugations, and punctuation.
				</p>
				<p>
					Use sandbox mode to experiment freely, or switch into practice modes for prompts
					that focus on translation, conjugations, particles, sentence fixes, and word order.
				</p>
				<p>
					For support, email{" "}
					<a href="mailto:support@bunshobuilder.com">support@bunshobuilder.com</a>.
				</p>
			</main>
		</div>
	)
}
