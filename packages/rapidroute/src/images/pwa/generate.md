# to generate the PWA images with:

```bash

npx pwa-asset-generator src/images/pwa/RawLogo.png static --dark-mode --manifest src/images/pwa/manifest.json --index src/images/pwa/index.html --background '#111111' --padding 25%
npx pwa-asset-generator src/images/pwa/RawLogo.png static --manifest src/images/pwa/manifest.json --index src/images/pwa/index.html --background 'white' --padding 25%

```

then copy the values from the manifest.json file to the gatsby-config file and the index.html file to the seo file
