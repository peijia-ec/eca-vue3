<template>
  <div>
    <b-field
      style="max-width: 400px"
      label="Search"
    >
      <b-input
        v-debounce:300="search"
        placeholder="Start typing a user's name, email, or UID"
        :loading="searching"
        @click="clicked"
      />
    </b-field>
    <b-dropdown
      ref="userList"
      v-model="uid"
      :scrollable="false"
      aria-role="list"
      @change="selected"
      @active-change="shown = $event"
    >
      <b-dropdown-item
        v-for="user in users"
        :key="user.id"
        :value="user"
        aria-role="listitem"
      >
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              {{ user.displayName }}<br>{{ user.email }}
            </div>
          </div>
          <div
            class="level-right"
            style="margin-left:10px"
          >
            <div class="level-item has-text-right">
              Last login<br>{{ $moment(user.lastLogin).format('Do MMM YYYY') }}
            </div>
          </div>
        </div>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
export default {
  name: 'FindUser',
  data () {
    return {
      uid: null,
      users: [],
      shown: false,
      searching: false
    }
  },
  methods: {
    selected (value) {
      this.$emit('selected', value)
    },
    clicked () {
      if (this.users.length && !this.shown) {
        this.$refs.userList.toggle()
      }
    },
    async search (value) {
      this.searching = true
      if (!value) {
        this.users = []
        this.$emit('selected', null)
        if (this.shown) {
          this.$refs.userList.toggle()
        }
      } else {
        try {
          let res = await this.apiv2('admin', 'findUser', {search: value.trim()})
          console.log(res)
          this.users = res.users
          if (!this.shown) {
            this.$refs.userList.toggle()
          }
        } catch (e) {
          console.log(e)
        }
      }
      this.searching = false
    }
  }
}
</script>
