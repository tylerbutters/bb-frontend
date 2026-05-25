import { apiRequest } from "./client"

export async function login(credentials) {
	const data = await apiRequest("/login", {
		method: "POST",
		body: credentials,
	})

	return data.user
}
