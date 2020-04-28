<template>
  <e-dialog
    v-el-drag-dialog
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template slot="title">
      <slot name="title" />
    </template>
    <slot />
    <template slot="footer">
      <slot name="footer" />
    </template>
  </e-dialog>
</template>

<script>
import { Dialog as EDialog } from 'element-ui'
import elDragDialog from '@/directive/el-drag-dialog'
export default {
  name: 'Index',
  directives: { elDragDialog },
  components: {
    EDialog
  },
  inheritAttrs: false
}
</script>

<style scoped>

</style>
