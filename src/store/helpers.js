import moment from 'dayjs'
import duration from 'dayjs/plugin/duration'
moment.extend(duration)

export function getAge (date) {
  date = moment(date)
  if (!date.isValid()) {
    return false
  } // invalid date, force refresh
  return moment.duration(moment().diff(date))
}
