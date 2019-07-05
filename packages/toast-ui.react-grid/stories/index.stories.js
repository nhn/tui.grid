import React, {useCallback} from 'react';
import XHRMock from 'xhr-mock';
import {storiesOf} from '@storybook/react';
import Grid from '../src/index';
import TuiGrid from 'tui-grid';
import {actions} from '@storybook/addon-actions';
import {withKnobs, number, radios, button, object, array} from '@storybook/addon-knobs';
import {data} from './dummy-data';
import 'tui-grid/dist/tui-grid.css';
import 'tui-pagination/dist/tui-pagination.css';

const columns = [
  {header: 'Name', name: 'name'},
  {header: 'Artist', name: 'artist'},
  {header: 'Type', name: 'type', editor: 'text'},
  {header: 'Release', name: 'release', editor: 'text'},
  {header: 'Genre', name: 'genre', editor: 'text'}
];

const stories = storiesOf('Toast UI Grid', module).addDecorator(withKnobs);

stories.add('Normal', () => <Grid columns={columns} data={data} header={{height: 60}} />);

stories.add('Set Language', () => {
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
      alert('see console!');
      console.log(this.ref.current.getRootElement());
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
      this.grid = this.ref.current.getInstance();
    }

    handleClickAppend = () => {
      this.grid.appendRow({}, {at: 0});
    };

    handleClickSort = () => {
      this.grid.sort('type');
    };

    handleClickUnSort = () => {
      this.grid.unsort();
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
  const oneTimeBindingProps = array('oneTimeBindingProps', []);

  return (
    <Grid
      columns={columnsValue}
      data={dataValue}
      frozenColumnCount={frozenColumnCountValue}
      pagination={false}
      bodyHeight={bodyHeightValue}
      oneTimeBindingProps={oneTimeBindingProps}
    />
  );
});

stories.add('dataSource', () => {
  XHRMock.setup();

  XHRMock.get('api/readData?perPage=3&page=1', {
    status: 200,
    body: JSON.stringify({
      result: true,
      data: {
        contents: data.slice(0, 3),
        pagination: {
          page: 1,
          totalCount: data.length
        }
      }
    })
  })
    .get('api/readData?perPage=3&page=2', {
      status: 200,
      body: JSON.stringify({
        result: true,
        data: {
          contents: data.slice(3, 6),
          pagination: {
            page: 2,
            totalCount: data.length
          }
        }
      })
    })
    .get('api/readData?perPage=3&page=3', {
      status: 200,
      body: JSON.stringify({
        result: true,
        data: {
          contents: data.slice(6, 9),
          pagination: {
            page: 3,
            totalCount: data.length
          }
        }
      })
    })
    .get('api/readData?perPage=3&page=4', {
      status: 200,
      body: JSON.stringify({
        result: true,
        data: {
          contents: data.slice(9, 12),
          pagination: {
            page: 4,
            totalCount: data.length
          }
        }
      })
    });

  const dataSource = {
    withCredentials: false,
    initialRequest: true,
    api: {
      readData: {url: 'api/readData', method: 'GET'}
    }
  };

  return <Grid columns={columns} pagination={true} data={dataSource} pageOptions={{perPage: 3}} />;
});

stories.add('hook', () => {
  const condition = radios('condition', {true: 'true', false: 'false'}, 'true');
  const ReactComponent = () => {
    const onClick = useCallback(() => {
      console.log('condition:', condition);
    }, [condition]);

    return <Grid columns={columns} data={data} onClick={onClick} />;
  };

  return <ReactComponent />;
});

stories.add('change event based on condition', () => {
  const condition = radios('condition', {true: 'true', false: 'false'}, 'true');

  return (
    <Grid
      columns={columns}
      data={data}
      onClick={
        condition === 'true'
          ? () => {
              console.log('true');
            }
          : () => {
              console.log('false');
            }
      }
    />
  );
});
