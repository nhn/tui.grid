<template>
  <div ref="tuiGrid"></div>
</template>
<script>
import Grid from 'tui-grid';

const presetTheme = ['default', 'striped', 'clean'];

const presetLanguage = ['en', 'ko'];

export default {
  name: 'TuiGrid',
  props: {
    data: {
      type: [Array, Object],
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    // @deprecated. You should use it via importing tui-grid directly.
    theme: {
      type: [String, Object],
      validator(value) {
        let result = false;
        if (typeof value === 'string') {
          result = presetTheme.indexOf(value) > -1;
        } else {
          result = value.hasOwnProperty('name') && value.hasOwnProperty('value');
        }

        return result;
      },
    },
    // @deprecated. You should use it via importing tui-grid directly.
    language: {
      type: [String, Object],
      validator(value) {
        let result = false;
        if (typeof value === 'string') {
          result = presetLanguage.indexOf(value) > -1;
        } else {
          result = value.hasOwnProperty('name') && value.hasOwnProperty('value');
        }

        return result;
      },
    },
  },
  mounted() {
    const options = Object.assign(this.options || {}, this.$attrs, {
      el: this.$refs.tuiGrid,
      data: this.data,
      columns: this.columns,
    });

    this.gridInstance = new Grid(options);
    this.addEventListeners();
    this.applyTheme();
    this.setLanguage();
  },
  beforeDestroy() {
    Object.keys(this.$listeners).forEach((eventName) => {
      this.gridInstance.off(eventName);
    });
    this.gridInstance.destroy();
    this.gridInstance = null;
  },
  methods: {
    addEventListeners() {
      for (const eventName of Object.keys(this.$listeners)) {
        this.gridInstance.on(eventName, (...args) => this.$emit(eventName, ...args));
      }
    },
    // @deprecated. You should use it via importing tui-grid directly.
    applyTheme() {
      if (this.theme) {
        if (typeof this.theme === 'string') {
          Grid.applyTheme(this.theme);
        } else {
          Grid.applyTheme(this.theme.name, this.theme.value);
        }
      }
    },
    // @deprecated. You should use it via importing tui-grid directly.
    setLanguage() {
      if (this.language) {
        if (typeof this.language === 'string') {
          Grid.setLanguage(this.language);
        } else {
          Grid.setLanguage(this.language.name, this.language.value);
        }
      }
    },
    getRootElement() {
      return this.$refs.tuiGrid;
    },
    invoke(methodName, ...args) {
      return typeof this.gridInstance[methodName] === 'function'
        ? this.gridInstance[methodName](...args)
        : null;
    },
  },
};
</script>
