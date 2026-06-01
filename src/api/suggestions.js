import { apiRequest } from "./client"

export async function sendSuggestion({ suggestion }) {
	return apiRequest("/suggestions", {
		method: "POST",
		body: {
			suggestion,
		},
	})
}
