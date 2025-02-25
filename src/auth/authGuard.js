/* eslint-disable */
import store from '../store'
import { Role } from '../role'

export const authGuard = (to, from, next) => {
  let roles = store.state.goauth.roles
  const authorize = to.meta.authorize
  if (typeof (roles) === 'string') {
    roles = roles.split(',')
    if (roles !== null) {
      // Check if authorize for all
      if (authorize.length === 0) return next()
      // Check for default authorize in roles
      if (roles.includes(Role.Admin)) return next()
      // Check if authorize is in roles
      if (roles.some(r => authorize.includes(r))) {
        return next()
      }
      // No role matched
      console.log('Not authorized!!!')
      return next(false)
    }
  }
  return next()
}
