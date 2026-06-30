export default function AccountSectionHeader({ headingId, icon: Icon, title }) {
	return (
		<div className="accountSectionHeader">
			<span className="accountSectionIcon" aria-hidden="true">
				<Icon size={18} strokeWidth={2.4} />
			</span>
			<h2 id={headingId}>{title}</h2>
		</div>
	)
}
