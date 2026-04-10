/**
 * Create Extension for Worklist Filter & Sort
 * 
 * This extension adds quick filter buttons and sort dropdown to the Worklist toolbar
 */
sap.ui.define([
    "sap/dm/dme/podfoundation/extension/PluginControllerExtension",
    "sap/ui/core/mvc/OverrideExecution",
    "sap/dm/dme/plugins/worklistPlugin/controller/extensions/CreateExtensionConstants",
    "sap/m/Button",
    "sap/m/Select",
    "sap/m/SegmentedButton",
    "sap/m/SegmentedButtonItem",
    "sap/m/ToolbarSpacer",
    "sap/m/ToolbarSeparator",
    "sap/ui/core/Item",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (PluginControllerExtension, OverrideExecution, CreateConstants,
             Button, Select, SegmentedButton, SegmentedButtonItem, 
             ToolbarSpacer, ToolbarSeparator, Item, Filter, FilterOperator, Sorter) {
    "use strict";

    return PluginControllerExtension.extend("rits.ext.custom.plugins.CreateExtension", {
        constructor: function (oExtensionUtilities) {
            this._oExtensionUtilities = oExtensionUtilities;
            this._oTable = null;
        },

        getOverrideExecution: function (sOverrideMember) {
            if (sOverrideMember === CreateConstants.CREATE_TOOLBAR) {
                return OverrideExecution.After;
            } else if (sOverrideMember === CreateConstants.ENHANCE_WORKLIST_TABLE) {
                return OverrideExecution.After;
            } else if (sOverrideMember === CreateConstants.LOAD_WORKLIST_TABLE) {
                return OverrideExecution.After;
            }
            return null;
        },

        getExtensionName: function () {
            return CreateConstants.EXTENSION_NAME;
        },

        enhanceWorklistTable: function (oTable, oListConfiguration) {
            this._oExtensionUtilities.logMessage("CreateExtension.enhanceWorklistTable: Got table reference");
            this._oTable = oTable;
        },

        loadWorklist: function (bIgnoreErrors, vInputSfc) {
            this._oExtensionUtilities.logMessage("CreateExtension.loadWorklist: Data loaded");
            var sCurrentFilter = this._oExtensionUtilities.getCurrentStatusFilter();
            if (sCurrentFilter && sCurrentFilter !== "ALL" && this._oTable) {
                var that = this;
                setTimeout(function() {
                    that._oExtensionUtilities.applyStatusFilter(that._oTable, sCurrentFilter);
                }, 300);
            }
        },

        createToolbar: function (oToolbar) {
            console.log("=== WorklistFilterSort CreateExtension.createToolbar CALLED ===", oToolbar);
            this._oExtensionUtilities.logMessage("CreateExtension.createToolbar: Adding filter controls");
            if (!oToolbar) {
                return oToolbar;
            }

            var that = this;

            oToolbar.addContent(new ToolbarSeparator());

            var oStatusFilter = new SegmentedButton({
                selectionChange: function (oEvent) {
                    var sSelectedKey = oEvent.getParameter("item").getKey();
                    that._onStatusFilterChange(sSelectedKey);
                },
                items: [
                    new SegmentedButtonItem({ key: "ALL", text: "All", tooltip: "Show all SFCs" }),
                    new SegmentedButtonItem({ key: "401", text: "New", icon: "sap-icon://add", tooltip: "Show New SFCs only" }),
                    new SegmentedButtonItem({ key: "402", text: "Queue", icon: "sap-icon://queue", tooltip: "Show In Queue SFCs only" }),
                    new SegmentedButtonItem({ key: "403", text: "Active", icon: "sap-icon://play", tooltip: "Show Active SFCs only" }),
                    new SegmentedButtonItem({ key: "404", text: "Hold", icon: "sap-icon://pause", tooltip: "Show SFCs on Hold only" })
                ],
                selectedKey: "ALL"
            });
            this._oStatusFilter = oStatusFilter;
            oToolbar.addContent(oStatusFilter);

            oToolbar.addContent(new ToolbarSeparator());

            var oSortSelect = new Select({
                tooltip: "Sort by field",
                width: "140px",
                change: function (oEvent) {
                    var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
                    that._onSortFieldChange(sSelectedKey);
                },
                items: [
                    new Item({ key: "sfc", text: "Sort: SFC" }),
                    new Item({ key: "shopOrder", text: "Sort: Order" }),
                    new Item({ key: "material", text: "Sort: Material" }),
                    new Item({ key: "statusDescription", text: "Sort: Status" }),
                    new Item({ key: "quantity", text: "Sort: Qty" }),
                    new Item({ key: "dueDateTime", text: "Sort: Due" })
                ],
                selectedKey: "sfc"
            });
            this._oSortSelect = oSortSelect;
            oToolbar.addContent(oSortSelect);

            var oSortDirectionBtn = new Button({
                icon: "sap-icon://sort-ascending",
                tooltip: "Toggle sort direction",
                type: "Transparent",
                press: function (oEvent) {
                    that._onSortDirectionToggle(oEvent.getSource());
                }
            });
            this._oSortDirectionBtn = oSortDirectionBtn;
            oToolbar.addContent(oSortDirectionBtn);

            var oClearBtn = new Button({
                icon: "sap-icon://clear-filter",
                tooltip: "Clear all filters",
                type: "Transparent",
                press: function () {
                    that._onClearFilters();
                }
            });
            oToolbar.addContent(oClearBtn);

            this._oExtensionUtilities.logMessage("CreateExtension.createToolbar: Controls added");
            return oToolbar;
        },

        _onStatusFilterChange: function (sStatusCode) {
            this._oExtensionUtilities.logMessage("Status filter changed to: " + sStatusCode);
            if (this._oTable) {
                this._oExtensionUtilities.applyStatusFilter(this._oTable, sStatusCode);
            } else {
                var oController = this.getController();
                if (oController && oController.getWorklistTable) {
                    this._oTable = oController.getWorklistTable();
                    if (this._oTable) {
                        this._oExtensionUtilities.applyStatusFilter(this._oTable, sStatusCode);
                    }
                }
            }
        },

        _onSortFieldChange: function (sSortField) {
            this._oExtensionUtilities.logMessage("Sort field changed to: " + sSortField);
            if (this._oTable) {
                var bDescending = this._oExtensionUtilities.isSortDescending();
                this._oExtensionUtilities.applySorting(this._oTable, sSortField, bDescending);
            }
        },

        _onSortDirectionToggle: function (oButton) {
            var bDescending = this._oExtensionUtilities.toggleSortDirection();
            if (bDescending) {
                oButton.setIcon("sap-icon://sort-descending");
                oButton.setTooltip("Sort Descending - Click to toggle");
            } else {
                oButton.setIcon("sap-icon://sort-ascending");
                oButton.setTooltip("Sort Ascending - Click to toggle");
            }
            if (this._oTable) {
                var sSortField = this._oExtensionUtilities.getCurrentSortField();
                this._oExtensionUtilities.applySorting(this._oTable, sSortField, bDescending);
            }
        },

        _onClearFilters: function () {
            this._oExtensionUtilities.logMessage("Clearing filters");
            if (this._oStatusFilter) {
                this._oStatusFilter.setSelectedKey("ALL");
            }
            if (this._oSortSelect) {
                this._oSortSelect.setSelectedKey("sfc");
            }
            if (this._oSortDirectionBtn) {
                this._oSortDirectionBtn.setIcon("sap-icon://sort-ascending");
            }
            this._oExtensionUtilities.setCurrentSortField("sfc");
            this._oExtensionUtilities.setSortDescending(false);
            
            // Use client-side clear
            this._oExtensionUtilities.clearAllFilters(this._oTable);
        }
    });
});