import dayjs from 'dayjs';

export function dateAsString(d: Date) {
    return dayjs(d).format('YYYY/MM/DD')
}
