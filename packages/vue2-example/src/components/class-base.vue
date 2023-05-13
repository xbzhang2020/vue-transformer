<template>
  <div>{{ message }}</div>
</template>
  
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class HelloWorld extends Vue {
  message = 'Hello World!'
}
</script>