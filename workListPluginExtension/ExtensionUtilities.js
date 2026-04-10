/**
 * Extension Utilities for Worklist Filter & Sort
 * 
 * Shared utility functions and state management
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (BaseObject, Filter, FilterOperator, Sorter) {
    "use strict";

    return BaseObject.extend("rits.ext.custom.plugins.ExtensionUtilities", {
        constructor: function () {
            this._bLogToConsole = true;
            this._sCurrentStatusFilter = "ALL";
            this._sCurrentSortField = "sfc";
            this._bSortDescending = false;
        },

        setLogToConsole: function (bLogToConsole) {
            this._bLogToConsole = bLogToConsole;
        },

        logMessage: function (sMessage) {
            if (this._bLogToConsole) {
                console.log("[WorklistFilterSort] " + sMessage);
            }
        },

        getCurrentStatusFilter: function () {
            return this._sCurrentStatusFilter;
        },

        setCurrentStatusFilter: function (sStatusFilter) {
            this._sCurrentStatusFilter = sStatusFilter;
        },

        getCurrentSortField: function () {
            return this._sCurrentSortField;
        },

        setCurrentSortField: function (sSortField) {
            this._sCurrentSortField = sSortField;
        },

        isSortDescending: function () {
            return this._bSortDescending;
        },

        setSortDescending: function (bDescending) {
            this._bSortDescending = bDescending;
        },

        toggleSortDirection: function () {
            this._bSortDescending = !this._bSortDescending;
            return this._bSortDescending;
        },

        /**
         * Apply status filter - uses client-side filtering on visible items
         * Since OData service doesn't support server-side filtering
         */
        applyStatusFilter: function (oTable, sStatusCode) {
            this._sCurrentStatusFilter = sStatusCode;
            this.logMessage("applyStatusFilter: status=" + sStatusCode);
            
            if (!oTable) {
                this.logMessage("applyStatusFilter: No table provided");
                return false;
            }

            // Get all items and filter them client-side by hiding/showing rows
            var aItems = oTable.getItems ? oTable.getItems() : [];
            this.logMessage("applyStatusFilter: Found " + aItems.length + " items");
            
            if (aItems.length === 0) {
                return false;
            }

            // Find the status field name
            var sStatusField = this._detectStatusField(oTable);
            this.logMessage("applyStatusFilter: Using field '" + sStatusField + "'");

            // Apply visibility filter to each item
            var iVisible = 0;
            var iHidden = 0;
            
            for (var i = 0; i < aItems.length; i++) {
                var oItem = aItems[i];
                var oContext = oItem.getBindingContext();
                
                if (oContext) {
                    var oData = oContext.getObject();
                    var sItemStatus = oData ? oData[sStatusField] : null;
                    
                    // Show all or filter by status
                    if (sStatusCode === "ALL" || sItemStatus === sStatusCode) {
                        oItem.setVisible(true);
                        iVisible++;
                    } else {
                        oItem.setVisible(false);
                        iHidden++;
                    }
                }
            }
            
            this.logMessage("applyStatusFilter: " + iVisible + " visible, " + iHidden + " hidden");
            return true;
        },

        /**
         * Apply sorting - uses client-side sorting
         */
        applySorting: function (oTable, sSortField, bDescending) {
            this._sCurrentSortField = sSortField;
            this._bSortDescending = bDescending;
            this.logMessage("applySorting: field=" + sSortField + ", desc=" + bDescending);
            
            if (!oTable) {
                this.logMessage("applySorting: No table provided");
                return false;
            }

            var oBinding = oTable.getBinding("items");
            if (!oBinding) {
                this.logMessage("applySorting: No binding found");
                return false;
            }

            // Detect actual field name
            var sActualField = this._detectSortField(oTable, sSortField);
            this.logMessage("applySorting: Actual field = " + sActualField);

            try {
                // Client-side sort doesn't trigger OData request
                var oSorter = new Sorter(sActualField, bDescending);
                oBinding.sort(oSorter);
                this.logMessage("applySorting: Sort applied");
                return true;
            } catch (e) {
                this.logMessage("applySorting: Error - " + e.message);
                return false;
            }
        },

        /**
         * Clear all filters - restore visibility
         */
        clearAllFilters: function (oTable) {
            this._sCurrentStatusFilter = "ALL";
            
            if (!oTable) {
                return;
            }
            
            var aItems = oTable.getItems ? oTable.getItems() : [];
            for (var i = 0; i < aItems.length; i++) {
                aItems[i].setVisible(true);
            }
            
            this.logMessage("clearAllFilters: All items visible");
        },

        _detectStatusField: function (oTable) {
            var aItems = oTable.getItems ? oTable.getItems() : [];
            if (aItems.length > 0) {
                var oContext = aItems[0].getBindingContext();
                if (oContext) {
                    var oData = oContext.getObject();
                    if (oData) {
                        if (oData.hasOwnProperty("statusCode")) return "statusCode";
                        if (oData.hasOwnProperty("sfcStatus")) return "sfcStatus";
                        if (oData.hasOwnProperty("status")) return "status";
                        if (oData.hasOwnProperty("Status")) return "Status";
                    }
                }
            }
            return "statusCode";
        },

        _detectSortField: function (oTable, sRequestedField) {
            var aItems = oTable.getItems ? oTable.getItems() : [];
            if (aItems.length > 0) {
                var oContext = aItems[0].getBindingContext();
                if (oContext) {
                    var oData = oContext.getObject();
                    if (oData && oData.hasOwnProperty(sRequestedField)) {
                        return sRequestedField;
                    }
                }
            }
            return sRequestedField;
        }
    });
});