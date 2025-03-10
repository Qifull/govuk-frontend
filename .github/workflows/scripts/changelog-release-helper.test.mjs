import fs from 'fs'

import {
  validateVersion,
  updateChangelog,
  generateReleaseNotes
} from './changelog-release-helper.mjs'

jest.mock('fs')

describe('Changelog release helper', () => {
  beforeEach(() => {
    jest.mocked(fs.readFileSync).mockReturnValue(`
    ## Unreleased

    ### Fixes

    Bing bong

    ## v3.0.0 (Breaking release)
  `)
  })

  describe('Validate version', () => {
    it('runs normally if a valid new version is parsed to it', () => {
      expect(() => validateVersion('3.1.0')).not.toThrow()
    })

    it('throws an error if an invalid semver is parsed', () => {
      expect(() => validateVersion('pizza')).toThrow(
        'New version number pizza could not be processed by Semver. Please ensure you are providing a valid semantic version'
      )
    })

    it('throws an error if new version is less than old version', () => {
      expect(() => validateVersion('2.11.0')).toThrow(
        'New version number 2.11.0 is less than or equal to the most recent version (3.0.0). Please provide a newer version number'
      )
    })

    it('throws an error if new version is more than one possible increment', () => {
      const increments = [
        {
          badVersion: '5.0.0',
          type: 'major',
          goodVersion: '4.0.0'
        },
        {
          badVersion: '3.2.0',
          type: 'minor',
          goodVersion: '3.1.0'
        },
        {
          badVersion: '3.0.2',
          type: 'patch',
          goodVersion: '3.0.1'
        }
      ]

      for (const increment of increments) {
        expect(() => validateVersion(increment.badVersion)).toThrow(
          `New version number ${increment.badVersion} is incrementing more than one for its increment type (${increment.type}). Please provide a version number than only increments by one from the current version. In this case, it's likely that your new version number should be: ${increment.goodVersion}`
        )
      }
    })
  })

  describe('Update changelog', () => {
    it('adds a new heading to the changelog for the new version', () => {
      updateChangelog('3.1.0')
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './CHANGELOG.md',
        expect.stringContaining('## v3.1.0 (Feature release)')
      )
    })
  })

  describe('Generate release notes', () => {
    it('writes release notes from the changelog from the Unreleased heading', () => {
      // Pass 'true' here so that the function reads from the 'Unreleased' heading
      generateReleaseNotes(true)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.stringContaining('Bing bong')
      )
    })

    it('writes release notes from the changelog from the last version heading', () => {
      // re-mock the readFileSync return value as if we'd just run
      // updateChangelog and the contents we wanted was between the new and
      // current version headings
      jest.mocked(fs.readFileSync).mockReturnValue(`
        ## Unreleased

        ## v3.1.0 (Feature release)

        ### Fixes

        Bing bong

        ## v3.0.0 (Breaking release)
      `)

      generateReleaseNotes()
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.stringContaining('Bing bong')
      )
    })

    it('increases the heading levels from the changelog by one', () => {
      generateReleaseNotes(true)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.stringContaining('## Fixes')
      )
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './release-notes-body',
        expect.not.stringContaining('### Fixes')
      )
    })
  })
})
