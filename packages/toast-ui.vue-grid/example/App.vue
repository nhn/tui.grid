<template>
  <div class="container">
    <h1>🍞🔡 TOAST UI Grid + Vue</h1>
    <grid
      :rowData="data"
      :columnData="columns"
      :options="options"
      @check="onCheck"
      @uncheck="onUnCheck"
    ></grid>
  </div>
</template>
<script>
import {Grid} from '../src/index.js';

export default {
  components: {
    grid: Grid
  },
  data() {
    return {
      columns: [
        {
          title: 'Name',
          name: 'name'
        },
        {
          title: 'Artist',
          name: 'artist'
        },
        {
          title: 'Personal Score',
          name: 'score',
          onBeforeChange(ev) {
            console.log('executes before the value changes : ', ev);
          },
          onAfterChange(ev) {
            console.log('executes after the value has changed : ', ev);
          },
          copyOptions: {
            useListItemText: true
          },
          editOptions: {
            type: 'radio',
            listItems: [
              {
                text: '★☆☆☆☆',
                value: '1'
              },
              {
                text: '★★☆☆☆',
                value: '2'
              },
              {
                text: '★★★☆☆',
                value: '3'
              },
              {
                text: '★★★★☆',
                value: '4'
              },
              {
                text: '★★★★★',
                value: '5'
              }
            ],
            useViewMode: true
          }
        }
      ],
      data: [
        {
          name: 'Kiss and Make Up',
          artist: 'Dua Lipa',
          score: '5'
        },
        {
          name: 'Bohemian Rhapsody',
          artist: 'Queen',
          score: '2'
        },
        {
          name: 'Done For Me',
          artist: 'Charlie Puth',
          score: '3'
        },
        {
          name: 'thank u, next',
          artist: 'Ariana Grande',
          score: '4'
        },
        {
          name: 'Handclap',
          artist: 'Fitz & The Tantrums',
          score: '1'
        },
        {
          name: 'Shape Of You',
          artist: 'Ed Sheeran',
          score: '5'
        },
        {
          name: 'Snowman',
          artist: 'Sia',
          score: '5'
        },
        {
          name: "Don't Stop Me Now ",
          artist: 'Queen',
          score: '3'
        },
        {
          name: 'Havana',
          artist: 'Camila Cabello',
          score: '2'
        },
        {
          name: 'A No No',
          artist: 'Mariah Carey',
          score: '5'
        }
      ],
      options: {
        rowHeaders: [
          {
            type: 'checkbox'
          }
        ]
      }
    };
  },
  methods: {
    onCheck(ev) {
      console.log('check event: ', ev);
    },
    onUnCheck(ev) {
      console.log('uncheck event: ', ev);
    }
  }
};
</script>
<style>
@import 'https://uicdn.toast.com/tui-grid/latest/tui-grid.css';
</style>
