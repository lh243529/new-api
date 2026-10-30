/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { describe, expect, test } from 'vitest'

import {
  convertDetectedLanguage,
  INTERFACE_LANGUAGE_OPTIONS,
  normalizeInterfaceLanguage,
} from './languages'

describe('convertDetectedLanguage', () => {
  test('maps browser BCP-47 Chinese tags onto interface codes', () => {
    expect(convertDetectedLanguage('zh-TW')).toBe('zhCN')
    expect(convertDetectedLanguage('zh-HK')).toBe('zhCN')
    expect(convertDetectedLanguage('zh-MO')).toBe('zhCN')
    expect(convertDetectedLanguage('zh-Hant-TW')).toBe('zhCN')
    expect(convertDetectedLanguage('zh')).toBe('zhCN')
    expect(convertDetectedLanguage('zh-CN')).toBe('zhCN')
    expect(convertDetectedLanguage('zh-Hans')).toBe('zhCN')
  })

  test('restores cached Chinese codes as Simplified Chinese', () => {
    expect(convertDetectedLanguage('zhTW')).toBe('zhCN')
    expect(convertDetectedLanguage('zhCN')).toBe('zhCN')
  })

  test('falls back to English for removed non-Chinese languages', () => {
    expect(convertDetectedLanguage('en')).toBe('en')
    expect(convertDetectedLanguage('fr-FR')).toBe('en')
    expect(convertDetectedLanguage('ja')).toBe('en')
  })
})

describe('interface languages', () => {
  test('offers only Simplified Chinese and English', () => {
    expect(INTERFACE_LANGUAGE_OPTIONS.map((language) => language.code)).toEqual(
      ['zhCN', 'en']
    )
  })

  test.each([
    ['zhCN', 'zhCN'],
    ['zh_TW', 'zhCN'],
    [' zh-Hant-TW ', 'zhCN'],
    ['ZH-cn', 'zhCN'],
    ['en-US', 'en'],
    ['fr', 'en'],
    ['ru', 'en'],
    ['ja', 'en'],
    ['vi', 'en'],
    ['invalid', 'en'],
    ['', 'en'],
    [null, 'en'],
    [undefined, 'en'],
  ])('normalizes saved language %s to %s', (value, expected) => {
    expect(normalizeInterfaceLanguage(value)).toBe(expected)
  })
})
