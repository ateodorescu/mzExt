/**
 * A small abstract class that contains the shared behaviour for any summary
 * calculations to be used in the grid. It handles multiple levels of grouping too.
 * @author Adrian Teodorescu (ateodorescu@gmail.com)
*/
Ext.define('Ext.ux.grid.feature.MultiAbstractSummary', {

    extend: 'Ext.grid.feature.Feature',
    
    alias: 'feature.multiabstractsummary',
    
    mixins: {
        mixSummary:     'Ext.ux.grid.feature.MixinSummary'
    },
    
    summaryRendererProperty:    'summaryRenderer',
    summaryTypeProperty:        'summaryType',

    summaryRowCls: Ext.baseCSSPrefix + 'grid-row-summary',
    summaryTableCls: Ext.baseCSSPrefix + 'table-plain ' + Ext.baseCSSPrefix + 'grid-table',
    summaryRowSelector: '.' + Ext.baseCSSPrefix + 'grid-row-summary',

    // High priority rowTpl interceptor which sees summary rows early, and renders them correctly and then aborts the row rendering chain.
    // This will only see action when summary rows are being updated and Table.onUpdate->Table.bufferRender renders the individual updated sumary row.
    summaryRowTpl: {
        before: function (values, out) {
            // If a summary record comes through the rendering pipeline, render it simply, and return false from the
            // before method which aborts the tpl chain
            if (values.record.isSummary) {
                this.summaryFeature.outputSummaryRecord(values.record, values, out);
                return false;
            }
        },
        priority: 1000
    },

    cellTpl: [
        '{%',
            'values.hideCell = values.tdAttr == "hidden";\n',
        '%}',
        '<tpl if="!hideCell">',
            '<td class="{tdCls}" {tdAttr} columnid="{column.id}" columnindex="{columnIndex}">',
                '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner"',
                    'style="text-align:{align};<tpl if="style">{style}</tpl>">{value}</div>',
            '</td>',
        '</tpl>', {
            priority: 0
        }
    ],

    /**
     * @cfg {Boolean}
     * True to show the summary row.
     */
    showSummaryRow: true,

    // Listen for store updates. Eg, from an Editor.
    init: function () {
        var me = this;
        me.view.summaryFeature = me;
        me.rowTpl = me.view.self.prototype.rowTpl;

        // Add a high priority interceptor which renders summary records simply
        // This will only see action ona bufferedRender situation where summary records are updated.
        me.view.addRowTpl(me.summaryRowTpl).summaryFeature = me;
        me.view.addCellTpl(Ext.XTemplate.getTpl(me, 'cellTpl'));
    },

    /**
     * Toggle whether or not to show the summary row.
     * @param {Boolean} visible True to show the summary row
     */
    toggleSummaryRow: function (visible) {
        this.showSummaryRow = !!visible;
    },

    // overwrite the default function to call the Ext.ux.grid.feature.MixinSummary mixin
    getSummary: function () {
        return this.mixins.mixSummary.getSummary.apply(this, arguments);
    },

    /**
     * Used by the Grouping Feature when {@link #showSummaryRow} is `true`.
     * 
     * Generates group summary data for the whole store.
     * @private
     * @return {Object} An object hash keyed by group name containing summary records.
     */
    generateSummaryData: function () {
        var data = {};

        this.parseAllGroups(Ext.Object.getValues(this.groupCache), data);

        return data;
    },

    parseAllGroups: function (groups, data) {
        var me = this,
            store = me.view.store,
            //groups = store.groups.items,
            reader = store.proxy ? store.proxy.reader : null,
            len = groups.length,
            lockingPartner = me.lockingPartner,
            i, group, record,
            root, summaryRows, hasRemote,
            convertedSummaryRow, remoteData;

        for (i = 0; i < len; i++) {
            group = groups[i];
            var groupField = group.grouper.property;

            /**
             * @cfg {String} [remoteRoot=undefined]
             * The name of the property which contains the Array of summary objects.
             * It allows to use server-side calculated summaries.
             */
            if (me.remoteRoot && reader.rawData) {
                hasRemote = true;
                remoteData = {};
                // reset reader root and rebuild extractors to extract summaries data
                root = reader.root;
                reader.root = me.remoteRoot;
                reader.buildExtractors(true);
                summaryRows = reader.getRoot(reader.rawData);
                len = summaryRows.length;

                // Ensure the Reader has a data conversion function to convert a raw data row into a Record data hash
                if (!reader.convertRecordData) {
                    reader.buildExtractors();
                }

                for (i = 0; i < len; ++i) {
                    convertedSummaryRow = {};

                    // Convert a raw data row into a Record's hash object using the Reader
                    reader.convertRecordData(convertedSummaryRow, summaryRows[i]);
                    remoteData[convertedSummaryRow[groupField]] = convertedSummaryRow;
                }

                // restore initial reader configuration
                reader.root = root;
                reader.buildExtractors(true);
            }

            group.getAggregateRecord = Ext.data.Group.prototype.getAggregateRecord;
            group.store = store;

            // Something has changed or it doesn't exist, populate it
            //if (hasRemote || group.isDirty() || !group.hasAggregate()) {
            if (hasRemote) {
                if (hasRemote) {
                    record = me.populateRemoteRecord(group, remoteData);
                } else {
                    record = me.populateRecord(group);
                }
                // Clear the dirty state of the group if this is the only Summary, or this is the right hand (normal grid's) summary
                if (!lockingPartner || (me.view.ownerCt === me.view.ownerCt.ownerLockable.normalGrid)) {
                    group.commit();
                }
            } else {
                record = group.getAggregateRecord();
                record.depth = me.depthToIndent * group.depth;
                if (!record.hasPartnerData) {
                    me.populateRecord(group);
                    record.hasPartnerData = true;
                }
            }
            data[group.key] = record;

        }
    },

    populateRemoteRecord: function (group, data) {
        var record = group.getAggregateRecord(true),
            groupData = data[group.key],
            field;

        record.beginEdit();
        for (field in groupData) {
            if (groupData.hasOwnProperty(field)) {
                if (field !== record.idProperty) {
                    record.set(field, groupData[field]);
                }
            }
        }
        record.endEdit(true);
        record.commit(true);

        return record;
    },

    populateRecord: function (group) {
        var me = this,
            view = me.view,
            store = view.store,
            record = group.getAggregateRecord(),
            columns = view.headerCt.getGridColumns(),
            len = columns.length,
            i, column, fieldName,
            sumType, value;

        record.internalId = 'summary-record-' + group.key;
        record.beginEdit();
        
        for (i = 0; i < len; ++i) {
            column = columns[i];

            // Use the column id if there's no mapping, could be a calculated field
            if (!column.dataIndex) {
                column.dataIndex = column.id;
            }

            fieldName = me.formatColumnField(column);
            sumType = column[this.summaryTypeProperty];
            value = me.getSummary(store, sumType, column.dataIndex, group);

            // this is buggy when the Model field has a "convert" function
            //record.set(fieldName, me.getSummary(store, column[this.summaryTypeProperty], fieldName, group));
            // just update the data object
            record.data[fieldName] = value;
        }
        record.endEdit(true);
        record.commit();

        return record;
    }
    
});
