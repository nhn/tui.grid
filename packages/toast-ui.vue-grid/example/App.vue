<template>
  <div class="container">
    <h1>🍞🔡 TOAST UI Grid + Vue</h1>
    <grid
      :data="gridProps.data"
      :columns="gridProps.columns"
      :options="gridProps.options"
      :theme="gridProps.myTheme"
      @check="onCheck"
      @uncheck="onUnCheck"
      :rowHeaders="gridProps.rowHeaders"
      :columnOptions="gridProps.columnOptions"
    ></grid>
  </div>
</template>
<script>
import 'tui-grid/dist/tui-grid.css';
import { Grid } from '../src/index.js';

export default {
  components: {
    grid: Grid,
  },
  created() {
    this.gridProps = {
      rowHeaders: ['checkbox', 'rowNum'],
      columnOptions: {
        resizable: true,
        frozenCount: 1,
      },
      columns: [
        {
          header: 'Name',
          name: 'name',
          editor: 'text',
        },
        {
          header: 'Artist',
          name: 'artist',
        },
        {
          header: 'Personal Score',
          name: 'score',
          onBeforeChange(ev) {
            console.log('executes before the value changes : ', ev);
          },
          onAfterChange(ev) {
            console.log('executes after the value has changed : ', ev);
          },
          copyOptions: {
            useListItemText: true,
          },
          formatter: 'listItemText',
          editor: {
            type: 'radio',
            options: {
              listItems: [
                {
                  text: '★☆☆☆☆',
                  value: '1',
                },
                {
                  text: '★★☆☆☆',
                  value: '2',
                },
                {
                  text: '★★★☆☆',
                  value: '3',
                },
                {
                  text: '★★★★☆',
                  value: '4',
                },
                {
                  text: '★★★★★',
                  value: '5',
                },
              ],
            },
          },
        },
      ],
      data: [
        {
          name: 'Kiss and Make Up',
          artist: 'Dua Lipa',
          score: '5',
        },
        {
          name: 'Bohemian Rhapsody',
          artist: 'Queen',
          score: '2',
        },
        {
          name: 'Done For Me',
          artist: 'Charlie Puth',
          score: '3',
        },
        {
          name: 'thank u, next',
          artist: 'Ariana Grande',
          score: '4',
        },
        {
          name: 'Handclap',
          artist: 'Fitz & The Tantrums',
          score: '1',
        },
        {
          name: 'Shape Of You',
          artist: 'Ed Sheeran',
          score: '5',
        },
        {
          name: 'Snowman',
          artist: 'Sia',
          score: '5',
        },
        {
          name: "Don't Stop Me Now ",
          artist: 'Queen',
          score: '3',
        },
        {
          name: 'Havana',
          artist: 'Camila Cabello',
          score: '2',
        },
        {
          name: 'A No No',
          artist: 'Mariah Carey',
          score: '5',
        },
      ],
      myTheme: {
        name: 'myTheme',
        value: {
          cell: {
            normal: {
              background: '#00ff00',
              border: '#e0e0e0',
            },
            header: {
              background: '#ff0000',
              border: '#ffff00',
            },
            editable: {
              background: '#fbfbfb',
            },
          },
        },
      },
      options: {
        rowHeaders: ['checkbox'],
      },
    };
  },
  methods: {
    onCheck(ev) {
      console.log('check event: ', ev);
    },
    onUnCheck(ev) {
      console.log('uncheck event: ', ev);
    },
  },
};
</script>
<style>
@import 'https://uicdn.toast.com/tui-grid/latest/tui-grid.css';
</style>
