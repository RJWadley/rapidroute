interface Config {
  setItem?: (key: string, value: unknown) => void
  getItem?: (key: string) => unknown
  updateItem?: (key: string, value: unknown) => void
  removeItem?: (key: string) => void
}

const config: Config = {}

const throwError = () => {
  throw new Error("database hasn't been configured to complete this operation")
}

export const setConfig = (newConfig: Config) => {
  Object.assign(config, newConfig)
}

export const setItem = (key: string, value: unknown) => {
  config.setItem ? config.setItem(key, value) : throwError()
}

export const getItem = (key: string) => {
  return config.getItem ? config.getItem(key) : throwError()
}

export const updateItem = (key: string, value: unknown) => {
  config.updateItem ? config.updateItem(key, value) : throwError()
}

export const removeItem = (key: string) => {
  config.removeItem ? config.removeItem(key) : throwError()
}
