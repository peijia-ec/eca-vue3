<template>
  <b-table
    :data="data"
    :loading="loading"
  >
    <template #default="props">
      <b-table-column label="Type">
        <Icon
          :type="props.row.fileType"
          classes="has-text-grey-light"
        /> {{ props.row.fileType }}
      </b-table-column>
      <b-table-column label="Links">
        <ul>
          <li
            v-for="(item, index) in props.row.link"
            :key="index"
          >
            <a
              :href="item"
              target="_blank"
            >Link {{ index + 1 }}</a>
          </li>
        </ul>
      </b-table-column>
      <b-table-column label="Date">
        {{ $moment(props.row.date).format('DD/MM/YY') }}
      </b-table-column>
      <b-table-column label="Status">
        <b-tag
          v-if="props.row.processed"
          type="is-success"
          size="is-small"
        >
          <b-icon
            icon="check"
            size="is-small"
          />
          <span>Processed</span>
        </b-tag>
        <b-tag
          v-else-if="props.row.denied"
          type="is-danger"
        >
          <b-icon
            icon="times"
            size="is-small"
          />
          <span>Denied</span>
        </b-tag>
        <p v-else>
          -
        </p>
      </b-table-column>
    </template>
    <template #empty>
      <div class="has-text-centered">
        No records
      </div>
    </template>
  </b-table>
</template>

<script>
import Icon from '../Icon.vue'

export default {
  name: 'DocumentFiles',
  components: {Icon},
  props: {
    uid: {
      default: '',
      type: String
    }
  },
  data () {
    return {
      data: [],
      loading: false
    }
  },
  async created () {
    await this.populateTable()
  },
  methods: {
    async populateTable () {
      this.loading = true
      const record = await this.getVerificationQueue()

      const filteredRecord = record.manual.filter(data => {
        return data.uid === this.uid
      })

      filteredRecord.forEach(data => {
        const sourceFilesIsArray = Array.isArray(data.sourceFiles)

        if (!sourceFilesIsArray) {
          return
        }

        this.data.push({
          fileType: data.type,
          link: data.sourceFiles,
          date: data.created,
          processed: data.processed,
          denied: data.denied
        })
      })

      this.loading = false
    },
    async getVerificationQueue () {
      return this.ecApi('admin', 'getVerificationQueue')
    }
  }
}
</script>
