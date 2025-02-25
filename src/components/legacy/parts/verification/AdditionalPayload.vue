<template>
  <div>
    <div
      v-for="row in fields"
      :key="row.field"
      slot="reference"
      class="mb-4"
    >
      <label class="label is-size-7">{{ row.label }}</label>
      <div
        class="control"
        :class="{'has-icons-right': row.warning}"
      >
        <b-select
          v-if="row.field === 'type'"
          v-model="body[row.field]"
          size="is-small"
          @input="handleChangeType"
        >
          <option
            v-for="opt in options"
            :key="opt.type"
            :value="opt.type"
            :label="opt.label"
          />
        </b-select>
        <b-select
          v-else-if="row.field === 'dlState'"
          v-model="body[row.field]"
          size="is-small"
        >
          <option
            v-for="state in dlStates"
            :key="state"
            :value="state"
            :label="state"
          />
        </b-select>
        <div v-else-if="row.field === 'idFront' || row.field === 'idBack'">
          <a
            :href="getFileUrl(body[row.field])"
            class="is-size-7"
            target="_blank"
            title="Click to view full size image"
          >
            <Truncate
              :tooltip="false"
              :length="50"
              :text="getFileUrl(body[row.field])"
            />
          </a>
        </div>
        <input
          v-else
          v-model="body[row.field]"
          class="input is-small"
          :class="{'is-danger': row.warning}"
        >
        <span
          v-if="row.warning"
          class="icon is-small is-right has-text-danger"
        ><i class="fa fa-exclamation-circle" /></span>
      </div>
    </div>
    <button
      class="button"
      :class="{'is-loading': loading}"
      :disabled="loading"
      @click="handleSave"
    >
      Save these fields
    </button>
  </div>
</template>

<script>
import Truncate from '@/components/Truncate.vue'

export default {
  name: 'AdditionalPayload',
  props: {
    uid: String,
    column: String,
    payload: String,
    files: Array
  },
  components: { Truncate },
  data () {
    return {
      localFields: [],
      updatedBody: null,
      loading: false,
      dlStates: [
        'VIC', 'NSW', 'ACT', 'WA', 'SA', 'NT', 'QLD', 'TAS'
      ],
      options: [{
        type: 'passport',
        label: 'Passport'
      }, {
        type: 'au_driver_license',
        label: 'AU Driver License'
      },{
        type: 'nz_driver_license',
        label: 'NZ Driver License'
      }, {
        type: 'au_medicare_card',
        label: 'AU Medicare Card'
      }, {
        type: 'au_health_card',
        label: 'AU Health Card'
      }]
    }
  },
  watch: {
    'body.type': {
      handler () {
        this.fields = this.getDynamicFields()
      },
      immediate: true
    }
  },
  computed: {
    body () {
      try {
        return this.updatedBody || JSON.parse(this.payload)
      } catch (e) {
        return {}
      }
    },
    fields: {
      get () {
        return this.localFields
      },
      set (value) {
        this.localFields = value || this.getDynamicFields()
      }
    }
  },
  methods: {
    handleChangeType () {
      this.fields = this.getDynamicFields()
    },
    getDynamicFields () {
      const arr = [{
        label: 'Type',
        field: 'type',
        required: false,
        warning: false
      }]
      if (this.body.type === 'au_driver_license') {
        arr.push({
          label: 'ID Number',
          field: 'idNumber',
          required: false,
          warning: false
        },{
          label: 'Driver License State',
          field: 'dlState',
          required: false,
          warning: false
        }, {
          label: 'Driver Licence Card Number',
          field: 'dlCardNumber',
          required: false,
          warning: false
        })
      } else if (this.body.type === 'passport') {
        arr.push({
          label: 'ID Number',
          field: 'idNumber',
          required: false,
          warning: false
        }, {
          label: 'ID Expiry date',
          field: 'idExpiry',
          required: false,
          warning: false
        })
      }

      // ID images
      arr.push({
        label: 'ID Front',
        field: 'idFront',
        required: false,
        warning: false
      })
      if (this.body.type.includes('driver_license')) {
        arr.push({
          label: 'ID Back',
          field: 'idBack',
          required: false,
          warning: false
        })
      }
      return arr
    },
    getFileUrl (filePath) {
      return this.files.find(file => file.includes(filePath))
    },
    async handleSave () {
      const data = {
        uid: this.uid,
        table: 'verification',
        [this.column]: JSON.stringify(this.body)
      }
      this.loading = true
      const res = await this.ecApi('admin', 'setValue', data)
      if (res) {
        this.updatedBody = this.body
        this.$buefy.toast.open('Data saved')
        await this.$emit('update')
      } else {
        this.$buefy.toast.open('Error! Please retry :(')
      }
      this.loading = false
    }
  }
}
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>
