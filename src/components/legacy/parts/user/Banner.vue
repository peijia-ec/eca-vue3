<template>
  <div
    v-if="user"
    style="position:relative;margin:1em 0"
  >
    <b-loading
      :is-full-page="true"
      :active="loading"
    />
    <article
      v-if="user.banner || text"
      class="message is-warning is-small"
    >
      <div class="message-header">
        <p v-if="!text">
          <span class="icon"><i class="fa fa-arrow-down" /></span> User has this banner set <span class="icon"><i class="fa fa-arrow-down" /></span>
        </p>
        <p v-else>
          Add a banner for this user
        </p>
      </div>
      <div class="message-body content">
        <p
          v-if="!text"
          v-html="markdown(user.banner)"
        />
        <b-field v-if="text">
          <b-input
            ref="editor"
            v-model="text"
            type="textarea"
            size="is-small"
          />
        </b-field>
        <p v-if="text">
          <a
            href="https://daringfireball.net/projects/markdown/basics"
            target="_blank"
          >Markdown styling guide
            <span class="icon"><i class="fa fa-external-link" /></span>
          </a>
        </p>
        <div class="buttons">
          <button
            v-if="!text && user.banner"
            class="button is-small"
            @click="edit"
          >
            <span class="icon"><i class="fa fa-pencil" /></span><span>Edit</span>
          </button>
          <button
            v-if="text"
            class="button is-small"
            @click="save"
          >
            <span class="icon"><i class="fa fa-floppy-o" /></span><span>Save</span>
          </button>
          <button
            v-if="text || user.banner"
            class="button is-small"
            @click="del"
          >
            <span class="icon"><i class="fa fa-trash" /></span><span>Delete</span>
          </button>
        </div>
      </div>
    </article>
    <div class="buttons">
      <button
        v-if="!user.banner && !text"
        class="button is-small is-warning is-outlined"
        @click="edit"
      >
        <span class="icon"><i class="fa fa-plus" /></span><span>Add user banner</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserBanner',
  props: ['user'],
  data () {
    return {
      text: null,
      loading: false
    }
  },
  methods: {
    edit () {
      this.text = this.user.banner || `Hi ${this.user.firstName} - `
      setTimeout(() => {
        this.$refs.editor.focus()
      }, 200)
    },
    async set (text) {
      try {
        await this.apiv2('admin', 'setUserBanner', {
          uid: this.user.uid,
          banner: text
        })
        this.$emit('updated')
      } catch (e) {
        console.log(e)
      }
    },
    async save () {
      if (this.loading) {
        return
      }
      this.loading = true
      await this.set(this.text)
      this.text = null
      this.loading = false
    },
    async del () {
      if (this.loading) {
        return
      }
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to delete?',
        onConfirm: async () => {
          this.loading = true
          if (this.user.banner) {
            await this.set(null)
          }
          this.text = null
          this.loading = false
        }
      })
    }
  }
}
</script>
