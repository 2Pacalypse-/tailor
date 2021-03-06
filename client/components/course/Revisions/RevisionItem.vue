<template>
  <li>
    <div
      :class="{ expanded }"
      :style="{ cursor: isTeachingElement ? 'pointer' : 'auto' }"
      @click="toggle"
      class="revision">
      <div :style="{ color }" class="acronym"><span>{{ acronym }}</span></div>
      <div class="content">
        <div class="description">{{ description }}</div>
        <div class="name">{{ revision.user.email }}</div>
      </div>
      <div class="date">{{ date }}</div>
    </div>
    <entity-revisions
      v-if="expanded"
      :revision="revision"
      :isDetached="!activity">
    </entity-revisions>
  </li>
</template>

<script>
import {
  getFormatDescription,
  getRevisionAcronym,
  getRevisionColor
} from 'utils/revision';
import { mapGetters } from 'vuex-module';
import EntityRevisions from './EntityRevisions';
import fecha from 'fecha';
import find from 'lodash/find';

export default {
  name: 'revision-item',
  props: {
    revision: { type: Object, required: true }
  },
  data() {
    return { expanded: false };
  },
  computed: {
    ...mapGetters(['structure'], 'course'),
    ...mapGetters(['getParent'], 'activities'),
    activity() {
      const { state } = this.revision;
      const activityId = state.activityId || state.id;
      return this.getOutlineLocation(this.getParent(activityId));
    },
    color() {
      return getRevisionColor(this.revision);
    },
    acronym() {
      return getRevisionAcronym(this.revision);
    },
    date() {
      return fecha.format(this.revision.createdAt, 'M/D/YY HH:mm');
    },
    description() {
      return getFormatDescription(this.revision, this.activity);
    },
    isTeachingElement() {
      return this.revision.entity === 'TEACHING_ELEMENT';
    }
  },
  methods: {
    getOutlineLocation(current) {
      if (!current) return null;
      const level = find(this.structure, { type: current.type });
      if (level) return { ...current, label: level.label };
      return this.getOutlineLocation(this.getParent(current.id));
    },
    toggle() {
      if (this.isTeachingElement) this.expanded = !this.expanded;
    }
  },
  components: { EntityRevisions }
};
</script>

<style lang="scss" scoped>
.revision {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 72px;
  padding: 0 16px;

  .acronym {
    width: 40px;
    height: 40px;
    margin-right: 16px;
    font-size: 18px;
    text-align: center;
    border-radius: 50%;
    background-color: #eee;

    span {
      line-height: 40px;
    }
  }

  .content {
    flex: 1;
    overflow: hidden;

    .description {
      font-size: 16px;
      word-wrap: break-word;
    }

    .name {
      color: #808080;
      font-size: 14px;
    }
  }

  .date {
    width: 128px;
    color: #808080;
    text-align: right;
    font-size: 14px;
  }
}

.expanded, .revision:hover {
  background-color: #f1f1f1;

  .acronym {
    background-color: #fff;
  }
}
</style>
