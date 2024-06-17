import { withPigment } from "@pigment-css/nextjs-plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withPigment(nextConfig, {
    
        theme: {
          colors: {
            primary: 'tomato',
            secondary: 'cyan',
          },
          spacing: {
            unit: 8,
          },
          typography: {
            fontFamily: 'Inter, sans-serif',
          },
        },
      
})
