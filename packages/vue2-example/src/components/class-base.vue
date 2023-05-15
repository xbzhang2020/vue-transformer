<template>
  <div>{{ message }}</div>
</template>
  
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import OptionBase from './option-base.vue';

@Component({
  name: 'Hello',
  components: { OptionBase },
})
export default class HelloWorld extends Vue {
  message: string = 'Hello World!'
}
</script>