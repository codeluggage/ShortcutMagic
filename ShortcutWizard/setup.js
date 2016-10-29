module.exports = {
  // remove the following files as they are mostly
  // related to the sample Shortcuts page and functionality
  remove: [
    { file: 'app/actions/Shortcuts.js' },
    { file: 'app/components/Shortcuts.css' },
    { file: 'app/components/Shortcuts.js' },
    { file: 'app/containers/ShortcutsPage.js' },
    { file: 'app/reducers/Shortcuts.js' },
    { file: 'test/actions/Shortcuts.spec.js' },
    { file: 'test/components/Shortcuts.spec.js' },
    { file: 'test/containers/ShortcutsPage.spec.js' },
    { file: 'test/reducers/Shortcuts.spec.js' },
    { file: 'CHANGELOG.md' },
    { file: 'erb-logo.png' }
  ],
  // clean the following files by either clearing them
  // (by specifying {clear: true}) or by removing lines
  // that match a regex pattern
  clean: [
    {
      file: 'app/reducers/index.js',
      pattern: /Shortcuts/
    },
    {
      file: 'app/store/configureStore.development.js',
      pattern: /ShortcutsActions/
    },
    {
      file: 'app/app.global.css',
      clear: true
    },
    {
      file: 'app/routes.js',
      pattern: /ShortcutsPage/
    },
    {
      file: 'test/e2e.js',
      clear: true
    },
    {
      file: 'README.md',
      clear: true
    },
    {
      file: 'app/components/Home.js',
      pattern: /(h2|Link to)/
    }
  ],
  // add the following files to the project, mostly
  // related to .gitkeep for version control
  add: [
    { file: 'app/actions/.gitkeep' },
    { file: 'test/actions/.gitkeep' },
    { file: 'test/components/.gitkeep' },
    { file: 'test/containers/.gitkeep' },
    { file: 'test/reducers/.gitkeep' }
  ]
};
