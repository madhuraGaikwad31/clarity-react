/**
 * Copyright (c) 2020 Dell Inc., or its subsidiaries. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import * as React from "react";
import {Button} from "../forms/button";
import {ClassNames} from "./ClassNames";
import * as utils from "../utils";
import {Dropdown, DropdownMenu, DropdownItem, MenuItemType} from "../forms/dropdown";
import {TabPane} from "./TabPane";

/**
 * props for tabs
 * @param {tabs} List of all Tabs
 * @param {id} string to identify tab group uniquely
 * @param {tabOrientation} orientation of tab either vertical or horizontal
 * @param {onTabClick} callback function from parent to call on tab click
 * @param {overflowTabsFrom} name of tab from which tabs added to overflow menu.
 *         optional prop, if set activates overflow tabs
 * @param {dataqa} quality engineering tag
 */
type TabsProp = {
    tabs: TabDetails[];
    id: string;
    tabOrientation: TabOrientation;
    // onTabClick: (evt: React.MouseEvent<HTMLElement>, clickedTab: TabDetails, updatedTabDetails: TabDetails[]) => void;
    overflowTabsFrom?: number;
    dataqa?: string;
};

/**
 * state for tabs
 * @param {isOverflowTabSelected} if true inticate overflow tab button as active
 */
type TabsState = {
    isOverflowTabSelected: boolean;
    selectedTabId: string;
};

/**
 * props for tabs
 * @param {name} name or title of tab to uniquely identify tab
 * @param {id} id to uniquely identify single tab
 * @param {component} React element loaded on tab selection
 * @param {isSelected} true if tab is selected by default
 * @param {isDisabled} true if tab is disabled
 */
export type TabDetails = {
    name: any;
    id: string;
    isSelected?: boolean;
    isDisabled?: boolean;
    tabType?: TabType;
};

/**
 * Tab Orientation Types
 * @param {VERTICAL} vertical tabs
 * @param {HORIZONTAL} Horizontal tabs
 */
export enum TabOrientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
}

/**
 * Tab Types
 * @param {STATIC} tabs which has no panel to render
 * @param {SIMPLE} simple tabs user can switch between tabs
 */
export enum TabType {
    STATIC = "static",
    SIMPLE = "simple",
}

/**
 * Tabs Component : Use to divide content into separate views which users navigate between.
 */
export class NewTabs extends React.PureComponent<TabsProp, TabsState> {
    constructor(props: TabsProp) {
        super(props);
        this.state = {
            isOverflowTabSelected: false,
            selectedTabId: props.tabs[0].id,
        };
    }

    //Function handelling normal tab click
    tabClicked = (evt: React.MouseEvent<HTMLElement>, clickedTab: TabDetails, isOverflowTab: boolean = false) => {
        const {tabs} = this.props;
        let lastActiveTabIndex: number | undefined;
        let activeLastTab: boolean = false;
        tabs.map((tab: TabDetails, index: number) => {
            if (tab.isSelected) {
                lastActiveTabIndex = index;
            }

            if (clickedTab.id === tab.id) {
                // If tabType is present and if tabType is STATIC then active last selected tab
                if (clickedTab.tabType && clickedTab.tabType === TabType.STATIC) {
                    tab.isSelected = false;
                    activeLastTab = true;
                } else {
                    tab.isSelected = true;
                }
            } else {
                tab.isSelected = false;
            }
        });

        // Active last tab if user clicks on static tab
        if (activeLastTab && lastActiveTabIndex !== undefined) {
            tabs[lastActiveTabIndex].isSelected = true;
        }

        this.setState({
            isOverflowTabSelected: isOverflowTab,
            selectedTabId: clickedTab.id,
        });
    };

    //tab click
    tabClick = (evt: React.MouseEvent<HTMLElement>, clickedTab: TabDetails, isOverflowTab: boolean = false) => {
        this.setState({
            isOverflowTabSelected: isOverflowTab,
            selectedTabId: clickedTab.id,
        });
    };

    //Render Tab Button
    private renderTabLink = (tab: TabDetails, index: number) => {
        const {selectedTabId} = this.state;
        const className = tab.id === selectedTabId ? ClassNames.TABACTIVE : ClassNames.TABINACTIVE;
        return (
            <li key={index} role="presentation" className={ClassNames.TABITEM}>
                <Button
                    id={`tab-${tab.id}`}
                    aria-controls={`panel-${tab.id}`}
                    aria-selected={tab.isSelected}
                    className={className}
                    disabled={tab.isDisabled}
                    onClick={evt => this.tabClick(evt, tab)}
                >
                    {tab.name}
                </Button>
            </li>
        );
    };

    //Render Tab bar
    private renderTabLinks = () => {
        const {id, tabOrientation, overflowTabsFrom, tabs} = this.props;
        let isOverflowRendered = false;
        return (
            <ul className={ClassNames.TABMAIN} role="tablist" id={id}>
                {tabs.map((tab: TabDetails, index: number) => {
                    //once overflow tab rendered push all tabs in overflow list
                    if (tabOrientation === TabOrientation.HORIZONTAL && index === overflowTabsFrom) {
                        isOverflowRendered = true;
                        return this.renderOverflowTab(tabs.slice(index, tabs.length), index);
                    }

                    //Render normal tab unless overflow tab rendered
                    if (!isOverflowRendered) {
                        return this.renderTabLink(tab, index);
                    }
                })}
            </ul>
        );
    };

    //Render Overflow Tab
    private renderOverflowTab = (overflowTabs: TabDetails[], index: number) => {
        const {isOverflowTabSelected} = this.state;
        const className = isOverflowTabSelected ? ClassNames.TABACTIVE : ClassNames.TABINACTIVE;
        return (
            <li className={ClassNames.TABITEM} key={index}>
                <Dropdown
                    showCaret={false}
                    button={{
                        icon: {shape: "ellipsis-horizontal"},
                        link: true,
                        className: className,
                    }}
                >
                    <DropdownMenu>
                        {overflowTabs.map((tab: TabDetails, index: number) => {
                            return (
                                <DropdownItem
                                    key={index.toString()}
                                    menuItemType={MenuItemType.ITEM}
                                    isHeaderChild={true}
                                    label={tab.name}
                                    onClick={evt => this.tabClicked(evt, tab, true)}
                                    isDisabled={tab.isDisabled}
                                />
                            );
                        })}
                    </DropdownMenu>
                </Dropdown>
            </li>
        );
    };

    private static renderTabPane(children: utils.ReactChildren, tabs: TabDetails[], id: string): utils.ReactChildren {
        // const selectedTabId = tabs.filter(tab => {return tab.isSelected}).map(tab => {return tab.id})[0];
        const selectedTabId = id;
        return React.Children.map(children, child => {
            const childEl = child as React.ReactElement;
            if (childEl.type === TabPane && childEl.props.id === selectedTabId) {
                return childEl;
            }
        });
    }

    render() {
        const {tabOrientation, children, tabs} = this.props;
        const {selectedTabId} = this.state;
        return (
            <div className={tabOrientation === TabOrientation.VERTICAL ? ClassNames.VERTICALTAB : undefined}>
                {this.renderTabLinks()}
                {NewTabs.renderTabPane(children, tabs, selectedTabId)}
            </div>
        );
    }
}
