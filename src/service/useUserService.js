import { useApiService } from './useApiService'

export function useUserService () {
  const { ecApi } = useApiService()

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
