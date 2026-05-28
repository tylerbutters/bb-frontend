import "./BuyPage.css"

export default function BuyPage() {
	return (
		<div className="app buyPage">
			<main className="buyContent" aria-labelledby="buy-heading">
				<h1 id="buy-heading">Buy premium</h1>
				<section className="buyPanel" aria-label="Premium plan">
					<div>
						<h2>Premium</h2>
						<p>Unlimited challenge practice, full stats, and complete history.</p>
					</div>
					<div className="buyPrice">Premium plan</div>
					<p className="buyNotice">Checkout is coming soon.</p>
					<button type="button" className="buyDisabledButton" disabled>
						Buy premium
					</button>
				</section>
			</main>
		</div>
	)
}
