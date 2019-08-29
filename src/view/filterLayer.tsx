import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';

interface StoreProps {
  hello: null;
}

type Props = StoreProps & DispatchProps;

export class FilterLayerComp extends Component<Props> {
  public render(props: Props) {
    return (
      <div className={cls('filter-container')}>
        <div>
          <span className={cls('btn-filter', 'btn-filter-active')} />
          <a className={cls('btn-close')} style={{ border: 'none', padding: 0 }} />
        </div>
        <div style={{ margin: '0 8px' }}>
          {/*  @TODO; 1.dropdown*/}
          <div className={cls('filter-dropdown')}>
            <select>
              <option>Greater Than</option>
              <option>Better Than</option>
              <option>Orange Than</option>
              <option>Toast Group</option>
            </select>
          </div>

          {/*  @TODO; 2.input*/}
          <input type="text" name="input" className={cls('filter-input')} />
          {/* @TODO; 5.Search*/}
          <input
            type="text"
            name="input"
            className={cls('filter-input', 'filter-input-search')}
            placeholder="Search.."
          />
          {/*  @TODO; 3.radio*/}
          <div className={cls('filter-comparator-container')}>
            <div className={cls('filter-comparator')}>
              <input type="radio" name="filterOperator" value="AND" id="AND" checked />
              <label for="AND" />
              <span>AND</span>
            </div>
            <div className={cls('filter-comparator')}>
              <input type="radio" id="OR" name="filterOperator" value="OR" />
              <label for="OR" />
              <span>OR</span>
            </div>
          </div>

          {/*  @TODO; 5.List*/}
          <ul className={cls('filter-list')}>
            <li className={cls('filter-list-item')}>
              <input type="checkbox" id="id1" />
              <label for="id1" />
              <span>Lorem</span>
            </li>
            <li className={cls('filter-list-item', 'filter-list-item-checked')}>
              <input type="checkbox" id="id2" checked />
              <label for="id2" />
              <span>Lorem LoremLoremLoremLoremLorem Lorem</span>
            </li>
            <li className={cls('filter-list-item')}>
              <input type="checkbox" id="id3" />
              <label for="id3" />
              <span>Lorem</span>
            </li>
          </ul>
          {/*  @TODO; 4.button*/}
          {/* @TODO: hover */}
          {/* @TODO: i18n */}
          <div className={cls('filter-btn-container')}>
            <button className={cls('filter-btn', 'filter-btn-clear')}>Clear</button>
            <button className={cls('filter-btn', 'filter-btn-apply')}>Apply</button>
          </div>
        </div>
      </div>
    );
  }
}

export const FilterLayer = connect<StoreProps>(() => ({}))(FilterLayerComp);
