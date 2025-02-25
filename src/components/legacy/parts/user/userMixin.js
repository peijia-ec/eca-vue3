import moment from 'dayjs'

const PTR_GROUP_SIZE = 2
const PTR_TARGET_GROUPS = [0]

export default {
  methods: {
    under18User (birthday) {
      const age = moment().diff(birthday, 'years')
      return age <= 17 ? true : false
    },
    over70User (birthday) {
      const age = moment().diff(birthday, 'years')
      return age >= 70 ? true : false
    },
    getUserW2AGroup (uid) {
      return this.apiv2('api-admin/index', 'user/getUserW2AGroup', { uid })
    },
    ptrUserGroup (affiliateId) {
      const userTestGroup = affiliateId % PTR_GROUP_SIZE
      return PTR_TARGET_GROUPS.includes(userTestGroup)
    }
  }
}
