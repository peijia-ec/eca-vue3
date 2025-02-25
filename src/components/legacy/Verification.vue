<template>
  <section class="section">
    <b-button
      v-if="user || user2"
      style="margin-bottom: 1em"
      label="Back"
      type="is-warning"
      icon-left="chevron-left"
      :disabled="!user && !user2"
      @click="resetUser"
    />

    <b-tabs
      v-if="!user && !user2"
      v-model="activeTab"
      type="is-boxed"
      @input="changeTab"
    >
      <b-tab-item
        icon="id-card"
        label="Registration"
        value="verification"
      />
      <b-tab-item
        icon="level-up"
        label="Upgrade"
        value="upgrade"
      />
      <b-tab-item
        icon="pie-chart"
        label="Statistics"
        value="statistics"
      />
    </b-tabs>
    <div
      v-if="!user && activeTab === 'verification'"
      class="search-container"
    >
      <b-field
        grouped
        group-multiline
      >
        <div class="control">
          <input
            v-model="filter"
            type="search"
            placeholder="Filter list"
            class="input"
          >
        </div>
        <div class="control">
          <button
            class="button"
            @click="loadQueue"
          >
            Refresh
          </button>
        </div>
        <div class="control">
          <b-switch
            v-model="isDisabled"
            style="padding-top:10px;"
          >
            Disable Verification Checklist
          </b-switch>
        </div>
      </b-field>
    </div>
    <b-table
      key="registration-table"
      class="clickable"
      :data="filteredList"
      :selected.sync="user"
      :mobile-cards="false"
      :paginated="true"
      :per-page="12"
      :loading="loadVerifications"
      :style="`display: ${!user && activeTab === 'verification' ? 'block' : 'none'}`"
      :default-sort="$local.countryCode === 'AU' ? ['created'] : ''"
      :default-sort-direction="$local.countryCode === 'AU' ? 'desc' : ''"
    >
      <template #default="props">
        <b-table-column label="Live Agent">
          <div
            v-for="realtime in realtimes"
            :key="realtime. data_id"
          >
            <figure
              v-if="realtime.data_id === props.row.id && realtime.status===1 && realtime.module === 'Verification' && realtime.sub_module ==='New Manual'"
              class="image is-32x32"
            >
              <img
                :src="realtime.admin_url"
                style="border-radius: 50%"
              >
            </figure>
          </div>
        </b-table-column>
        <b-table-column
          field="created"
          label="Registration Date"
          sortable
        >
          <span class="no-break is-size-8">{{ $moment(props.row.created).format('D MMM') }} <span style="opacity: .5">{{ $moment(props.row.created).format('YYYY') }}</span></span>
        </b-table-column>

        <b-table-column
          field="firstName"
          label="First Name"
          :visible="!$root.mobile"
          sortable
        >
          {{ props.row.firstName }}
        </b-table-column>

        <b-table-column
          field="lastName"
          label="Last Name"
          :visible="!$root.mobile"
          sortable
        >
          {{ props.row.lastName }}
        </b-table-column>

        <b-table-column
          field="email"
          label="Email"
          sortable
        >
          <email-link
            :user="props.row"
            :truncate="false"
          />
        </b-table-column>

        <b-table-column
          field="tries"
          label="Attempts"
          :visible="!$root.mobile"
          sortable
        >
          {{ props.row.tries }}
        </b-table-column>

        <b-table-column
          field="tier"
          label="Tier"
          :visible="!$root.mobile"
          sortable
        >
          {{ props.row.tier }}
        </b-table-column>

        <b-table-column label="Status">
          <b-tag
            v-if="props.row.flag"
            :type="'is-' + props.row.flagColour"
          >
            <span class="icon has-text-light"><i :class="'fa fa-' + props.row.flagIcon" /></span>
            <span class="is-size-8 has-text-light">{{ props.row.flagText }}</span>
          </b-tag>
        </b-table-column>

        <b-table-column
          label="Origin"
          :visible="!$root.mobile"
        >
          <div
            v-if="getVerificationProvider(props.row).icon"
            class="row-centered"
          >
            <span class="icon"><i
              class="has-text-grey-light"
              :class="getVerificationProvider(props.row).icon"
            /></span>
            <span class="is-size-8">{{ getVerificationProvider(props.row).name }}</span>
          </div>
        </b-table-column>

        <b-table-column
          field="gender"
          label="Gender"
          :visible="!$root.mobile"
        >
          <span
            v-if="props.row.gender"
            class="icon"
            :title="ucFirst(props.row.gender)"
          ><i :class="'has-text-grey-light fa fa-'+props.row.gender.toLowerCase()" /></span>
        </b-table-column>

        <b-table-column
          label="Peer"
          :visible="!$root.mobile"
        >
          <span
            v-if="props.row.review"
            class="icon"
            title="Peer reviewed"
          ><i class="fa fa-check-circle has-text-success" /></span>
          <span
            v-else-if="!props.row.tier"
            class="icon"
            title="Not verified"
          ><i class="fa fa-minus has-text-grey-lighter" /></span>
        </b-table-column>

        <b-table-column
          label="Total Transaction"
          :visible="!$root.mobile"
        >
          {{ props.row.totalBuy || props.row.totalSell ? currency(props.row.totalBuy + props.row.totalSell) : '' }}
        </b-table-column>
      </template>
    </b-table>
    <div
      v-if="user && activeTab === 'verification'"
      :key="user.uid"
    >
      <h2
        class="title is-4 is-5-mobile"
        style="margin-top:1em;"
      >
        Details
      </h2>
      <ip-table
        :uid="user.uid"
        :danger-only="false"
      />
      <article
        v-if="user.suspicious && user.susReason"
        class="message is-danger"
      >
        <article class="message is-danger">
          <div class="message-header">
            <p>Suspicious user</p>
          </div>
          <div class="message-body">
            {{ user.susReason }}
          </div>
        </article>
      </article>
      <compliance-log
        ref="modal"
        :uid="user.uid"
        :refresh="refreshComplianceLogFlag"
        :close-modal="closeModal"
        :compliance-response="complianceResponse"
        :type="'verification'"
      />
      <div class="columns">
        <div class="column content is-size-6">
          <p><b>Tier :</b> {{ user.tier }}</p>
          <p><b>Submitted:</b> {{ $moment(user.created).format('D MMM YYYY h:mm a') }}</p>
          <p>
            <clipboard>{{ user.email }}</clipboard>
          </p>
          <p><a :href="'tel:' + user.phone">{{ user.phone }}</a></p>
          <p>{{ $moment(user.birthday).format('D MMM YYYY') }} &nbsp; ({{ $moment().diff($moment(user.birthday), 'years', false) }} years old)</p>
          <div>
            <clipboard v-if="user.uid || user.externalId">
              {{ user.uid || user.externalId }}
            </clipboard>
            <clipboard>{{ user.verifiedLast }}</clipboard>
            <br>
            <clipboard>{{ user.verifiedFirst }}</clipboard>
            <br>
            <clipboard>{{ user.idNumber }}</clipboard>
            <br>
            <clipboard :suffix="', ' + user.suburb + ', ' + user.city">
              {{ user.address }}
            </clipboard>
          </div>
        </div>
        <div class="column">
          <div class="content">
            <!-- SumSub -->
            <template v-if="payload && getVerificationProvider(user).name === 'Sumsub'">
              <p
                class="title is-5"
                style="margin-top:20px"
              >
                {{ getVerificationProvider(user).name }} data:
              </p>
              <p class="is-size-6">
                Result:
                <span
                  v-if="payload.reviewResult.reviewAnswer === 'GREEN'"
                  class="icon has-text-success"
                ><i class="fa fa-check" /></span>
                <span
                  v-else
                  class="icon has-text-danger"
                ><i class="fa fa-times" /></span>
              </p>
              <p v-if="payload.reviewResult.hasOwnProperty('rejectLabels') && payload.reviewResult.rejectLabels.length">
                <b>Rejected because:</b><br>
                <span
                  v-for="(label, i) of payload.reviewResult.rejectLabels"
                  :key="'reject'+i"
                  class="has-text-danger"
                >
                  {{ label }}<br>
                </span>
              </p>
              <p v-if="getVerificationProvider(user).link">
                <a
                  :href="getVerificationProvider(user).link"
                  target="_blank"
                >See full {{ getVerificationProvider(user).name }} data <span class="icon"><i class="fa fa-external-link" /></span></a>
              </p>
            </template>
            <!-- FrankieOne -->
            <template v-if="payload && getVerificationProvider(user).name === 'FrankieOne'">
              <p
                class="title is-5"
                style="margin-top:20px"
              >
                {{ getVerificationProvider(user).name }} data:
              </p>
              <p class="is-size-6">
                Result:
                <span
                  v-if="payload.entityProfileResult.actionRecommended === 'PASS' || payload.entityProfileResult.actionRecommended === 'PASS_MANUAL'"
                  class="icon has-text-success"
                ><i class="fa fa-check" /></span>
                <span
                  v-else
                  class="icon has-text-danger"
                ><i class="fa fa-times" /></span>
              </p>
              <p v-if="getVerificationProvider(user).link">
                <a
                  :href="getVerificationProvider(user).link"
                  target="_blank"
                >See full {{ getVerificationProvider(user).name }} data <span class="icon"><i class="fa fa-external-link" /></span></a>
              </p>
            </template>
            <template v-if="$local.countryCode === 'NZ' && originPayload && originPayload.hasOwnProperty('details')">
              <h3
                class="title is-5"
                style="margin: 30px 0 0 0;"
              >
                {{ idVerificationProvider.name }} result
              </h3>
              <origin-summary :payload="originPayload" />
              <origin-detail :payload="originPayload" />
            </template>
            <template v-if="$local.countryCode === 'ZA'">
              <span
                v-if="smileJobId"
                style="display:flex; align-items:center;"
              >
                <span
                  class="title is-5"
                  style="margin-right: 1rem;"
                >{{ idVerificationProvider.name }} result</span>
                <b-tooltip
                  label="Reverify with JobID"
                  type="is-dark"
                >
                  <span
                    class="icon has-text-grey-light cursor"
                    style="margin-bottom: 1.5rem;"
                    @click="refreshCurrentSmileIdStatus"
                  ><i class="fa fa-refresh" />
                  </span>
                </b-tooltip>
              </span>
              <p v-if="smileJobId">
                <b>Job ID:</b> <clipboard>{{ smileJobId }}</clipboard>
              </p>
              <div
                v-if="smileJobId && smileIdFetchLoading"
                class="smile-id-spinner"
              >
                <b-loading
                  :is-full-page="false"
                  :active="smileIdFetchLoading"
                />
              </div>
              <table
                v-if="!smileIdFetchLoading && smileIdPayload"
                style="width:fit-content;"
                class="is-size-5"
              >
                <tr>
                  <td>Result</td>
                  <td><span class="icon"><i :class="isSmileIdResultSuccess ? 'fa fa-check has-text-success' : 'fa fa-times has-text-danger'" /></span></td>
                </tr>
                <tr>
                  <td>Name Match</td>
                  <td><span class="icon"><i :class="isSmileIdResultSuccess && user.verifiedFirst && user.verifiedLast ? 'fa fa-check has-text-success' : 'fa fa-times has-text-danger'" /></span></td>
                </tr>
              </table>
            </template>
          </div>
        </div>
      </div>
      <div class="content is-size-7">
        <div
          :key="'verification-data'+user.uid"
          class="columns"
        >
          <div class="column is-half-desktop is-one-third-widescreen">
            <b-tabs
              size="is-small"
              type="is-boxed"
              class="subTabs"
              v-model="verificationDataActiveTab"
            >
              <template v-for="tab in verificationDataTabs">
                <b-tab-item
                  v-if="tab.displayed"
                  :key="tab.id"
                  :value="tab.id"
                  :label="tab.label"
                >
                  <div
                    v-if="verificationDataActiveTab === 'personal'"
                    class="box"
                    style="background-color: #f4f4ff"
                  >
                    <h4>What the customer sees when we communicate with them:</h4>
                    <div
                      v-if="$local.countryCode === 'BR'"
                      class="box"
                    >
                      <b-field label="Name">
                        <b-input
                          v-model="user.firstName"
                          maxlength="200"
                        />
                      </b-field>
                    </div>
                    <div
                      v-else
                      class="box"
                    >
                      <b-field label="Display first name">
                        <b-input
                          v-model="user.firstName"
                          maxlength="40"
                        />
                      </b-field>
                      <b-field label="Display last name">
                        <b-input
                          v-model="user.lastName"
                          maxlength="40"
                        />
                      </b-field>
                    </div>
                    <popper
                      trigger="focus"
                      :options="{placement: 'top'}"
                      :force-show="configs.checklistOther.show"
                      :disabled="configs.checklistOther.disabled"
                      :show="configs.checklistOther.show"
                    >
                      <div
                        slot="contents"
                        :class="$root.mobile ? 'popper-mobile':'popper'"
                      >
                        <p>
                          <b>Q10. Are there any other details of concern?</b>
                          <b-tooltip
                            label="NOTE: is there anything else you've spotted that means we need to be keeping an eye on this customer's activity?"
                            :position="$root.mobile ? 'is-left':'is-right'"
                            :active="true"
                            type="is-info"
                            multilined
                          >
                            <b-icon icon="info-circle" />
                          </b-tooltip>
                        </p>
                        <br><br>
                        <div
                          v-for="radio in btnChecklist.btnOther"
                          :key="radio.label"
                          class="field"
                        >
                          <b-radio
                            v-model="checklistOther"
                            :native-value="radio.value"
                          >
                            {{ radio.label }}
                          </b-radio>
                        </div>
                        <section :class="$root.mobile ? 'btn-action-mobile':'btn-action'">
                          <b-button
                            v-for="btnAction in btnActions.btnOther"
                            :key="btnAction.label"
                            :type="btnAction.type"
                            @click="btnOther()"
                          >
                            {{ btnAction.label }}
                          </b-button>
                        </section>
                      </div>
                      <div slot="reference">
                        <h4>What we send to the verification provider for checking:</h4>
                      </div>
                    </popper>
                    <div
                      class="box"
                      style="background-color: #fdd;"
                    >
                      <div
                        v-for="row in verificationFields"
                        :key="'field'+user.uid+row.field"
                        class="field"
                      >
                        <popper
                          v-if="row.field === 'verifiedFirst'"
                          trigger="focus"
                          :options="{placement: $root.mobile ? 'bottom': 'right'}"
                          :force-show="configs.checklistFirst.show"
                          :disabled="configs.checklistFirst.disabled"
                          :show="configs.checklistFirst.show"
                        >
                          <div
                            v-if="row.field === 'verifiedFirst'"
                            slot="contents"
                            :class="$root.mobile ? 'popper-mobile':'popper'"
                          >
                            <p><b>Q5(a). What is the name on their ID?</b></p>
                            <p>
                              <b> (First Name)</b>
                              <b-tooltip
                                label="NOTE: Be sure to include any dashes or hyphens, and all names on the first name line of the ID need to go into the first name slot in ECA"
                                position="is-right"
                                :active="true"
                                type="is-info"
                                multilined
                              >
                                <b-icon icon="info-circle" />
                              </b-tooltip>
                            </p>
                            <p> * Staff member to type the details from the ID into the red section - </p>
                            <p>under "What we send to the verification provider for checking"</p>
                            <p v-if="user.idExpiry !== null">
                              <b>*Please include the middle name with the first name</b>
                            </p>
                            <b-radio
                              v-for="radio in btnChecklist.btnVerifiedFirst"
                              :key="radio.label"
                              v-model="checklistVerifiedFirst"
                              :native-value="radio.value"
                            >
                              {{ radio.label }}
                            </b-radio>
                            <section :class="$root.mobile? 'btn-action-mobile':'btn-action'">
                              <b-button
                                v-for="btnAction in btnActions.btnVerifiedFirst"
                                :key="btnAction.label"
                                :type="btnAction.type"
                                @click="btnVerifiedFirst()"
                              >
                                {{ btnAction.label }}
                              </b-button>
                            </section>
                          </div>
                          <div
                            v-if="row.field === 'verifiedFirst'"
                            slot="reference"
                          >
                            <label class="label is-size-7">{{ row.label }}</label>
                            <div
                              class="control"
                              :class="{'has-icons-right': row.warning}"
                            >
                              <input
                                v-model="user[row.field]"
                                class="input is-small"
                                :class="{'is-danger': row.warning}"
                              >
                              <span
                                v-if="row.warning"
                                class="icon is-small is-right has-text-danger"
                              ><i class="fa fa-exclamation-circle" /></span>
                            </div>
                          </div>
                        </popper>
                        <popper
                          v-if="row.field === 'verifiedLast'"
                          trigger="focus"
                          :options="{placement: $root.mobile ? 'bottom':'right'}"
                          :force-show="configs.checklistLast.show"
                          :disabled="configs.checklistLast.disabled"
                          :show="configs.checklistLast.show"
                        >
                          <div
                            v-if="verifyPopper"
                            slot="contents"
                            :class="$root.mobile ? 'popper-mobile':'popper'"
                          >
                            <p>
                              <b>Q5(b). What is the name on their ID?</b>
                            </p><p>
                              <b> (Last Name)</b>
                              <b-tooltip
                                label="NOTE: Be sure to include any dashes or hyphens, and all names on the first name line of the ID need to go into the first name slot in ECA"
                                position="is-right"
                                :active="true"
                                type="is-info"
                                multilined
                              >
                                <b-icon icon="info-circle" />
                              </b-tooltip>
                            </p>
                            <p> * Staff member to type the details from the ID into the red section</p>
                            <p>- under "What we send to the verification provider for checking"</p>
                            <b-radio
                              v-for="radio in btnChecklist.btnVerifiedLast"
                              :key="radio.label"
                              v-model="checklistVerifiedLast"
                              :native-value="radio.value"
                            >
                              {{ radio.label }}
                            </b-radio>
                            <section :class="$root.mobile? 'btn-action-mobile': 'btn-action'">
                              <b-button
                                v-for="btnAction in btnActions.btnVerifiedLast"
                                :key="btnAction.label"
                                :type="btnAction.type"
                                @click="btnVerifiedLast()"
                              >
                                {{ btnAction.label }}
                              </b-button>
                            </section>
                          </div>
                          <div
                            v-if="verifyPopper"
                            slot="reference"
                          >
                            <label class="label is-size-7">{{ row.label }}</label>
                            <div
                              class="control"
                              :class="{'has-icons-right': row.warning}"
                            >
                              <input
                                v-model="user[row.field]"
                                class="input is-small"
                                :class="{'is-danger': row.warning}"
                              >
                              <span
                                v-if="row.warning"
                                class="icon is-small is-right has-text-danger"
                              ><i class="fa fa-exclamation-circle" /></span>
                            </div>
                          </div>
                        </popper>
                        <popper
                          v-if="row.field === 'birthday'"
                          trigger="focus"
                          :options="{placement: $root.mobile ? 'bottom': 'right'}"
                          :force-show="configs.checklistDob.show"
                          :disabled="configs.checklistDob.disabled"
                          :show="configs.checklistDob.show"
                        >
                          <div
                            v-if="row.field === 'birthday'"
                            slot="contents"
                            :class="$root.mobile ?'popper-mobile': 'popper'"
                          >
                            <p><b>Q6. Does the Date of Birth (DOB) the customer has entered</b></p>
                            <p>
                              <b>match the DOB on the ID? (and are they over 18 years old?)</b>
                              <b-tooltip
                                label="NOTE: be sure to check each digit carefully! We cannot onboard people under 18 without their parent's permission."
                                :position="$root.mobile ? 'is-left': 'is-bottom'"
                                :active="true"
                                type="is-info"
                                multilined
                              >
                                <b-icon icon="info-circle" />
                              </b-tooltip>
                            </p>
                            <div
                              v-for="radio in btnChecklist.btnDob"
                              :key="radio.label"
                              class="field"
                            >
                              <b-radio
                                v-model="checklistDob"
                                :native-value="radio.value"
                              >
                                {{ radio.label }}
                              </b-radio>
                            </div>
                            <section :class="$root.mobile ? 'btn-action-mobile':'btn-action'">
                              <b-button
                                v-for="btnAction in btnActions.btnDob"
                                :key="btnAction.label"
                                :type="btnAction.type"
                                @click="btnDob()"
                              >
                                {{ btnAction.label }}
                              </b-button>
                            </section>
                          </div>
                          <div
                            v-if="verifyPopper"
                            slot="reference"
                          >
                            <label class="label is-size-7">{{ row.label }}</label>
                            <div
                              class="control"
                              :class="{'has-icons-right': row.warning}"
                            >
                              <input
                                v-model="user[row.field]"
                                class="input is-small"
                                :class="{'is-danger': row.warning}"
                              >
                              <span
                                v-if="row.warning"
                                class="icon is-small is-right has-text-danger"
                              ><i class="fa fa-exclamation-circle" /></span>
                            </div>
                          </div>
                        </popper>
                        <popper
                          v-if="row.field === 'idNumber'"
                          trigger="focus"
                          :options="{placement: $root.mobile ? 'bottom': 'right'}"
                          :force-show="configs.checklistSupport.show"
                          :disabled="configs.checklistSupport.disabled"
                          :show="configs.checklistSupport.show"
                        >
                          <div
                            v-if="row.field === 'idNumber'"
                            slot="contents"
                            :class="$root.mobile ? 'popper-mobile':'popper'"
                          >
                            <p><b>Q7. Does the DL/Passport number on the ID match </b></p>
                            <p>
                              <b> what the customer typed in the red section?</b>
                              <b-tooltip
                                label="NOTE: Be sure to check each digit carefully"
                                :position="$root.mobile ? 'is-left': 'is-right'"
                                :active="true"
                                type="is-info"
                                multilined
                              >
                                <b-icon icon="info-circle" />
                              </b-tooltip>
                            </p>
                            <p>* under "What we send to the verification provider for checking"</p>
                            <b-radio
                              v-for="radio in btnChecklist.btnSupportDocs"
                              :key="radio.label"
                              v-model="checklistSupport"
                              :native-value="radio.value"
                            >
                              {{ radio.label }}
                            </b-radio>
                            <section :class="$root.mobile ? 'btn-action-mobile':'btn-action'">
                              <b-button
                                v-for="btnAction in btnActions.btnSupportDocs"
                                :key="btnAction.label"
                                :type="btnAction.type"
                                @click="btnSupportDocs()"
                              >
                                {{ btnAction.label }}
                              </b-button>
                            </section>
                          </div>
                          <div
                            v-if="verifyPopper"
                            slot="reference"
                          >
                            <label class="label is-size-7">{{ row.label }}</label>
                            <div
                              class="control"
                              :class="{'has-icons-right': row.warning}"
                            >
                              <input
                                v-model="user[row.field]"
                                class="input is-small"
                                :class="{'is-danger': row.warning}"
                              >
                              <span
                                v-if="row.warning"
                                class="icon is-small is-right has-text-danger"
                              ><i class="fa fa-exclamation-circle" /></span>
                            </div>
                          </div>
                        </popper>
                        <popper
                          v-if="row.field === 'idVersion' || row.field === 'idExpiry'"
                          trigger="focus"
                          :options="{placement: $root.mobile ? 'bottom':'right'}"
                          :force-show="configs.checklistDlVersion.show"
                          :disabled="configs.checklistDlVersion.disabled"
                          :show="configs.checklistDlVersion.show"
                        >
                          <div
                            v-if="row.field === 'idVersion'"
                            slot="contents"
                            :class="$root.mobile? 'popper-mobile':'popper'"
                          >
                            <p><b>Q8. Does version number (for Drivers License)</b></p>
                            <p>
                              <b> match the ID document uploaded?</b>
                              <b-tooltip
                                label="NOTE: be sure to check each digit carefully"
                                position="is-bottom"
                                :active="true"
                                type="is-info"
                              >
                                <b-icon icon="info-circle" />
                              </b-tooltip>
                            </p>
                            <b-radio
                              v-for="radio in btnChecklist.btnDlVersion"
                              :key="radio.label"
                              v-model="checklistDlVersion"
                              :native-value="radio.value"
                            >
                              {{ radio.label }}
                            </b-radio>
                            <section :class="$root.mobile ? 'btn-action-mobile': 'btn-action'">
                              <b-button
                                v-for="btnAction in btnActions.btnDlVersion"
                                :key="btnAction.label"
                                :type="btnAction.type"
                                @click="btnDlVersion()"
                              >
                                {{ btnAction.label }}
                              </b-button>
                            </section>
                          </div>
                          <div
                            v-if="row.field === 'idExpiry'"
                            slot="contents"
                            class="popper"
                          >
                            <p><b>Q8. Does expiry date (for Passports)</b></p>
                            <p>
                              <b> match the ID document uploaded?</b>
                              <b-tooltip
                                label="NOTE: be sure to check each digit carefully"
                                position="is-bottom"
                                :active="true"
                                type="is-info"
                              >
                                <b-icon icon="info-circle" />
                              </b-tooltip>
                            </p>
                            <b-radio
                              v-for="radio in btnChecklist.btnDlVersion"
                              :key="radio.label"
                              v-model="checklistDlVersion"
                              :native-value="radio.value"
                            >
                              {{ radio.label }}
                            </b-radio>
                            <section :class="$root.mobile ? 'btn-action-mobile': 'btn-action'">
                              <b-button
                                v-for="btnAction in btnActions.btnDlVersion"
                                :key="btnAction.label"
                                :type="btnAction.type"
                                @click="btnDlVersion()"
                              >
                                {{ btnAction.label }}
                              </b-button>
                            </section>
                          </div>
                          <div
                            v-if="verifyPopper"
                            slot="reference"
                          >
                            <label class="label is-size-7">{{ row.label }}</label>
                            <div
                              class="control"
                              :class="{'has-icons-right': row.warning}"
                            >
                              <input
                                v-model="user[row.field]"
                                class="input is-small"
                                :class="{'is-danger': row.warning}"
                              >
                              <span
                                v-if="row.warning"
                                class="icon is-small is-right has-text-danger"
                              ><i class="fa fa-exclamation-circle" /></span>
                            </div>
                          </div>
                        </popper>

                        <popper
                          v-if="row.field === 'address'"
                          trigger="focus"
                          :options="{placement: $root.mobile ? 'bottom':'right'}"
                          :force-show="configs.checklistAddress.show"
                          :disabled="configs.checklistAddress.disabled"
                          :show="configs.checklistAddress.show"
                        >
                          <div
                            v-if="row.field === 'address'"
                            slot="contents"
                            :class="$root.mobile? 'popper-mobile':'popper'"
                          >
                            <p>
                              <b>Q9. Has the customer entered the address details in the correct format?</b>
                            </p><p>
                              <b> (i.e. City and Postcode included?)</b>
                              <b-tooltip
                                id="address"
                                label="NOTE: the address needs to be in the following
