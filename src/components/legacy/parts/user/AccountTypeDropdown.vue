<template>
  <div>
    <b-tooltip
      label="Account Type"
      type="is-dark"
    >
      <b-dropdown
        aria-role="list"
        @change="selectType"
      >
        <template #trigger>
          <b-button
            :label="ACCOUNT_TYPES[accountType].label"
            :type="ACCOUNT_TYPES[accountType].type"
            :icon-left="ACCOUNT_TYPES[accountType].iconLeft"
            icon-right="chevron-down"
            :loading="loading"
          />
        </template>
        <template v-for="(t, i) in ACCOUNT_TYPES">
          <b-dropdown-item
            :key="t.id"
            :value="t.id"
          >
            <b-icon :icon="ACCOUNT_TYPES[i].iconLeft" />
            <b-icon
              v-if="t.id === 3"
              icon="user"
            />
            {{ ACCOUNT_TYPES[i].label }}
          </b-dropdown-item>
        </template>
      </b-dropdown>
    </b-tooltip>
  </div>
</template>

<script>
export const ACCOUNT_TYPES = {
  1: {
    id: 1,
    label: 'Individual Account',
    type: '',
    iconLeft: 'user'
  },
  2: {
    id: 2,
    label: 'Company Account',
    type: 'is-info',
    iconLeft: 'briefcase'
  },
  3: {
    id: 3,
    label: 'Hybrid Account',
    type: 'is-success',
    iconLeft: 'briefcase'
  },
  4: {
    id: 4,
    label: 'Sole Trader',
    type: 'is-warning',
    iconLeft: 'user'
  }
}

export default {
  props: {
    accountType: {
      type: Number,
      required: true
    },
    uid: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      ACCOUNT_TYPES,
      loading: false
    }
  },
  methods: {
    async selectType (value) {
      this.loading = true
      try {
        await this.ecApi('admin', 'setValue', {
          uid: this.uid,
          table: 'user',
          column: 'accountType',
          value: value
        })
        this.loading = false
        this.$buefy.toast.open('Done!')
      } catch (e) {
        console.error(e)
      }
      this.$emit('updated')
    }
  }
}
</script>