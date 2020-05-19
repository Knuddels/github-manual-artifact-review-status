import { Octokit } from "@octokit/rest";
import { observable, action, autorun } from "mobx";

const localStorageGithubAccessTokenKey = "githubAccessToken";

export class Model {
	private readonly info = getInfo();

	public get reviewMessage(): string {
		return this.info.reviewMessage;
	}

	public get subjectUrl(): string {
		return this.info.subjectUrl;
	}

	@observable private _isTokenViewOpen: boolean = false;
	get isTokenViewOpen() {
		return this._isTokenViewOpen || this.githubAccessToken === undefined;
	}

	@action.bound
	public openTokenInputView() {
		this._isTokenViewOpen = true;
	}

	@action
	public submitTokenInputView(newToken: string) {
		this._isTokenViewOpen = false;
		this.setGithubAccessToken(newToken);
	}

	@observable private editedDescription: string | undefined = undefined;
	public get description(): string {
		if (this.editedDescription !== undefined) {
			return this.editedDescription;
		}
		if (this.state.kind !== "loaded") {
			return "";
		} else {
			return this.state.description;
		}
	}

	public get isDecriptionModified(): boolean {
		return this.editedDescription !== undefined;
	}

	@action
	public setDescription(value: string) {
		this.editedDescription = value;
	}

	@observable private _githubAccessToken: string | undefined;

	get githubAccessToken(): string | undefined {
		return this._githubAccessToken;
	}

	@action
	private setGithubAccessToken(token: string | undefined): void {
		if (token !== undefined) {
			localStorage.setItem(localStorageGithubAccessTokenKey, token);
		} else {
			localStorage.removeItem(localStorageGithubAccessTokenKey);
		}
		this._githubAccessToken = token;
	}

	@observable
	public state: { kind: "noData" } | { kind: "loading" } | GithubState = {
		kind: "noData",
	};

	constructor() {
		const storedGithubAccessToken = localStorage.getItem(
			localStorageGithubAccessTokenKey
		);
		this._githubAccessToken = storedGithubAccessToken || undefined;

		autorun(() => {
			this.update();
		});
	}

	private async update() {
		if (!this.githubAccessToken) {
			this.state = { kind: "noData" };
			return;
		}

		try {
			this.state = { kind: "loading" };

			const o = this.createOctoKit();

			const response = await o.repos.getCombinedStatusForRef({
				owner: this.info.owner,
				repo: this.info.repo,
				ref: this.info.commitSha,
			});

			const currentStatus = response.data.statuses.find(
				(s) => s.context === this.info.context
			);

			if (currentStatus) {
				this.state = {
					kind: "loaded",
					state: currentStatus.state as
						| "pending"
						| "success"
						| "error"
						| "failure",
					description: currentStatus.description,
					targetUrl: currentStatus.target_url,
				};
			} else {
				this.state = {
					kind: "loaded",
					state: undefined,
					description: "",
					targetUrl: undefined,
				};
			}
		} catch (e) {
			console.error(e);
			this.setGithubAccessToken(undefined);
		}
	}

	private createOctoKit() {
		const octokit = new Octokit({
			auth: this.githubAccessToken,
			log: {
				debug: () => {},
				info: () => {},
				warn: console.warn,
				error: console.error,
			},
		});
		return octokit;
	}

	@action.bound
	public async markEnding() {
		await this.postGithubStatus({
			state: "pending",
		});
	}

	@action.bound
	public async markAccepted() {
		await this.postGithubStatus({
			state: "success",
		});
	}

	@action.bound
	public async markReject() {
		await this.postGithubStatus({
			state: "error",
		});
	}

	private async postGithubStatus(args: {
		state: "pending" | "success" | "error" | "failure";
	}): Promise<void> {
		if (this.state.kind !== "loaded") {
			console.log("error, already loading");
			return;
		}
		const s = this.state;
		const octokit = this.createOctoKit();
		const description = this.description;

		this.state = { kind: "loading" };
		await octokit.repos.createStatus({
			owner: this.info.owner,
			repo: this.info.repo,
			state: args.state,
			sha: this.info.commitSha,
			description,
			target_url: s.targetUrl,
			context: this.info.context,
		});
		await this.update();
		this.editedDescription = undefined;
	}
}

interface GithubState {
	kind: "loaded";
	state: "pending" | "success" | "error" | "failure" | undefined;
	description: string;
	targetUrl: string | undefined;
}

interface Info {
	context: string;
	owner: string;
	repo: string;
	commitSha: string;
	subjectUrl: string;
	reviewMessage: string;
}

function getInfo(): Info {
	const searchParams = new URL(window.location.href).searchParams;
	const getQueryParam = (name: string): string => {
		const result = searchParams.get(name);
		if (!result) {
			const str = `Query param ${name} is missing.`;
			alert(str);
			throw new Error(str);
		}
		return result;
	};

	return {
		context: getQueryParam("context"),
		owner: getQueryParam("owner"),
		repo: getQueryParam("repo"),
		commitSha: getQueryParam("commit-sha"),
		subjectUrl: getQueryParam("subject-url"),
		reviewMessage: getQueryParam("review-message"),
	};
}
