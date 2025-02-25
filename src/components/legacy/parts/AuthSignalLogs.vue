<template>
  <div style="margin-top: 2rem;">
    <h2 class="title is-size-5">
      AuthSignal Logs
      <b-tooltip
        :label="helpHint"
        multilined
      >
        <i class="fa fa-question-circle-o cursor" />
      </b-tooltip>
    </h2>
    <b-field>
      <b-select
        v-model="selectedState"
        placeholder="Filter by state"
        @input="filterTable"
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </b-select>
    </b-field>
    <b-field v-if="data.length">
      <b-table
        paginated
        :per-page="5"
        :class="{'fit-table': !$root.mobile}"
        :data="data"
        :loading="loading"
      >
        <template #default="props">
          <b-table-column label="Action">
            {{ props.row.actionCode }}
          </b-table-column>
          <b-table-column label="State">
            {{ props.row.state }}
          </b-table-column>
          <b-table-column label="Created">
            {{ props.row.createdAt }}
          </b-table-column>
          <b-table-column label="Link">
            <a
              :href="authUrl(props.row)"
              target="_blank"
            >
              <b-icon icon="link" />
            </a>
          </b-table-column>
        </template>
      </b-table>
    </b-field>
    <b-field v-else>
      <p>No data to display</p>
    </b-field>
  </div>
</template>

<script>
export default {
  name: 'AuthSignalLogs',
  props: {
    uid: String
  },
  data () {
    return {
      data: [],
      loading: false,
      selectedState: null,
      options: [
        { value: 'ALL', label: 'All' },
        { value: 'BLOCK', label: 'Block' },
        { value: 'CHALLENGE_REQUIRED', label: 'Challenge Required' },
        { value: 'CHALLENGE_FAILED', label: 'Challenge Failed' },
        { value: 'REVIEW_REQUIRED', label: 'Review Required' },
        { value: 'REVIEW_FAILED', label: 'Review Failed' }
      ],
      helpHint: 'Only the following state types are shown for this users recent AS logs: \n Block \n Challenge_Required \n Challenge_Failed \n Review_Failed \n Review_Required'
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    async getData () {
      this.loading = true
      try {
        const res = await this.apiv2('api-admin/index', 'user/getUserAuthSignalLogs', {
          uid: this.uid
        })
        this.data = res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    authUrl (row) {
      return `https://portal.authsignal.com/users/${this.uid}/${row.actionCode}/actions/${row.idempotencyKey}`
    },
    async filterTable () {
      await this.getData()
      if (this.selectedState === 'ALL') {
        return
      }
      this.data = this.data.filter((item) => {
        return item.state === this.selectedState
      })
    }
  }
}
</script>

<style scoped>
.b-tooltip.is-multiline:after {
white-space:  pre-line;
}
</style>
