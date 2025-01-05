import { isServer } from "app/utils/isBrowser"

export const RAW_WIKI_URL = "https://wiki.minecartrapidtransit.net/"
const withCors = `https://cors.mrtrapidroute.com/?${RAW_WIKI_URL}`
const approvedHosts = ["mrtrapidroute.com", "www.mrtrapidroute.com"]

export const getWikiURL = () => {
	if (isServer) {
		return RAW_WIKI_URL
	}

	if (approvedHosts.includes(window.location.hostname)) {
		return RAW_WIKI_URL
	}

	return withCors
}
