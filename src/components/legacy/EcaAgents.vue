<template>
  <section class="section">
    <h1 class="title">
      ECA Agents
    </h1>
    <b-field
      grouped
      group-multiline
    >
      <b-select v-model="perPage">
        <option value="15">
          15 per page
        </option>
        <option value="30">
          30 per page
        </option>
        <option value="50">
          50 per page
        </option>
        <option value="100">
          100 per page
        </option>
      </b-select>
      <b-field>
        <b-input
          v-model="search"
          placeholder="Filter..."
          type="search"
          @keyup.enter="loadAsyncData"
        />
      </b-field>
      <b-field>
        <p class="control">
          <button
            class="button is-success"
            @click="addAgent()"
          >
            Add New Agent
          </button>
        </p>
      </b-field>
    </b-field>
    <b-table
      :data="filteredList"
      :loading="loading"
      paginated
      :total="total"
      :per-page="perPage"
      :current-page.sync="page"
    >
      <template #default="props">
        <b-table-column
          field="sub"
          label="Sub"
        >
          {{ props.row.sub }}
        </b-table-column>

        <b-table-column
          field="email"
          label="Email"
        >
          {{ props.row.email }}
        </b-table-column>

        <b-table-column
          field="last_login"
          label="Last Login"
        >
          {{ props.row.last_login }}
        </b-table-column>

        <b-table-column
          v-if="props.row.email !== $store.state.goauth.email"
          label="A"
        >
          <span
            title="Edit agent"
            class="icon has-text-grey cursor"
            @click="editAgent(props.row.email,props.row.roles)"
          ><i class="fa fa-pencil" /></span>
          <span
            title="Delete agent"
            class="icon has-text-grey cursor"
            @click="deleteAgent(props.row.email)"
          ><i class="fa fa-times" /></span>
        </b-table-column>
      </template>
    </b-table>
    <b-modal
      :active.sync="isComponentModalActive"
      has-modal-card
      trap-focus
      :destroy-on-hide="false"
      aria-role="dialog"
      aria-modal
    >
      <div
        class="modal-card"
        style="height:500px;width: auto"
      >
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ formProps.title }}
          </p>
        </header>
        <section class="modal-card-body">
          <b-field label="Email">
            <b-input
              v-model="formProps.email"
              type="email"
              required
            />
          </b-field>
          <b-field label="Roles">
            <b-taginput
              v-model="formProps.roles"
              :data="filteredTags"
              autocomplete
              :allow-new="allowNew"
              :open-on-focus="openOnFocus"
              field="title"
              placeholder="Add a role"
              @typing="getFilteredTags"
            />
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <b-button
            type="is-primary"
            @click="submit"
          >
            Submit
          </b-button>
        </footer>
      </div>
    </b-modal>
  </section>
</template>

