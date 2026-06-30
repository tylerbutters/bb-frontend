import "./GameModeSelector.css"

const GAME_MODES = [
	{
		id: "sandbox",
		label: "Build",
		title: "Build",
		description: "Create any sentence you want.",
	},
	{
		id: "translate",
		label: "Translate",
		title: "Translate",
		description: "Translate the English sentence into Japanese.",
	},
	{
		id: "conjugations",
		label: "Conjugate",
		title: "Conjugate",
		description: "Choose the right conjugation for the sentence.",
	},
	{
		id: "fix sentence",
		label: "Fix mistakes",
		title: "Fix mistakes",
		description: "Find and fix the mistakes in the Japanese sentence.",
	},
	{
		id: "particles",
		label: "Particles",
		title: "Particles",
		description: "Choose the particle that fits the sentence.",
	},
	{
		id: "reorder",
		label: "Word order",
		title: "Word order",
		description: "Put the sentence elements in the correct order.",
	},
	{
		id: "shuffle",
		label: "Random",
		title: "Random",
		description: "Get a random practice mode when you want mixed review.",
	},
]

export default function GameModeSelector({
	selectedGameMode,
	generatedGameMode,
	onSelectGameMode,
}) {
	const displayGameMode =
		selectedGameMode === "shuffle" && generatedGameMode ? generatedGameMode : selectedGameMode
	const selectedGameModeDetails =
		GAME_MODES.find((gameMode) => gameMode.id === displayGameMode) || GAME_MODES[0]

	return (
		<>
			<div className="gameTabsBar">
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
							{gameMode.label}
						</button>
					))}
				</div>
			</div>
			<header className="gameModeDetails">
				{selectedGameModeDetails.title && <h1>{selectedGameModeDetails.title}</h1>}
				{selectedGameModeDetails.description && <p>{selectedGameModeDetails.description}</p>}
			</header>
		</>
	)
}
