sap.ui.define([
    "sap/dm/dme/podfoundation/extension/PluginControllerExtension",
    "sap/ui/core/mvc/OverrideExecution",
    "sap/dm/dme/dcplugins/dataCollectionEntryPlugin/controller/extensions/PluginEventExtensionConstants",
    "rits/ext/custom/plugins/utils/ElectronicSignatureHandler",
    "sap/m/MessageBox"
], function (PluginControllerExtension, OverrideExecution, PluginEventConstants, ElectronicSignatureHandler,
    MessageBox) {
    "use strict";

    return PluginControllerExtension.extend("rits.ext.custom.plugins.dataCollectionEntryPluginExtension.PluginEventExtension", {
        constructor: function (oExtensionUtilities) {
            this._oExtensionUtilities = oExtensionUtilities;
            this.oElectronicSignatureHandler = new ElectronicSignatureHandler(this);
        },

        getOverrideExecution: function (sOverrideMember) {
            if (sOverrideMember === PluginEventConstants.ON_WORKLIST_SELECT_EVENT) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_POD_SELECTION_CHANGE_EVENT) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_OPERATION_LIST_SELECT_EVENT) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_DC_LIST_SELECT_EVENT) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.REFRESH_DATA_COLLECTION_LIST) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_CLOSE_PLUGIN) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.RENDER_DC_ENTRY) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_COLLECT_DATA) {
                return OverrideExecution.Instead;
            } else if (sOverrideMember === PluginEventConstants.LOG_DATA_COLLECTION) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_LOG_DATA_COLLECTION_RESPONSE) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_LOG_DATA_COLLECTION_ERROR) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_NEXT_GROUP) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_PARAMETER_CHANGE) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.CREATE_DATA_COLLECTION_TABLE) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.UPDATE_LIST_CONFIGURATION) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.UPDATE_TABLE_CONFIGURATION) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.UPDATE_COLUMN_CONFIGURATION) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_COMMENTS_BUTTON_PRESSED) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.UPDATE_COMMENTS_DIALOG_MODEL_DATA) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_COMMENTS_DIALOG_OK_PRESS) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_COMMENTS_DIALOG_CANCEL_PRESS) {
                return OverrideExecution.After;
            } else if (sOverrideMember === PluginEventConstants.ON_FILE_ATTACHMENTS_BUTTON_PRESS) {
                return OverrideExecution.After;
            };
            return null;
        },

        /**
         * Returns the name of the core extension this overrides
         *
         * @returns {string} core extension name
         * @public
         */
        getExtensionName: function () {
            return PluginEventConstants.EXTENSION_NAME;
        },

        onWorklistSelectEvent: function (oEvent) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onWorklistSelectEvent: hi");
        },

        onPodSelectionChangeEvent: function (oEvent) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onPodSelectionChangeEvent: hi");
        },

        onOperationListSelectEvent: function (oEvent) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onOperationListSelectEvent: hi");
        },

        onDataCollectionListSelectEvent: function (oEvent) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onDataCollectionListSelectEvent: hi");
        },

        refreshDataCollectionList: function (oSelectDc) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.refreshDataCollectionList: hi");
        },

        onClosePlugin: function () {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onClosePlugin: hi");
        },

        renderDcEntry: function (oDcData) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.renderDcEntry: hi");
            const oView = this.getController().getView();
        },

        // onCollectData: function (bIsValidated) {
        //     this._logDcValue();
        // },
        onCollectData: function (bIsValidated) {

            const dcParams = this._getDcParams();
            const { dataCollectionGroup: dcGroup, revision: dcGroupVersion } = dcParams[0];

            // ✅ Auto-fill
            dcParams.forEach(param => {
                if (
                    param.requiredDataEntries > 0 &&
                    this._isEmpty(this._normalize(param.userValue)) &&
                    param.dcParameterType === "NUMBER"
                ) {
                    param.userValue = "0";
                }
            });

            const missingParam = dcParams.find(p => {
                const value = this._normalize(p.userValue);
                return this._isEmpty(value) && p.requiredDataEntries > 0;
            });

            // 🔹 Validation
            if (missingParam) {
                sap.m.MessageToast.show(`${missingParam.parameterName} is required`);
                return;
            }

            let errorMessage = "";

            const invalidParam = dcParams.find(param => {

                const value = this._normalize(param.userValue);
                if (this._isEmpty(value)) return false;

                if (param.dcParameterType !== "NUMBER") return false;

                const num = Number(value);

                if (isNaN(num)) {
                    errorMessage = `${param.parameterName}: Enter a valid number`;
                    return true;
                }

                if (this._isOverride(param.overrideMinMax)) return false;

                const min = this._toNumber(param.minValue);
                const max = this._toNumber(param.maxValue);

                const hasMin = min !== null;
                const hasMax = max !== null;

                if (hasMin && hasMax && (num < min || num > max)) {
                    errorMessage = `${param.parameterName}: Enter value between ${min} and ${max}`;
                    return true;
                }

                if (hasMin && num < min) {
                    errorMessage = `${param.parameterName}: Value should be >= ${min}`;
                    return true;
                }

                if (hasMax && num > max) {
                    errorMessage = `${param.parameterName}: Value should be <= ${max}`;
                    return true;
                }

                return false;
            });

            if (invalidParam) {
                sap.m.MessageBox.error(errorMessage);
                return;
            }

            const hasFormula = dcParams.some(p => /^f:\{.*\}$/i.test((p.description || "").trim()));
            this._callPPD(dcGroup, dcGroupVersion, hasFormula);
        },

        promptAcknowledgment: function () {
            let sMessage = "Data collected!  Press OK to have supervisor add signature.";
            let that = this;
            let bCompact = this._isViewCompactSize();
            MessageBox.confirm(sMessage, {
                title: "Acknowledge completion of step",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        that._oExtensionUtilities.logMessage("PluginEventExtension.onConfirmation: hi");
                        // that.addSupervisorSignature();
                    }
                }
            });
        },

        _isViewCompactSize: function () {
            let oController = this.getController();
            if (oController && oController.getView) {
                return !!oController.getView().$().closest(".sapUiSizeCompact").length;
            }
            return null;
        },

        addSupervisorSignature: function () {
            let oController = this.getController();
            let mDialogSettings = {
                parentView: oController.getView(),
                message: "Add signature to verify data was collected",
                reason: "sample reason",
                showMessage: false,
                showReason: false,
                reasonEditable: false,
                showComment: false,
                showToolbar: false
            };
            this.oElectronicSignatureHandler.openSignatureDialog(mDialogSettings);
        },

        onSigningSuccess: function () {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onSigningSuccess: hi");
        },

        onSigningError: function (oError) {
            this.getController().showErrorMessage(oError.message, true, true);
        },

        logDataCollection: function (oParameters) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.logDataCollection: hi");
        },

        onLogDataCollectionResponse: function (oResponseData, oLoggedData) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onLogDataCollectionResponse: hi");
        },

        onLogDataCollectionError: function (oError) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onLogDataCollectionError: hi");
        },

        onNextGroup: function () {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onNextGroup: hi");
        },

        onParameterChange: function (sId) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onParameterChange: hi");
        },

        createDataCollectionTable: function (oPluginConfiguration, oListConfiguration) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.createDataCollectionTable");
            this._disableFormulaParams();
            // setTimeout(() => {
            //     this._disableFormulaParams();
            // }, 10);
        },

        updateListConfiguration: function (oListConfiguration) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.updateListConfiguration: oListConfiguration hi");
        },

        updateTableConfiguration: function (oTableConfiguration) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.updateTableConfiguration: oTableConfiguration hi");
        },

        updateColumnConfiguration: function (aColumnConfiguration) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.updateColumnConfiguration: hi");
        },

        onCommentsButtonPressed: function (oData, sButtonId) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onCommentsButtonPressed: hi");
        },

        updateCommentDialogModelData: function (oDialogData) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.updateCommentDialogModelData: hi");
        },

        onCommentDialogOkPress: function (oCommentData) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onCommentDialogOkPress: hi");
        },

        onCommentDialogCancelPress: function () {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onCommentDialogCancelPress: hi");
        },

        onFileAttachmentsButtonPress: function (sBindingContextPath) {
            this._oExtensionUtilities.logMessage("PluginEventExtension.onFileAttachmentsButtonPress: hi");
        },


        _getDcParams: function () {
            return this.getController()
                .getView()
                .getModel()
                .getData().value[0].dcParameters;
        },

        _normalize: function (value) {
            return (value != null) ? value.toString().trim() : value;
        },

        _isEmpty: function (value) {
            return value === "" || value == null || value === "Deselect";
        },

        _isOverride: function (val) {
            return val === true || val === "true";
        },

        _toNumber: function (val) {
            return (val !== null && val !== "") ? Number(val) : null;
        },

        _buildPayload: function () {
            var oController = this.getController();
            var oData = oController.getView().getModel().getData();

            var aDcParameters = oData.dcParameters || [];
            var aDistinctSelections = oController.getPodSelectionModel().distinctSelections || [];
            var oSfcData = aDistinctSelections[0]?.sfcData || {};

            var sPlant = oController.getPodController().getUserPlant();

            var sResource = oSfcData.resource;
            var sWorkcenter = oSfcData.workCenter;

            var sMaterial = oSfcData.material;
            var sMaterialVersion = oSfcData.materialVersion;

            var sRouting = oSfcData.routing;
            var sRoutingType = oSfcData.routingType;
            var sRoutingVersion = oSfcData.routingVersion;

            var aInSFCS = aDistinctSelections.map(function (oSel) {
                return oSel.sfc.sfc;
            });

            var sGroupRev = aDcParameters.length ? aDcParameters[0].dataCollectionGroupRevision : "";
            var sGroup = aDcParameters.length ? aDcParameters[0].dcGroup : "";
            var sGroupVersion = sGroupRev.includes("/") ? sGroupRev.split("/").pop() : sGroupRev;

            var sOperation = aDcParameters.length ? aDcParameters[0].forOperation : "";
            var sOperationRev = aDcParameters.length ? aDcParameters[0].forOperationRev : "";

            var aInParameters = aDcParameters.map(function (oParam) {
                var sValue = oParam.userValue != null ? String(oParam.userValue).trim() : null;
                if (sValue === "" || sValue === "Deselect") sValue = null;
                return { name: oParam.parameterName, value: sValue };
            });

            var oPayload = {
                inDcGroup: { dcGroup: sGroup, version: sGroupVersion },
                inOperation: { operation: sOperation, version: sOperationRev },
                inParameters: aInParameters,
                inPlant: sPlant,
                inResource: sResource,
                inSFCS: aInSFCS,
                inWorkcenter: sWorkcenter
            };
            return oPayload;
        },


        _logDcValue: function () {
            const sUrl = this.getController().getPublicApiRestDataSourceUri() +
                "/pe/api/v1/process/processDefinitions/start?key=REG_ad921461-2111-41ed-a607-dc007db2222c&async=false";
            const payload = this._buildPayload();

            this.getController().ajaxPostRequest(
                sUrl,
                payload,
                (oResponse) => {
                    if (oResponse && oResponse.Message) {
                        sap.m.MessageToast.show("DC Value logged successfully!");
                        this._clearInputs();
                        this._disableFormulaParams();
                        // setTimeout(() => {
                        //     this._disableFormulaParams();
                        // }, 10);
                    } else {
                        sap.m.MessageToast.show(oResponse.outputErrorMessage || "Something went wrong.");
                    }
                },
                (oError) => {
                    sap.m.MessageToast.show(oError?.message || "API failed");
                }
            );
        },

        _clearInputs: function () {
            const oModel = this.getController().getView().getModel();
            if (!oModel) return;

            const dcParams = oModel.getData()?.value?.[0]?.dcParameters || [];

            dcParams.forEach(oParam => {
                oParam.userValue = null;

                const oCtrl = sap.ui.getCore().byId(oParam.controlId);
                if (!oCtrl) return;

                const sType = oParam.dcParameterType;

                if (sType === "BOOLEAN") {
                    if (typeof oCtrl.setSelected === "function") oCtrl.setSelected(false);
                    if (typeof oCtrl.setState === "function") oCtrl.setState(false);
                } else if (sType === "LIST" || sType === "DATA_FIELD_LIST") {
                    if (typeof oCtrl.setSelectedKey === "function") oCtrl.setSelectedKey(null);
                    if (typeof oCtrl.setValue === "function") oCtrl.setValue(null);
                } else {
                    if (typeof oCtrl.setValue === "function") oCtrl.setValue(null);
                }
            });

            oModel.refresh(true);
        },


        _callPPD: function (dcGroup, dcGroupVersion, hasFormula) {
            const sUrl = this.getController().getPublicApiRestDataSourceUri() +
                '/pe/api/v1/process/processDefinitions/start?key=REG_43b98f4c-be15-44df-94bb-b1aa1b2f753a&async=false';

            const oPayload = {
                inPlant: this.getController().getPodController().getUserPlant(),
                inDcGroup: dcGroup,
                inDcGroupVersion: dcGroupVersion,
                inUserId: this.getController().getPodController().getUserId(),
            };

            this.getController().ajaxPostRequest(
                sUrl,
                oPayload,
                (oResponse) => {
                    if (oResponse && oResponse.Message) {
                        if (hasFormula) {
                            this._logDcValue();
                        } else {
                            this._oCoreExtension.base.processOnCollectData(true);
                        }
                    } else {
                        sap.m.MessageBox.error(oResponse.outputErrorMessage);
                    }
                },
                (oError) => {
                    sap.m.MessageBox.error(oError?.message || "API failed");
                }
            );

            this._oExtensionUtilities.logMessage("PluginEventExtension.onCollectData executed");
        },
        _disableFormulaParams: function () {
            const oView = this.getController().getView();
            const oModel = oView.getModel();
            if (!oModel) return;

            const dcParams = oModel.getData()?.value?.[0]?.dcParameters;
            if (!dcParams || !dcParams.length) {
                this._oExtensionUtilities.logMessage(" No dcParams found");
                return;
            }

            this._oExtensionUtilities.logMessage("Total params: " + dcParams.length);

            dcParams.forEach(oParam => {
                const isFormula = /^f:\{.*\}$/i.test((oParam.description || "").trim());

                this._oExtensionUtilities.logMessage(
                    "Param: " + oParam.parameterName +
                    " | desc: " + oParam.description +
                    " | isFormula: " + isFormula
                );

                if (!isFormula) return;

                const sControlId = oParam.controlId;
                if (!sControlId) {
                    this._oExtensionUtilities.logMessage(" No controlId for: " + oParam.parameterName);
                    return;
                }

                const oCtrl = sap.ui.getCore().byId(sControlId);
                if (!oCtrl) {
                    this._oExtensionUtilities.logMessage(" Control not found: " + sControlId);
                    return;
                }

                this._recursiveDisable(oCtrl);
                this._oExtensionUtilities.logMessage(" Disabled: " + oParam.parameterName);
            });
        },


        _recursiveDisable: function (oControl) {
            if (!oControl) return;
            if (typeof oControl.setEditable === "function") {
                oControl.setEditable(false);
                this._oExtensionUtilities.logMessage(" setEditable(false): " + oControl.getId());
            } else if (typeof oControl.setEnabled === "function") {
                oControl.setEnabled(false);
                this._oExtensionUtilities.logMessage(" setEnabled(false): " + oControl.getId());
            }
            // ["getItems", "getContent"].forEach(sAgg => {
            //     if (typeof oControl[sAgg] === "function") {
            //         (oControl[sAgg]() || []).forEach(c => this._recursiveDisable(c));
            //     }
            // });
        },
    })
});
