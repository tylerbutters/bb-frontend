import { ElementDetailPanelContent } from "./ElementDetailPanel"
import MenuList from "./MenuList"
import { HIDDEN_PANEL_STYLE } from "./anchoredPanel"

const PUNCTUATION_CATEGORY_TEXT = "Punctuation"

export function PrimaryMenuLayer({
	isOpen,
	layerRef,
	style,
	hasDelete,
	hasSearch,
	menuTitle,
	elementOptions,
	selectedOptionText,
	onDelete,
	onHoverOption,
	onSelectOption,
}) {
	return (
		<MenuLayer
			layerRef={layerRef}
			className={`elementsMenuContainer ${
				isOpen ? "elementsMenuOpen" : "elementsMenuClosing"
			}`}
			style={style}
		>
			<MenuSurface hasDelete={hasDelete} onDelete={onDelete} menuTitle={menuTitle}>
				<MenuList
					hasSearch={hasSearch}
					elementOptions={elementOptions}
					selectedOptionText={selectedOptionText}
					onHoverOption={onHoverOption}
					onSelectOption={onSelectOption}
				/>
			</MenuSurface>
		</MenuLayer>
	)
}

export function SecondaryMenuLayers({
	activeSecondaryMenu,
	activeSubmenuCategoryText,
	detailLayer,
	secondaryLayer,
	secondHasSearch,
	onHoverSecondaryOption,
	onSelectSecondaryOption,
}) {
	if (!activeSecondaryMenu) return null

	const isSubmenu = activeSecondaryMenu.type === "submenu"

	return (
		<>
			<AnchoredMenuLayer
				layer={secondaryLayer}
				menuType={activeSecondaryMenu.type}
			>
				<MenuSurface
					menuTitle={isSubmenu ? activeSecondaryMenu.categoryText : undefined}
				>
					{isSubmenu && (
						<MenuList
							hasSearch={
								activeSubmenuCategoryText === PUNCTUATION_CATEGORY_TEXT
									? false
									: secondHasSearch
							}
							elementOptions={activeSecondaryMenu.elementOptions}
							selectedOptionText={detailLayer.active?.optionText}
							onHoverOption={onHoverSecondaryOption}
							onSelectOption={(option) =>
								onSelectSecondaryOption(option, activeSecondaryMenu.categoryText)
							}
						/>
					)}
					{activeSecondaryMenu.type === "detail" && (
						<ElementDetailPanelContent
							detail={activeSecondaryMenu.detail}
							element={activeSecondaryMenu.element}
						/>
					)}
				</MenuSurface>
			</AnchoredMenuLayer>
			<DetailMenuLayer detailLayer={detailLayer} />
		</>
	)
}

function DetailMenuLayer({ detailLayer }) {
	if (!detailLayer.active) return null

	return (
		<AnchoredMenuLayer
			layer={detailLayer}
			menuType="detail"
			isLayer
		>
			<MenuSurface>
				<ElementDetailPanelContent
					detail={detailLayer.active.detail}
					element={detailLayer.active.element}
				/>
			</MenuSurface>
		</AnchoredMenuLayer>
	)
}

function AnchoredMenuLayer({
	children,
	isLayer = false,
	layer,
	menuType,
}) {
	return (
		<MenuLayer
			layerRef={layer.ref}
			className={getMenuLayerClassName({
				placement: layer.placement,
				type: menuType,
				isLayer,
			})}
			style={layer.style || HIDDEN_PANEL_STYLE}
		>
			{children}
		</MenuLayer>
	)
}

function MenuLayer({
	children,
	className,
	layerRef,
	style,
}) {
	return (
		<div
			ref={layerRef}
			className={className}
			popover="manual"
			style={style || HIDDEN_PANEL_STYLE}
		>
			{children}
		</div>
	)
}

function MenuSurface({
	children,
	hasDelete,
	onDelete,
	menuTitle,
}) {
	return (
		<div className="menuPanel">
			{menuTitle && <div className="elementsMenuTitle">{menuTitle}</div>}
			{children}
			{hasDelete && (
				<div className="deleteElementButtonContainer">
					<button
						type="button"
						className="elementsMenuButton deleteElementButton"
						onClick={onDelete}
					>
						Delete
					</button>
				</div>
			)}
		</div>
	)
}

function getMenuLayerClassName({ placement, type, isLayer = false }) {
	return joinClassNames(
		"flyoutMenuPanel",
		isLayer && "flyoutMenuPanel-layer",
		`flyoutMenuPanel-${placement}`,
		type === "submenu" && "flyoutMenuPanel-submenu",
		type === "detail" && "flyoutMenuPanel-detail",
	)
}

function joinClassNames(...classNames) {
	return classNames.filter(Boolean).join(" ")
}
