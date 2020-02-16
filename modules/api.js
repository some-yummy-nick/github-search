const URL = "https://api.github.com/";

export class Api {
	async loadUsers(searchValue, page) {
		return await fetch(`${URL}search/users?q=${searchValue}&page=${page}`);
	}

	async loadUser(login) {
		const urls = [
			`${URL}users/${login}/following`,
			`${URL}users/${login}/followers`,
			`${URL}users/${login}/repos`,
		];
		const requests = urls.map(url => fetch(url));
		return await Promise.all(requests)
			.then(responses => Promise.all(responses.map(r => r.json())))
	}
}
