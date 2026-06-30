import { apiRequest } from "./client"
import type { MessageResponse } from "./types"

export async function sendSuggestion({
	suggestion,
}: {
	suggestion: string
}): Promise<MessageResponse> {
	return apiRequest<MessageResponse>("/suggestions", {
		method: "POST",
		body: {
			suggestion,
		},
	})
}
