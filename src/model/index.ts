import { Octokit } from "@octokit/rest";

export class Model {
	private readonly info = getInfo();

	public get reviewMessage(): string {
		return this.info.reviewMessage;
	}

	public get subjectUrl(): string {
		return this.info.subjectUrl;
	}

	private targetUrl: string | undefined = undefined;

	constructor() {
		this.init();
	}

	private createOctoKit() {
		const octokit = new Octokit({
			auth: this.info.token,
			log: {
				debug: () => {},
				info: () => {},
				warn: console.warn,
				error: console.error,
			},
		});
		return octokit;
	}

	private async init() {
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
			this.targetUrl = currentStatus.target_url;
		}
	}

	public async accept() {
		await this.postGithubStatus({
			state: "accept",
		});
	}

	public async reject() {
		await this.postGithubStatus({
			state: "reject",
		});
	}

	private async postGithubStatus(args: {
		state: "accept" | "reject";
		description?: string;
	}): Promise<void> {
		const octokit = this.createOctoKit();

		await octokit.repos.createStatus({
			owner: this.info.owner,
			repo: this.info.repo,
			state: args.state === "accept" ? "success" : "error",
			sha: this.info.commitSha,
			description: args.description,
			target_url: this.targetUrl,
			context: this.info.context,
		});
	}
}

interface Info {
	context: string;
	owner: string;
	repo: string;
	token: string;
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
		token: getQueryParam("token"),
		commitSha: getQueryParam("commit-sha"),
		subjectUrl: getQueryParam("subject-url"),
		reviewMessage: getQueryParam("review-message"),
	};
}
