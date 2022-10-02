/* eslint-disable import/prefer-default-export */

import { GatsbyNode } from "gatsby"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
  stage,
  loaders,
}) => {
  if (stage === "build-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /canvas|jsdom|fabric/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}
