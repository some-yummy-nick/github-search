class View {
	constructor() {
		this.usersList = document.getElementById("js-users-list");
		this.template = document.getElementsByTagName("template");
	}

	createUser(usersData) {
		const clone = this.template[0].content.cloneNode(true);
		let userItem = clone.querySelector(".users__item");
		usersData.forEach(user => {
			userItem = document.importNode(userItem, true);
			let login = userItem.querySelector(".users__login");
			let image = userItem.querySelector(".users__image");
			login.textContent = user["login"];
			image.setAttribute("src", user["avatar_url"]);
			image.setAttribute("alt", user["login"]);
			this.usersList.appendChild(userItem);
		})
	}
}


class Search {
	constructor(view) {
		this.view = view;
		this.input = document.getElementById("js-search-input");
		this.input.addEventListener("keyup", this.searchUsers.bind(this))
	}

	async searchUsers() {
		this.view.usersList.innerHTML = "";
		return await fetch(`https://api.github.com/search/users?q=${this.input.value}`)
			.then(res => {
				if (res.ok) {
					res.json()
						.then(res => {
							this.view.createUser(res.items);
						})
				}
			})
	}
}

new Search(new View());
