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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { handleServerError } from '@/lib/handle-server-error'
import { requireServerSuccess } from '@/lib/server-error-message'

import { updateApiKeyGroup } from '../api'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import type { ApiKey } from '../types'
import { ApiKeyGroupCell } from './api-key-group-cell'
import {
  ApiKeyGroupCombobox,
  type ApiKeyGroupOption,
} from './api-key-group-combobox'
import type { GroupRatio } from './auto-group-visuals'

type ApiKeyGroupSelectorProps = {
  apiKey: ApiKey
  options: ApiKeyGroupOption[]
  disabled: boolean
  ratio?: GroupRatio
  shouldReduceMotion: boolean
}

export function ApiKeyGroupSelector(props: ApiKeyGroupSelectorProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currentGroup = props.apiKey.group || ''
  const mutation = useMutation({
    mutationFn: async (group: string) => {
      const result = requireServerSuccess(
        await updateApiKeyGroup(props.apiKey.id, group)
      )
      if (!result.data) throw new Error(t(ERROR_MESSAGES.UPDATE_FAILED))
      return result.data
    },
    onSuccess: (updated) => {
      queryClient.setQueriesData<{ items: ApiKey[]; total: number }>(
        { queryKey: ['keys'] },
        (previous) =>
          previous && {
            ...previous,
            items: previous.items.map((key) =>
              key.id === updated.id ? updated : key
            ),
          }
      )
      queryClient.setQueryData(['api-key', updated.id], {
        success: true,
        data: updated,
      })
      void queryClient.invalidateQueries({ queryKey: ['keys'] })
      toast.success(t(SUCCESS_MESSAGES.API_KEY_UPDATED))
    },
    onError: (error) =>
      handleServerError(error, t(ERROR_MESSAGES.UPDATE_FAILED)),
  })

  return (
    <ApiKeyGroupCombobox
      options={props.options}
      value={currentGroup}
      variant='cell'
      disabled={props.disabled || mutation.isPending}
      aria-label={t('Change group for {{name}}', { name: props.apiKey.name })}
      onValueChange={(group) => {
        if (group !== currentGroup && !mutation.isPending) {
          mutation.mutate(group)
        }
      }}
      triggerContent={
        <ApiKeyGroupCell
          group={currentGroup}
          ratio={props.ratio}
          crossGroupRetry={props.apiKey.cross_group_retry}
          shouldReduceMotion={props.shouldReduceMotion}
          asContent
        />
      }
    />
  )
}
