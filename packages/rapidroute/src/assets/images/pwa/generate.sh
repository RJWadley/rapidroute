# to generate the PWA images

# enter this directory
cd "$(dirname "$0")"

# splash screens
npx pwa-asset-generator src/images/pwa/RawLogo.png static --dark-mode --index src/images/pwa/index.html --background '#111111' --padding 25% --xhtml --splash-only
npx pwa-asset-generator src/images/pwa/RawLogo.png static --index src/images/pwa/index.html --background 'white' --padding 25% --xhtml --splash-only

# icons
npx pwa-asset-generator src/images/pwa/Maskable.png static --dark-mode --index src/images/pwa/index.html --background '#111111' --xhtml --icon-only --padding 0%
npx pwa-asset-generator src/images/pwa/Maskable.png static --index src/images/pwa/index.html --background 'white' --xhtml --icon-only --padding 0%

# copy Circle.png, Maskable.png, Circle-192.png, Maskable-192.png to static/icons
cp Circle.png ../../../static/icons
cp Maskable.png ../../../static/icons
cp Circle-192.png ../../../static/icons
cp Maskable-192.png ../../../static/icons

echo "\n\nDone\n\nnow copy the values from the index.html file to the autogenerated tags file\n\n"
