# Reform Gatsby Starter

Setup:

1. Clone and setup git for new repo (make sure to remove the old remote if needed)
2. Update all existing packages with `npx npm-check-updates` (feel free to update the starter repository as well)
3. Create a new file called `./github/dependabot.yml`
4. Update `package.json` to include proper metadata for the new project
5. Complete TODO items in `gatsby-config.ts`
6. Add any typography to `src/styles/typography.css`
7. Add any text styles to `src/styles/text.ts`
8. Configure branch protections

## Other resources

### Base dependabot config

```
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    # Look for `package.json` and `lock` files in the `root` directory
    directory: "/"
    # Check the npm registry for updates every day (weekdays)
    schedule:
      interval: "weekly"
```
