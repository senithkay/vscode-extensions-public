/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
/* eslint-disable react/no-array-index-key */
// tslint:disable: jsx-no-multiline-js
import { useEffect } from 'react';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Divider, FormControlLabel, Typography } from '@material-ui/core';
import { ChevronRight, ExpandMore } from '@material-ui/icons';
import { TreeItem, TreeView } from '@material-ui/lab';

import { FilterStateMap } from '..';

import Categories from './Categories';
import menuItems from './menuItems.json';
import useStyles, { CustomCheckbox } from './style';

// Sample data for filter by menu items
// @TODO finalize whether the menuItem list need to fetched dynamically
const { mainFilters, pricingCategories, connectorCategories } = menuItems;

export interface FilterByMenuProps {
  filterValues: string[];
  filterState: FilterStateMap;
  setFilterState: (filterState: FilterStateMap) => void;
}

function FilterByMenu(props: FilterByMenuProps) {
  const classes = useStyles();
  const { filterState, setFilterState, filterValues } = props;

  // const { search, pathname } = useLocation();
  // const queryParams = new URLSearchParams(search);

  // const history = useHistory();

  const handleChange = (event: any, value: string) => {
    setFilterState({
      ...filterState,
      [event.target.name]: event.target.checked,
    });
    const newFilterValues = [...filterValues];
    if (event.target.checked) {
      newFilterValues.push(value);
    } else {
      newFilterValues.splice(newFilterValues.indexOf(value), 1);
    }
    // queryParams.set(FILTER_BY, newFilterValues.join(','));
    // queryParams.set(PAGE_OFFSET, '');
    // history.push({
    //   pathname,
    //   search: `?${queryParams.toString()}`,
    // });
  };

  useEffect(() => {
    let newFilterState: FilterStateMap = {};
    filterValues.forEach((value) => {
      if (value === 'External') {
        newFilterState = {
          ...newFilterState,
          External: true,
        };
      } else if (value === 'myOrg') {
        newFilterState = {
          ...newFilterState,
          'My Organization': true,
        };
      } else {
        const filterName = value.split('/')[1];
        newFilterState = {
          ...newFilterState,
          [filterName]: true,
        };
      }
    });
    setFilterState(newFilterState);
  }, []);

  const renderTree = (node: any) => (
    <TreeItem
      key={node.name}
      nodeId={node.name}
      label={
        <div className={classes.labelRoot}>
          {!node.children ? (
            <FormControlLabel
              control={
                <CustomCheckbox
                  id={node.id}
                  checked={
                    filterState[node.name] ? filterState[node.name] : false
                  }
                  onChange={(event) => handleChange(event, node.value)}
                  name={node.name}
                  value={node.value}
                />
              }
              label={<>{node.name}</>}
              key={node.name}
            />
          ) : (
            <Typography
              variant="body1"
              classes={{ root: classes.expandaleFilterByLabel }}
            >
              {node.name}
            </Typography>
          )}
        </div>
      }
      // todo: null check
      classes={{
        content: classes.content,
        group: classes.groupItem,
        selected: classes.selectedItem,
        label: classes.labelItem,
      }}
    >
      {Array.isArray(node.children)
        ? node.children.map((childNode: any) => renderTree(childNode))
        : null}
    </TreeItem>
  );

  return (
    <div className={classes.filterByMenuDiv}>
      <Typography variant="body1" classes={{ root: classes.filterByMenuTitle }}>
        <FormattedMessage
          id="modules.marketplace.FilterByMenu.FilterByMenu.Filter.By"
          defaultMessage="Filter by"
        />
      </Typography>
      <TreeView
        classes={{ root: classes.filterByMenu }}
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        defaultExpanded={[connectorCategories.name, pricingCategories.name]}
      >
        {mainFilters.map((menuItem, index) => (
          <div key={index}>{renderTree(menuItem)}</div>
        ))}
        <Divider light={true} classes={{ root: classes.divider }} />
        <Categories />
        <Divider light={true} classes={{ root: classes.divider }} />
        <TreeItem
          nodeId={pricingCategories.name}
          classes={{
            content: classes.content,
            selected: classes.selectedItem,
            group: classes.groupItem,
            label: classes.labelItem,
          }}
          label={
            <div className={classes.labelRoot}>
              <Typography
                variant="body1"
                classes={{ root: classes.expandaleFilterByLabel }}
              >
                {pricingCategories.name}
              </Typography>
            </div>
          }
        >
          {pricingCategories.categories.map((menuItem, index) => (
            <div key={index}>{renderTree(menuItem)}</div>
          ))}
        </TreeItem>
      </TreeView>
    </div>
  );
}

export default FilterByMenu;
