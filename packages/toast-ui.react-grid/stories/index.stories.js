import React from 'react';
import {storiesOf} from '@storybook/react';
import Grid from '../src/index';
import TuiGrid from 'tui-grid';
import {actions} from '@storybook/addon-actions';
import {withKnobs, number, radios, button, object, array} from '@storybook/addon-knobs';
import $ from 'jquery';
import mockjax from 'jquery-mockjax';
import {data} from './dummy-data';
import 'tui-grid/dist/tui-grid.css';
import 'tui-pagination/dist/tui-pagination.css';

const columns = [
  {title: 'Name', name: 'name'},
  {title: 'Artist', name: 'artist'},
  {title: 'Type', name: 'type', editOptions: {type: 'text'}},
  {title: 'Release', name: 'release', editOptions: {type: 'text'}},
  {title: 'Genre', name: 'genre', editOptions: {type: 'text'}}
];

const stories = storiesOf('Toast UI Grid', module).addDecorator(withKnobs);

stories.add('Normal', () => <Grid columns={columns} data={data} header={{height: 60}} />);

stories.add('Set Language', (...args) => {
  const options = {
    ko: 'ko',
    en: 'en'
  };
  const lang = radios('Language', options, 'ko');
  const Story = () => {
    TuiGrid.setLanguage(lang);
    return <Grid columns={columns} data={[]} />;
  };

  return <Story />;
});

stories.add('Apply Theme', () => {
  const options = {
    normal: 'normal',
    striped: 'striped',
    clean: 'clean'
  };
  const theme = radios('Theme', options, 'normal');
  const Story = () => {
    TuiGrid.applyTheme(theme);
    return <Grid columns={columns} data={data} />;
  };

  return <Story />;
});

stories.add('getRootElement', () => {
  class Story extends React.Component {
    ref = React.createRef();

    handleClick = () => {
      alert(this.ref.current.getRootElement().className);
    };

    render() {
      return (
        <div>
          <Grid ref={this.ref} columns={columns} data={data} />
          <button onClick={this.handleClick}>getRootElement</button>
        </div>
      );
    }
  }

  return <Story />;
});

stories.add('Using Method', () => {
  class Story extends React.Component {
    ref = React.createRef();

    grid = null;

    componentDidMount() {
      this.grid = this.ref.current.getGridInstance();
    }

    handleClickAppend = () => {
      this.grid.appendRow({}, {at: 0});
    };

    handleClickSort = () => {
      this.grid.sort('type');
    };

    handleClickUnSort = () => {
      this.grid.unSort();
    };

    render() {
      return (
        <div>
          <Grid ref={this.ref} columns={columns} data={data} />
          <button onClick={this.handleClickAppend}>Append Row</button>
          <button onClick={this.handleClickSort}>Sort (Type)</button>
          <button onClick={this.handleClickUnSort}>UnSort</button>
        </div>
      );
    }
  }

  return <Story />;
});

stories.add('Events', () => {
  const eventsFromObject = actions('onClick', 'onDblclick', 'onMousedown');

  return <Grid columns={columns} data={data} bodyHeight={500} {...eventsFromObject} />;
});

stories.add('Reactive Props', () => {
  const rows = data.slice(0, 10);
  const dataValue = object('data', data.slice(0, 5));
  const columnsValue = object('columns', columns);
  const bodyHeightValue = number('bodyHeight', 300, {
    range: true,
    min: 100,
    max: 500
  });
  const frozenColumnCountValue = number('frozenColumnCount', 0, {
    range: true,
    min: 0,
    max: 4
  });
  const reactivePropsValue = array('reactiveProps', [
    'columns',
    'data',
    'bodyHeight',
    'frozenColumnCount'
  ]);

  return (
    <Grid
      columns={columnsValue}
      data={dataValue}
      pagination={false}
      bodyHeight={bodyHeightValue}
      frozenColumnCount={frozenColumnCountValue}
      reactiveProps={reactivePropsValue}
    />
  );
});

stories.add('Addon Net', () => {
  const mock = mockjax($, window);

  mock({
    url: 'api/readData',
    responseTime: 0,
    response: function(settings) {
      const {page, perPage} = settings.data;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const contents = data.slice(start, end);

      this.responseText = JSON.stringify({
        result: true,
        data: {
          contents,
          pagination: {
            page,
            totalCount: data.length
          }
        }
      });
    }
  });

  return (
    <Grid
      columns={columns}
      pagination={true}
      addon={{
        Net: {
          perPage: 3,
          readDataMethod: 'GET',
          api: {
            readData: 'api/readData'
          }
        }
      }}
    />
  );
});
