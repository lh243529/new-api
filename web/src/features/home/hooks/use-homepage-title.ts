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
import { useEffect } from 'react'

import { applyPageTitleToDom, applySystemTitleToDom } from '@/lib/dom-utils'
import { getSystemName } from '@/stores/system-config-store'

/** Keep the homepage SEO title across SPA navigation without changing other pages. */
export function useHomepageTitle() {
  useEffect(() => {
    applySystemTitleToDom(getSystemName())
    return () => applyPageTitleToDom(getSystemName())
  }, [])
}
