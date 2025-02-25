import { ApiService } from './ApiService'

export function UserService () {
  const { ecApi } = ApiService()

  const fetchAllUsers = (params) => {
    const { page, perPage, search, suspicious, referral, method, sortOrder, sortField } = params
    return ecApi('admin', 'getAllUsers', {
      page,
      perPage,
      search,
      suspicious,
      referral,
      method,
      sort: `${sortOrder === 'asc' ? '+' : '-'}${sortField}`
    })
  }

  return { fetchAllUsers }
}
