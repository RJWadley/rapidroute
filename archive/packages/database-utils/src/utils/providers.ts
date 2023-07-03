import { getItem, removeItem, setItem } from "../config"
import { isProvider, Provider } from "../schema/providers"

/**
 * save a provider to the database
 * @param provider the provider to save
 */
export const setProvider = (provider: Provider) => {
  const key = `providers/${provider.uniqueId}`
  const previous = getProvider(provider.uniqueId)

  // save any manual keys
  const manualKeys = new Set([...(previous?.manualKeys ?? []), "manualKeys"])
  const manualEntries =
    previous && Object.entries(previous).filter(([k]) => manualKeys.has(k))

  // create new provider & restore manual keys
  const newProvider: Provider = {
    ...provider,
    ...Object.fromEntries(manualEntries ?? []),
  }
  setItem(key, newProvider)
}

/**
 * update a provider in the database
 * @param provider the provider to update, may also be partial
 */
export const updateProvider = (provider: Partial<Provider>) => {
  if (!provider.uniqueId) {
    console.error("Cannot update a provider without a uniqueId", provider)
    return
  }

  const previous = getProvider(`providers/${provider.uniqueId}`)
  const newProvider = {
    ...previous,
    ...provider,
  }

  if (isProvider(newProvider)) setProvider(newProvider)
}

/**
 * remove a provider from the database
 * @param providerId the id of the provider to delete
 */
export const removeProvider = (providerId: string) => {
  removeItem(`providers/${providerId}`)
}

/**
 * get a provider from the database
 * @param providerId the id of the provider to get
 * @return the provider, or undefined if it doesn't exist
 */
export const getProvider = (providerId: string) => {
  const key = `providers/${providerId}`
  const provider = getItem(key)

  if (!isProvider(provider)) {
    if (provider) console.warn("Invalid provider", providerId)
    return
  }

  return provider
}
