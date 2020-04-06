import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'

const createConfig = (input, output, additionnalPlugins = []) => ({
  input,
  output: {
    file: output,
    format: 'cjs'
  },
  plugins: [
    resolve({
      preferBuiltins: true,
      mainFields: ['jsnext']
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    ...additionnalPlugins
  ]
})

export default [
  createConfig('src/index.js', 'lib/index.js'),
  createConfig('src/index.js', 'lib/index.min.js', [uglify()])
]
