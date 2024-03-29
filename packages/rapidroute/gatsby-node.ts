/*  eslint-disable @typescript-eslint/no-unsafe-assignment */
/*  eslint-disable import/prefer-default-export */

import { GatsbyNode } from "gatsby"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
  stage,
  loaders,
}) => {
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /pixi-viewport/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}
