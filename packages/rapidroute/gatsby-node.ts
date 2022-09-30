/* eslint-disable import/prefer-default-export */

import { GatsbyNode } from "gatsby"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  // node loader
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: "node-loader",
        },
      ],
    },
  })
}
