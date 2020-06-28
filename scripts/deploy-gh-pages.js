const ghpages = require("gh-pages");

ghpages.publish("docs", {
	silent: true,
	dotfiles: true,
	add: true,
	user: {
		name: "Ayanava De",
		email: "ayanavade01@gmail.com"
	},
	repo: `https://${process.env.GH_TOKEN}@github.com/terrible-coder/multivariate_calculus`,
	message: "Deploy to gh-pages"
}, err => {
	if(err !== undefined) {
		console.error(err);
		throw new Error("Something went wrong.");
	} else console.log("Published.");
});