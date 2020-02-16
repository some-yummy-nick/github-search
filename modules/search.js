import { debounce, num2str } from "./helpers.js";

export class Search {
	constructor(api) {
		this.api = api;
		this.currentPage = 1;
		this.usersList = document.getElementById("js-users-list");
		this.user = document.getElementById("js-user");
		this.userLogin = this.user.querySelector(".user__login");
		this.userImage = this.user.querySelector(".user__image");
		this.userBlocks = document.getElementById("js-user-blocks");
		this.usersTemplate = document.getElementById("js-users-template");
		this.blockTemplate = document.getElementById("js-block-template");
		this.listTemplate = document.getElementById("js-list-template");
		this.more = document.getElementById("js-search-more");
		this.message = document.getElementById("js-search-message");
		this.input = document.getElementById("js-search-input");
		this.input.addEventListener("keyup", debounce(this.searchUsers.bind(this), 500));
		this.more.addEventListener("click", this.usersRequest.bind(this));
		this.usersCount = 0;
	}

	createUsers(usersData) {
		const clone = this.usersTemplate.content.cloneNode(true);
		let usersItem = clone.querySelector(".users__item");
		usersData.forEach(user => {
			usersItem = document.importNode(usersItem, true);
			let login = usersItem.querySelector(".users__login");
			let image = usersItem.querySelector(".users__image");
			login.textContent = user["login"];
			image.setAttribute("src", user["avatar_url"]);
			image.setAttribute("alt", user["login"]);
			usersItem.addEventListener("click", () => {
				this.userRequest(user["login"], user["avatar_url"]);
			});
			this.usersList.appendChild(usersItem);
		})
	}

	createUser(login, image, userData) {
		const [following, followers, repos] = userData;
		this.userLogin.textContent = login;
		this.userImage.setAttribute("src", image);
		this.userImage.setAttribute("alt", login);
		this.userBlocks.innerHTML = "";
		this.setUserListHTML("Following", following);
		this.setUserListHTML("Followers", followers);
		this.setUserListHTML("Repos", repos);
		this.user.classList.add("active");
	}

	setUserListHTML(name, data) {
		const clone = this.blockTemplate.content.cloneNode(true);
		let userBlock = clone.querySelector(".user__block");
		let userTitle = userBlock.querySelector(".user__title");
		userTitle.textContent = name;
		let userList = userBlock.querySelector(".user__list");

		data.forEach(item => {
			const cloneList = this.listTemplate.content.cloneNode(true);
			let listItem = cloneList.querySelector(".user__list-item");
			let listLink = listItem.querySelector("a");
			listLink.textContent = item.login || item.name;
			listLink.setAttribute("href", item.html_url);
			userList.appendChild(listItem);
		});

		this.userBlocks.appendChild(userBlock);
	}

	clearUsers() {
		this.usersList.innerHTML = "";
		this.user.classList.remove("active");
		this.message.textContent = "";
		this.userBlocks.innerHTML = "";
		this.userLogin.textContent = "";
		this.userImage.setAttribute("src", "");
		this.userImage.setAttribute("alt", "");
	}

	toggleMore(show) {
		this.more.style.display = show ? "block" : "none";
	}

	setMessage(usersCount) {
		let text = "По вашему запросу пользователей не найдено";
		if (usersCount) {
			const user = num2str(usersCount, ["пользователь", "пользователя", "пользователей"]);
			const find = num2str(usersCount, ["Найден", "Найдено", "Найдено"]);
			text = `${find} ${usersCount} ${user}`;
		}
		this.message.textContent = text;
	}

	searchUsers() {
		this.currentPage = 1;
		this.toggleMore(false);
		this.clearUsers();
		if (this.input.value) {
			this.usersRequest();
		}
	}

	async usersRequest() {
		let totalCount;
		let users;
		const searchValue = this.input.value;
		try {
			await this.api.loadUsers(searchValue, this.currentPage)
				.then(res => {
					this.currentPage++;
					res.json()
						.then(res => {
							users = res.items;
							this.usersCount += users.length;
							totalCount = res.total_count;
							const show = (totalCount > users.length) && (this.usersCount !== totalCount);
							this.toggleMore(show);
							this.createUsers(res.items);
							this.setMessage(totalCount);
						})
				})
		} catch (e) {
			console.log("Error", e);
		}
	}

	async userRequest(login, image) {
		try {
			await this.api.loadUser(login)
				.then(data => {
					this.createUser(login, image, data);
				})
		} catch (e) {
			console.log("Error", e);
		}
	}

}
