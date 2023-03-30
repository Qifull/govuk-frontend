import { join } from 'path'

import gulp from 'gulp'

import { paths } from '../../config/index.js'
import { configs, files, scripts, styles, task } from '../index.mjs'

/**
 * Build package task
 * Prepare package folder for publishing
 */
export default gulp.series(
  task.name('clean', () =>
    files.clean('**/*', {
      destPath: paths.package,
      ignore: [
        '**/package.json',
        '**/README.md'
      ]
    })
  ),

  // Copy GOV.UK Frontend template files
  task.name('copy:templates', () =>
    files.copy('**/*.{md,njk}', {
      srcPath: join(paths.src, 'govuk'),
      destPath: join(paths.package, 'govuk'),

      // Preserve paths.package README when copying to ./package
      // https://github.com/alphagov/govuk-frontend/tree/main/package#readme
      ignore: ['**/govuk/README.md']
    })
  ),

  // Copy GOV.UK Frontend static assets
  task.name('copy:assets', () =>
    files.copy('**/*', {
      srcPath: join(paths.src, 'govuk/assets'),
      destPath: join(paths.package, 'govuk/assets')
    })
  ),

  // Generate GOV.UK Frontend fixtures.json from ${componentName}.yaml
  task.name('copy:fixtures', () =>
    files.generateFixtures({
      srcPath: paths.src,
      destPath: paths.package
    })
  ),

  // Generate GOV.UK Frontend macro-options.json from ${componentName}.yaml
  task.name('copy:macro-options', () =>
    files.generateMacroOptions({
      srcPath: paths.src,
      destPath: paths.package
    })
  ),

  // Copy GOV.UK Frontend JavaScript (ES modules)
  task.name('copy:mjs', () =>
    files.copy('**/!(*.test).mjs', {
      srcPath: join(paths.src, 'govuk'),
      destPath: join(paths.package, 'govuk-esm')
    })
  ),

  // Compile GOV.UK Frontend JavaScript (AMD modules)
  task.name('compile:js', () =>
    scripts.compile('**/!(*.test).mjs', {
      srcPath: join(paths.src, 'govuk'),
      destPath: join(paths.package, 'govuk'),

      filePath (file) {
        return join(file.dir, `${file.name}.js`)
      }
    })
  ),

  // Apply CSS prefixes to GOV.UK Frontend Sass
  task.name('compile:scss', () =>
    styles.compile('**/*.scss', {
      srcPath: join(paths.src, 'govuk'),
      destPath: join(paths.package, 'govuk'),

      filePath (file) {
        return join(file.dir, `${file.name}.scss`)
      }
    })
  ),

  // Apply CSS prefixes to GOV.UK Prototype Kit Sass
  task.name("compile:scss 'govuk-prototype-kit'", () =>
    styles.compile('init.scss', {
      srcPath: join(paths.src, 'govuk-prototype-kit'),
      destPath: join(paths.package, 'govuk-prototype-kit'),

      filePath (file) {
        return join(file.dir, `${file.name}.scss`)
      }
    })
  ),

  // Compile GOV.UK Prototype Kit config
  task.name("compile:js 'govuk-prototype-kit'", () =>
    configs.compile('govuk-prototype-kit.config.mjs', {
      srcPath: join(paths.src, 'govuk-prototype-kit'),
      destPath: paths.package,

      filePath (file) {
        return join(file.dir, `${file.name}.json`)
      }
    })
  ),

  // Copy GOV.UK Prototype Kit JavaScript
  task.name("copy:files 'govuk-prototype-kit'", () =>
    files.copy('**/*.js', {
      srcPath: join(paths.src, 'govuk-prototype-kit'),
      destPath: join(paths.package, 'govuk-prototype-kit')
    })
  )
)