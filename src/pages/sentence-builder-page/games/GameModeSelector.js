import { useEffect } from "react"

const GAME_MODES = [
	{
		id: "sandbox",
		title: "Sandbox",
		description: "Create any sentence you want.",
	},
	{
		id: "shuffle",
		title: "Shuffle practice",
		description: "Build the correct sentence from shuffled Japanese parts.",
	},
	{
		id: "translate",
		title: "Translate sentence practice",
		description: "Translate the English sentence into Japanese.",
	},
	{
		id: "conjugations",
		title: "Conjugation practice",
		description: "Choose the right conjugation for the sentence.",
	},
	{
		id: "fix sentence",
		title: "Fix sentence practice",
		description: "Find and fix the mistake in the Japanese sentence.",
	},
	{
		id: "particles",
		title: "Particle practice",
		description: "Choose the particle that fits the sentence.",
	},
	{
		id: "reorder",
		title: "Reorder practice",
		description: "Put the sentence elements in the correct order.",
	},
]

export default function GameModeSelector({ selectedGameMode, onSelectGameMode }) {
	const selectedGameModeDetails =
		GAME_MODES.find((gameMode) => gameMode.id === selectedGameMode) || GAME_MODES[0]

	return (
		<>
			<div className="gameTabs" role="tablist" aria-label="Game modes">
				{GAME_MODES.map((gameMode) => (
					<button
						key={gameMode.id}
						type="button"
						role="tab"
						aria-selected={selectedGameMode === gameMode.id}
						className={`gameTab ${selectedGameMode === gameMode.id ? "gameTabSelected" : ""}`}
						onClick={() => onSelectGameMode(gameMode.id)}
					>
						{gameMode.id}
					</button>
				))}
			</div>
			<header className="gameModeDetails">
				<h1>{selectedGameModeDetails.title}</h1>
				<p>{selectedGameModeDetails.description}</p>
			</header>
		</>
	)
}
