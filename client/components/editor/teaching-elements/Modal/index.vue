<template>
  <div class="te-modal">
    <div v-if="isEditing" class="container-fluid">
      <div v-if="!hasElements" class="well">
        Click the button below to Add first teaching element to your modal.
      </div>
      <draggable
        :list="embeds"
        :options="dragOptions"
        @update="reorder"
        class="row">
        <primitive
          v-for="it in embeds"
          :key="it.id"
          :initialElement="it"
          :drag="true"
          @save="saveItem">
        </primitive>
      </draggable>
      <add-element
        :include="['HTML', 'IMAGE']"
        :layout="false"
        @add="saveItem"/>
    </div>
    <button
      v-else
      @click="showModal = true"
      class="btn btn-primary btn-open"
      type="button">
      {{ title }}
    </button>
    <preview
      v-if="showModal"
      :elements="embeds"
      @close="showModal = false">
    </preview>
  </div>
</template>

<script>
import AddElement from '../../structure/AddElement';
import calculatePosition from 'utils/calculatePosition';
import cloneDeep from 'lodash/cloneDeep';
import Draggable from 'vuedraggable';
import EventBus from 'EventBus';
import { mapActions } from 'vuex-module';
import Preview from './Preview';
import Primitive from '../Primitive';
import values from 'lodash/values';

const appChannel = EventBus.channel('app');
const teChannel = EventBus.channel('te');

export default {
  name: 'te-modal',
  props: {
    element: { type: Object, required: true }
  },
  data() {
    return {
      isEditing: false,
      dragOptions: { handle: '.drag-handle' },
      showModal: false
    };
  },
  computed: {
    title() {
      return this.element.data.title || 'Open modal';
    },
    embeds() {
      const items = this.element.data.embeds;
      return items ? values(items).sort((a, b) => a.position - b.position) : [];
    },
    hasElements() {
      return this.embeds.length;
    }
  },
  methods: {
    ...mapActions(['save'], 'tes'),
    reorder({ newIndex: newPosition }) {
      const isFirstChild = newPosition === 0;
      const context = { items: this.embeds, newPosition, isFirstChild };
      const element = cloneDeep(this.element);
      let reordered = element.data.embeds[this.embeds[newPosition].id];
      reordered.position = calculatePosition(context);
      this.save(element);
    },
    saveItem(item) {
      let element = cloneDeep(this.element);
      if (!item.position) item.position = this.embeds.length + 1;
      element.data.embeds = element.data.embeds || {};
      element.data.embeds[item.id] = item;
      this.save(element);
    }
  },
  created() {
    teChannel.on(`${this.element._cid}/toggleEdit`, () => {
      this.isEditing = !this.isEditing;
    });

    appChannel.on('deleteElement', item => {
      if (!item.embedded) return;
      if (!this.hasElements || !this.element.data.embeds[item.id]) return;
      let element = cloneDeep(this.element);
      delete element.data.embeds[item.id];
      this.save(element);
    });
  },
  components: {
    AddElement,
    Draggable,
    Preview,
    Primitive
  }
};
</script>

<style lang="scss" scoped>
.btn-open {
  max-width: 90%;
  padding: 9px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
