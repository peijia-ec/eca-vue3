<template>
  <div>
    <div
      v-for="value in smileIdHealth"
      :key="value.type"
      class="health-container"
    >
      <h5 class="health-title">
        <span
          class="health-indicator"
          :class="{'status-online': value.type === 'NATIONAL_ID' ? isSmileIdWithPhotoOnline : isSmileIdWithoutPhotoOnline}"
        />
        Smile ID Health ({{ value.type }})
      </h5>
      <div>Last checked: {{ $moment(value.last_checked).format('DD/MM/YYYY hh:mm A') }}</div>
      <div>Last checked status: {{ value.last_check_status }}</div>
      <div>Last hour success rate: {{ value.last_hour_success_rate }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmileIdHealthDropdown',
  props: ['smileIdHealth', 'isSmileIdWithPhotoOnline', 'isSmileIdWithoutPhotoOnline']
}
</script>

<style scoped>
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

.health-title {
  margin-bottom: .4rem;
}

.health-container:not(:first-child) {
  margin-top: .8rem;
}

.health-title .health-indicator {
  width: .5rem;
  height: .5rem;
}
</style>
