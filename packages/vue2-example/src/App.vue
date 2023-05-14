<template>
  <div>
    <!-- <OptionBase /> -->
    <ClassBase />
    <!-- <VcaBase /> -->
  </div>
</template>

<script lang="ts">
import OptionBase from './components/option-base.vue';
import ClassBase from './components/class-base.vue'
import VcaBase from './components/vca-base.vue';

export default {
  components: {
    OptionBase,
    ClassBase,
    VcaBase
  }
}
</script>