<script>
export default {
  name: 'Agents',
  data () {
    return {
      isComponentModalActive: false,
      formProps: {
        title: '',
        email: '',
        roles: ''
      },
      screenWidth: window.innerWidth,
      completedReady: false,
      data: [],
      users: [],
      total: 0,
      loading: false,
      page: 1,
      perPage: 15,
      search: null,
      filteredTags: [],
      isSelectOnly: false,
      allowNew: false,
      openOnFocus: false,
      tagConfigs: [
        {'title': 'Admin NZ', 'role': 'AdminNZ'},
        {'title': 'Compliance NZ', 'role': 'ComplianceNZ'},
        {'title': 'User NZ', 'role': 'UserNZ'},
        {'title': 'Admin AU', 'role': 'AdminAU'},
        {'title': 'Compliance AU', 'role': 'ComplianceAU'},
        {'title': 'User AU', 'role': 'UserAU'},
        {'title': 'Admin NG', 'role': 'AdminNG'},
        {'title': 'Compliance NG', 'role': 'ComplianceNG'},
        {'title': 'User NG', 'role': 'UserNG'},
        {'title': 'Admin ZA', 'role': 'AdminZA'},
        {'title': 'Compliance ZA', 'role': 'ComplianceZA'},
        {'title': 'User ZA', 'role': 'UserZA'},
        {'title': 'Admin BR', 'role': 'AdminBR'},
        {'title': 'Compliance BR', 'role': 'ComplianceBR'},
        {'title': 'User BR', 'role': 'UserBR'}
      ]
    }
  },
  computed: {
    /**
     * Used to filter the list of agents
     * @returns {Array} [u.sub, u.email, u.last_login] - list of agents
     * @returns {Array} this.search - result of search input
     */
    filteredList () {
      return this.users.filter((u) => {
        return !this.search || [u.sub, u.email, u.last_login].join(' ').search(new RegExp(this.search, 'i')) !== -1
      })
    }
  },
  watch: {
    perPage () {
      this.loadAsyncData()
    },
    isComponentModalActive (val) {
      if (val === false) {
        this.clearForm()
      }
    }
  },
  mounted () {
    // call the list when onload
    this.loadAsyncData()
  },
  methods: {
    /**
     * Used to clear the fields when modal is inactive
     * @returns {*}
     */
    clearForm () {
      this.formProps.email = ''
      this.formProps.roles = null
    },
    /**
     * Used to get the filtered list of role tags
     * @param {String} text - input from text field
     * @returns {Array} option.title - label of role tags
     */
    getFilteredTags (text) {
      this.filteredTags = this.tagConfigs.filter((option) => {
        if (!this.formProps.roles.includes(option)) {
          return option.title
            .toString()
            .toLowerCase()
            .indexOf(text.toLowerCase()) >= 0
        }
      })
    },
    /**
     * Used to submit the ECA agent data to the backend
     * @returns {Boolean}
     */
    async submit () {
      try {
        if (this.formProps.email === '' || this.formProps.roles === null) {
          return
        }
        let roles = []
        Object.values(this.formProps.roles).forEach(res => {
          roles.push(res.role)
        })
        let result = await this.ecApi(this.$local.authServer, 'createOrUpdateEcaUser', {
          email: this.formProps.email,
          roles: roles
        })
        if (result === true) {
          this.isComponentModalActive = false
          this.loadAsyncData()
        }
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * Used to load the list of ECA Agents
     * @returns {*}
     */
    async loadAsyncData () {
      this.loading = true
      try {
        let res = await this.ecApi(this.$local.authServer, 'listAllEcaUsers')
        if (res) {
          this.users = res
          this.loading = false
        }
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * Used when to add new agent
     * @returns {*}
     */
    addAgent () {
      this.isComponentModalActive = true
      this.formProps.title = 'Add Agent'
      this.formProps.email = ''
      this.formProps.roles = []
    },
    /**
     * Used when to edit the existing agent
     * @param {String} email - get from the list
     * @param {String} roles - get from the list
     * @returns {*}
     */
    editAgent (email, roles) {
      let roleTags = []
      let roleArr = []
      if (typeof (roles) === 'string') {
        roleArr = roles.split(',')
        roleArr.forEach((item) => {
          roleTags.push({ 'title': this.camelPad(item), 'role': item })
        })
      }
      this.formProps.title = 'Edit Agent'
      this.formProps.email = email
      this.formProps.roles = roleTags
      this.isComponentModalActive = true
    },
    /**
     * Used to convert lower-case to upper-case letters for first letter of word
     * @param {String} str - get from roleArr
     * @returns {*}
     */
    camelPad (str) {
      return str
      // Look for long acronyms and filter out the last letter
        .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
      // Look for lower-case letters followed by upper-case letters
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      // Look for lower-case letters followed by numbers
        .replace(/([a-zA-Z])(\d)/g, '$1 $2')
        .replace(/^./, function (str) {
          return str.toUpperCase()
        })
      // Remove any white space left around the word
        .trim()
    },
    /**
     * Used to delete the agent
     * @param {String} email - get from the list
     * @returns {*}
     */
    deleteAgent (email) {
      this.$buefy.dialog.confirm({
        message: 'Are you sure want to delete this agent?',
        onConfirm: async () => {
          try {
            let res = await this.ecApi(this.$local.authServer, 'deleteEcaUser', {
              email: email
            })
            if (res === true) {
              this.loadAsyncData()
            }
          } catch (e) {
            console.log(e)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
  .tag {
    font-size: 80%;
  }

  .tooltip:after {
    white-space: pre;
  }

  sup {
    padding-left: 2px;
    font-size: 9px;
    color: #aaa;
  }
</style>
