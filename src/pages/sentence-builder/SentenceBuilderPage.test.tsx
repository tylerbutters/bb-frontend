import { getGeneratedPromptWorkspacePermissions } from "./SentenceBuilderPage"

describe("getGeneratedPromptWorkspacePermissions", () => {
	test("lets fix sentence prompts edit generated sentence structure", () => {
		expect(
			getGeneratedPromptWorkspacePermissions({
				generatedElementMode: "fix sentence",
				hasGeneratedPromptElements: true,
			}),
		).toEqual({
			canAddElements: true,
			canDragGeneratedElements: true,
		})
	})

	test("keeps narrower generated modes structurally locked", () => {
		expect(
			getGeneratedPromptWorkspacePermissions({
				generatedElementMode: "particles",
				hasGeneratedPromptElements: true,
			}),
		).toEqual({
			canAddElements: false,
			canDragGeneratedElements: false,
		})
	})

	test("still allows normal editing when there is no generated prompt sentence", () => {
		expect(
			getGeneratedPromptWorkspacePermissions({
				generatedElementMode: null,
				hasGeneratedPromptElements: false,
			}),
		).toEqual({
			canAddElements: true,
			canDragGeneratedElements: false,
		})
	})
})
