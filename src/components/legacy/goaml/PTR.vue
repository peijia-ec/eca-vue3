<template>
  <div class="container is-desktop mb-3">
    <div class="columns">
      <div class="column">
        <label class="label">Date Range</label>
        <b-datepicker
          placeholder="Click to select..."
          v-model="dates"
          range
        />
      </div>
    </div>
    <div>
      <!-- <button class="button is-primary" @click="generateReportAction" disabled
        v-text="isLoading ? 'Generating...' : 'Preview Report'" /> -->
      <button
        class="button is-primary"
        style="margin-left: 5px;"
        @click="downloadReport"
        :disabled="isLoading"
        v-text="isLoading ? 'Downloading...' : 'Download Report'"
      />
      <div v-if="xml">
        <br>
        <pre>{{ xml }}</pre>
      </div>
      <br>
      <br>
      <br>
    </div>
  </div>
</template>

<script>

import api from '@/api';
import dayjs from 'dayjs';

export default {
  name: 'PTR',

  data() {
    return {
      /**
       * @type {Array<Date>} dates
       */
      dates: [],
      payload: {
        indicators: [],
        startDate: null,
        endDate: null
      },
      xml: null,
      isLoading: false
    }
  },
  mounted() {

  },
  methods: {
    getToken() {
      return this.$store.state.goauth.token
    },
    formatXml(xml, tab) { // tab = optional indent value, default is tab (\t)
      let formatted = '', indent = '';
      tab = tab || '\t';
      xml.split(/>\s*</).forEach(function (node) {
        if (node.match(/^\/\w/)) {
          indent = indent.substring(tab.length);
        } // decrease indent by one 'tab'
        formatted += indent + '<' + node + '>\r\n';
        if (node.match(/^<?\w[^>]*[^/]$/)) {
          indent += tab;
        } // increase indent
      });
      return formatted.substring(1, formatted.length - 3);
    },
    generateReportAction() {
      this.isLoading = true;
      this.generateReport().finally(() => {
        this.isLoading = false
      });
    },
    async generateReport() {
      if (this.dates.length === 0) {
        alert('Please select a date range')
        return
      }

      this.payload.startDate = dayjs(this.dates[0]).format('YYYY-MM-DD')
      this.payload.endDate = dayjs(this.dates[1]).format('YYYY-MM-DD')
      this.payload.indicators = ['DIA'] // Indicators are hard-coded for now for PTR

      const ptr = await fetch(this.$local.apiBaseUrl + '/api/v2/eca-ptr', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        method: 'POST',
        body: JSON.stringify(this.payload)
      }).catch(err => {
        alert(err.message)
      })

      this.xml = this.formatXml(await ptr.text())
    },
    async downloadReport() {
      if (this.dates.length === 0) {
        alert('Please select a date range')
        return
      }
      this.isLoading = true;
      this.payload.startDate = dayjs(this.dates[0]).format('YYYY-MM-DD')
      this.payload.endDate = dayjs(this.dates[1]).format('YYYY-MM-DD')
      this.payload.indicators = ['DIA'] // Indicators are hard-coded for now for PTR

      try {
        const response = await fetch(this.$local.apiBaseUrl + '/api/v2/eca-ptr/ptr-xml', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
          },
          method: 'POST',
          body: JSON.stringify(this.payload)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convert the response to a Blob
        const blob = await response.blob();

        // Create a temporary <a> element to trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Extract the filename from the Content-Disposition header (if available)
        const contentDisposition = response.headers.get('Content-Disposition');

        let filename = 'generated.xml'; // Default filename
        if (contentDisposition && contentDisposition.includes('filename=')) {
          filename = contentDisposition
            .split('filename=')[1]
            .split(';')[0]
            .replace(/['"]/g, ''); // Remove quotes
        } else {
          filename = `${this.payload.startDate}_${this.payload.endDate}__${Date.now()}.xml`
        }
        a.download = filename;

        // Trigger the download
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      } catch (e) {
        alert(e.message)
      }
      this.isLoading = false;
    }
  }
}

</script>
