export default function GameModeSelector({ gameModes, selectedGameMode, onSelectGameMode }) {
	const selectedGameModeDetails =
		gameModes.find((gameMode) => gameMode.id === selectedGameMode) || gameModes[0]

	return (
		<>
			<div className="gameTabs" role="tablist" aria-label="Game modes">
				{gameModes.map((gameMode) => (
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
