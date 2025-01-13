import { $ } from "bun"

/**
 * update the submodule
 */
const beforeHash = await $`
    cd gatelogue
    git rev-parse HEAD
`.text()
await $`
    cd gatelogue
    git fetch
    git checkout origin/dist
`.text()
const afterHash = await $`
    cd gatelogue
    git rev-parse HEAD
`.text()

/**
 * verify that the submodule is valid
 */
await import("./app/data/validation").catch(async (error) => {
	console.error(
		`gatelogue could not be automatically updated, reverting to ${beforeHash}`,
	)

	// revert to the previous commit
	await $`
        git submodule update --init --recursive
    `.text()

	process.exit(0)
})

if (beforeHash !== afterHash) {
	console.log("gatelogue updated")
} else {
	console.log("gatelogue is up to date")
}
