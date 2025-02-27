import { Role } from '@/role'
import store from '@/store'
import { useRouter } from 'vue-router'

export function useRoleAccess () {
  const router = useRouter()

  const hasAccess = (requires = []) => {
    if (!requires) {
      return true
    } else if (!Array.isArray(requires)) {
      requires = [requires]
    }
    let roles = store.state.goauth.roles
    if (typeof (roles) !== 'string') {
      return false
    }
    roles = roles.split(',')
    if (!roles) {
      // Can't get user roles, no access allowed
      return false
    } else if (roles.includes(Role.Admin)) {
      // Always allow if user has Admin role
      return true
    } else {
      // Check role matched with authorize
      return roles.some(r => requires.includes(r))
    }
  }

  const routeAccess = (routename) => {
    if (!router.hasOwnProperty('options')) {
      return false
    }
    let info = router.options.routes[0].children
    // Find authorize meta for this route
    const index = info.findIndex(x => x.name === routename)
    const authorize = info[index].meta.authorize
    // Skip open-for-all route
    if (authorize.length === 0) {
      return true
    }
    // Else use route roles
    return hasAccess(authorize)
  }

  return { hasAccess, routeAccess }
}
