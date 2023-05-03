import { type FilterFormValues, filtrableTimeRangePreset } from '#data/filters'
import { ToggleButtons } from '@commercelayer/app-elements-hook-form'
import { useFormContext } from 'react-hook-form'
import { getTimeRangePresetName } from '#data/dictionaries'
import { getTimeRangeCustomLabel } from '#data/filtersTimeUtils'
import { useTokenProvider } from '@commercelayer/app-elements'

export function FilterFieldTimePreset(): JSX.Element {
  const {
    settings: { timezone }
  } = useTokenProvider()
  const { watch } = useFormContext<FilterFormValues>()
  const timeFrom = watch('timeFrom')
  const timeTo = watch('timeTo')

  return (
    <ToggleButtons
      label='Time Range'
      name='timePreset'
      mode='single'
      options={filtrableTimeRangePreset.map((option) => {
        const label =
          option === 'custom' && timeFrom != null && timeTo != null
            ? getTimeRangeCustomLabel(timeFrom, timeTo, timezone)
            : getTimeRangePresetName(option)
        return {
          label,
          value: option
        }
      })}
    />
  )
}