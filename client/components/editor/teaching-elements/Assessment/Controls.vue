<template>
  <div class="controls">
    <div v-if="isEditing" class="pull-right">
      <button @click="$emit('cancel')" class="btn btn-material btn-default">
        Cancel
      </button>
      <button @click="save" class="btn btn-material btn-success">
        Save
      </button>
    </div>
    <div v-else class="pull-right">
      <button
        v-if="summative"
        @click="$emit('remove')"
        class="btn btn-default"> Remove
      </button>
      <button @click="$emit('edit')" class="btn btn-success btn-material">
        Edit
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isEditing: { type: Boolean, default: false },
    summative: { type: Boolean, default: false }
  },
  methods: {
    save() {
      // Make sure all other handlers are executed prior to save
      setTimeout(() => this.$emit('save'), 0);
    }
  }
};
</script>

<style lang="scss" scoped>
.controls {
  width: 100%;
  height: 55px;
  margin-top: 20px;
  padding: 10px 20px;

  .btn {
    min-width: 85px;
    margin-left: 10px;
    padding: 7px 15px;
  }
}
</style>
