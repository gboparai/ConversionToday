module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  overrides: [
    {
      test: /node_modules[\\/]@jsquash[\\/].*\.js$/,
      plugins: [
        './build-utils/babel-plugin-transform-import-meta-url.js'
      ]
    }
  ]
}