format:

Address:
City:
Postcode:

E.g.....
Address: 123 Queen Street
City: Auckland
Postcode: 1010

If no city and/or postcode is included,
copy and paste the address you have into
Google to find out"
                                position="is-bottom"
                                :active="true"
                                type="is-info"
                                size="is-large"
                              >
                                <b-icon icon="info-circle" />
                              </b-tooltip>
                            </p>
                            <b-radio
                              v-for="radio in btnChecklist.btnAddress"
                              :key="radio.label"
                              v-model="checklistAddress"
                              :native-value="radio.value"
                            >
                              {{ radio.label }}
                            </b-radio>
                            <section :class="$root.mobile ?'btn-action-mobile':'btn-action'">
                              <b-button
                                v-for="btnAction in btnActions.btnAddress"
                                :key="btnAction.label"
                                :type="btnAction.type"
                                @click="btnAddress()"
                              >
                                {{ btnAction.label }}
                              </b-button>
                            </section>
                          </div>
                          <div
                            v-if="verifyPopper"
                            slot="reference"
                          >
                            <label class="label is-size-7">{{ row.label }}</label>
                            <div
                              class="control"
                              :class="{'has-icons-right': row.warning}"
                            >
                              <input
                                v-model="user[row.field]"
                                class="input is-small"
                                :class="{'is-danger': row.warning}"
                              >
                              <span
                                v-if="row.warning"
                                class="icon is-small is-right has-text-danger"
                              ><i class="fa fa-exclamation-circle" /></span>
                            </div>
                          </div>
                        </popper>
                        <div v-if="row.field !== 'verifiedLast' && row.field !== 'verifiedFirst' && row.field !== 'birthday' && row.field !== 'idNumber' && row.field !== 'idVersion' && row.field !== 'address' && row.field !=='idExpiry'">
                          <label class="label is-size-7">{{ row.label }}</label>
                          <div
                            class="control"
                            :class="{'has-icons-right': row.warning}"
                          >
                            <input
                              v-model="user[row.field]"
                              class="input is-small"
                              :class="{'is-danger': row.warning}"
                            >
                            <span
                              v-if="row.warning"
                              class="icon is-small is-right has-text-danger"
                            ><i class="fa fa-exclamation-circle" /></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <popper
                      trigger="focus"
                      :options="{placement: $root.mobile? 'bottom':'right'}"
                      :force-show="configs.checklistSave.show"
                      :disabled="configs.checklistSave.disabled"
                      :show="configs.checklistSave.show"
                    >
                      <div
                        slot="contents"
                        :class="$root.mobile ? 'popper-mobile':'popper'"
                      >
                        <p><b>Please click the button to save data</b></p>
                        <b-button
                          v-for="btnAction in btnActions.btnSave"
                          :key="btnAction.label"
                          :class="$root.mobile? 'btn-action-mobile':'btn-action'"
                          :type="btnAction.type"
                          @click="btnSave()"
                        >
                          {{ btnAction.label }}
                        </b-button>
                      </div>
                      <div slot="reference">
                        <b-field>
                          <p class="control">
                            <button
                              class="button"
                              :class="{'is-loading': odataVal}"
                              :disabled="disabledButton"
                              @click="saveOdata"
                            >
                              Save these fields
                            </button>
                          </p>
                        </b-field>
                      </div>
                    </popper>
                  </div>
                  <div
                    class="box"
                    v-else-if="verificationDataActiveTab === 'primaryIdPayload'"
                  >
                    <AdditionalPayload
                      :uid="user.uid"
                      column="primaryIdPayload"
                      :payload="user.primaryIdPayload"
                      :files="sourceFiles"
                    />
                  </div>
                  <div
                    class="box"
                    v-else-if="verificationDataActiveTab === 'secondaryIdPayload'"
                  >
                    <AdditionalPayload
                      :uid="user.uid"
                      column="secondaryIdPayload"
                      :payload="user.secondaryIdPayload"
                      :files="sourceFiles"
                    />
                  </div>
                </b-tab-item>
              </template>
            </b-tabs>
          </div>
          <div class="column">
            <popper
              trigger="focus"
              :options="{placement: $root.mobile ? 'bottom': 'right'}"
              :force-show="configs.checklistGender.show"
              :disabled="configs.checklistGender.disabled"
              :show="configs.checklistGender.show"
            >
              <div
                slot="contents"
                :class="$root.mobile? 'popper-mobile':'popper'"
              >
                <p>
                  <b>Q4. Please confirm the customer's gender</b>
                  <b-tooltip
                    label="NOTE: Unsure? If the customer has submitted a passport, you can check the gender on there - otherwise, just select 'other'"
                    :position="$root.mobile ? 'is-left':'is-bottom'"
                    :active="true"
                    type="is-info"
                    multilined
                  >
                    <b-icon icon="info-circle" />
                  </b-tooltip>
                </p>
                <b-radio
                  v-for="radio in btnChecklist.btnGender"
                  :key="radio.label"
                  v-model="checklistGender"
                  :native-value="radio.value"
                >
                  {{ radio.label }}
                </b-radio>
                <section :class="$root.mobile ? 'btn-action-mobile':'btn-action'">
                  <b-button
                    v-for="btnAction in btnActions.btnGender"
                    :key="btnAction.label"
                    :type="btnAction.type"
                    @click="btnGender"
                  >
                    {{ btnAction.label }}
                  </b-button>
                </section>
              </div>
              <div slot="reference">
                <h4>Set customer gender:</h4>
                <b-field>
                  <b-radio-button
                    v-model="user.gender"
                    native-value="male"
                    @input="setGender"
                  >
                    <span>Male</span>
                  </b-radio-button>
                  <b-radio-button
                    v-model="user.gender"
                    native-value="female"
                    @input="setGender"
                  >
                    <span>Female</span>
                  </b-radio-button>
                  <b-radio-button
                    v-model="user.gender"
                    native-value="other"
                    @input="setGender"
                  >
                    <span>Other</span>
                  </b-radio-button>
                </b-field>
              </div>
            </popper>
            <popper
              v-if="user.idFront"
              trigger="focus"
              :options="{placement: $root.mobile ?'bottom':'right'}"
              :force-show="configs.checklistId.show"
              :disabled="configs.checklistId.disabled"
              :show="configs.checklistId.show"
            >
              <div
                slot="contents"
                :class="$root.mobile? 'popper-mobile' :'popper'"
              >
                <p><b>Q1. Did the customer upload a clear closeup of</b></p>
                <p>
                  <b>their ID?</b>
                  <b-tooltip
                    label="NOTE: We need to be able to read all the details, clearly see the ID photo, and see all four corners in frame"
                    :position="$root.mobile ? 'is-right': 'is-top'"
                    :active="true"
                    type="is-info"
                    multilined
                  >
                    <b-icon icon="info-circle" />
                  </b-tooltip>
                </p>
                <b-radio
                  v-for="radio in btnChecklist.btnId"
                  :key="radio.label"
                  v-model="checklistId"
                  :native-value="radio.value"
                >
                  {{ radio.label }}
                </b-radio>
                <br>
                <section :class="$root.mobile? 'btn-action-mobile':'btn-action'">
                  <b-button
                    v-for="btnAction in btnActions.btnId"
                    :key="btnAction.label"
                    :type="btnAction.type"
                    @click="btnId()"
                  >
                    {{ btnAction.label }}
                  </b-button>
                </section>
              </div>
              <div slot="reference">
                <VerificationImage
                  title="ID image"
                  :url="user.idFront"
                />
                <VerificationImage
                  v-if="user.idBack"
                  title="ID back"
                  :url="user.idBack"
                />
              </div>
            </popper>
            <br><br>
            <popper
              v-if="typeof(photoWithId) === 'string'"
              trigger="focus"
              :options="{placement: $root.mobile ? 'bottom':'right'}"
              :force-show="configs.checklistSelfie.show"
              :disabled="configs.checklistSelfie.disabled"
              :show="configs.checklistSelfie.show"
            >
              <div
                slot="contents"
                :class="$root.mobile? 'popper-mobile':'popper'"
              >
                <div v-if="showQuest === false">
                  <p>
                    <b>Q2. Did the customer upload a selfie? </b>
                    <b-tooltip
                      label="NOTE: A selfie is a picture taken of the person's face"
                      :position="$root.mobile? 'is-left':'is-top'"
                      :active="true"
                      type="is-info"
                      multilined
                    >
                      <b-icon icon="info-circle" />
                    </b-tooltip>
                  </p>
                  <b-radio
                    v-for="radio in btnChecklist.btnSelfie"
                    :key="radio.label"
                    v-model="checklistSelfie"
                    :native-value="radio.value"
                  >
                    {{ radio.label }}
                  </b-radio>
                  <section
                    v-if="showBtn"
                    :class="$root.mobile? 'btn-action-mobile':'btn-action'"
                  >
                    <b-button
                      v-for="btnAction in btnActions.btnSelfie"
                      :key="btnAction.label"
                      :type="btnAction.type"
                      @click="btnSelfie()"
                    >
                      {{ btnAction.label }}
                    </b-button>
                  </section>
                </div>
                <div
                  v-if="showQuest"
                  style="margin-top:10px;"
                >
                  <p><b>Q3. Does the selfie include their face, their ID, AND </b></p>
                  <p>
                    <b>the correct note?</b>
                    <b-tooltip
                      label="NOTE: 'I am verifying with Easy Crypto. No one has asked me to make this account. Today's date.'"
                      position="is-top"
                      :active="true"
                      type="is-info"
                      multilined
                    >
                      <b-icon icon="info-circle" />
                    </b-tooltip>
                  </p>
                  <b-radio
                    v-for="radio in btnChecklist.btnSelfieNote"
                    :key="radio.label"
                    v-model="checklistSelfieNote"
                    :native-value="radio.value"
                  >
                    {{ radio.label }}
                  </b-radio>
                  <section :class="$root.mobile? 'btn-action-mobile':'btn-action'">
                    <div v-if="checklistSelfieNote !== 'selfieNoteNo'">
                      <b-button
                        v-for="btnAction in btnActions.btnSelfieNote"
                        :key="btnAction.label"
                        :type="btnAction.type"
                        @click="btnSelfieNote( )"
                      >
                        {{ btnAction.label }}
                      </b-button>
                    </div>
                  </section>
                  <div
                    v-if="checklistSelfieNote === 'selfieNoteNo'"
                    style="margin-top:10px;"
                  >
                    <p><b>Reason:</b></p>
                    <section>
                      <div
                        v-for="radio in btnChecklist.btnNoteReason"
                        :key="radio.label"
                        class="field"
                      >
                        <b-radio
                          v-model="reason"
                          :native-value="radio.value"
                        >
                          {{ radio.label }}
                        </b-radio>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
              <div slot="reference">
                <VerificationImage
                  title="Selfie Image with Note"
                  :url="user.photoWithId"
                />
              </div>
            </popper>
            <div v-if="getVerificationProvider(user).name === 'Sumsub'">
              <h4>Document image from Sumsub</h4>
              <popper
                trigger="focus"
                :options="{placement: $root.mobile ? 'bottom':'right'}"
                :force-show="configs.checklistSumsubFront.show"
                :disabled="configs.checklistSumsubFront.disabled"
                :show="configs.checklistSumsubFront.show"
              >
                <div
                  slot="contents"
                  :class="$root.mobile ? 'popper-mobile':'popper'"
                >
                  <p><b>Front/Back Side: What's the reason Sumsub failed?</b></p>
                  <div
                    v-for="radio in btnChecklist.btnSumsub"
                    :key="radio.label"
                    class="field"
                  >
                    <b-radio
                      v-model="sumsubFrontReason"
                      :native-value="radio.value"
                    >
                      {{ radio.label }}
                    </b-radio>
                  </div>
                </div>
                <div slot="reference">
                  <VerificationImage
                    v-if="externalDocuments[0]"
                    :url="externalDocuments[0].link"
                  />
                </div>
              </popper>
              <div style="margin-top: 20px;">
                <VerificationImage
                  v-if="externalDocuments[1]"
                  :url="externalDocuments[1].link"
                />
              </div>
            </div>
          </div>
          <div class="column">
            <VerificationImage
              v-if="base64SmileIdPhoto"
              title="SmileID Photo"
              style="margin-top: 6.5rem;"
              :url="base64SmileIdPhoto"
            />
            <file-list
              v-if="sourceFiles.length"
              :files="sourceFiles"
            />
            <template v-if="$local.countryCode === 'NG'">
              <h4>BVN Details</h4>
              <img
                v-if="bvnImages[0]"
                :src="storage + bvnImages[0]"
                class="id-bvn-basicdetail"
              >
              <img
                v-if="bvnImages[1]"
                :src="storage + bvnImages[1]"
                class="id-bvn-basicdetail"
                style="border-radius:10px;width:250px;"
              >
              <b-notification
                v-if="bvnError"
                type="is-danger"
                aria-close-label="Close notification"
                role="alert"
              >
                {{ bvnError }}
              </b-notification>
            </template>
            <template v-if="typeof(photoWithId) === 'object'">
              <a
                target="_blank"
                :href="storage + photoWithId.face"
              >
                <img
                  v-if="isImage(photoWithId.face)"
                  :src="storage + photoWithId.face"
                  class="id-photo"
                >
                <span v-else><span class="icon"><i class="fa fa-external-link" /></span> Selfie Front</span>
              </a>
              <br>
              <a
                target="_blank"
                :href="storage + photoWithId.turn"
              >
                <img
                  v-if="isImage(photoWithId.turn)"
                  :src="storage + photoWithId.turn"
                  class="id-photo"
                >
                <span v-else><span class="icon"><i class="fa fa-external-link" /></span> Selfie Turn</span>
              </a>
            </template>
          </div>
        </div>
        <div class="buttons">
          <b-button
            v-if="user.tier < 20"
            id="verify"
            :loading="loading"
            type="is-success"
            @click="verify"
          >
            Verify!
          </b-button>
          <template v-if="!user.tier">
            <a
              class="button is-info"
              @click="requestAddress"
            >
              <span class="icon"><i class="fa fa-home" /></span>
              <span>Request PoA</span>
            </a>
            <a
              class="button"
              @click="updateFlag('emailed')"
            >
              <span class="icon"><i class="fa fa-envelope" /></span>
              <span>Have emailed user</span>
            </a>
            <a
              class="button"
              @click="denyPhotos({ type: 'note' })"
            >
              <span class="icon"><i class="fa fa-camera" /></span>
              <span>Deny - No note</span>
            </a>
            <popper
              trigger="focus"
              :options="{placement: $root.mobile ? 'bottom': 'top'}"
              :force-show="configs.checklistCentrix.show"
              :disabled="configs.checklistCentrix.disabled"
              :show="configs.checklistCentrix.show"
            >
              <div
                slot="contents"
                :class="$root.mobile?'popper-mobile-centrix':'popper'"
              >
                <p><b>Now you can click on "Run ID Check ({{ idVerificationProvider.name }})" button</b></p>
                <p>Click radio button, if you don't want to run ID Check ({{ idVerificationProvider.name }})</p>
                <b-radio
                  v-for="radio in btnChecklist.btnCentrix"
                  :key="radio.label"
                  v-model="checklistCentrix"
                  :native-value="radio.value"
                >
                  {{ radio.label }}
                </b-radio>
                <section :class="$root.mobile ? 'btn-action-mobile-centrix': 'btn-action'">
                  <b-button
                    v-for="btnAction in btnActions.btnCentrix"
                    :key="btnAction.label"
                    :type="btnAction.type"
                    @click="btnCentrix()"
                  >
                    {{ btnAction.label }}
                  </b-button>
                </section>
              </div>
              <div slot="reference">
                <b-dropdown
                  custom
                  class="dropdown"
                  :hoverable="$local.countryCode === 'ZA'"
                  :position="$root.mobile ? 'is-top-right' : 'is-top-left'"
                >
                  <b-button
                    v-if="user.tier < 20 && getVerificationProvider(user).name !== 'FrankieOne'"
                    slot="trigger"
                    :loading="loading"
                    :disabled="$local.countryCode === 'ZA' && !isSmileIdOnline"
                    @click="runIdCheck(user)"
                  >
                    <span
                      v-if="$local.countryCode === 'NZ'"
                      class="icon"
                    ><i class="fa fa-search" /></span>
                    <span
                      v-if="$local.countryCode === 'ZA'"
                      class="health-indicator"
                      :class="{'status-online': isSmileIdOnline}"
                    />
                    Run ID Check ({{ idVerificationProvider.name }})
                  </b-button>

                  <b-dropdown-item
                    custom
                    aria-role="listitem"
                    v-if="$local.countryCode === 'ZA'"
                  >
                    <SmileIdHealthDropdown
                      :is-smile-id-with-photo-online="isSmileIdWithPhotoOnline"
                      :is-smile-id-without-photo-online="isSmileIdWithoutPhotoOnline"
                      :smile-id-health="smileIdHealth"
                    />
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </popper>
          </template>
          <button
            class="button is-danger"
            @click="del(user)"
          >
            Ignore
          </button>
          <template v-if="user.tier && !user.review && canReview">
            <a
              class="button is-warning"
              @click="peerReviewed('manual', user)"
            >
              <span class="icon"><i class="fa fa-check-circle" /></span>
              <span>Peer review</span>
            </a>
          </template>
          <router-link
            class="button"
            :to="{name: 'user', query: {uid: user.uid}}"
          >
            Go to user
          </router-link>
        </div>
      </div>
      <b-collapse
        class="card"
        :open="false"
        style="margin: 2em 0"
      >
        <div
          slot="trigger"
          class="card-header"
        >
          <p
            class="card-header-title"
            v-if="getVerificationProvider(user).name === 'Sumsub'"
          >
            Tap to open full Sumsub / {{ idVerificationProvider.name }} data
          </p>
          <p
            class="card-header-title"
            v-else-if="getVerificationProvider(user).name === 'FrankieOne'"
          >
            Tap to open full FrankieOne data
          </p>
        </div>
        <div class="card-content">
          <div class="content">
            <pre style="font-size:10pt;font-family:monospace;">{{ originPayload }}</pre>
          </div>
        </div>
      </b-collapse>
      <!--<div class="buttons">
        <button class="button" @click="verify">Verify!</button>
        <template v-if="type === 'manual'">
          <button class="button is-danger" @click="deny">Deny</button>
        </template>
        <button class="button is-danger" @click="del(user)">Delete</button>
      </div>-->
    </div>
    <div
      v-if="!user2 && activeTab === 'upgrade'"
      class="search-container"
    >
      <b-field
        grouped
        group-multiline
      >
        <div class="control">
          <input
            v-model="filter2"
            type="search"
            placeholder="Filter list"
            class="input"
          >
        </div>
        <div class="control">
          <button
            class="button"
            @click="loadQueue"
          >
            Refresh
          </button>
        </div>
      </b-field>
    </div>
    <b-table
      key="upgrade-table"
      class="clickable"
      :style="`display: ${!user2 && activeTab === 'upgrade' ? 'block' : 'none'}`"
      :data="filteredList2"
      :selected.sync="user2"
      :mobile-cards="false"
      :paginated="true"
      :per-page="12"
      :loading="loadVerifications"
    >
      <template #default="props">
        <b-table-column label="Live Agent">
          <div
            v-for="realtime in realtimes"
            :key="realtime. data_id"
          >
            <figure
              v-if="realtime.data_id === props.row.id && realtime.status===1 && realtime.module === 'Verification' && realtime.sub_module ==='Upgrade Queue'"
              class="image is-32x32"
            >
              <img
                :src="realtime.admin_url"
                style="border-radius: 50%"
              >
            </figure>
          </div>
        </b-table-column>
        <b-table-column
          field="created"
          label="Date"
          sortable
        >
          <span class="no-break is-size-8">{{ $moment(props.row.created).format('D MMM') }} <span style="opacity: .5">{{ $moment(props.row.created).format('YYYY') }}</span></span>
        </b-table-column>

        <b-table-column
          field="firstName"
          label="First Name"
          :visible="!$root.mobile"
          sortable
        >
          {{ props.row.firstName }}
        </b-table-column>

        <b-table-column
          field="lastName"
          label="Last Name"
          :visible="!$root.mobile"
          sortable
        >
          {{ props.row.lastName }}
        </b-table-column>

        <b-table-column
          field="email"
          label="Email"
          sortable
        >
          <email-link
            :user="props.row"
            :truncate="false"
          />
        </b-table-column>

        <b-table-column
          field="type"
          label="Type"
          sortable
        >
          <icon
            :type="props.row.type"
            classes="has-text-grey-light"
          />
          <span class="is-size-8">{{ props.row.type }}</span>
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
        </b-table-column>
      </template>
    </b-table>
    <div
      v-if="user2 && activeTab === 'upgrade'"
      :key="user2.uid"
    >
      <div class="columns">
        <div class="column">
          <div class="content">
            <h3>{{ user2.verifiedFirst }} {{ user2.verifiedLast }}</h3>
            <article
              v-if="!user2.verifiedFirst || !user2.verifiedLast"
              class="message is-danger"
            >
              <div class="message-body">
                User has no verified name. Fix this before doing anything else!
              </div>
            </article>
            <article
              v-if="user2.type==='privacy'"
              class="message is-warning"
            >
              <div class="message-body">
                User is applying for Privacy Coins
              </div>
            </article>
            <article
              v-if="user2.type==='address'"
              class="message is-warning"
            >
              <div class="message-body">
                User is verifying their address
              </div>
            </article>
            <p><b>Submitted:</b><br>{{ user2.created }}</p>
            <p>
              <b>UID:</b><br>
              <clipboard>{{ user2.uid }}</clipboard>
            </p>
            <p>
              <b>Email:</b><br>
              <clipboard>{{ user2.email }}</clipboard>
            </p>
            <!--            dont show this if type is privacy-->
            <template v-if="user2.limit && user2.type !== 'privacy'">
              <!-- Verify source of fiat -->
              <h5>Requested limit:</h5>
              <p>{{ user2.limit }}</p>
              <h5>Purpose:</h5>
              <p>{{ user2.purpose }}</p>
              <h5>Source:</h5>
              <p>{{ user2.source }}</p>
            </template>
            <div v-if="user2.type === 'privacy'">
              <br>
              <template>
                <div>
                  <h2 class="title is-5">
                    Nature and Purpose
                  </h2>
                  <div>
                    <h3 class="is-marginless title is-6">
                      Latest Source Of Funds Verification
                    </h3>
                    <p class="is-marginless">
                      Purpose: {{ sourceOfFund.purpose }}
                    </p>
                    <p class="is-marginless">
                      Source: {{ sourceOfFund.source }}
                    </p>
                    <p class="is-marginless">
                      Requested Limit: {{ sourceOfFund.limit }}
                    </p>
                  </div>
                  <br>
                  <div>
                    <h3 class="is-marginless title is-6">
                      Privacy Coins
                    </h3>
                    <p class="is-marginless">
                      Purpose: {{ naturePurpose.privacy_coins.purpose }}
                    </p>
                    <p class="is-marginless">
                      Source: {{ naturePurpose.privacy_coins.source }}
                    </p>
                  </div>
                  <br>
                  <div>
                    <h3 class="is-marginless title is-6">
                      Sign up
                    </h3>
                    <p class="is-marginless">
                      Purpose: {{ signupPurpose }}
                    </p>
                    <p class="is-marginless">
                      Source: {{ signupSource }}
                    </p>
                  </div>
                </div>
              </template>
            </div>
            <br>
            <br>
            <template v-if="user2.cryptoSales">
              <!-- Verify source of crypto -->
              <h5>What they want to sell:</h5>
              <pre>{{ user2.cryptoSales }}</pre>
              <h5>Wallet addresses:</h5>
              <pre>{{ user2.walletAddresses }}</pre>
            </template>
            <h5>Uploaded files:</h5>
            <file-list :files="user2.sourceFiles" />
            <template v-if="!user2.processed && user2.type==='address'">
              <b-button
                :loading="loading"
                type="is-success"
                @click="verifyAddress"
              >
                Verify address
              </b-button>
              <b-button
                type="is-danger"
                @click="denyAddress"
              >
                Deny
              </b-button>
              <b-button
                type="is-danger"
                icon-left="trash"
                @click="del(user2, 'manual')"
              >
                Ignore
              </b-button>
            </template>
          </div>
        </div>

        <div class="column">
          <compliance-log :uid="user2.uid" />
        </div>
      </div>
      <template v-if="user2 && user2.type !== 'address'">
        <hr>
        <limits
          :uid="user2.uid"
          :user="user2"
        />
        <br>
        <section>
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">
                Action
              </p>
            </div>
            <div class="card-content">
              <div class="content">
                <div class="buttons">
                  <b-button
                    type="is-success"
                    icon-left="check"
                    @click="approvedUpgrade(user2.type)"
                  >
                    Verify Source
                  </b-button>
                  <b-button
                    type="is-danger"
                    icon-left="times"
                    @click="denyUpgrade(user2.type)"
                  >
                    Deny
                  </b-button>
                  <b-button
                    type="is-danger"
                    icon-left="trash"
                    @click="del(user2, 'manual')"
                  >
                    Ignore
                  </b-button>
                  <toggle-value
                    v-if="user2.processed === null && user2.type === 'privacy'"
                    icon="fa-user-secret"
                    field="privacy"
                    :current="user2.privacy"
                    :uid="user2.uid"
                    text="privacy coins"
                    @updated="getUserData(data.user.uid)"
                  />
                  <router-link
                    class="button"
                    :to="{name: 'user', query: {uid: user2.uid}}"
                  >
                    Go to user
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
    <div v-if="activeTab === 'statistics'">
      <iframe
        style="width:100%;height:800px"
        src="https://easycrypto-ai-1.domo.com/link/Kt7DSZjyfInDppbF"
        marginheight="0"
        marginwidth="0"
        frameborder="0"
      />
      <b-table
        v-if="$store.state.info.info.agentStats"
        key="statistics-table"
        :data="$store.state.info.info.agentStats.data"
        default-sort="0"
      >
        <template #default="props">
          <b-table-column
            v-for="(column, i) in $store.state.info.info.agentStats.columns"
            :key="column"
            :field="i.toString()"
            :label="column"
            sortable
          >
            {{ props.row[i] }}
          </b-table-column>
        </template>
      </b-table>
    </div>
    <b-modal :active.sync="showVideo">
      <video
        :src="videoLink"
        controls
        autoplay
        loop
      />
    </b-modal>
    <b-button
      type="is-primary"
      rounded
      class="sticky-update-btn"
      @click="updatePage"
      icon-left="refresh"
      :class="{'is-loading': loadVerifications}"
    >
      Refresh
    </b-button>
  </section>
