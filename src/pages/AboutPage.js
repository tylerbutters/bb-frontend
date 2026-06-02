import { Link } from "react-router-dom"
import "./AboutPage.css"

const practiceModes = [
	{
		name: "Build",
		description: "Build any Japanese sentence and check it for feedback.",
	},
	{
		name: "Translate",
		description: "Read an English prompt and build the Japanese sentence.",
	},
	{
		name: "Conjugate",
		description: "Choose the verb, adjective, or desu form that fits the sentence.",
	},
	{
		name: "Fix mistakes",
		description: "Start with a Japanese sentence that has one mistake and correct it.",
	},
	{
		name: "Particles",
		description: "Choose the particle that shows each word's role in the sentence.",
	},
	{
		name: "Word order",
		description: "Put the provided sentence elements into the correct order.",
	},
	{
		name: "Random",
		description: "Get a random practice mode when you want mixed review.",
	},
]

export default function AboutPage() {
	return (
		<div className="app aboutPage">
			<main className="aboutContent" aria-labelledby="about-heading">
				<h1 id="about-heading">About Bunsho Builder</h1>
				<section className="aboutIntro" aria-label="Overview">
					<p>
						Bunsho Builder helps Japanese learners practice sentence structure by
						constructing sentences from words, particles, conjugations, counters, and
						punctuation.
					</p>
					<p>
						The goal is to make grammar visible. Instead of only typing an answer, you
						choose the pieces of a sentence, arrange them, and see how each piece changes
						the final Japanese text.
					</p>
				</section>

				<section className="aboutSection" aria-labelledby="about-builder-heading">
					<h2 id="about-builder-heading">How the builder works</h2>
					<ol className="aboutSteps">
						<li>
							Choose a mode from the tabs at the top of the sentence builder.
						</li>
						<li>
							Use the + word buttons to add sentence elements. You can search by
							Japanese, kana, romaji, or English meaning.
						</li>
						<li>
							Click an element to edit its particle, conjugation, counter, prefix, or
							suffix when those options apply.
						</li>
						<li>
							Drag sentence elements to reorder them. In generated practice, locked
							elements keep the exercise focused on the target skill.
						</li>
						<li>
							Read the sentence preview above the workspace. In Build mode, the app
							also shows an English translation when one is available.
						</li>
					</ol>
				</section>

				<section className="aboutSection" aria-labelledby="about-modes-heading">
					<h2 id="about-modes-heading">Practice modes</h2>
					<div className="aboutModeList">
						{practiceModes.map((mode) => (
							<div className="aboutModeItem" key={mode.name}>
								<h3>{mode.name}</h3>
								<p>{mode.description}</p>
							</div>
						))}
					</div>
				</section>

				<section className="aboutSection" aria-labelledby="about-feedback-heading">
					<h2 id="about-feedback-heading">Checking answers</h2>
					<ul className="aboutList">
						<li>Use Check to submit the sentence you built.</li>
						<li>Build checks give feedback without requiring an account.</li>
						<li>Practice checks work without an account. Log in to save results.</li>
						<li>
							If an answer is not quite right, feedback can explain what needs to change.
						</li>
						<li>Use Next or Regenerate to move on to a new prompt.</li>
					</ul>
				</section>

				<section className="aboutSection" aria-labelledby="about-account-heading">
					<h2 id="about-account-heading">Accounts, stats, and history</h2>
					<p>
						An account lets Bunsho Builder save your practice checks, show your accuracy by
						mode and difficulty, and reopen past answers from the history drawer.
					</p>
					<p>
						The stats page groups results across all games and each individual mode, so you
						can see where you are improving and where you may want more review.
					</p>
				</section>

				<section className="aboutSection" aria-labelledby="about-help-heading">
					<h2 id="about-help-heading">Help and suggestions</h2>
					<p>
						If something is confusing, broken, or missing, send a suggestion from the
						suggestions page or email support.
					</p>
					<div className="aboutActions">
						<Link className="aboutActionLink" to="/suggestions">
							Send a suggestion
						</Link>
						<a className="aboutSupportLink" href="mailto:support@bunshobuilder.com">
							support@bunshobuilder.com
						</a>
					</div>
				</section>
			</main>
		</div>
	)
}
