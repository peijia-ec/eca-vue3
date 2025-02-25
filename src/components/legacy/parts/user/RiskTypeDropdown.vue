<template>
  <div class="ml-2">
    <b-tooltip
      label="Customer risk level"
      type="is-dark"
    >
      <b-dropdown
        aria-role="list"
        @change="selectType"
      >
        <template #trigger>
          <b-button
            :label="RISK_TYPES[riskType].label"
            :type="RISK_TYPES[riskType].type"
            icon-right="chevron-down"
            :loading="loading"
            :class="{ 'orange-btn' : riskType === 'Medium-high'}"
          />
        </template>
        <template v-for="(type, i) in RISK_TYPES">
          <b-dropdown-item
            :key="type + i"
            :value="type.label"
          >
            {{ type.label }}
          </b-dropdown-item>
        </template>
      </b-dropdown>
    </b-tooltip>
  </div>
</template>

<script>
export const RISK_TYPES = {
  'None': {
    label: 'None',
    type: ''
  },
  'Low': {
    label: 'Low',
    type: 'is-success'
  },
  'Medium': {
    label: 'Medium',
    type: 'is-warning'
  },
  'Medium-high': {
    label: 'Medium-high',
    type: ''
  },
  'High': {
    label: 'High',
    type: 'is-danger'
  },
}
export default {
  name: 'RiskTypeDropdown',
  props: {
    riskType: {
      type: String,
      required: true
    },
    uid: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      RISK_TYPES,
      loading: false,
      reason: ''
    }
  },
  methods: {
    async selectType (value) {
      await this.$buefy.dialog.prompt({
        message: 'Please enter your reasoning for changing this users risk level.',
        confirmText: 'Confirm',
        onConfirm: async (reason) => {
          this.loading = true
          try {
            await this.ecApi('admin', 'setValue', {
              uid: this.uid,
              table: 'user',
              column: 'riskType',
              value: value
            })
            await this.ecApi('admin', 'complianceLog', {
              uid: this.uid,
              what: 'Risk Level Changed',
              who: this.$store.getters['goauth/logName'],
              why: `Risk level changed from ${this.riskType} to ${value} - ${reason}`
            })
            this.$emit('updated')
          } catch (e) {
            this.$buefy.toast.open(e)
            console.error(e)
          }
          this.$buefy.toast.open('Done!')
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>

.orange-btn {
  background-color: orange !important;
}

</style>