</template>

<script>
import ComplianceLog from './parts/ComplianceLog.vue'
import Clipboard from './parts/Clipboard.vue'
import Limits from './parts/user/UserLimits.vue'
import IpTable from './parts/user/IpTable.vue'
import FileList from './parts/user/FileList.vue'
import OriginSummary from './parts/verification/OriginSummary.vue'
import OriginDetail from './parts/verification/OriginDetail.vue'
import ToggleValue from './parts/user/ToggleValue.vue'
import EmailLink from './parts/user/EmailLink.vue'
import Icon from './parts/Icon.vue'
import { Role } from '@/role'
import Popper from '../components/parts/checklist/Checklist.vue'
import { VERIFICATION_EMAIL_BODY, formatEmailBody } from '../components/parts/checklist/email'
import verificationDocumentsMixin from './parts/verification/verificationDocumentsMixin'
import idVerificationProviderMixin from './parts/verification/idVerificationProviderMixin'
import auVerificationMixin from './parts/verification/auVerificationMixin'
import VerificationImage from './parts/verification/VerificationImage.vue'
import SmileIdHealthDropdown from './parts/verification/SmileIdHealthDropdown.vue'
import AdditionalPayload from './parts/verification/AdditionalPayload.vue'

export default {
  name: 'Verification',
  components: {SmileIdHealthDropdown, VerificationImage, Icon, EmailLink, Limits, ComplianceLog, Clipboard, IpTable, FileList, OriginSummary, OriginDetail, ToggleValue, Popper, AdditionalPayload},
  mixins: [verificationDocumentsMixin, idVerificationProviderMixin, auVerificationMixin],
  data () {
    return {
      activeTab: this.$route.query.tab || 'verification',
      loading: false,
      storage: '',
      perPage: 6,
      showVideo: false,
      videoLink: '',
      manual: [], // The upgrade verification queue (bottom half of the page)
      origin: [],
      bvnError: null,
      bvnImages: [],
      queue: [], // The normal verification queue (top half of the page)
      payload: null,
      matrix: [],
      checks: [],
      user: null,
      user2: null,
      type: null,
      birthday: null,
      flagIcon: null,
      flagText: null,
      odataVal: false, // Is saving user verification data
      filter: '',
      filter2: '',
      icons: {
        address: 'fa-home'
      },
      checklistId: null,
      checklistSelfie: null,
      checklistSelfieNote: null,
      checklistGender: null,
      checklistVerifiedFirst: null,
      checklistVerifiedLast: null,
      checklistDob: null,
      checklistSupport: null,
      checklistDlVersion: null,
      checklistAddress: null,
      checklistOther: null,
      checklistCentrix: null,
      reason: null,
      sumsubFrontReason: null,
      disabledButton: true,
      configs: {
        checklistId: {disabled: true, show: false},
        checklistSumsubFront: {disabled: true, show: false},
        checklistSelfie: {disabled: true, show: false},
        checklistGender: {disabled: true, show: false},
        checklistFirst: {disabled: true, show: false},
        checklistLast: {disabled: true, show: false},
        checklistDob: {disabled: true, show: false},
        checklistSupport: {disabled: true, show: false},
        checklistDlVersion: {disabled: true, show: false},
        checklistAddress: {disabled: true, show: false},
        checklistOther: {disabled: true, show: false},
        checklistCentrix: {disabled: true, show: false},
        checklistSave: {disabled: true, show: false}
      },
      manualRealtime: {
        admin_nickname: null,
        admin_url: null,
        module: null,
        sub_module: null,
        data_id: null,
        uid: null,
        status: null,
        created_at: null,
        updated_at: null
      },
      queueRealtime: {
        admin_nickname: null,
        admin_url: null,
        module: null,
        sub_module: null,
        data_id: null,
        uid: null,
        status: null,
        created_at: null,
        updated_at: null
      },
      isUpdate: false,
      showBtn: true,
      showQuest: false,
      btnBack: 'Back',
      btnBackType: 'is-primary',
      isDisabled: false,
      isCentrix: false, // variable to check flag running centrix
      sourceOfFund: {purpose: '', source: '', sourceFiles: [], limit: ''},
      naturePurpose: {
        signup: {
          purpose: '', source: ''
        },
        privacy_coins: {
          purpose: '', source: '', limit: ''
        }
      },
      loadVerifications: false,
      verificationDataActiveTab: 'personal'
    }
  },
  computed: {
    verificationDataTabs () {
      return [{
        id: 'personal',
        label: 'Personal',
        displayed: true,
      }, {
        id: 'primaryIdPayload',
        label: 'Primary ID',
        displayed: !!this.user.primaryIdPayload,
      }, {
        id: 'secondaryIdPayload',
        label: 'Secondary ID',
        displayed: !!this.user.secondaryIdPayload,
      }]
    },
    signupPurpose () {
      let retPurpose = this.naturePurpose.signup.purpose
      if (this.naturePurpose.signup.purposeOther) {
        retPurpose += ' - ' + this.naturePurpose.signup.purposeOther
      }

      return retPurpose
    },
    signupSource () {
      let retSource = this.naturePurpose.signup.source
      if (this.naturePurpose.signup.sourceOther) {
        retSource += ' - ' + this.naturePurpose.signup.sourceOther
      }

      return retSource
    },
    /**
     * Dynamic data for action buttons
     * @returns {Object} configs - configurations for action buttons
     */
    btnActions () {
      let configs = {
        btnSumsub: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnSelfie: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnSelfieNote: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnGender: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnVerifiedFirst: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnVerifiedLast: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnSave: [{label: this.btnBack, type: this.btnBackType}],
        btnDob: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnSupportDocs: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnDlVersion: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnAddress: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnOther: [
          {label: this.btnBack, type: this.btnBackType}
        ],
        btnCentrix: [
          {label: this.btnBack, type: this.btnBackType}
        ]
      }
      return configs
    },
    /**
     *  Condition for view field based on the condition
     * @returns {Object} res - response from operation searching data in array
     */
    verifyPopper () {
      return Object.values(this.verificationFields).some(res => res.field === 'verifiedFirst') ||
          Object.values(this.verificationFields).some(res => res.field === 'verifiedLast' && res.field !== 'verifiedFirst') ||
          Object.values(this.verificationFields).some(res => res.field === 'birthday' && res.field && res.field !== 'verifiedFirst' && res.field !== 'verifiedLast') ||
          Object.values(this.verificationFields).some(res => res.field === 'idNumber' && res.field !== 'verifiedFirst' && res.field !== 'verifiedLast' && res.field !== 'birthday') ||
          Object.values(this.verificationFields).some(res => res.field === 'idVersion' && res.field !== 'verifiedFirst' && res.field !== 'verifiedLast' && res.field !== 'birthday' && res.field !== 'idNumber') ||
          Object.values(this.verificationFields).some(res => res.field === 'address' && res.field !== 'verifiedFirst' && res.field !== 'verifiedLast' && res.field !== 'birthday' && res.field !== 'idNumber' && res.field !== 'idVersion')
    },
    realtimes () {
      return []
    },
    hasMissingVerificationData () {
      return this.verificationFields.filter(x => x.warning).length > 0
    },
    /**
     * Return the dynamic array for building the radio button checklist that will be used inside the popper
     * @returns {Object} buttons - radio button for checklist
     */
    btnChecklist () {
      // constant variable for buttons
      const BTN_YES = 'Yes'
      const BTN_NO = 'No'
      return {
        btnId: [{label: BTN_YES, value: 'id' + BTN_YES}, {label: BTN_NO, value: 'id' + BTN_NO}],
        btnSelfie: [{label: BTN_YES, value: 'selfie' + BTN_YES}, {label: BTN_NO, value: 'selfie' + BTN_NO}],
        btnSelfieNote: [{label: BTN_YES, value: 'selfieNote' + BTN_YES}, {label: 'No', value: 'selfieNote' + BTN_NO}],
        btnNoteReason: [
          {label: 'No note in selfie', value: 'checklist-note'},
          {label: 'No ID in selfie', value: 'checklist-id'},
          {label: 'No note or ID in selfie', value: 'checklist-id-note'},
          {label: 'Other', value: 'checklist-other'}],
        btnGender: [
          {label: 'Male', value: 'male'},
          {label: 'Female', value: 'female'},
          {label: 'Other', value: 'other'}
        ],
        btnVerifiedFirst: [{label: BTN_YES, value: 'verifiedFirst' + BTN_YES}],
        btnVerifiedLast: [{label: BTN_YES, value: 'verifiedLast' + BTN_YES}],
        btnDob: [
          {label: BTN_YES + ', the DOB matches the ID and they are over 18', value: 'dobMatchOver'},
          {label: 'The DOB matches the ID, but they are under 18', value: 'dobMatchBelow'},
          {label: 'The DOB does not match the ID', value: 'dobNotMatch'}
        ],
        btnSupportDocs: [{label: BTN_YES, value: 'supportDoc' + BTN_YES}, {label: BTN_NO, value: 'supportDoc' + BTN_NO}],
        btnDlVersion: [{label: BTN_YES, value: 'dlVersion' + BTN_YES}, {label: BTN_NO, value: 'dlVersion' + BTN_NO}],
        btnAddress: [{label: BTN_YES, value: 'address' + BTN_YES}, {label: BTN_NO, value: 'address' + BTN_NO}],
        btnOther: [
          {label: 'Demograph?', value: 'demograph'},
          {label: 'Webcam?', value: 'webcam'},
          {label: 'Coached?', value: 'coached'},
          {label: 'Anything else of concern?', value: 'anything else of concern'},
          {label: 'None/Already added', value: 'noneoradded'}
        ],
        btnCentrix: [{label: `End the checklist and run ID check (${this.idVerificationProvider.name})`, value: 'centrix'}],
        btnSumsub: [
          {label: 'Problem Applicant Data', value: 'problemmaticApplicant'},
          {label: 'Graphics Editing Software', value: 'graphicSoftware'},
          {label: 'Not a document', value: 'notDocs'},
          {label: 'Invalid ID', value: 'invalidID'},
          {label: 'Bad Selfie/ Bad Video Selfie/ Bad Face Matching', value: 'badSelfie'},
          {label: 'Expiration Date', value: 'expDate'},
          {label: 'Screenshots', value: 'screenshots'},
          {label: 'Low Quality', value: 'lowQuality'},
          {label: 'Front side / Back side missing', value: 'missingSide'},
          {label: 'Incomplete document', value: 'incompleteDocs'},
          {label: 'Damaged document', value: 'damagedDocs'},
          {label: 'Additional documents', value: 'additionalDocs'},
          {label: 'Unsatisfactory Photos', value: 'unsatisfiedPhotos'},
          {label: 'Under 18', value: 'underAge'},
          {label: 'None of the above', value: 'none'}
        ]
      }
    },
    /*
     * Return a dynamic array used to build the verification data fields that an agent needs to fill in.
     * This will also automatically create a warning boolean if they need to fill in a field.
     */
    verificationFields () {
      let fields = []

      if (this.$local.countryCode === 'BR') {
        fields.push({
          label: 'Name',
          field: 'verifiedFirst',
          required: true,
          warning: false
        })
      } else {
        fields.push({
          label: 'Verified first name',
          field: 'verifiedFirst',
          required: true,
          warning: false
        }, {
          label: 'Verified last name',
          field: 'verifiedLast',
          required: true,
          warning: false
        })
      }

      fields.push({
        label: 'Birthday',
        field: 'birthday',
        required: true,
        warning: false
      })

      if (this.$local.countryCode !== 'AU') {
        fields.push({
          label: 'Driver Licence / Passport number',
          field: 'idNumber',
          required: true,
          warning: false
        })
      }

      if (this.$local.countryCode === 'NZ') {
        if (this.getVerificationProvider(this.user).name === 'Manual' || this.getVerificationProvider(this.user).name === 'Centrix') {
          if (this.user.idExpiry !== null) {
            fields.push(
              {
                label: 'Passport exp date',
                field: 'idExpiry',
                required: false,
                warning: false
              }
            )
          } else {
            fields.push({
              label: 'Driver Licence version',
              field: 'idVersion',
              required: false,
              warning: false
            })
          }
        } else {
          fields.push({
            label: 'Driver Licence version',
            field: 'idVersion',
            required: false,
            warning: false
          },
          {
            label: 'Passport exp date',
            field: 'idExpiry',
            required: false,
            warning: false
          }
          )
        }
      }

      fields.push({
        label: 'Address',
        field: 'address',
        required: true,
        warning: false
      })
      if (this.$local.countryCode === 'BR') {
        fields.push({
          label: 'Unit No./House No.',
          field: 'address1',
          required: true,
          warning: false
        }, {
          label: 'Complement',
          field: 'address2',
          required: true,
          warning: false
        }, {
          label: 'State',
          field: 'address3',
          required: true,
          warning: false
        })
      }
      fields.push({
        label: 'City',
        field: 'city',
        required: true,
        warning: false
      }, {
        label: 'Postcode',
        field: 'postcode',
        required: true,
        warning: false
      })
      if (!this.user) {
        return fields
      }

      // Check to see if all the necessary fields are filled in for this user
      for (let row of fields) {
        if (!this.user[row.field]) {
          row.warning = true
        }
        // Special case for removing the licence/passport warning when we have the other field filled in
        if (row.field === 'idVersion') {
          if (!this.user.idVersion) {
            row.warning = !this.user.idExpiry
          }
        }
        if (row.field === 'idExpiry') {
          if (!this.user.idExpiry) {
            row.warning = !this.user.idVersion
          }
        }
      }

      return fields
    },
    canReview () {
      let r = this.$store.state.goauth.roles
      if (typeof (r) !== 'string') {
        return false
      }
      r = r.split(',')
      return r.includes(Role.Admin) || r.includes(Role.Compliance)
    },
    // eslint-disable-next-line vue/return-in-computed-property
    photoWithId () {
      if (this.user.photoWithId) {
        try {
          return JSON.parse(this.user.photoWithId)
        } catch (e) {
          // not a object
        }
        return this.user.photoWithId
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    originPayload () {
      try {
        return JSON.parse(this.user.payload)
      } catch (e) {}
    },
    filteredList () {
      return this.queue.filter((x) => {
        return !this.filter || [x.firstName, x.lastName, x.email, x.uid, x.verifiedFirst, x.verifiedLast, x.idNumber].join(' ').search(new RegExp(this.filter, 'i')) !== -1
      })
    },
    filteredList2 () {
      return this.manual.filter((x) => {
        return !this.filter2 || [x.firstName, x.lastName, x.email, x.uid, x.verifiedFirst, x.verifiedLast, x.type].join(' ').search(new RegExp(this.filter2, 'i')) !== -1
      })
    }
  },
  watch: {
    /**
     * Watch updated value from disabled checklist switcher
     */
    isDisabled (val) {
      if (val === true) {
        this.disabledConfigs()
        this.resetValue()
        this.saveChecklistSettings()
      } else {
        this.resetConfig()
        this.saveChecklistSettings()
      }
    },
    /**
     * Watch updated value for Sumsub Front Side Image /Data
     */
    sumsubFrontReason (value) {
      let type = ''
      let reason = ''
      let subject = ''
      this.configs.checklistSumsubFront.disabled = true
      this.configs.checklistSumsubFront.show = false
      switch (value) {
      case 'problemmaticApplicant':
        type = 'problemData'
        break
      case 'graphicSoftware':
        type = 'problemPhoto'
        subject = 'Easy Crypto Account Verification Photos'
        break
      case 'notDocs':
        type = 'problemPhoto'
        break
      case 'invalidID':
        type = 'invalidID'
        break
      case 'badSelfie':
        type = 'livelinessCheck'
        break
      case 'expDate':
        type = 'expiredID'
        break
      case 'screenshots':
        type = 'problemPhoto'
        subject= 'Easy Crypto Account Verification Screenshot'
        reason = 'as the <strong>photos need to be originals</strong> (we cannot accept screenshots or scans)'
        break
      case 'lowQuality':
        type = 'problemPhoto'
        subject = 'Easy Crypto Account Verification Photo Quality'
        reason = 'as <strong>we cannot see the details due to them being too low quality</strong>'
        break
      case 'missingSide':
        type = 'problemPhoto'
        subject = 'Easy Crypto Account Verification Photos Info Missing'
        reason = 'as we <strong>need to see a clear picture of the front of your ID</strong>'
        break
      case 'incompleteDocs':
        type = 'problemPhoto'
        subject ='Easy Crypto Account Verification Document'
        reason = 'as we <strong>need to see the full document with all four corners in frame</strong>'
        break
      case 'damagedDocs':
        type = 'problemPhoto'
        subject ='Easy Crypto Account Verification Document Damaged'
        reason = 'as your <strong>ID appears to be damaged</strong>. Please provide complete undamaged documents to finish your verification'
        break
      case 'additionalDocs':
        type = 'sumsubAdditionalDoc'
        break
      case 'unsatisfiedPhotos':
        type = 'problemPhoto'
        subject = 'Easy Crypto Account Verification Photos'
        reason = 'as <strong>they do not follow our instructions</strong>'
        break
      case 'underAge':
        type = 'underAge'
        break
      case 'none':
        this.configs.checklistSumsubFront.disabled = true
        this.configs.checklistSumsubFront.show = false
        this.configs.checklistGender.disabled = false
        this.configs.checklistGender.show = true
        break
      }
      if (value !== 'none') {
        this.denyPhotos({ type, reason, subject })
      }
    },
    /**
     * Watch updated value for checklistId
     */
    checklistId (value) {
      switch (value) {
      case 'idYes':
        this.configs.checklistSelfie.show = true
        this.configs.checklistSelfie.disabled = false
        this.configs.checklistId.disabled = true
        this.configs.checklistId.show = false
        break
      case 'idNo':
        this.configs.checklistId.disabled = true
        this.configs.checklistSelfie.disabled = false
        this.configs.checklistSelfie.show = false
        this.configs.checklistId.show = false
        let type = 'unclearID'
        this.denyPhotos({ type })
        break
      }
    },
    /**
     * Watch updated value for checklistSelfie
     */
    checklistSelfie (value) {
      switch (value) {
      case 'selfieYes':
        this.showQuest = true
        this.showBtn = false
        break
      case 'selfieNo':
        this.showQuest = false
        this.configs.checklistSelfie.disabled = true
        this.configs.checklistSelfie.show = false
        let type = 'noSelfie'
        this.denyPhotos({ type })
        break
      }
    },
    checklistSelfieNote (value) {
      if (value === 'selfieNoteYes') {
        this.configs.checklistGender.disabled = false
        this.configs.checklistGender.show = true
        this.configs.checklistSelfie.disabled = true
        this.configs.checklistSelfie.show = false
      }
    },
    /**
     * Watch updated value for checklistGender
     */
    checklistGender (value) {
      if (value) {
        this.user.gender = value
        this.setGender()
      }
    },
    /**
     * Watch updated value for Verified First
     */
    checklistVerifiedFirst (value) {
      if (value) {
        this.configs.checklistLast.show = true
        this.configs.checklistLast.disabled = false
        this.configs.checklistFirst.disabled = true
        this.configs.checklistFirst.show = false
      }
    },
    /**
     * Watch updated value for Verified Last
     */
    checklistVerifiedLast (value) {
      if (value) {
        this.configs.checklistDob.show = true
        this.configs.checklistDob.disabled = false
        this.configs.checklistLast.disabled = true
        this.configs.checklistLast.show = false
      }
    },
    /**
     * Watch updated value for DOB
     */
    checklistDob (value) {
      switch (value) {
      case 'dobMatchBelow':
        this.configs.checklistDob.disabled = true
        this.configs.checklistDob.show = false
        let type = 'underAge'
        this.denyPhotos({ type })
        break
      case 'dobNotMatch':
        this.$buefy.toast.open({
          message: 'Please edit the birthday!',
          position: 'is-top'
        })
        break
      case 'dobMatchOver':
        this.configs.checklistSupport.show = true
        this.configs.checklistSupport.disabled = false
        this.configs.checklistDob.disabled = true
        this.configs.checklistDob.show = false
        break
      }
    },
    /**
     * Watch updated value for Driving License / Passport Number
     */
    checklistSupport (value) {
      switch (value) {
      case 'supportDocYes':
        this.configs.checklistDlVersion.show = true
        this.configs.checklistDlVersion.disabled = false
        this.configs.checklistSupport.disabled = true
        this.configs.checklistSupport.show = false
        break
      case 'supportDocNo':
        this.$buefy.toast.open({
          message: 'Please edit the driving license or passport number!',
          position: 'is-top'
        })
        break
      }
    },
    /**
     * Watch updated value for Driving License Version / Passport Expiry
     */
    checklistDlVersion (value) {
      switch (value) {
      case 'dlVersionYes':
        this.configs.checklistAddress.show = true
        this.configs.checklistAddress.disabled = false
        this.configs.checklistDlVersion.disabled = true
        this.configs.checklistDlVersion.show = false
        break
      case 'dlVersionNo':
        this.$buefy.toast.open({
          message: 'Please edit the driving license version or passport expiry date!',
          position: 'is-top-right'
        })
        break
      }
    },
    /**
     * Watch updated value for Address
     */
    checklistAddress (value) {
      switch (value) {
      case 'addressYes':
        this.configs.checklistSave.show = true
        this.configs.checklistSave.disabled = false
        this.configs.checklistAddress.disabled = true
        this.configs.checklistAddress.show = false
        this.disabledButton = false
        break
      case 'addressNo':
        this.$buefy.toast.open({
          message: 'Please edit the address!',
          position: 'is-top-left'
        })
        break
      }
    },
    /**
     * Watch updated value for Other issue
     */
    checklistOther (value) {
      if (value !== 'noneoradded' && value !== null) {
        this.configs.checklistOther.disabled = true
        this.configs.checklistOther.show = false
        this.$refs.modal.openModal(value)
      } else if (value !== null) {
        this.configs.checklistCentrix.show = true
        this.configs.checklistCentrix.disabled = false
        this.configs.checklistOther.disabled = true
        this.configs.checklistOther.show = false
      }
    },
    checklistCentrix (value) {
      if (value) {
        this.configs.checklistCentrix.show = false
        this.configs.checklistCentrix.disabled = true
      }
    },
    /**
     * Watch updated value for reason of Selfie with Note
     */
    reason (val) {
      let type = 'checklist-selfie'
      let reason = ''
      this.configs.checklistId.disabled = false
      this.configs.checklistId.show = false
      this.configs.checklistSelfie.disabled = true
      this.configs.checklistSelfie.show = false
      switch (val) {
      case 'checklist-note':
        reason = 'as the selfie <strong>didn\'t include a note and your ID as per the instructions.</strong>'
        break
      case 'checklist-id':
        reason = 'as your <strong>selfie didn\'t include your ID</strong>'
        break
      case 'checklist-id-note':
        reason = 'as the selfie <strong>didn\'t include a note and your ID as per the instructions</strong>.'
        break
      case 'checklist-other':
        reason = '<strong>your selfie didn\'t follow the instructions</strong>'
        break
      }
      this.denyPhotos({ type, reason })
    },
    user2 () {
      Object.values(this.realtimes).forEach((res) => {
        if (res.admin_nickname === this.$store.state.goauth.name && res.sub_module === 'Upgrade Queue') {
          this.queueRealtime.admin_nickname = res.admin_nickname
          this.queueRealtime.data_id = res.data_id
          this.queueRealtime.sub_module = res.sub_module
        }
      })
      /**
       * subModule is a parameter to define current submodule
       * The parameter will be passed to updateRealtime for firestore find the data based on the passed parameter
       * The parameter also will be passed to createRealtime for firestore creating new doc
       */
      let subModule = 'Upgrade Queue'
      // Check if the rowId same with current data id and agent is same with current data
      if (this.user2.id !== this.queueRealtime.data_id && this.$store.state.goauth.name === this.queueRealtime.admin_nickname) {
        /**
         * isUpdate is a parameter to trigger update
         * If meet with first check, set isUpdate = true
         */
        this.isUpdate = true
        this.updateRealtime(subModule)
      } else {
        this.createRealtime(subModule)
      }
      this.loadLatestSourceOfFunds()
      this.loadNaturePurposeInfo()
    },
    async user () {
      // reset bvn
      this.bvnError = null
      if (!this.user) {
        return
      }
      this.resetVerificationDocuments()
      this.bvnImages = []
      this.type = 'manual'
      this.birthday = this.$moment(this.user.birthday).format('DD-MM-YYYY')

      // Load realtime user from firestore and ammend to events if current user same with data from firestore
      Object.values(this.realtimes).forEach((res) => {
        if (res.admin_nickname === this.$store.state.goauth.name && res.sub_module === 'New Manual') {
          this.manualRealtime.admin_nickname = res.admin_nickname
          this.manualRealtime.data_id = res.data_id
          this.manualRealtime.sub_module = res.sub_module
        }
      })
      /**
       * subModule is a parameter to define current submodule
       * The parameter will be passed to updateRealtime for firestore find the data based on the passed parameter
       * The parameter also will be passed to createRealtime for firestore creating new doc
       */
      let subModule = 'New Manual'
      // Check if the rowId same with current data id and agent is same with current data
      if (this.user.id !== this.manualRealtime.data_id && this.$store.state.goauth.name === this.manualRealtime.admin_nickname) {
        /**
         * isUpdate is a parameter to trigger update
         * If meet with first check, set isUpdate = true
         */
        this.isUpdate = true
        this.updateRealtime(subModule)
      } else {
        this.createRealtime(subModule)
      }
      // get sumsub image ID from database if provider is Sumsub
      if (this.getVerificationProvider(this.user).name === 'Sumsub') {
        await this.getExternalUserDocuments(this.user.uid, 'Sumsub')
      }
      if (this.$local.countryCode === 'NG') {
        try {
          let data = await this.ecApi('admin', 'getExternalUserPayload', {
            uid: this.user.uid,
            provider: 'BVN'
          })
          if (data.payload !== null) {
            let bvn = data.payload
            this.bvnImages = bvn.split(',')
          } else {
            this.bvnError = 'BVN images not found / Something wrong with BVN verification'
          }
        } catch (e) {
          console.log(e)
        }
      }
      this.resetConfig()
      this.fetchVerificationFilesIfExists()
      if (this.user && this.user.payload) {
        try {
          this.payload = this.$local.vms.enable ? this.user.payload.slice(-1)[0] : JSON.parse(this.user.payload)
        } catch (e) {
          // nothing
        }
        if (this.getVerificationProvider(this.user).name === 'OriginID') {
          // Origin ID
          this.type = 'originid'
          if (!this.payload || !this.payload.hasOwnProperty('details')) {
            console.log('not valid origin data')
            return // not valid Origin data
          }

          // personal data
          let data = this.payload.details.personal
          let dob = null
          let lastname = null
          let firstname = null
          let licencenumber = null
          if (data) {
            dob = data.dateOfBirth
            lastname = data.lastName
            firstname = data.firstName
            licencenumber = data.licenceNumber
          } else {
            let payload = this.payload
            if (payload && payload.hasOwnProperty('results')) {
              if (payload.results.hasOwnProperty('documents') && Array.isArray(payload.results.documents)) {
                let pdocuments = payload.results.documents.shift()
                firstname = pdocuments.confirmedData.firstName
                lastname = pdocuments.confirmedData.lastName
                dob = pdocuments.confirmedData.dateOfBirth
                licencenumber = pdocuments.confirmedData.licenceNumber
              }
            }
          }

          this.user.firstName = this.user.firstName || this.nameCase(firstname) // use user's preferred name first
          this.user.lastName = this.user.lastName || this.nameCase(lastname)
          this.user.verifiedFirst = this.user.verifiedFirst || firstname
          this.user.verifiedLast = this.user.verifiedLast || lastname
          this.user.birthday = this.user.birthday || dob
          this.user.idNumber = this.user.idNumber || (licencenumber ? licencenumber.toUpperCase() : null)
        }
      }
    }
  },
  mounted () {
    this.loadQueue()
    this.loadChecklistSettings()
    if (this.$local.countryCode !== 'NZ') {
      this.isDisabled = true
    }
  },
  methods: {
    resetUser () {
      this.user = null
      this.user2 = null
    },
    changeTab (tab) {
      this.$router.push({query: {tab}})
    },
    /**
     * Used to disable checklist configs and disabled button when switcher value is true
     * @returns {*}
     */
    disabledConfigs () {
      this.configs.checklistId.show = false
      this.configs.checklistId.disabled = true
      this.configs.checklistSelfie.show = false
      this.configs.checklistSelfie.disabled = true
      this.configs.checklistGender.show = false
      this.configs.checklistGender.disabled = true
      this.configs.checklistFirst.show = false
      this.configs.checklistFirst.disabled = true
      this.configs.checklistLast.show = false
      this.configs.checklistLast.disabled = true
      this.configs.checklistDob.show = false
      this.configs.checklistDob.disabled = true
      this.configs.checklistSupport.show = false
      this.configs.checklistSupport.disabled = true
      this.configs.checklistDlVersion.show = false
      this.configs.checklistDlVersion.disabled = true
      this.configs.checklistAddress.show = false
      this.configs.checklistAddress.disabled = true
      this.configs.checklistOther.show = false
      this.configs.checklistOther.disabled = true
      this.configs.checklistCentrix.show = false
      this.configs.checklistCentrix.disabled = true
      this.configs.checklistSave.show = false
      this.configs.checklistSave.disabled = true
      this.configs.checklistSumsubFront.show = false
      this.configs.checklistSumsubFront.disabled = true
      this.disabledButton = false
    },
    /**
     * Used to load checklist setting flag and ammended the value to isDisabled
     * @returns {*}
     */
    async loadChecklistSettings () {
      try {
        let res = await this.ecApi('admin', 'loadChecklistSettings', {
          admin_nickname: this.$store.state.goauth.name,
          module_name: 'Verification'
        })
        if (res['setting'].module_flag === 1) {
          this.isDisabled = true
        }
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * Used to get latest source of Fund
     * @returns {*}
     */
    async loadLatestSourceOfFunds () {
      try {
        // Get source of funds
        this.sourceOfFund = await this.ecApi('admin', 'getLatestSourceOfFund', {uid: this.user2.uid})
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * Used to load nature and purpose information if type is privacy
     * @returns {*}
     */
    async loadNaturePurposeInfo () {
      try {
        // get nature and purpose
        this.naturePurpose = await this.ecApi('admin', 'getNatureAndPurposeInfo', {uid: this.user2.uid})
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * Used to save checklist setting information into table settings
     * @returns {*}
     */
    async saveChecklistSettings () {
      try {
        // Default value for flag
        let flag = 0
        if (this.isDisabled === true) {
          // If isDisabled = true, set flag =1
          flag = 1
        }
        await this.ecApi('admin', 'saveChecklistSettings', {
          admin_nickname: this.$store.state.goauth.name,
          module_name: 'Verification',
          module_flag: flag
        })
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * Method for  Sumsub
     * @returns {*}
     */
    btnSumsub () {
      this.configs.checklistSumsubFront.show = true
      this.configs.checklistSumsubFront.disabled = false
    },
    /**
     * Method for  Selfie
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnSelfie () {
      this.checklistSelfie = null
      this.checklistId = null
      this.configs.checklistId.show = true
      this.configs.checklistId.disabled = false
      this.configs.checklistSelfie.disabled = true
      this.configs.checklistSelfie.show = false
    },
    /**
     * Method for  Selfie Note
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnSelfieNote () {
      this.showQuest = false
      this.checklistSelfieNote = null
      this.checklistSelfie = null
      this.showBtn = true
    },
    /**
     * Method for Gender
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnGender () {
      this.checklistGender = null
      this.configs.checklistGender.disabled = true
      this.configs.checklistGender.show = false
      if (this.getVerificationProvider(this.user).name === 'Sumsub') {
        this.configs.checklistSumsubFront.show = true
        this.configs.checklistSumsubFront.disabled = false
      } else {
        this.checklistSelfieNote = null
        this.configs.checklistSelfie.show = true
        this.configs.checklistSelfie.disabled = false
      }
    },
    /**
     * Method for VerifiedFirst
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnVerifiedFirst () {
      this.checklistVerifiedFirst = null
      this.checklistVerifiedLast = null
      this.configs.checklistGender.show = true
      this.configs.checklistGender.disabled = false
      this.configs.checklistFirst.disabled = true
      this.configs.checklistFirst.show = false
    },
    /**
     * Method for VerifiedLast
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnVerifiedLast () {
      this.checklistVerifiedFirst = null
      this.checklistVerifiedLast = null
      this.configs.checklistFirst.show = true
      this.configs.checklistFirst.disabled = false
      this.configs.checklistLast.disabled = true
      this.configs.checklistLast.show = false
    },
    /**
     * Method for Save field
     * @returns {*}
     */
    btnSave () {
      this.checklistAddress = null
      this.configs.checklistAddress.show = true
      this.configs.checklistAddress.disabled = false
      this.configs.checklistSave.disabled = true
      this.configs.checklistSave.show = false
    },
    /**
     * Method for Dob
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnDob () {
      this.checklistDob = null
      this.checklistVerifiedLast = null
      this.configs.checklistLast.show = true
      this.configs.checklistLast.disabled = false
      this.configs.checklistDob.disabled = true
      this.configs.checklistDob.show = false
    },
    /**
     * Method for Support Documents
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnSupportDocs () {
      this.checklistSupport = null
      this.checklistDob = null
      this.configs.checklistDob.show = true
      this.configs.checklistDob.disabled = false
      this.configs.checklistSupport.disabled = true
      this.configs.checklistSupport.show = false
    },
    /**
     * Method for Driving License Version or Passport Expiry
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnDlVersion () {
      this.checklistDlVersion = null
      this.checklistSupport = null
      this.configs.checklistSupport.show = true
      this.configs.checklistSupport.disabled = false
      this.configs.checklistDlVersion.disabled = true
      this.configs.checklistDlVersion.show = false
    },
    /**
     * Method for Address
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnAddress () {
      this.checklistAddress = null
      this.checklistDlVersion = null
      this.configs.checklistDlVersion.show = true
      this.configs.checklistDlVersion.disabled = false
      this.configs.checklistAddress.disabled = true
      this.configs.checklistAddress.show = false
    },
    /**
     * Method for Other
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnOther () {
      this.checklistOther = null
      this.checklistAddress = null
      this.configs.checklistSave.show = true
      this.configs.checklistSave.disabled = false
      this.configs.checklistOther.disabled = true
      this.configs.checklistOther.show = false
    },
    /**
     * Method for Centrix
     * @param {String} action - name of action that defined in array
     * @returns {*}
     */
    btnCentrix () {
      this.checklistCentrix = null
      this.checklistOther = null
      this.configs.checklistOther.show = true
      this.configs.checklistOther.disabled = false
      this.configs.checklistCentrix.disabled = true
      this.configs.checklistCentrix.show = false
    },
    /**
     * Reset the current condition to initial state
     * @returns {*}
     */
    resetConfig () {
      if (this.isDisabled === false) {
        if (this.getVerificationProvider(this.user).name === 'Manual') {
          this.configs.checklistId.show = true
          this.configs.checklistId.disabled = false
        } else {
          this.configs.checklistSumsubFront.show = true
          this.configs.checklistSumsubFront.disabled = false
        }
        this.configs.checklistSelfie.show = false
        this.configs.checklistSelfie.disabled = true
        this.configs.checklistGender.show = false
        this.configs.checklistGender.disabled = true
        this.configs.checklistFirst.show = false
        this.configs.checklistFirst.disabled = true
        this.configs.checklistLast.show = false
        this.configs.checklistLast.disabled = true
        this.configs.checklistDob.show = false
        this.configs.checklistDob.disabled = true
        this.configs.checklistSupport.show = false
        this.configs.checklistSupport.disabled = true
        this.configs.checklistDlVersion.show = false
        this.configs.checklistDlVersion.disabled = true
        this.configs.checklistAddress.show = false
        this.configs.checklistAddress.disabled = true
        this.configs.checklistOther.show = false
        this.configs.checklistOther.disabled = true
        this.configs.checklistCentrix.show = false
        this.configs.checklistCentrix.disabled = true
        this.configs.checklistSave.show = false
        this.configs.checklistSave.disabled = true
        this.showBtn = true
        this.showQuest = false
        this.resetValue()
      } else {
        this.disabledButton = false
      }
    },
    /**
     * Reset value after the operation successfully run
     * @returns {*}
     */
    resetValue () {
      this.checklistId = null
      this.checklistSelfie = null
      this.checklistSelfieNote = null
      this.checklistGender = null
      this.checklistVerifiedFirst = null
      this.checklistVerifiedLast = null
      this.checklistDob = null
      this.checklistSupport = null
      this.checklistDlVersion = null
      this.checklistAddress = null
      this.checklistOther = null
      this.checklistCentrix = null
      this.sumsubFrontReason = null
      this.sumsubSelfieReason = null
    },
    /**
     * Update condition after successfully added the compliance note
     * @returns {*}
     */
    complianceResponse () {
      if (this.checklistOther !== null) {
        this.configs.checklistOther.disabled = true
        this.configs.checklistOther.show = false
        if (this.configs.checklistOther.show === false) {
          this.resetValue()
        }
      }
    },
    /**
     * Update condition when modal is closed
     * @returns {*}
     */
    closeModal () {
      if (this.isDisabled === false) {
        if (this.configs.checklistOther.disabled === true) {
          this.configs.checklistOther.disabled = false
          this.configs.checklistOther.show = true
        }
      }
    },
    /**
     * Function to create new realtime doc in firestore
     * @param {string} subModule - name of submodule that will be passed from user()
     * return {Promise<Boolean>}
     */
    createRealtime (subModule) {
      switch (subModule) {
      case 'New Manual':
        this.manualRealtime.admin_nickname = this.$store.state.goauth.name
        this.manualRealtime.admin_url = this.$store.state.goauth.photo
        this.manualRealtime.module = 'Verification'
        this.manualRealtime.data_id = this.user.id
        this.manualRealtime.uid = this.user.uid
        this.manualRealtime.status = 1
        this.manualRealtime.created_at = new Date()
        this.manualRealtime.sub_module = subModule
        if (this.manualRealtime) {
          // this.$store.dispatch('realtime/add', this.manualRealtime)
        } else {
          return false
        }
        break
      case 'Upgrade Queue':
        this.queueRealtime.admin_nickname = this.$store.state.goauth.name
        this.queueRealtime.admin_url = this.$store.state.goauth.photo
        this.queueRealtime.module = 'Verification'
        this.queueRealtime.data_id = this.user2.id
        this.queueRealtime.uid = this.user2.uid
        this.queueRealtime.status = 1
        this.queueRealtime.created_at = new Date()
        this.queueRealtime.sub_module = subModule
        if (this.queueRealtime) {
          // this.$store.dispatch('realtime/add', this.queueRealtime)
        } else {
          return false
        }
        break
      }
    },
    /**
     * Function to create new realtime doc in firestore
     * @param {string} subModule - name of submodule that will be passed from user()
     * return {Promise<Boolean>}
     */
    updateRealtime (subModule) {
      let res
      switch (subModule) {
      case 'New Manual':
        // res = this.$store.dispatch('realtime/update', this.manualRealtime)
        break
      case 'Upgrade Queue':
        // res = this.$store.dispatch('realtime/update', this.queueRealtime)
        break
      }
      if (res && this.isUpdate === true) {
        // If result Promise is not pending, set isUpdate = false
        this.isUpdate = false
        if (this.isUpdate === false) {
          // Call createRealtime with params after set isUpdate = false
          this.createRealtime(subModule)
        }
      } else {
        return false
      }
    },
    setFlag (row, flag, showNotification = false) {
      let f
      let notification
      switch (flag) {
      case 'verified':
        row.flag = true
        row.flagIcon = 'check'
        row.flagColour = 'success'
        row.flagText = 'Verified'
        notification = 'This user has been verified and has been emailed to let them know'
        break
      case 'fraud':
      case 'banned':
        f = this.getFlag('banned')
        row.flag = true
        row.flagIcon = f.icon
        row.flagColour = 'danger'
        row.flagText = f.label
        break
      case 'frozen':
      case 'suspicious':
        f = this.getFlag('frozen')
        row.flag = true
        row.flagIcon = f.icon
        row.flagColour = 'danger'
        row.flagText = f.label
        break
      case 'denied':
        row.flag = true
        row.flagIcon = 'times'
        row.flagColour = 'danger'
        row.flagText = 'Denied'
        notification = 'Request was denied and the user has been emailed'
        break
      case 'delete':
        row.flag = true
        row.flagIcon = 'times'
        row.flagColour = 'primary'
        row.flagText = 'Ignored'
        notification = 'Request was removed and the user has not been emailed'
        break
      case 'address':
      case 'poaRequested':
        row.flag = flag
        row.flagIcon = 'home'
        row.flagColour = 'dark'
        row.flagText = 'Proof of address has been requested'
        notification = 'Verified the user and sent an email requesting a proof-of-address'
        break
      case 'email':
      case 'emailed':
        row.flag = flag
        row.flagIcon = 'envelope'
        row.flagColour = 'dark'
        row.flagText = 'Have requested additional info via helpdesk'
        break
      case 'photos':
        row.flag = flag
        row.flagIcon = 'envelope'
        row.flagColour = 'dark'
        row.flagText = 'Replied'
        // row.flagText = 'Have requested new photos'
        notification = 'The user has been sent an email requesting new photos'
        break
      default:
        row.flag = null
        row.flagIcon = null
        row.flagColour = null
        row.flagText = null
        break
      }
      // Show a snackbar with an update
      if (showNotification && notification) {
        this.$buefy.snackbar.open({
          message: notification,
          position: 'is-bottom-left',
          duration: 8000,
          queue: false
        })
      }
    },
    processRow (row, flag) {
      this.setFlag(row, flag, true)
      // Sort by "no flag" by descending createdAt
      const filteredNoFlagQueue = this.queue.filter(x => !x.flag);
      filteredNoFlagQueue.sort((a, b) => {
        return new Date(b.created) - new Date(a.created);
      });
      this.queue = filteredNoFlagQueue.concat(this.queue.filter(x => x.flag));
    },
    onCompleteApiCall (data, queue = []) {
      this.payload = null
      this.type = null
      this.user2 = null
      this.manual = data.manual
      this.queue = queue
      const origin = []
      for (let row of data.origin) {
        this.setFlag(row, row.flag)
        origin.push(row)
      }
      this.origin = origin
    },
    async loadQueue () {
      this.user = null
      this.user2 = null
      if (this.$local.vms.enable) {
        const [fromVMS, fromUDB] = await Promise.all([
          this.verifyApi('applications/' + this.$local.countryCode, 'GET'),
          this.ecApi('admin', 'getVerificationQueue')
        ])
        fromVMS.data.data.forEach(d => {
          d.tier = 0
          d.uid = d.externalId
          const matchingDataFromUDB = fromUDB.queue.find(({uid}) => uid === d.externalId)
          if (matchingDataFromUDB) {
            d.tier = matchingDataFromUDB.tier
            this.setFlag(d, 'verified')
          }
        })
        this.onCompleteApiCall(fromUDB, fromVMS.data.data)
      } else {
        this.ecApi('admin', 'getVerificationQueue')
          .then((data) => {
            const queue = []
            for (let row of data.queue) {
              // Do flags
              if (row.fraud) {
                this.setFlag(row, 'fraud')
              } else if (row.suspicious) {
                this.setFlag(row, 'frozen')
              } else if (row.denied) {
                this.setFlag(row, 'denied')
              } else if (row.flag) {
                this.setFlag(row, row.flag)
              } else if (row.tier) {
                this.setFlag(row, 'verified')
              }
              queue.push(row)
            }
            this.onCompleteApiCall(data, queue)
          })
          .catch((e) => console.log(e))
      }
    },
    async setGender () {
      try {
        let res = await this.ecApi('admin', 'setValue', {
          uid: this.user.uid,
          table: 'user',
          column: 'gender',
          value: this.user.gender
        })
        if (res) {
          if (this.isDisabled === false) {
            this.configs.checklistFirst.show = true
            this.configs.checklistFirst.disabled = false
            this.configs.checklistGender.disabled = true
            this.configs.checklistGender.show = false
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    copyq () {
      let fields = [
        this.user.address,
        this.user.idNumber,
        this.user.firstName,
        this.user.lastName,
        this.user.uid
      ]

      function copy () {
        let temp = document.createElement('input')
        document.body.appendChild(temp)
        temp.style = 'position: absolute; left: -1000px; top: -1000px'
        temp.value = fields.shift()
        temp.select()
        document.execCommand('copy')
        document.body.removeChild(temp)
        if (fields.length) {
          setTimeout(() => {
            copy()
          }, 500)
        }
      }

      copy()

      this.$buefy.toast.open('All copied!')
    },
    denyPhotos ({ type, reason, subject }) {
      let user = this.user
      let noReply = false
      let emailSubject = subject || 'Easy Crypto Verification'
      let emailBody = ''
      let generalEmail = false
      this.email = user.email
      const emailPlaceholders = {
        firstName: user.firstName,
        reason,
        country: this.$local.country,
        verifyUrl: `${this.$local.site}/verify`
      }
      switch (type) {
      case 'note':
        if (this.$local.countryCode === 'ZA') {
          const { subject: noteZaSubject, body } = VERIFICATION_EMAIL_BODY.noteZA
          emailSubject = noteZaSubject
          emailBody = formatEmailBody(body, emailPlaceholders)
        } else {
          const { subject: noteSubject, body } = VERIFICATION_EMAIL_BODY.note
          emailSubject = noteSubject
          emailBody = formatEmailBody(body, emailPlaceholders)
        }
        break
      case 'foreign':
        const { body: foreignEmailBody } = VERIFICATION_EMAIL_BODY.foreign
        emailBody = formatEmailBody(foreignEmailBody, emailPlaceholders)
        break
      case 'checklist-selfie':
        noReply = false
        const { body: checklistSelfieBody } = VERIFICATION_EMAIL_BODY.checklistSelfie
        emailBody = formatEmailBody(checklistSelfieBody, emailPlaceholders)
        break
      case 'unclearID':
        noReply = false
        const { subject: unclearIDSubject, body: unclearIDBody } = VERIFICATION_EMAIL_BODY.unclearID
        emailSubject = unclearIDSubject
        emailBody = formatEmailBody(unclearIDBody, emailPlaceholders)
        break
      case 'noSelfie':
        noReply = false
        const { subject: noSelfieSubject, body: noSelfieBody } = VERIFICATION_EMAIL_BODY.noSelfie
        emailSubject = noSelfieSubject
        emailBody = formatEmailBody(noSelfieBody, emailPlaceholders)
        break
      case 'underAge':
        const { subject: underAgeEmailSubject, body: underAgeEmailBody } = VERIFICATION_EMAIL_BODY.underAge
        emailSubject = underAgeEmailSubject
        emailBody = formatEmailBody(underAgeEmailBody, emailPlaceholders)
        break
      case 'expiredID':
        noReply = false
        const { subject: expiredIdEmailSubject, body: expiredIdEmailBody } = VERIFICATION_EMAIL_BODY.expiredID
        emailSubject = expiredIdEmailSubject
        emailBody = formatEmailBody(expiredIdEmailBody, emailPlaceholders)
        break
      case 'problemData':
        noReply = false
        const { subject: problemDataEmailSubject, body: problemDataEmailBody } = VERIFICATION_EMAIL_BODY.problemData
        emailSubject = problemDataEmailSubject
        emailBody = formatEmailBody(problemDataEmailBody, emailPlaceholders)
        break
      case 'livelinessCheck':
        noReply = false
        const { subject: livelinessCheckSubject, body: livelinessCheckBody } = VERIFICATION_EMAIL_BODY.livelinessCheck
        emailSubject = livelinessCheckSubject
        emailBody = formatEmailBody(livelinessCheckBody, emailPlaceholders)
        break
      case 'problemData':
        const { subject: problemDataSubject , body: problemDataBody } = VERIFICATION_EMAIL_BODY.problemData
        emailSubject = problemDataSubject
        emailBody = formatEmailBody(problemDataBody, emailPlaceholders)
        break
      case 'problemPhoto':
        const { body: problemPhotoBody } = VERIFICATION_EMAIL_BODY.problemPhoto
        emailBody = formatEmailBody(problemPhotoBody, emailPlaceholders)
        break
      case 'invalidID':
        const { subject: invalidIDSubject, body: invalidIDBody } = VERIFICATION_EMAIL_BODY.invalidID
        emailSubject = invalidIDSubject
        emailBody = formatEmailBody(invalidIDBody, emailPlaceholders)
        break
      case 'sumsubAdditionalDoc':
        const { subject: sumsubAdditionalDocSubject, body: sumsubAdditionalDocBody } = VERIFICATION_EMAIL_BODY.sumsubAdditionalDoc
        emailSubject = sumsubAdditionalDocSubject
        emailBody = formatEmailBody(sumsubAdditionalDocBody, emailPlaceholders)
        break
      case 'general':
        noReply = true
        this.email = 'compliance@easycrypto.ai'
        generalEmail = true
        const { subject: generalSubject, body: generalBody } = VERIFICATION_EMAIL_BODY.general
        emailSubject = generalSubject
        emailBody = formatEmailBody(generalBody, emailPlaceholders)
        break
      case 'additionalDoc':
        noReply = true
        const { body: additionalDocBody } = VERIFICATION_EMAIL_BODY.additionalDoc
        emailBody = formatEmailBody(additionalDocBody, emailPlaceholders)
        break
      }
      this.sendEmail({
        noreply: noReply,
        email: this.email,
        subject: emailSubject,
        body: emailBody
      })
        .then(() => {
          this.resetValue()
          return this.apiv2('verify-admin', 'updateFlag', {
            uid: user.uid,
            flag: 'photos',
            generalEmail: generalEmail
          })
        })
        .then(() => {
          this.$buefy.toast.open('Flag updated')
          let index = this.queue.findIndex(x => x.id === user.id)
          let row = this.queue[index]
          this.processRow(row, 'photos')
        })
        .catch(e => {
          if (this.isDisabled === false) {
            if (this.configs.checklistId.disabled === true && this.checklistId === 'idNo' && e === undefined) {
              this.configs.checklistId.disabled = false
              this.configs.checklistId.show = true
            }
            if ((this.configs.checklistSelfie.disabled === true && this.checklistSelfie === 'selfieNo' && e === undefined) || (this.configs.checklistSelfie.disabled === true && this.reason !== '' && e === undefined)) {
              this.configs.checklistSelfie.disabled = false
              this.configs.checklistSelfie.show = true
            }
            if (this.configs.checklistDob.disabled === true && this.checklistDob === 'dobMatchBelow' && e === undefined) {
              this.configs.checklistDob.disabled = false
              this.configs.checklistDob.show = true
              this.configs.checklistSelfie.disabled = true
              this.configs.checklistSelfie.show = false
            }
            if (this.configs.checklistSumsubFront.disabled === true && this.sumsubFrontReason !== 'none' && e === undefined) {
              this.configs.checklistSumsubFront.disabled = false
              this.configs.checklistSumsubFront.show = true
            }
          }
          console.log(e)
        })
    },
    updateFlag (flag) {
      let uid = this.user.uid
      this.$buefy.dialog.confirm({
        message: 'Are you sure?',
        onConfirm: () => {
          this.apiv2('verify-admin', 'updateFlag', {
            uid: uid,
            flag: flag
          })
            .then((res) => {
              this.$buefy.toast.open('Flag updated')
              let index = this.queue.findIndex(x => x.id === this.user.id)
              let row = this.queue[index]
              this.processRow(row, flag)
            })
            .catch(e => console.log(e))
        }
      })
    },
    requestAddress () {
      this.saveOdata()
      let user = this.user
      this.$buefy.dialog.prompt({
        message: 'We will send an POA request email. Please check the customer\'s first name:',
        inputAttrs: {
          value: this.ucFirst(user.firstName)
        },
        onConfirm: (value) => {
          this.apiv2('admin', 'addressRequired', {
            id: user.id,
            uid: user.uid,
            email: user.email,
            firstName: value
          })
            .then(() => {
              let row = this.queue[this.queue.findIndex(x => x.id === user.id)]
              this.processRow(row, 'address')
            })
            .catch(err => console.log(err))
        }
      })
    },
    async verify () {
      if (this.loading) {
        return
      }
      let user = this.user
      let type = this.type
      let res = await this.saveOdata()
      if (res) {
        user.birthday = this.$moment(this.birthday, 'DD-MM-YYYY').format('YYYY-MM-DD') // birthday back to ISO format
        this.$buefy.dialog.confirm({
          message: 'Are you sure you want to verify ' + user.firstName + ' ' + user.lastName + '?',
          onConfirm: async () => {
            this.loading = true
            try {
              await this.apiv2('admin', 'manuallyVerify', {
                uid: user.uid,
                type: type,
                userdata: user,
                tier: this.$local.countryCode === 'ZA' ? 10 : 20
              })
              let row = this.queue[this.queue.findIndex(x => x.id === user.id)]
              this.processRow(row, 'verified')
            } catch (e) {
              console.log(e)
            }
            this.loading = false
            this.resetValue()
            console.log(this.configs)
          }
        })
      }
    },
    verifyAddress () {
      if (this.loading) {
        return
      }
      this.loading = true
      let user = this.user2
      this.$buefy.dialog.confirm({
        message: 'Are you sure you want to verify address ' + user.firstName + ' ' + user.lastName + '?',
        onConfirm: () => {
          this.apiv2('admin', 'manuallyVerify', {
            uid: user.uid,
            type: 'address',
            userdata: user,
            tier: 20
          })
            .then(() => {
              let row = this.manual[this.manual.findIndex(x => x.id === user.id)]
              row.processed = true
              this.setFlag(row, 'verified', true)
              this.loading = false
            })
            .catch((err) => {
              console.log(err)
              this.loading = false
            })
        }
      })
    },
    async denyAddress () {
      let user = this.user2
      try {
        await this.sendEmail({
          what: 'Proof of address denied',
          noreply: false,
          email: user.email,
          subject: 'Easy Crypto Verify Address - More info needed',
          body: `Hi ${user.firstName}

Thank you for your address verification request, the document doesn't meet our requirements.

Please carefully check the requirements on this page, <a href="https://help.easycrypto.com/en/articles/6552510-how-can-i-verify-my-account">How can I verify my account?</a>

Then resubmit the new information here: <a href="${this.$local.site}/verify-address">Verify Address</a>

This doesn't need to be a physical letter - we can accept a PDF or electronic statement.

Once you resubmit new documents that meet the requirements, we'll get you verified and this will increase your limits :)`
        })
        await this.apiv2('admin', 'processVerification', {
          uid: user.uid,
          id: user.id,
          denied: 1
        })
        let row = this.manual[this.manual.findIndex(x => x.id === user.id)]
        row.denied = true
      } catch (e) {
        // Email was cancelled
      }
    },
    deny () {
      let user = this.user
      let type = this.type
      this.$buefy.dialog.prompt({
        message: '<p>What is the reason you want to DENY ' + this.user.firstName + ' ' + this.user.lastName + '? The user will be sent this reason as part of the deny email:</p>' +
            '<p>&nbsp;</p><p>Hi [their name]</p><p>&nbsp;</p><p>There was a problem with your verification request.</p><p>&nbsp;</p><p>[YOUR REASON WILL BE ADDED HERE]</p><p>&nbsp;</p><p>Please re-submit your application with those changes and we\'ll get you verified.</p>',
        inputAttrs: {
          value: ''
        },
        onConfirm: (value) => {
          this.ecApi('admin', 'denyVerification', {
            uid: user.uid,
            type: type,
            userdata: user,
            reason: value
          })
            .then((res) => {
              let row = this.queue[this.queue.findIndex(x => x.id === user.id)]
              this.processRow(row, 'denied')
            })
            .catch(err => console.log(err))
        }
      })
    },
    /**
     * Delete/ignore a row in the verification queue
     *
     * @param {object} user - The user row from the verification queue
     * @param {string} whichQueue - Which queue to select the row from. 'queue' for the normal verifications, or 'manual' for the upgrade queue
     */
    del (user, whichQueue = 'queue') {
      if (!user) {
        return
      }
      this.$buefy.dialog.confirm({
        message: 'Do you really want to delete this request from ' + user.firstName + ' ' + user.lastName + '?',
        onConfirm: () => {
          this.ecApi('admin', 'deleteVerification', {
            userdata: user,
            type: this.type
          })
            .then((res) => {
              this.$buefy.toast.open('Done!')
              let row = this[whichQueue][this[whichQueue].findIndex(x => x.id === user.id)]
              this.processRow(row, 'delete')
            })
            .catch(err => console.log(err))
        }
      })
    },
    /*
     * Save user verification data
     */
    async saveOdata () {
      if (this.hasMissingVerificationData) {
        this.$buefy.dialog.alert({
          message: 'Please fill in missing verification data.',
          type: 'is-danger',
          hasIcon: true,
          icon: 'times-circle',
          iconPack: 'fa',
          ariaRole: 'alertdialog',
          ariaModal: true
        })
        return false
      }
      const uid = this.user.uid || this.user.externalId
      const o = this.user
      if (this.odataVal) {
        return
      }
      if (this.$local.countryCode !== 'BR' && !o.lastName) {
        return
      }
      this.odataVal = true
      let res
      try {
        let data = {
          uid: uid,
          firstName: o.firstName,
          lastName: o.lastName,
          verifiedFirst: o.verifiedFirst,
          verifiedLast: o.verifiedLast,
          birthday: o.birthday,
          idNumber: o.idNumber,
          idExpiry: o.idExpiry,
          idVersion: o.idVersion,
          address: o.address,
          city: o.city,
          postcode: o.postcode
        }
        if (this.$local.countryCode === 'BR') {
          data = {
            ...data,
            address1: o.address1,
            address2: o.address2,
            address3: o.address3
          }
        }
        res = this.$local.vms.enable
          ? await this.verifyApi('verify', 'POST', {externalId: uid, ...data, countryCode: this.$local.countryCode})
          : await this.ecApi('admin', 'saveOdata', data)
      } catch (e) {
        console.log(e)
      }

      if (res) {
        if (this.isDisabled === false) {
          if (this.checklistCentrix === 'centrix' || this.isCentrix === true) {
            this.configs.checklistOther.show = false
            this.configs.checklistOther.disabled = true
          } else {
            this.configs.checklistOther.show = true
            this.configs.checklistOther.disabled = false
            this.configs.checklistSave.disabled = true
            this.configs.checklistSave.show = false
          }
          this.configs.checklistCentrix.show = false
          this.configs.checklistCentrix.disabled = true
          this.$buefy.toast.open('Data saved')
        }
      } else {
        this.$buefy.toast.open('Error! Please retry :(')
      }
      this.odataVal = false
      return res
    },
    isImage (link) {
      return link && link.match(/(jpg|jpeg|png)$/i)
    },
    peerReviewed (verify, user) {
      this.$buefy.dialog.confirm({
        message: 'Do you want to confirm the verification for ' + user.firstName + ' ' + user.lastName + '?',
        onConfirm: () => {
          this.apiv2('admin', 'markReview', {
            uid: user.uid,
            id: user.id,
            verify: verify
          })
            .then(() => {
              this.$buefy.toast.open('Marked as reviewed')
              let row = this[verify][this[verify].findIndex(x => x.id === user.id)]
              row.review = 1
            })
            .catch(err => console.log(err))
        }
      })
    },
    approvedUpgrade (type) {
      let user = this.user2
      let noReply = false
      let body = ''
      let what = ''
      let subject = 'Account upgrade - success!'
      switch (type) {
      case 'fiat':
        what = 'Source of funds approved'
        subject = 'Easy Crypto Upgrade successful. You have a new limit.'
        body = `Hi ${user.firstName}

Thanks for submitting your documents to upgrade your account limits. I have upgraded your account now :)

To check your limits head to My Account and select <a href="${this.$local.site}/account/limits">Limits</a>.

Have you got yourself a hardware wallet? We have a variety available in <a href="https://shopnz.easycrypto.com/">our shop</a> and it is a good idea if you're increasing your spend.

Also, check out our broader safety tips around crypto here: <a href="https://help.easycrypto.com/en/articles/6552506-how-to-keep-my-funds-safe">How to keep my funds safe</a>

If you have any questions on this let us know, we are very happy to help.`
        break
      case 'privacy':
        what = 'Privacy coins approved'
        subject = 'Easy Crypto Privacy Coins Success'
        body = `Hi ${user.firstName}

Thanks for submitting your documents to upgrade your account for privacy coins. I have upgraded your account now :)

If there's anything else I can help with just let me know.

Have a great day!`
        break
      case 'crypto':
        what = 'Source of crypto approved'
        body = `Hi ${user.firstName}

Thanks for submitting your documents to upgrade your account limits. I have upgraded your account now :)

If there's anything else I can help with just let me know.

Have a great day!`
        break
      }
      this.sendEmail({
        what,
        noreply: noReply,
        email: user.email,
        subject,
        body
      })
        .then(() => {
          this.apiv2('admin', 'processVerification', {
            uid: user.uid,
            id: user.id,
            tier: user.tier
          })
        })
        .then(() => {
          this.$buefy.toast.open('Done')
          let row = this.manual[this.manual.findIndex(x => x.id === user.id)]
          row.processed = true
        })
        .catch(e => console.log(e))
    },
    denyUpgrade (type) {
      let user = this.user2
      let noReply = false
      let body = ''
      let what = ''
      let subject = 'Account upgrade'
      switch (type) {
      case 'fiat':
        what = 'Source of funds denied'
        subject = 'Easy Crypto Upgrade - More information needed'
        body = `Hi ${user.firstName}

Thanks for submitting your application to upgrade your account verification, however the information supplied doesn't meet our requirements for source of funds.

There are many different ways to provide this information such as evidence of income, savings, sale of property, and this evidence must be provided by from an official source.

Check out the list of things we can accept: <a href="https://help.easycrypto.com/en/articles/6806616-how-can-i-increase-my-limits"></a>Verify source of funds

Once you have the correct information please upload it here for review: <a href="${this.$local.site}/verify-fiat">Upgrade source of funds</a>

Alternatively though, at your current verification level you can spend up to $100,000 for your first month, and then a further $20,000 each month.`
        break
      case 'privacy':
        what = 'Privacy coins ignored'
        subject = 'Easy Crypto Upgrade Privacy Coins - More info needed'
        body = `Hi ${user.firstName}

Thanks for submitting your application to upgrade your account for <a href="https://help.easycrypto.com/en/articles/6552399-how-can-i-buy-privacy-coins">privacy coins</a>.

We can't upgrade based on the screenshot sent through, as some evidence of where the funds have come from is needed. Can you please send a recent full bank statement, showing some routine deposits into your account?

Apologies for any inconvenience caused by this. We don't want to snoop, but we're required by <a href="https://help.easycrypto.com/en/articles/6552391-why-is-easy-crypto-so-strict">law</a> to ask customers about the source of their funds for privacy coins.`
        break
      case 'crypto':
        what = 'Source of crypto denied'
        body = `Hi ${user.firstName}

Thanks for submitting your application to upgrade your account verification. However, the information you supplied doesn't meet our requirements for source of crypto verification.

Check out this link for a list of things we can accept:

https://help.easycrypto.com/en/articles/6806616-how-can-i-increase-my-limits

Once you have the correct information please upload it here for review: <a href="https://easycrypto.com/nz/verify-crypto">Upgrade source of funds</a>

Also note that you can sell up to $100,000 to us before you need to verify, AND anything you bought from us you can sell back, no matter what value it goes to!`
        break
      }
      this.sendEmail({
        what,
        noreply: noReply,
        email: user.email,
        subject,
        body
      })
        .then(() => {
          this.apiv2('admin', 'processVerification', {
            uid: user.uid,
            id: user.id,
            denied: 1
          })
        })
        .then(() => {
          this.$buefy.toast.open('Done')
          let row = this.manual[this.manual.findIndex(x => x.id === user.id)]
          row.denied = true
        })
        .catch(e => console.log(e))
    },
    async updatePage () {
      this.loadVerifications = true
      try {
        await this.loadQueue()
      } catch (e) {
        console.error(e)
      }
      setTimeout(() => {
        this.loadVerifications = false
      }
      , 2000)
    }
  }
}
</script>

<style scoped>
pre {
  font-family: Lato, sans-serif;
  white-space: pre-wrap;
  word-break: keep-all
}

.no-break {
  word-break: keep-all;
  white-space: nowrap;
}

#address:after {
  white-space: pre !important;
}

.btn-action {
  margin-top: 10px;
  margin-left: 300px;
  position: relative;
  right: 0;
}

.btn-action-mobile {
  margin-top: 10px;
  margin-left: 200px;
  position: relative;
  right: 0;
}

.search-container {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  margin-bottom: 1em;
}

.btn-action-mobile {
  margin-top: 10px;
  margin-left: 200px;
  position: relative;
  right: 0;
}

.btn-action-mobile-centrix {
  margin-top: 10px;
  margin-left: 150px;
  position: relative;
  right: 0;
}

.status-pill {
  padding-left: .2em;
  padding-right: .2em;
  border-radius: .3em;
}

.health-indicator {
  background: #999;
  display: inline-flex;
  width: .6rem;
  height: .6rem;
  border-radius: 50%;
  margin: .2rem .3rem .1rem 0;
}

.status-online {
  background: #33ff33;
}

.dropdown {
  margin-right: .5rem;
}

.smile-id-spinner {
  position: relative;
  height: 5rem;
  width: 5rem;
}
</style>
