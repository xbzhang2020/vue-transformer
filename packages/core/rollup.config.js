import typescript from '@rollup/plugin-typescript'

/**
 * @type { import('rollup').RollupOptions }
 */
const config = {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
  },
  plugins: [typescript()],
}

export default config
